const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema({
  description: { type: String, required: true },
  value: { type: Number, required: true },
  valueType: { type: String, enum: ["fixed", "percentage"], required: true },
  imageUrl: { type: String, required: true },
  applicableCategories: {
    type: [String],
    enum: ["pizza", "antreuri", "paste", "burgeri", "salate", "desert", "bauturi"],
    default: [],
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Voucher", voucherSchema);