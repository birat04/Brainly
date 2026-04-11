import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/brainly";

async function setupDatabase() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("brainly");

    const users = db.collection("users");
    await users.createIndex({ email: 1 }, { unique: true });
    await users.createIndex({ username: 1 }, { unique: true });
    console.log("✓ Users indexes");

    const contents = db.collection("contents");
    await contents.createIndex({ userId: 1 });
    await contents.createIndex({ shareId: 1 }, { unique: true, sparse: true });
    await contents.createIndex({ createdAt: -1 });
    await contents.createIndex({ type: 1 });
    await contents.createIndex({ tags: 1 });
    console.log("✓ Contents indexes");

    console.log("\n✅ Database setup complete");
  } catch (error) {
    console.error("❌ Database setup failed", error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

void setupDatabase();
