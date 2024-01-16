import sessionChecker from "~/lib/sessionPermission";
import CustomTypeModel from "../../../../models/customType";
import dbConnect from "../../../../utils/dbConnect";
import { parseForm } from "../../../../utils/parseForm";


export default async function apiHandler(req, res) {
  const { method } = req;
  if (!(await sessionChecker(req, "customType")))
    return res
      .status(403)
      .json({ success: false, message: "Access Forbidden" });

  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const customType = await CustomTypeModel.find({}).select({name:1, Id:1, _id:0});
        res.status(200).json({
          success: true,
          customType,
        });
      } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
      }
      break;

    // case "POST":
    //   try {
    //     const data = await parseForm(req);
    //     const {
    //       name,
    //     } = data.field;

    //     const customTypeData = {
    //       name,
    //     };
    //     await customFieldModel.create(customTypeData);
    //     res.status(200).json({ success: true });
    //   } catch (err) {
    //     console.log(err);
    //     res.status(500).json({ success: false });
    //   }
    //   break;
    default:
      res.status(400).json({ success: false });
      break;
  }
}
