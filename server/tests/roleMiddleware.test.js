import request from "supertest";
import app from "../app.js";
import jwt from "jsonwebtoken";
import {
  connectTestDB,
  clearTestDB,
  closeTestDB,
} from "./setupDB.js";

process.env.JWT_SECRET = "test-secret";

const generateTestToken = (role) => {
  return jwt.sign(
    { id: "test-user-id", role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe("Role-based authorization middleware", () => {
  it("should block USER from admin-only route", async () => {
    const userToken = generateTestToken("USER");

    const res = await request(app)
      .get("/api/admin-test")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("message");
  });

  it("should allow ADMIN to access admin-only route", async () => {
    const adminToken = generateTestToken("ADMIN");

    const res = await request(app)
      .get("/api/admin-test")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
  });

  it("should return 401 when token is missing", async () => {
    const res = await request(app).get("/api/admin-test");

    expect(res.statusCode).toBe(401);
  });
});
