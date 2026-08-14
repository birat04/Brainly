import { MongoClient, type Db } from "mongodb";

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var __cortexlyMongoUriWarned: boolean | undefined;
}

const DEV_FALLBACK_URI = "mongodb://127.0.0.1:27017/cortexly";

function getMongoUri(): string {
  const explicit = process.env.MONGODB_URI?.trim();
  if (explicit) {
    return explicit;
  }

  if (process.env.NODE_ENV !== "production") {
    if (!global.__cortexlyMongoUriWarned) {
      global.__cortexlyMongoUriWarned = true;
      console.warn(
        `[cortexly/db] MONGODB_URI is not set. Using dev fallback: ${DEV_FALLBACK_URI}\n` +
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
      const connectWithFallback = async (): Promise<MongoClient> => {
        try {
          client = new MongoClient(uri, options);
          await client.connect();
          return client;
        } catch (error) {
          if (uri === DEV_FALLBACK_URI) {
            throw error;
          }

          console.warn(
            `[cortexly/db] Mongo connection failed for configured URI. Falling back to local dev DB: ${DEV_FALLBACK_URI}`,
            error instanceof Error ? error.message : error,
          );

          client = new MongoClient(DEV_FALLBACK_URI, options);
          await client.connect();
          return client;
        }
      };

      global._mongoClientPromise = connectWithFallback();
    }
    return global._mongoClientPromise;
  }

  client = new MongoClient(uri, options);
  return client.connect();
}

export async function getDatabase(): Promise<Db> {
  clientPromise = clientPromise ?? getClientPromise();
  const mongoClient = await clientPromise;
  return mongoClient.db("cortexly");
}
