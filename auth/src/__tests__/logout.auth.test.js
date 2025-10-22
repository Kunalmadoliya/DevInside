const request = require("supertest");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const app = require("../app");
const userModel = require("../models/auth.model");

beforeAll(async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("Missing MONGO_URI in .env.test");
  await mongoose.connect(uri);
  console.log("✅ Connected to test database");
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  console.log("🧹 Test database closed");
});

beforeEach(async () => {
  await userModel.deleteMany({});
});

describe("GET /api/auth/logout", () => {
  it(
    "clears the auth cookie and returns 200 when logged in",
    async () => {
      const password = "Secret123!";
      const hashedPassword = await bcrypt.hash(password, 10);
      await userModel.create({
        fullName: { firstName: "Log", lastName: "Out" },
        userName: "logout_user",
        email: "logout@example.com",
        password: hashedPassword,
      });

      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: "logout@example.com", password });


        console.log(lo);
        

      expect(loginRes.status).toBe(200);
      const cookies = loginRes.headers["set-cookie"];
      expect(cookies).toBeDefined();

      const res = await request(app)
        .get("/api/auth/logout")
        .set("Cookie", cookies);

      expect(res.status).toBe(200);
      const setCookie = res.headers["set-cookie"] || [];
      const cookieStr = setCookie.join(";");
      expect(cookieStr).toMatch(/token=;/);
      expect(cookieStr.toLowerCase()).toMatch(/expires=/);
    },
    20000 // increased timeout
  );

  it("is idempotent: returns 200 even without auth cookie", async () => {
    const res = await request(app).get("/api/auth/logout");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("User logged out successfully");
  });
});
