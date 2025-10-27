import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

// Prevent multiple connection attempts
let conn = null;
async function connectDB() {
  if (conn) return conn;
  conn = await mongoose.connect(uri, {
    dbName: "reviewsDB",
    bufferCommands: false,
  });
  return conn;
}

// Schema
const reviewSchema = new mongoose.Schema({
  name: { type: String, default: "Anonymous" },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Avoid model overwrite
const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

// API Route ✅ Works on Vercel
export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    const reviews = await Review.find().sort({ createdAt: -1 }).limit(100);
    return res.status(200).json(reviews);
  }

  if (req.method === "POST") {
    const { name, rating, text } = req.body;
    if (!rating || !text) {
      return res.status(400).json({ error: "Rating & text required" });
    }
    const review = await Review.create({ name, rating, text });
    return res.status(201).json(review);
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
