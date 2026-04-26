import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export interface User {
  _id: ObjectId;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const client = await clientPromise;
  const col = client.db("agenda-igreja").collection<User>("users");
  return col.findOne({ email });
}

export async function createUser(
  email: string,
  name: string,
  passwordHash: string
): Promise<void> {
  const client = await clientPromise;
  const col = client.db("agenda-igreja").collection<User>("users");
  await col.createIndex({ email: 1 }, { unique: true });
  await col.insertOne({
    _id: new ObjectId(),
    email,
    name,
    passwordHash,
    createdAt: new Date(),
  });
}
