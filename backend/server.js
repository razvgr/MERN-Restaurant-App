require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const Product = require("./models/Product");
const User = require("./models/User");
const Reservation = require("./models/Reservation");
const Voucher = require("./models/Voucher");
const Feedback = require("./models/Feedback");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const fs = require("fs");
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Middleware
app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true, 
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Conectat la MongoDB"))
  .catch((err) => console.error("❌ Eroare la conectare:", err));

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  console.log("Token primit în authenticateToken:", token); // Log token
  if (!token) {
    console.log("Token lipsă. Acces neautorizat.");
    return res.status(401).json({ message: "Acces neautorizat. Token lipsă." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Eroare la verificarea token-ului:", err.message);
      return res.status(403).json({ message: "Token invalid.", error: err.message });
    }
    console.log("Token valid. Utilizator:", user); // Log utilizator
    req.user = user;
    next();
  });
};

app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    const categorizedProducts = products.reduce((acc, product) => {
      acc[product.category] = acc[product.category] || [];
      acc[product.category].push(product);
      return acc;
    }, {});
    res.json(categorizedProducts);
  } catch (err) {
    console.error("Eroare la obținerea produselor:", err);
    res.status(500).json({ error: "Eroare la obținerea produselor" });
  }
});

app.post("/products", authenticateToken, upload.single("image"), async (req, res) => {
  try {
    const { category, name, price, description, toppings } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const newProduct = new Product({
      category,
      name,
      price: parseFloat(price),
      description,
      imageUrl,
      toppings: JSON.parse(toppings) || [],
    });
    await newProduct.save();
    res.status(201).json({ message: "Produs adăugat cu succes!" });
  } catch (error) {
    res.status(500).json({ message: "Eroare la adăugarea produsului.", error: error.message });
  }
});

app.delete("/products/:id", authenticateToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Produsul nu a fost găsit" });
    }

    const imagePath = path.join(__dirname, product.imageUrl);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log(`Imaginea ${imagePath} a fost ștearsă cu succes`);
    } else {
      console.warn(`Imaginea ${imagePath} nu a fost găsită pe server`);
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Produs și imagine șterse cu succes" });
  } catch (err) {
    console.error("Eroare la ștergerea produsului:", err);
    res.status(500).json({ error: "Eroare la ștergerea produsului" });
  }
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  console.log("Cerere de înregistrare de la:", req.headers.origin, { username, password });

  if (!username || !password) {
    return res.status(400).json({ message: "Username și parolă sunt obligatorii." });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Utilizatorul există deja." });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log("Parolă criptată cu succes pentru:", username);

    const user = new User({
      username,
      password: hashedPassword,
    });
    await user.save();
    console.log("Utilizator înregistrat:", username);
    res.status(201).json({ message: "Utilizator înregistrat cu succes." });
  } catch (error) {
    console.error("❌ Eroare la înregistrare:", error.message, error.stack);
    res.status(500).json({ message: "Eroare la înregistrare.", error: error.message });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("Cerere de login de la:", req.headers.origin, { username, password });

  if (!username || !password) {
    return res.status(400).json({ message: "Username și parolă sunt obligatorii." });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log("Utilizator negăsit:", username);
      return res.status(401).json({ message: "Credențiale incorecte." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Parolă incorectă pentru:", username);
      return res.status(401).json({ message: "Credențiale incorecte." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log("Login reușit, token generat pentru:", username);
    res.json({ token, role: user.role });
  } catch (error) {
    console.error("❌ Eroare la login:", error.message, error.stack);
    res.status(500).json({ message: "Eroare la login.", error: error.message });
  }
});

app.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.error("Eroare la obținerea datelor utilizatorului:", error);
    res.status(500).json({ message: "Eroare la obținerea datelor utilizatorului.", error: error.message });
  }
});

app.put("/me/username", authenticateToken, async (req, res) => {
  const { username } = req.body;
  const userId = req.user.id;

  if (!username) {
    return res.status(400).json({ message: "Numele de utilizator este obligatoriu." });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({ message: "Numele de utilizator este deja folosit." });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { username },
      { new: true }
    );
    res.status(200).json(user);
  } catch (error) {
    console.error("Eroare la actualizarea username-ului:", error);
    res.status(500).json({ message: "Eroare la actualizarea username-ului." });
  }
});

