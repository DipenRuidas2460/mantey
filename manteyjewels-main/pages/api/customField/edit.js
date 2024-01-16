import sessionChecker from "~/lib/sessionPermission";
import CustomFieldModel from "../../../models/customfieldmodel";
import dbConnect from "../../../utils/dbConnect";
import { parseForm } from "../../../utils/parseForm";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function apiHandler(req, res) {
  const { method } = req;
  if (!(await sessionChecker(req, "customfieldss")))
    return res
      .status(403)
      .json({ success: false, message: "Access Forbidden" });

  await dbConnect();

  switch (method) {
    case "POST":
      try {
        const data = await parseForm(req);
        const { customfield, loginuserid } = data.field;
        const customData = JSON.parse(customfield).map((e) => {
          return {
            _id: e?._id,
            Name: e.Name,
            NeedInFilter: e.NeedInFilter,
            TypeId: e.TypeId,
            TypeName:
              e.TypeId == 1
                ? "Text"
                : e.TypeId == 2
                ? "Dropdown"
                : e.TypeId == 3
                ? "Textarea"
                : e.TypeId == 4
                ? "Checkbox"
                : e.TypeId == 5
                ? "Phone Number"
                : e.TypeId == 6
                ? "Website"
                : e.TypeId == 7
                ? "E-mail"
                : e.TypeId == 8
                ? "File"
                : e.TypeId == 9
                ? "Date"
                : "",
            Optionvalue:
              typeof e.Optionvalue === "string"
                ? e.Optionvalue.split(",")
                : e.Optionvalue,
            HideFieldLabel: e.HideFieldLabel,
            Required: e.Required,
            createdBy: loginuserid,
            modifiedBy: loginuserid,
            isDeleted: false,
          };
        });

        const bulkOperations = [];
        const bulkInsertOperations = [];

        // Iterate over the updateArray and build the update operations
        customData.forEach((updateObj) => {
          if (updateObj._id) {
            const updateOperation = {
              updateMany: {
                filter: { _id: { $in: updateObj._id } },
                update: { $set: updateObj },
                upsert: true,
              },
            };
            bulkOperations.push(updateOperation);
          } else {
            bulkInsertOperations.push(updateObj);
          }
        });

        await CustomFieldModel.bulkWrite(bulkOperations);

        await CustomFieldModel.insertMany(bulkInsertOperations);

        res.status(200).json({ success: true });
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
