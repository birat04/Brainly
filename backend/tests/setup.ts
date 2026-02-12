import mongoose from "mongoose";

beforeAll(async () => {
  const uri = process.env.MONGO_URI_TEST || "mongodb://127.0.0.1:27017/brainly_test";
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

