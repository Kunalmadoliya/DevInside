const request = require("supertest");
const app = require("../app");
const connectDB = require("../db/db");

describe("POST /api/auth/register", () => {
  beforeAll(async () => {
    await connectDB();
  });

  it("creates a user and returns 201 with user (no password)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        fullName: { firstName: "John", lastName: "Doe" },
        userName: "john_doe",
        email: "john@example.com",
        password: "Secret123!",
      });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.userName).toBe("john_doe");
    expect(res.body.user.email).toBe("john@example.com");
    expect(res.body.user.password).toBeUndefined();
  });

  it("rejects duplicate email with 409", async () => {
    const payload = {
      fullName: { firstName: "Dup", lastName: "User" },
      userName: "Dup",
      email: "dup@example.com",
      password: "Secret123!",
    };

    await request(app).post("/api/auth/register").send(payload).expect(201);
    const res = await request(app).post("/api/auth/register").send(payload);


    expect(res.status).toBe(409);
  });

  it("validates missing fields with 400", async () => {
    const res = await request(app).post("/api/auth/register").send({});
    expect(res.status).toBe(400);
  });
});
