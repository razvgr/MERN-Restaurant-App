const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email-ul este deja folosit" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "Cont creat cu succes!" });
  } catch (error) {
    res.status(500).json({ message: "Eroare server" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Toate câmpurile sunt obligatorii." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email sau parolă incorectă." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Email sau parolă incorectă." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ message: "Autentificare reușită!", token, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: "Eroare server." });
  }
});

module.exports = router;
