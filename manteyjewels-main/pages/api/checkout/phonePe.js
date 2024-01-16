import axios from "axios";
import { getToken } from "next-auth/jwt";
import orderModel from "~/models/order";
import userModel from "~/models/user";
import dbConnect from "~/utils/dbConnect";
import { SHA256 } from "crypto-js";
import { eachSeries } from "async";
import productModel from "~/models/product";
import customId from "custom-id-new";

const phonePe_api_url = `${process.env.NEXT_PUBLIC_PHONEPE_PAYMENT_API_URL}/pay`;

export default async function apiHandler(req, res) {
  const { method } = req;
  const secret = process.env.AUTH_SECRET;
  const session = await getToken({ req, secret });
  await dbConnect();

  switch (method) {
    case "POST":
      try {
        const { cartData, orderId } = req.body;

        const decrementQty = async (products) => {
          eachSeries(
            products,
            async (item, done) => {
              const product = await productModel.findById(item._id);
              if (product) {
                if (product.variants.length > 0) {
                  const variant = product.variants.find(
                    (v) => v.sku === item.sku
                  );
                  if (variant.qty > 0) {
                    variant.qty = variant.qty - item.qty;
                    product.markModified("variants");
                  }
                } else {
                  if (product.quantity > 0) {
                    product.quantity = product.quantity - item.qty;
                  }
                }
                await product.save(done);
              }
            },
            (err) => {
              if (err) {
                console.log(err);
              }
            }
          );
        };

        const getTotalPrice = async (products) => {
          const price = await products.reduce(
            (accumulator, item) => accumulator + item.qty * item.price,
            0
          );
          return Math.round(price * 10) / 10;
        };

        const trnId = "T" + customId({ randomLength: 4, upperCase: true });

        const merchantUserId =
          "T" + customId({ randomLength: 4, upperCase: true });

        const totalPrice = await getTotalPrice(cartData.items);
        const payAmount =
          cartData.deliveryInfo.cost +
          Math.round(
            (totalPrice - (cartData.coupon.discount / 100) * totalPrice) * 10
          ) /
            10;

        const phonePeData = {
          merchantId: process.env.NEXT_PUBLIC_PHONEPE_MERCHANT_ID,
          merchantTransactionId: trnId,
          merchantUserId: merchantUserId,
          amount: Math.round(payAmount * 100),
          redirectUrl: `${process.env.PHONEPE_CALL_BACK_BASE_URL}/checkout/phonePeRedirect?merchantTransactionId=${trnId}&orderId=${orderId}`,
          redirectMode: "GET",
          callbackUrl: `${process.env.PHONEPE_CALL_BACK_BASE_URL}/api/checkout/phonePeCallback?orderId=${orderId}&merchantUserId=${merchantUserId}`,
          mobileNumber: `${process.env.MERCHANT_MOBILE_NUMBER}`,
          paymentInstrument: {
            type: "PAY_PAGE",
          },
        };

        const jsonString = JSON.stringify(phonePeData);
        const buffer = Buffer.from(jsonString, "utf-8");
        const base64String = buffer.toString("base64");

        const options = {
          method: "POST",
          url: phonePe_api_url,
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            "X-VERIFY": `${SHA256(
              base64String +
                "/pg/v1/pay" +
                process.env.NEXT_PUBLIC_PHONEPE_SALT_KEY
            )}###${process.env.NEXT_PUBLIC_PHONEPE_SALT_KEY_INDEX}`,
          },
          data: { request: base64String },
        };

        const response = await axios.request(options);

        if (response.data.success == true) {
          const { coupon, items, billingInfo, shippingInfo, deliveryInfo } =
            cartData;

          await decrementQty(items);

          const paymentStatus = "Unpaid";
          const orderData = {
            orderId,
            products: items,
            status: "Draft",
            billingInfo,
            shippingInfo,
            deliveryInfo,
            paymentMethod: "PhonePe",
            paymentStatus,
            paymentId: null,
            merchantTransactionId: null,
            merchantUserId: null,
            totalPrice,
            payAmount,
            coupon,
            user: session.user.id,
          };
          const createdOrder = await orderModel.create(orderData);
          if (session && session.user.id) {
            await userModel.findByIdAndUpdate(session.user.id, {
              $push: { orders: createdOrder._id },
            });
          }
          res.status(200).json({
            success: true,
            data: response.data.data.instrumentResponse.redirectInfo.url,
          });
        } else {
          res.status(500).json({ success: false, data: response.data });
        }
      } catch (err) {
        console.log(err.message);
        res.status(500).json({ success: false });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}
