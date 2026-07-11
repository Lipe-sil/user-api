import request from "supertest";
import mongoose from "mongoose";
import app from "../../src/app";
import { beforeAll, afterAll, describe, expect, it } from "@jest/globals";
import { UserModel } from "../../src/models/user.model";

import { connectDatabase } from "../../src/database/database";

beforeAll(async () => {
  await connectDatabase();
  await UserModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("POST /users", () => {
  it("should create user", async () => {
    const response = await request(app).post("/users").send({
      name: "Felipe",
      lastName: "Silva",
      email: "felipe@test.com",
      password: "123456",
    });

    expect(response.status).toBe(201);
  });

  it("should not create user", async () => {
    const response = await request(app).post("/users").send({
      name: "Felipe",
      email: "felipe@test.com",
      password: "123456",
    });

    expect(response.status).toBe(400);
  });
});