app.put("/me/password", authenticateToken, async (req, res) => {
  const { password } = req.body;
  const userId = req.user.id;

  if (!password) {
    return res.status(400).json({ message: "Parola este obligatorie." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });
    res.status(200).json({ message: "Parola a fost actualizată cu succes!" });
  } catch (error) {
    console.error("Eroare la actualizarea parolei:", error);
    res.status(500).json({ message: "Eroare la actualizarea parolei." });
  }
});

const Order = require("./models/Order");

app.post("/orders", authenticateToken, async (req, res) => {
  const { items, total, address, paymentMethod, notes, voucherId } = req.body;
  const userId = req.user.id;

  if (!items || !total || !address) {
    return res.status(400).json({ message: "Toate câmpurile obligatorii (items, total, address) sunt necesare." });
  }

  try {
    let finalTotal = parseFloat(total);

    if (voucherId) {
      const voucher = await Voucher.findById(voucherId);
      if (!voucher) {
        return res.status(404).json({ message: "Voucherul nu a fost găsit." });
      }
      console.log("Produse în comandă:", items);
      const applicableSubtotal = items.reduce((total, item) => {
        if (!voucher || !voucher.applicableCategories) {
          console.warn("⚠️ Voucherul nu are applicableCategories:", voucher);
          return total;
        }
      
        const isApplicable =
          voucher.applicableCategories.length === 0 || 
          voucher.applicableCategories.includes(item.category.toLowerCase());
      
        return isApplicable ? total + item.price * item.quantity : total;
      }, 0);
      

      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      let discount = 0;
      if (voucher.valueType === "fixed") {
        discount = Math.min(applicableSubtotal, voucher.value); 
        finalTotal = subtotal - discount;
      } else if (voucher.valueType === "percentage") {
        discount = (applicableSubtotal * voucher.value) / 100;
        finalTotal = subtotal - discount;
      }

      if (Math.abs(finalTotal - parseFloat(total)) > 0.1) { 
        console.error(`⚠️ Eroare total mismatch: Expected ${finalTotal}, received ${total}`);
        return res.status(400).json({ message: `Totalul calculat (${finalTotal}) nu corespunde cu cel trimis (${total})` });
      }
      
    }

    const order = new Order({
      userId,
      items,
      total: finalTotal,
      address,
      paymentMethod,
      notes,
      status: "pending",
      createdAt: new Date(),
      voucherId: voucherId || null,
    });

    await order.save();
    console.log(`Comandă salvată cu succes în MongoDB: ${order._id}`);
    res.status(201).json({ message: "Comanda a fost plasată cu succes!" });
  } catch (error) {
    console.error("Eroare la salvarea comenzii:", error);
    res.status(500).json({ message: "Eroare la procesarea comenzii." });
  }
});

app.get("/orders", authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "username")
      .sort({ createdAt: -1 }); 
    res.status(200).json(orders);
  } catch (error) {
    console.error("Eroare la preluarea comenzilor:", error);
    res.status(500).json({ message: "Eroare la preluarea comenzilor." });
  }
});

app.get("/orders/user", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId })
      .populate("voucherId", "description")
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Eroare la preluarea comenzilor:", error);
    res.status(500).json({ message: "Eroare la preluarea comenzilor." });
  }
});

app.patch("/orders/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (req.user.role !== "curier") {
    return res.status(403).json({ message: "Acces interzis. Doar curierii pot actualiza status-ul comenzilor." });
  }

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Comanda nu a fost găsită." });
    }

    order.status = status;
    await order.save();
    res.status(200).json({ message: "Status-ul comenzii a fost actualizat." });
  } catch (error) {
    console.error("Eroare la actualizarea comenzii:", error);
    res.status(500).json({ message: "Eroare la actualizarea comenzii." });
  }
});

app.post("/feedback", async (req, res) => {
  const { message } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!message) {
    return res.status(400).json({ message: "Mesajul este obligatoriu." });
  }

  try {
    let userId = null;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
      userId = decoded.id;
    }

    const feedback = new Feedback({
      userId,
      message,
    });

    await feedback.save();
    res.status(201).json({ message: "Feedback-ul a fost trimis cu succes!" });
  } catch (error) {
    console.error("Eroare la salvarea feedback-ului:", error);
    res.status(500).json({ message: "Eroare la procesarea feedback-ului." });
  }
});

app.get("/feedback", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Acces interzis. Doar adminii pot vedea feedback-urile." });
  }

  try {
    const feedbackList = await Feedback.find()
      .populate("userId", "username") 
      .sort({ createdAt: -1 }); 
    res.status(200).json(feedbackList);
  } catch (error) {
    console.error("Eroare la preluarea feedback-urilor:", error);
    res.status(500).json({ message: "Eroare la preluarea feedback-urilor." });
  }
});

