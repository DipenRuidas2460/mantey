import { model, models, Schema } from "mongoose";
import { commonSettings } from "~/utils/modelData.mjs";

const commonSettingSchema = new Schema(commonSettings);

export default models.common || model("common", commonSettingSchema);
