const request = require("supertest");
const app = require("../app");
const connectDB = require("../db/db");
const userModel = require("../models/auth.model");
const bcrypt = require("bcrypt");

describe("POST /api/auth/login", () => {
  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    // Clean users before each test
    await userModel.deleteMany({});
  });

  it("logs in with correct credentials and returns 200 with user and sets cookie", async () => {
    const password = "Secret123!";
    const hashedPassword = await bcrypt.hash(password, 10);

    await userModel.create({
      fullName: {firstName: "Kunal", lastName: "Doe"},
      userName: "kunal_doe",
      email: "kunal@example.com",
      password: hashedPassword,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({email: "kunal@example.com", password});

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe("kunal@example.com");

    // Check if cookie is set
    const setCookie = res.headers["set-cookie"];
    expect(setCookie).toBeDefined();
    expect(setCookie.join(";")).toMatch(/token=/);
  });

  it("rejects wrong password with 400", async () => {
    const password = "Secret123!";
    const hashedPassword = await bcrypt.hash(password, 10);

    await userModel.create({
      fullName: {firstName: "Kunal", lastName: "Doe"},
      userName: "kunal_doe",
      email: "kunal@example.com",
      password: hashedPassword,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({email: "jack@example.com", password: "WrongPass1!"});

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });

  it("validates missing fields with 400", async () => { const res = await request(app).post("/api/auth/login").send({}); expect(res.status).toBe(400); expect(res.body.errors).toBeDefined(); });
});