app.post("/reservations", async (req, res) => {
  try {
    const { name, phone, date, time, numberOfPeople, userId } = req.body;

    if (!name || !phone || !date || !time || !numberOfPeople) {
      return res.status(400).json({ message: "Toate câmpurile sunt obligatorii." });
    }

    const hour = time.split(":")[0];
    const startTime = `${hour}:00`;
    const endTime = `${hour}:59`;

    const existingReservations = await Reservation.find({
      date: date,
      time: { $gte: startTime, $lte: endTime }, 
    });

    const totalPeople = existingReservations.reduce((sum, reservation) => sum + reservation.numberOfPeople, 0);

    if (totalPeople + numberOfPeople > 50) {
      return res.status(400).json({
        message: `Ne pare rău, limita de 50 de persoane pentru ora ${startTime} a fost atinsă. Te rugăm să alegi o altă oră.`,
      });
    }

    const reservation = new Reservation({
      name,
      phone,
      date,
      time,
      numberOfPeople: parseInt(numberOfPeople),
      userId: userId || null,
    });

    await reservation.save();
    console.log("Rezervare salvată cu succes:", reservation._id);
    res.status(201).json({ message: "Rezervare creată cu succes!", reservation });
  } catch (error) {
    console.error("❌ Eroare la crearea rezervării:", error.message, error.stack);
    res.status(500).json({ message: "Eroare la crearea rezervării.", error: error.message });
  }
});

app.delete("/reservations/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Acces interzis. Doar adminii pot șterge rezervări." });
    }
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "Rezervarea nu a fost găsită." });
    }
    res.status(200).json({ message: "Rezervare ștearsă cu succes!" });
  } catch (error) {
    console.error("❌ Eroare la ștergerea rezervării:", error.message, error.stack);
    res.status(500).json({ message: "Eroare la ștergerea rezervării.", error: error.message });
  }
});

app.get("/reservations", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Acces interzis. Doar adminii pot vedea rezervările." });
    }
    const reservations = await Reservation.find();
    res.status(200).json(reservations);
  } catch (error) {
    console.error("❌ Eroare la preluarea rezervărilor:", error.message, error.stack);
    res.status(500).json({ message: "Eroare la preluarea rezervărilor.", error: error.message });
  }
});

app.post("/vouchers", authenticateToken, upload.single("image"), async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Acces interzis. Doar adminii pot adăuga vouchere." });
    }

    const { description, value, valueType } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    let applicableCategories = req.body.applicableCategories || [];

    if (typeof applicableCategories === "string") {
      applicableCategories = applicableCategories.split(",").map(cat => cat.trim().toLowerCase());
    }

    const validCategories = ["pizza", "antreuri", "paste", "burgeri", "salate", "desert", "bauturi"];
    applicableCategories = applicableCategories.filter(cat => validCategories.includes(cat));

    if (applicableCategories.length === 0) {
      return res.status(400).json({ message: "Voucherul trebuie să aibă cel puțin o categorie validă." });
    }

    const newVoucher = new Voucher({
      description,
      value: parseFloat(value),
      valueType,
      imageUrl,
      applicableCategories
    });

    await newVoucher.save();
    res.status(201).json({ message: "Voucher adăugat cu succes!", voucher: newVoucher });
  } catch (error) {
    console.error("Eroare la adăugarea voucherului:", error);
    res.status(500).json({ message: "Eroare la adăugarea voucherului.", error: error.message });
  }
});


app.get("/vouchers", async (req, res) => {
  try {
    const vouchers = await Voucher.find();
    res.status(200).json(vouchers);
  } catch (error) {
    console.error("Eroare la preluarea voucherelor:", error);
    res.status(500).json({ message: "Eroare la preluarea voucherelor.", error: error.message });
  }
});

app.delete("/vouchers/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Acces interzis. Doar adminii pot șterge vouchere." });
    }

    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ message: "Voucherul nu a fost găsit." });
    }

    const imagePath = path.join(__dirname, voucher.imageUrl);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log(`Imaginea ${imagePath} a fost ștearsă cu succes`);
    } else {
      console.warn(`Imaginea ${imagePath} nu a fost găsită pe server`);
    }

    await Voucher.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Voucher și imagine șterse cu succes." });
  } catch (error) {
    console.error("Eroare la ștergerea voucherului:", error);
    res.status(500).json({ message: "Eroare la ștergerea voucherului.", error: error.message });
  }
});

