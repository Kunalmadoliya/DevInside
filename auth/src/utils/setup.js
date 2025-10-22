require("dotenv").config({ path: ".env.test" });
const mongoose = require("mongoose");

beforeAll(async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("Missing MONGO_URI in .env.test");
    await mongoose.connect(uri);
    console.log("✅ Connected to test database");
  } catch (err) {
    console.error("❌ Test DB connection failed:", err);
    throw err;
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  console.log("🧹 Test database closed");
});
