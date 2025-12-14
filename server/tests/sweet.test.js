import request from "supertest";
import app from "../app.js";
import jwt from "jsonwebtoken";
import {
  connectTestDB,
  clearTestDB,
  closeTestDB,
} from "./setupDB.js";

// Test environment setup
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

describe("Sweet API", () => {
  it("should allow ADMIN to create a sweet", async () => {
    const adminToken = generateTestToken("ADMIN");

    const res = await request(app)
      .post("/api/sweets")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Gulab Jamun",
        category: "Indian",
        price: 10,
        quantity: 50,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({
      name: "Gulab Jamun",
      category: "Indian",
      price: 10,
      quantity: 50,
    });
  });
});
