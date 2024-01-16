import dbConnect from "~/utils/dbConnect";
import orderModel from "~/models/order";

export default async function apiHandler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case "POST":
      try {
        const { orderId } = req.query;
        const { response } = req.body;
        const buffer = Buffer.from(response, "base64");
        const jsonObject = JSON.parse(buffer.toString("utf-8"));
        const orderData = await orderModel.findOne({ orderId: orderId });

        let newData;
        if (jsonObject.success) {
          newData = {
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
            },
          };
        }

        if (newData && newData.data.state === "COMPLETED") {
          orderData.paymentStatus = "Refunded";
          orderData.paymentRefundDetails = newData;
          await orderData.save();
          res
            .status(200)
            .json({ success: true, orderData: orderData, newData: newData });
        } else {
          orderData.paymentRefundDetails = jsonObject;
          await orderData.save();
          res
            .status(400)
            .json({ success: false, data: orderData, jsonObject: jsonObject });
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
