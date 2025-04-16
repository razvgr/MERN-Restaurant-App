const mongoose = require("mongoose");
const Product = require("./models/Product"); // Asigură-te că ai un model pentru produse
require("dotenv").config(); // Dacă folosești variabile de mediu

const products = [
  {
    name: "Pizza Margherita",
    category: "pizza",
    description: "Blat pufos, sos de roșii, mozzarella și busuioc.",
    price: 25,
  },
  {
    name: "Pizza Pepperoni",
    category: "pizza",
    description: "Blat subțire, sos de roșii, mozzarella și pepperoni.",
    price: 30,
  },
  {
    name: "Bruschette cu roșii",
    category: "antreuri",
    description: "Pâine prăjită cu roșii proaspete, usturoi și busuioc.",
    price: 15,
  },
  {
    name: "Plată mixtă",
    category: "antreuri",
    description: "Brânzeturi, mezeluri și măsline.",
    price: 40,
  },
  {
    name: "Cola 500ml",
    category: "bauturi",
    description: "Băutură răcoritoare carbogazoasă.",
    price: 8,
  },
  {
    name: "Apă plată 500ml",
    category: "bauturi",
    description: "Apă minerală naturală.",
    price: 5,
  },
  {
    name: "Oferta 1+1 Pizza",
    category: "oferte",
    description: "Comanzi o pizza și primești una gratis!",
    price: 30,
  },
];

// Conectare la MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Conectat la MongoDB...");
    await Product.deleteMany(); // Șterge toate produsele existente
    await Product.insertMany(products); // Adaugă produsele noi
    console.log("Produsele au fost adăugate cu succes!");
    mongoose.connection.close(); // Închide conexiunea
  })
  .catch((error) => {
    console.error("Eroare la conectarea la MongoDB:", error);
  });
