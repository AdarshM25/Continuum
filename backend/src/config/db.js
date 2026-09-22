const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not set — check your .env file");
  }

  mongoose.connection.on("error", (err) => {
    console.error("[mongo] connection error:", err.message);
  });

  await mongoose.connect(uri);
  console.log(`[mongo] connected -> ${uri}`);
}

module.exports = connectDB;
