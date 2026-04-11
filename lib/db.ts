import { MongoClient, type Db } from "mongodb";

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var __brainlyMongoUriWarned: boolean | undefined;
}

const DEV_FALLBACK_URI = "mongodb://127.0.0.1:27017/brainly";

function getMongoUri(): string {
  const explicit = process.env.MONGODB_URI?.trim();
  if (explicit) {
    return explicit;
  }

  if (process.env.NODE_ENV !== "production") {
    if (!global.__brainlyMongoUriWarned) {
      global.__brainlyMongoUriWarned = true;
      console.warn(
        `[brainly/db] MONGODB_URI is not set. Using dev fallback: ${DEV_FALLBACK_URI}\n` +
          "  Add MONGODB_URI to .env.local for Atlas or a custom host (see .env.example).",
      );
    }
    return DEV_FALLBACK_URI;
  }

  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

function getClientPromise(): Promise<MongoClient> {
  const uri = getMongoUri();

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }

  client = new MongoClient(uri, options);
  return client.connect();
}

export async function getDatabase(): Promise<Db> {
  clientPromise = clientPromise ?? getClientPromise();
  const mongoClient = await clientPromise;
  return mongoClient.db("brainly");
}

export default function getMongoClientPromise() {
  clientPromise = clientPromise ?? getClientPromise();
  return clientPromise;
}
