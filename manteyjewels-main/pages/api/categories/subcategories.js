import sessionChecker from "~/lib/sessionPermission";
import { convertToSlug } from "../../../middleware/functions";
import categoryModel from "../../../models/category";
import dbConnect from "../../../utils/dbConnect";
import { parseForm } from "../../../utils/parseForm";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function apiHandler(req, res) {
  const { method } = req;
  if (!(await sessionChecker(req, "category")))
    return res
      .status(403)
      .json({ success: false, message: "Access Forbidden" });

  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const data = await categoryModel.find({});
        res.status(200).json({ success: true, category: data });
      } catch (err) {
        console.log(err);
        res.status(400).json({ success: false });
      }
      break;

    case "POST":
      try {
        const data = await parseForm(req);
        const fetchCategory = await categoryModel.findById({
          _id: data.field.category,
        });
        const objectData = {
          name: fetchCategory.name,
          subCategory: {
            name: `${fetchCategory.name}-${data.field.name.toLowerCase().trim()}`,
            original: data.field.name.toLowerCase(),
          },
          parentSlug: fetchCategory.slug,
          slug: convertToSlug(data.field.name, false),
        };
        await categoryModel.findByIdAndUpdate(data.field.category, {
          $push: { subCategories: objectData },
        });
        res.status(200).json({ success: true });
      } catch (err) {
        console.log(err);
        res.status(400).json({ success: false });
      }
      break;

    case "DELETE":
      try {
        const id = req.query.id;
        const slug = req.query.slug;
        await categoryModel.findByIdAndUpdate(id, {
          $pull: { subCategories: { slug: slug } },
        });
        res.status(200).json({ success: true });
      } catch (err) {
        console.log(err);
        res.status(400).json({ success: false });
      }
      break;

    case "PUT":
      try {
        const data = await parseForm(req);
        const body = JSON.parse(data.field.data);
        const fetchCategory = await categoryModel.findOne({
          _id: body.id,
          "subCategories.subCategory.original": body.name,
        });
        await categoryModel.findOneAndUpdate(
          { _id: body.id, "subCategories.subCategory.original": body.name },
          {
            $set: {
              "subCategories.$": {
                name: fetchCategory.name,
                subCategory: {
                  name: `${fetchCategory.name}-${body.update.toLowerCase().trim()}`,
                  original: body.update.toLowerCase(),
                },
                parentSlug: fetchCategory.slug,
                slug: body.update,
              },
            },
          }
        );
        res.status(200).json({ success: true });
      } catch (err) {
        console.log(err);
        res.status(400).json({ success: false });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}