app.get("/top-products", async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $unwind: "$items" }, 
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" }, 
          price: { $first: "$items.price" },
          sales: { $sum: "$items.quantity" },
        },
      },
      { $sort: { sales: -1 } }, 
      { $limit: 5 }, 
    ]);

    res.status(200).json(topProducts);
  } catch (error) {
    console.error("Eroare la preluarea celor mai vândute produse:", error);
    res.status(500).json({ message: "Eroare la preluarea celor mai vândute produse.", error: error.message });
  }
});

app.get("/users", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Acces interzis. Doar adminii pot accesa această rută." });
  }

  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Eroare la preluarea utilizatorilor:", error);
    res.status(500).json({ message: "Eroare la preluarea utilizatorilor." });
  }
});

app.delete("/users/:id", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Acces interzis. Doar adminii pot șterge utilizatori." });
  }

  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit." });
    }

    if (user.role === "admin") {
      return res.status(403).json({ message: "Nu poți șterge un admin." });
    }

    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "Utilizatorul a fost șters cu succes!" });
  } catch (error) {
    console.error("Eroare la ștergerea utilizatorului:", error);
    res.status(500).json({ message: "Eroare la ștergerea utilizatorului." });
  }
});

app.put("/users/:id/role", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Acces interzis. Doar adminii pot modifica roluri." });
  }

  const { role } = req.body;
  const userId = req.params.id;

  if (!["client", "curier"].includes(role)) {
    return res.status(400).json({ message: "Rolul trebuie să fie 'client' sau 'curier'." });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "ID-ul utilizatorului este invalid." });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit." });
    }

    if (user.role === "admin") {
      return res.status(403).json({ message: "Nu poți modifica rolul unui admin." });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ message: "Rolul utilizatorului a fost actualizat cu succes!" });
  } catch (error) {
    console.error("Eroare la actualizarea rolului:", error.message, error.stack);
    res.status(500).json({ message: "Eroare la actualizarea rolului.", error: error.message });
  }
});

app.post("/register-user", authenticateToken, async (req, res) => {
  const { username, password, role } = req.body;
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!role || !["curier", "admin"].includes(role)) {
    return res.status(400).json({ message: "Rolul este obligatoriu și trebuie să fie 'curier' sau 'admin'." });
  }

  try {
    const user = await User.findById(jwt.verify(token, process.env.JWT_SECRET).id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Doar administratorii pot înregistra utilizatori." });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username-ul este deja utilizat." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      role, 
    });
    await newUser.save();

    res.status(201).json({ message: `Contul de ${role} ${username} a fost creat cu succes!` });
  } catch (error) {
    console.error(`Eroare la înregistrarea utilizatorului (${role}):`, error);
    res.status(500).json({ message: `Eroare la înregistrarea utilizatorului (${role}).`, error: error.message });
  }
});

const initAdmin = async () => {
  const adminUsername = "admin";
  const adminPassword = "admin";
  try {
    const adminExists = await User.findOne({ username: adminUsername });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const adminUser = new User({
        username: adminUsername,
        password: hashedPassword,
        role: "admin",
      });
      await adminUser.save();
      console.log("✅ Contul admin a fost creat.");
    } else {
      console.log("✅ Contul admin există deja.");
    }
  } catch (error) {
    console.error("❌ Eroare la crearea contului admin:", error.message, error.stack);
  }
};

initAdmin().catch((err) => console.error("Eroare la inițializarea admin:", err));

const initCourier = async () => {
  const courierUsername = "curier";
  const courierPassword = "curier";
  try {
    const courierExists = await User.findOne({ username: courierUsername });
    if (!courierExists) {
      const hashedPassword = await bcrypt.hash(courierPassword, 10);
      const courierUser = new User({
        username: courierUsername,
        password: hashedPassword,
        role: "curier",
      });
      await courierUser.save();
      console.log("✅ Contul curier a fost creat.");
    } else {
      console.log("✅ Contul curier există deja.");
    }
  } catch (error) {
    console.error("❌ Eroare la crearea contului curier:", error.message, error.stack);
  }
};

initCourier().catch((err) => console.error("Eroare la inițializarea curier:", err));

// pornire server
const PORT = process.env.PORT || 5555;
app.listen(PORT, () => console.log(`🚀 Server pornit pe portul ${PORT}`));