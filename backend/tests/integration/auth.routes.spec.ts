import request from "supertest";
import { app } from "../../src/app";
import mongoose from "mongoose";

describe("Auth routes", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/brainly_test");
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it("should signup and return JWT", async () => {
    const res = await request(app)
      .post("/api/v1/auth/signup")
      .send({ username: "testuser", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it("should login and return JWT", async () => {
    await request(app)
      .post("/api/v1/auth/signup")
      .send({ username: "loginuser", password: "password123" });

    const res = await request(app)
      .post("/api/v1/auth/signin")
      .send({ username: "loginuser", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });
}
);

