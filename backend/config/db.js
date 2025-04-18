const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB conectat...");
  } catch (error) {
    console.error("Eroare la conectare:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
