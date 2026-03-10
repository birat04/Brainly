import { MongoClient } from 'mongodb';



declare global {
  var _mongoClient: MongoClient | undefined;
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI || '';
const options = {};

function createClient(): MongoClient {
  if (global._mongoClient) {
    return global._mongoClient;
  }
  if (!uri) {
    throw new Error('MONGODB_URI not defined');
  }
  const client = new MongoClient(uri, options);
  global._mongoClient = client;
  return client;
}

export function getMongoClient(): Promise<MongoClient> {
  if (!uri) {
    return Promise.reject(new Error('MONGODB_URI not defined'));
  }
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = createClient().connect();
    }
    return global._mongoClientPromise;
  }
  return createClient().connect();
}
