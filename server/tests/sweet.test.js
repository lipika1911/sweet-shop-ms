import request from "supertest";
import app from "../app.js";
import jwt from "jsonwebtoken";
import {
  connectTestDB,
  clearTestDB,
  closeTestDB,
} from "./setupDB.js";

// Test environment
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

describe("Sweet API - Create Sweet", () => {
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

  it("should block USER from creating a sweet", async () => {
    const userToken = generateTestToken("USER");

    const res = await request(app)
      .post("/api/sweets")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        name: "Rasgulla",
        category: "Indian",
        price: 8,
        quantity: 20,
      });

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("message");
  });

  it("should return list of sweets for authenticated user", async () => {
    const adminToken = generateTestToken("ADMIN");
    const userToken = generateTestToken("USER");

    // create sweets as admin
    await request(app)
      .post("/api/sweets")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Barfi",
        category: "Indian",
        price: 12,
        quantity: 30,
      });

    await request(app)
      .post("/api/sweets")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Ladoo",
        category: "Indian",
        price: 6,
        quantity: 100,
      });

    // fetch sweets
    const res = await request(app)
      .get("/api/sweets")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });
});
