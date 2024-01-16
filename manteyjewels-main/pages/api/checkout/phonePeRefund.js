import axios from "axios";
import orderModel from "~/models/order";
import dbConnect from "~/utils/dbConnect";
import { SHA256 } from "crypto-js";
import customId from "custom-id-new";

const phonePe_refund_api_url = `${process.env.NEXT_PUBLIC_PHONEPE_PAYMENT_API_URL}/refund`;

export default async function apiHandler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case "POST":
      try {
        const { orderId } = req.body;

        const orderData = await orderModel.findOne({ orderId: orderId });

        // function reverseString(str) {
        //   return reverseString(str.substr(1)) + str.charAt(0);
        // }

        const phonePeData = {
          merchantId: process.env.NEXT_PUBLIC_PHONEPE_MERCHANT_ID,
          merchantTransactionId: orderData.merchantTransactionId,
          originalTransactionId: orderData.paymentId,
          // originalTransactionId: reverseString(orderData.merchantTransactionId),
          amount: orderData.payAmount * 100,
          callbackUrl: `${process.env.PHONEPE_CALL_BACK_BASE_URL}/api/checkout/phonePeRefundCallBack?orderId=${orderData.orderId}`,
        };

        const jsonString = JSON.stringify(phonePeData);
        const buffer = Buffer.from(jsonString, "utf-8");
        const base64String = buffer.toString("base64");

        const options = {
          method: "POST",
          url: phonePe_refund_api_url,
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            "X-VERIFY": `${SHA256(
              base64String +
                "/pg/v1/refund" +
                process.env.NEXT_PUBLIC_PHONEPE_SALT_KEY
            )}###${process.env.NEXT_PUBLIC_PHONEPE_SALT_KEY_INDEX}`,
          },
          data: { request: base64String },
        };

        const response = await axios.request(options);

        if (response.data.data.state === "PENDING") {
          orderData.paymentStatus = "Refund-Pending";
          await orderData.save();
          res.status(200).json({
            success: true,
            data: response.data,
            RefundedData: phonePeData,
            options: options,
          });
        } else {
          res.status(400).json({
            success: false,
            data: response.data,
            RefundedData: phonePeData,
            options: options,
          });
        }
      } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}
