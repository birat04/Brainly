import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/cortexly";

async function setupDatabase() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("cortexly");

    const users = db.collection("users");
    await users.createIndex({ email: 1 }, { unique: true });
    await users.createIndex({ username: 1 }, { unique: true });
    console.log("✓ Users indexes");

    const workspaces = db.collection("workspaces");
    await workspaces.createIndex({ slug: 1 }, { unique: true });
    await workspaces.createIndex({ ownerId: 1 });
    console.log("✓ Workspaces indexes");

    const memberships = db.collection("memberships");
    await memberships.createIndex({ userId: 1, workspaceId: 1 }, { unique: true });
    await memberships.createIndex({ workspaceId: 1 });
    console.log("✓ Memberships indexes");

    const contents = db.collection("contents");
    await contents.createIndex({ userId: 1 });
    await contents.createIndex({ workspaceId: 1, createdAt: -1 });
    await contents.createIndex({ workspaceId: 1, type: 1 });
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
