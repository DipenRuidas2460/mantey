import sessionChecker from "~/lib/sessionPermission";
import tagModel from "../../../models/tags";
import dbConnect from "../../../utils/dbConnect";
import { parseForm } from "../../../utils/parseForm";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function apiHandler(req, res) {
  const { method } = req;
  if (!(await sessionChecker(req, "tag")))
    return res
      .status(403)
      .json({ success: false, message: "Access Forbidden" });

  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const id = req.query.id;
        const tag = await tagModel.findById(id);
        res.status(200).json({ success: true, tag });
      } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
      }
      break;

    case "POST":
      try {
        const body = await parseForm(req);
        const id = body.field.id;
        const values = JSON.parse(body.field.value);
        const tag = {
          name: body.field.name,
          values,
          hideAttribute: body.field.hideAttribute,
        };
        await tagModel.findByIdAndUpdate(id, tag);
        res.status(200).json({ success: true });
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
