const mongoose = require("mongoose")
mongoose.Promise = global.Promise;

const customFieldsProductSchema = new mongoose.Schema({
  Name: {type:String},
  NeedInFilter: { type: Boolean, default: false },
  TypeId:{type:String},
  TypeName:{type:String},
  Optionvalue: [],
  HideFieldLabel: { type: Boolean, default: false },
  Required: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  isDeleted: { type: Boolean, default: false },

} ,{ versionKey: false });

module.exports = mongoose.models.customfieldss || mongoose.model("customfieldss", customFieldsProductSchema)

