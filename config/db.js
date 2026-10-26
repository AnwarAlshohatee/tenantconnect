const mongoose = require("mongoose");

// Connect to our TenantConnect MongoDB database.
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("TenantConnect connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

module.exports = connectDB;