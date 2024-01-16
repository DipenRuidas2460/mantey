import ProductModel from "~/models/product";
import dbConnect from "~/utils/dbConnect";

export default async function apiHandler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const { productId } = req.query;
        const product = await ProductModel.findOne({
          productId: productId,
        }).select({
          _id: 0,
          name: 1,
          productId: 1,
          image: 1,
          price: 1,
          discount: 1,
          slug: 1,
          type: 1,
        });
        res.status(200).json({ success: true, product });
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
