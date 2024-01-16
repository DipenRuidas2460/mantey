import axios from "axios";
import dbConnect from "~/utils/dbConnect";
import { SHA256 } from "crypto-js";

export default async function apiHandler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const { merchantTransactionId } = req.query;

        const check_payment_status_api = `${process.env.NEXT_PUBLIC_PHONEPE_PAYMENT_API_URL}/status/${process.env.NEXT_PUBLIC_PHONEPE_MERCHANT_ID}/${merchantTransactionId}`;

        const options = {
          method: "GET",
          url: check_payment_status_api,
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            "X-VERIFY": `${SHA256(
              `/pg/v1/status/${process.env.NEXT_PUBLIC_PHONEPE_MERCHANT_ID}/${merchantTransactionId}` +
                process.env.NEXT_PUBLIC_PHONEPE_SALT_KEY
            )}###${process.env.NEXT_PUBLIC_PHONEPE_SALT_KEY_INDEX}`,
            "X-MERCHANT-ID": `${process.env.NEXT_PUBLIC_PHONEPE_MERCHANT_ID}`,
          },
        };

        const response = await axios.request(options);
        res.status(200).json({
          success: true,
          data: response.data,
        });
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
