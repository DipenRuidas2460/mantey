import { model, models, Schema } from "mongoose";
import { tag } from "~/utils/modelData.mjs";

const tagSchema = new Schema(tag);

export default models.tag || model("tag", tagSchema);
