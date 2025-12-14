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

  it("should return empty array if no sweets exist", async () => {
    const userToken = jwt.sign(
        { id: "user456", role: "USER" },
        process.env.JWT_SECRET
    );

    const res = await request(app)
        .get("/api/sweets")
        .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
    });

});

describe("PUT /api/sweets/:id", () => {
  let sweetId;
  let adminToken;
  let userToken;

  beforeEach(async () => {
    adminToken = generateTestToken("ADMIN");
    userToken = generateTestToken("USER");

    // Arrange: create a sweet as ADMIN for each test
    const res = await request(app)
      .post("/api/sweets")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Ladoo",
        category: "Indian",
        price: 15,
        quantity: 40,
      });

    sweetId = res.body._id;
  });

  it("should allow ADMIN to update a sweet", async () => {
    const res = await request(app)
      .put(`/api/sweets/${sweetId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        price: 20,
        quantity: 60,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      price: 20,
      quantity: 60,
    });
  });

  it("should block USER from updating a sweet", async () => {
    const res = await request(app)
      .put(`/api/sweets/${sweetId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        price: 30,
      });

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("message");
  });

  it("should return 404 if sweet does not exist", async () => {
    const nonExistentId = "64f000000000000000000000";

    const res = await request(app)
      .put(`/api/sweets/${nonExistentId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        price: 50,
      });

    expect(res.statusCode).toBe(404);
  });

});

describe("DELETE /api/sweets/:id", () => {
  let sweetId;
  let adminToken;
  let userToken;

  beforeEach(async () => {
    adminToken = generateTestToken("ADMIN");
    userToken = generateTestToken("USER");

    const res = await request(app)
      .post("/api/sweets")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Barfi",
        category: "Indian",
        price: 12,
        quantity: 25,
      });

    sweetId = res.body._id;
  });

  it("should allow ADMIN to delete a sweet", async () => {
    const res = await request(app)
      .delete(`/api/sweets/${sweetId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
  });

  it("should block USER from deleting a sweet", async () => {
    const res = await request(app)
      .delete(`/api/sweets/${sweetId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("message");
  });

  it("should return 404 if sweet does not exist", async () => {
    const nonExistentId = "64f000000000000000000000";

    const res = await request(app)
      .delete(`/api/sweets/${nonExistentId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
  });
});

describe("POST /api/sweets/:id/purchase", () => {
  let sweetId;
  let adminToken;
  let userToken;

  beforeEach(async () => {
    adminToken = generateTestToken("ADMIN");
    userToken = generateTestToken("USER");

    // Arrange: create sweet with limited quantity
    const res = await request(app)
      .post("/api/sweets")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Kaju Katli",
        category: "Indian",
        price: 30,
        quantity: 2,
      });

    sweetId = res.body._id;
  });

  it("should allow USER to purchase a sweet and decrement quantity", async () => {
    const res = await request(app)
      .post(`/api/sweets/${sweetId}/purchase`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("quantity");
    expect(res.body.quantity).toBe(1);
  });

  it("should not allow purchase when quantity is zero", async () => {
    await request(app)
      .post(`/api/sweets/${sweetId}/purchase`)
      .set("Authorization", `Bearer ${userToken}`);

    await request(app)
      .post(`/api/sweets/${sweetId}/purchase`)
      .set("Authorization", `Bearer ${userToken}`);

    // Third attempt to purchase should fail
    const res = await request(app)
      .post(`/api/sweets/${sweetId}/purchase`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

});
