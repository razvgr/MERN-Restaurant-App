const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      toppings: [String],
    },
  ],
  total: { type: Number, required: true },
  address: { type: String, required: true },
  paymentMethod: { type: String, enum: ["cash", "card"], required: true },
  notes: { type: String },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
  voucherId: { type: mongoose.Schema.Types.ObjectId, ref: "Voucher", default: null }, // Adaugă câmp pentru voucher
});

module.exports = mongoose.model("Order", orderSchema);