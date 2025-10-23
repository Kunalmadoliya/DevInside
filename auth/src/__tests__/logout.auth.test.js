const request = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../app");
const connectDB = require("../db/db");
const User = require("../models/auth.model");

jest.setTimeout(20000);

describe("GET /api/auth/logout", () => {
  let cookie;

  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });
  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash("logout123", 10);
    await User.create({
      userName: "logout_user",
      email: "logout@example.com",
      password: hashedPassword,
      fullName: {firstName: "Log", lastName: "Out"},
      role: "user",
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({email: "logout@example.com", password: "logout123"})
      .expect(200);

    cookie = res.headers["set-cookie"];
  });

  it("should clear auth cookie and return 200 when logged in", async () => {
    const res = await request(app)
      .get("/api/auth/logout")
      .set("Cookie", cookie)
      .expect(200);

    const cookieStr = res.headers["set-cookie"]?.[0] || "";
    expect(cookieStr).toMatch(/token=;/);
    expect(cookieStr.toLowerCase()).toMatch(/expires=/);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("User logged out successfully");
  });

  it("should return 200 even without auth cookie", async () => {
    const res = await request(app).get("/api/auth/logout").expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("User logged out successfully");
  });
});
