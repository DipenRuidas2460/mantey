import axios from "axios";
import dbConnect from "~/utils/dbConnect";
import orderModel from "~/models/order";
import userModel from "~/models/user";
import { getToken } from "next-auth/jwt";

export default async function apiHandler(req, res) {
  const { method } = req;
  const secret = process.env.AUTH_SECRET;
  const session = await getToken({ req, secret });
  await dbConnect();

  switch (method) {
    case "POST":
      try {
        const { orderId, merchantUserId } = req.query;
        const { response } = req.body;
        const buffer = Buffer.from(response, "base64");
        const jsonObject = JSON.parse(buffer.toString("utf-8"));

        let createdData;
        if (jsonObject.success) {
          createdData = {
            success: jsonObject.success,
            code: jsonObject.code,
            message: jsonObject.message,
            data: {
              merchantId: jsonObject.data.merchantId,
              merchantTransactionId: jsonObject.data.merchantTransactionId,
              transactionId: jsonObject.data.transactionId,
              amount: jsonObject.data.amount / 100,
              state: jsonObject.data.state,
              responseCode: jsonObject.data.responseCode,
              paymentInstrument: jsonObject.data.paymentInstrument,
            },
          };
        }

        let orderData = await orderModel.findOne({ orderId: orderId });

        if (session && session.user.id) {
          await userModel.findByIdAndUpdate(session.user.id, {
            $push: { orders: orderData._id },
          });
        }

        const data = JSON.stringify({
          email: process.env.NEXT_PUBLIC_SHIPROCKET_EMAIL,
          password: process.env.NEXT_PUBLIC_SHIPROCKET_PASSWORD,
        });

        const config = {
          method: "post",
          maxBodyLength: Infinity,
          url: process.env.NEXT_PUBLIC_SHIPROCKET_TOKEN_GENERATE_URL,
          headers: {
            "Content-Type": "application/json",
          },
          data: data,
        };

        const tokenData = await axios(config);

        if (createdData && createdData.data.state === "COMPLETED") {
          orderData.status = "Pending";
          orderData.paymentId = createdData.data.transactionId;
          orderData.merchantTransactionId =
            createdData.data.merchantTransactionId;
          orderData.merchantUserId = merchantUserId;
          orderData.paymentDetails = createdData.data.paymentInstrument;
          orderData.paymentStatus = "Paid";
          await orderData.save();

          const desiredKeys = [
            "name",
            "sku",
            "units",
            "selling_price",
            "discount",
            "tax",
            "hsn",
          ];

          const newArray = orderData.products.map((item) => {
            const newItem = {};
            const shippingState = orderData.shippingInfo.state.toLowerCase();
            desiredKeys.forEach((key) => {
              if (item.hasOwnProperty(key)) {
                newItem[key] = item[key];
              } else if (key === "units") {
                newItem[key] = item.qty;
              } else if (key === "selling_price") {
                newItem[key] = `${item.price}`;
              } else if (key === "discount") {
                newItem[key] = "";
              } else if (key === "tax") {
                if (shippingState === "gujarat") {
                  newItem[key] = `${
                    item.productTax.CGSTIN +
                    item.productTax.SGSTIN +
                    item.productTax.IGSTIN +
                    item.productTax.UTGSTIN
                  }`;
                } else {
                  newItem[key] = `${
                    item.productTax.CGSTOUT +
                    item.productTax.SGSTOUT +
                    item.productTax.IGSTOUT +
                    item.productTax.UTGSTOUT
                  }`;
                }
              } else {
                newItem[key] = item.productTax?.hsn;
              }
            });
            return newItem;
          });

          const shipRocketOrder = {
            order_id: orderData._id,
            order_date: orderData.orderDate,
            pickup_location: "Primary",
            channel_id: "4210168",
            comment: "Reseller: Mantey Jewels",
            billing_customer_name: orderData.billingInfo.fullName,
            billing_last_name: "",
            billing_address: orderData.billingInfo.house,
            billing_address_2: "",
            billing_city: orderData.billingInfo.city,
            billing_pincode: orderData.billingInfo.zipCode,
            billing_state: orderData.billingInfo.state,
            billing_country: orderData.billingInfo.country,
            billing_email: orderData.billingInfo.billingEmail,
            billing_phone: orderData.billingInfo.phone,
            shipping_is_billing: true,
            shipping_customer_name: orderData.shippingInfo.fullName,
            shipping_last_name: "",
            shipping_address: orderData.shippingInfo.house,
            shipping_address_2: "",
            shipping_city: orderData.shippingInfo.city,
            shipping_pincode: orderData.shippingInfo.zipCode,
            shipping_country: orderData.shippingInfo.country,
            shipping_state: orderData.shippingInfo.state,
            shipping_email: orderData.shippingInfo.shippingEmail
              ? orderData.shippingInfo.shippingEmail
              : orderData.shippingInfo.billingEmail,
            shipping_phone: orderData.shippingInfo.phone,
            order_items: newArray,
            payment_method:
              orderData.paymentStatus === "Paid"
                ? "Prepaid"
                : orderData.paymentStatus,
            shipping_charges: 0,
            giftwrap_charges: 0,
            transaction_charges: 0,
            total_discount: 0,
            sub_total: orderData.payAmount,
            length: orderData.products[0].shipping?.length,
            breadth: orderData.products[0].shipping?.width,
            height: orderData.products[0].shipping?.height,
            weight: orderData.products[0].shipping?.weight,
          };

          const shipData = await JSON.stringify(shipRocketOrder);

          const shipRocketConfig = {
            method: "post",
            maxBodyLength: Infinity,
            url: process.env.NEXT_PUBLIC_SHIPROCKET_CREATE_ORDER_API_URL,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tokenData.data.token}`,
            },
            data: shipData,
          };

          const createShipRocketOrder = await axios(shipRocketConfig);

          res.status(200).json({
            success: true,
            shipRocketOrder: createShipRocketOrder.data,
            createdData: createdData,
          });
        } else if (createdData && createdData.data.state === "PENDING") {
          orderData.paymentStatus = "Pending";
          orderData.status = "Pending";
          orderData.paymentDetails = jsonObject;
          await orderData.save();
          res.status(400).json({
            success: true,
            data: orderData,
            message: "Payment Pending",
          });
        } else {
          orderData.paymentStatus = "UnPaid";
          orderData.status = "Pending";
          orderData.paymentDetails = jsonObject;
          await orderData.save();
          res.status(400).json({ success: false, data: orderData });
        }
      } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}
