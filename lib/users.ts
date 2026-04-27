import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export interface User {
  _id: ObjectId;
  email: string;
  name: string;
  passwordHash: string;
  role: "admin" | "superadmin";
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
  passwordHash: string,
  role: "admin" | "superadmin" = "admin"
): Promise<void> {
  const client = await clientPromise;
  const col = client.db("agenda-igreja").collection<User>("users");
  await col.createIndex({ email: 1 }, { unique: true });
  await col.insertOne({
    _id: new ObjectId(),
    email,
    name,
    passwordHash,
    role,
    createdAt: new Date(),
  });
}
