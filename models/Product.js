const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  category: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  toppings: { type: [String], default: [] }, // Nou: Array de toppinguri
});

module.exports = mongoose.model("Product", productSchema);