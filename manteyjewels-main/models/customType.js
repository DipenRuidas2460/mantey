import { model, models, Schema } from "mongoose";
import { customType } from "~/utils/modelData.mjs";

const customTypeSchema = new Schema(customType);

export default models.customType || model("customType", customTypeSchema);
