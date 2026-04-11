import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://palakbatra79_db_user:Gu8JSGCqJIrd2bKb@cluster0.zywebrp.mongodb.net/smartlinksuite";

mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  apiKey: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const shortUrlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortId: { type: String, required: true, unique: true },
  customAlias: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  clicks: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  expiryDate: { type: String },
  password: { type: String }
});

const analyticsSchema = new mongoose.Schema({
  urlId: { type: mongoose.Schema.Types.ObjectId, ref: "ShortUrl" },
  ip: { type: String },
  country: { type: String },
  city: { type: String },
  device: { type: String, enum: ["mobile", "desktop", "tablet"] },
  browser: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
const ShortUrl = mongoose.model("ShortUrl", shortUrlSchema);
const Analytics = mongoose.model("Analytics", analyticsSchema);

function generateShortId() {
  return Math.random().toString(36).slice(2, 8);
}

function generateApiKey() {
  return `sk_live_${Math.random().toString(36).slice(2, 14)}`;
}

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already registered" });
    
    const user = new User({ name, email, password, apiKey: generateApiKey() });
    await user.save();
    
    const token = Buffer.from(`${user._id}:${user.password}`).toString("base64");
    res.json({ 
      user: { id: user._id, email: user.email, name: user.name, role: user.role, apiKey: user.apiKey, createdAt: user.createdAt },
      token 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    
    const token = Buffer.from(`${user._id}:${user.password}`).toString("base64");
    res.json({ 
      user: { id: user._id, email: user.email, name: user.name, role: user.role, apiKey: user.apiKey, createdAt: user.createdAt },
      token 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// URL Routes
app.get("/api/urls", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const urls = await ShortUrl.find({ userId }).sort({ createdAt: -1 });
    res.json(urls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/urls", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const { originalUrl, customAlias, expiryDate, password } = req.body;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    
    let shortId = customAlias || generateShortId();
    const existing = await ShortUrl.findOne({ shortId });
    if (existing) shortId = `${shortId}-${Date.now()}`;
    
    const url = new ShortUrl({ originalUrl, shortId, customAlias, userId, expiryDate, password });
    await url.save();
    res.json(url);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/urls/:id", async (req, res) => {
  try {
    await ShortUrl.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/urls/:id", async (req, res) => {
  try {
    const url = await ShortUrl.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(url);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/urls/:id/toggle", async (req, res) => {
  try {
    const url = await ShortUrl.findById(req.params.id);
    url.isActive = !url.isActive;
    await url.save();
    res.json(url);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Routes
app.get("/api/admin/users", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const admin = await User.findById(userId);
    if (!admin || admin.role !== "admin") return res.status(403).json({ error: "Admin only" });
    
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/urls", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const admin = await User.findById(userId);
    if (!admin || admin.role !== "admin") return res.status(403).json({ error: "Admin only" });
    
    const urls = await ShortUrl.find().populate("userId", "name email");
    res.json(urls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/stats", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const admin = await User.findById(userId);
    if (!admin || admin.role !== "admin") return res.status(403).json({ error: "Admin only" });
    
    const totalUsers = await User.countDocuments();
    const totalUrls = await ShortUrl.countDocuments();
    const activeLinks = await ShortUrl.countDocuments({ isActive: true });
    const urls = await ShortUrl.find();
    const totalClicks = urls.reduce((sum, u) => sum + u.clicks, 0);
    
    res.json({ totalUsers, totalUrls, totalClicks, activeLinks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/admin/make-admin", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOneAndUpdate({ email }, { role: "admin" }, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Redirect route
app.get("/r/:shortId", async (req, res) => {
  try {
    const { shortId } = req.params;
    console.log("Redirect request for:", shortId);
    const url = await ShortUrl.findOne({ shortId });
    if (!url) {
      console.log("URL not found");
      return res.status(404).send("Link not found");
    }
    if (!url.isActive) {
      console.log("URL is disabled");
      return res.status(410).send("Link is disabled");
    }
    console.log("Redirecting to:", url.originalUrl);
    url.clicks += 1;
    await url.save();
    res.redirect(url.originalUrl);
  } catch (err) {
    console.error("Redirect error:", err);
    res.status(500).send("Error");
  }
});

app.get("/password/:shortId", async (req, res) => {
  const { shortId } = req.params;
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Password Required</title></head>
    <body style="font-family: system-ui; padding: 2rem; max-width: 400px; margin: 50px auto;">
      <h1>Password Required</h1>
      <form method="POST">
        <input type="password" name="password" placeholder="Enter password" style="width: 100%; padding: 0.5rem; margin: 1rem 0;" />
        <button type="submit" style="width: 100%; padding: 0.5rem; background: #000; color: #fff; border: none;">Unlock</button>
      </form>
    </body>
    </html>
  `);
});

app.post("/password/:shortId", async (req, res) => {
  try {
    const { shortId } = req.params;
    const { password } = req.body;
    const url = await ShortUrl.findOne({ shortId, password });
    if (!url) return res.status(401).send("Invalid password");
    url.clicks += 1;
    await url.save();
    res.redirect(url.originalUrl);
  } catch (err) {
    res.status(500).send("Error");
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));