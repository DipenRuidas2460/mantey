import sessionChecker from "~/lib/sessionPermission";
import CustomFieldModel from "../../../models/customfieldmodel";
import dbConnect from "../../../utils/dbConnect";

export default async function apiHandler(req, res) {
  const { method } = req;
  if (!(await sessionChecker(req, "customfieldss")))
    return res
      .status(403)
      .json({ success: false, message: "Access Forbidden" });

  await dbConnect();

  switch (method) {
    case "DELETE":
      try {
        const { id } = req.query;
        await CustomFieldModel.findByIdAndRemove(id);
        res.json({ success: true });
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
