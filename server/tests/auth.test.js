import request from "supertest";
import app from "../app.js";

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
});
