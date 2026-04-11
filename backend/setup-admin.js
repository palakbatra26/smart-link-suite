import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://palakbatra79_db_user:Gu8JSGCqJIrd2bKb@cluster0.zywebrp.mongodb.net/smartlinksuite";

await mongoose.connect(MONGO_URI);
console.log("Connected to MongoDB");

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

// Make admin endpoint
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

// Make palakbatra79@gmail.com admin
const user = await User.findOneAndUpdate({ email: "palakbatra79@gmail.com" }, { role: "admin" }, { new: true });
if (user) {
  console.log("SUCCESS: palakbatra79@gmail.com is now admin!");
  console.log(user);
} else {
  console.log("User not found");
}

await mongoose.disconnect();
process.exit(0);