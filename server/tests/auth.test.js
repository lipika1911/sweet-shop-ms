import request from "supertest";
import app from "../app.js";
import {
  connectTestDB,
  clearTestDB,
  closeTestDB,
} from "./setupDB.js";

process.env.JWT_SECRET = "test-secret";

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe("Auth API", () => {
  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Lipika",
        email: "lipika@test.com",
        password: "password123",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
  });

  it("should login an existing user", async () => {
    await request(app)
        .post("/api/auth/register")
        .send({
        name: "Lipika",
        email: "lipika@test.com",
        password: "password123",
        });
    const res = await request(app)
        .post("/api/auth/login")
        .send({
        email: "lipika@test.com",
        password: "password123",
        });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    });

});
