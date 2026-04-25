import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  const g = global as typeof global & { _mongoClientPromise?: Promise<MongoClient> };
  if (!g._mongoClientPromise) {
    g._mongoClientPromise = client.connect();
  }
  clientPromise = g._mongoClientPromise;
} else {
  clientPromise = client.connect();
}

export default clientPromise;
