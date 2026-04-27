import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key) return NextResponse.json({ error: "Parâmetro 'key' obrigatório" }, { status: 400 });

  const client = await clientPromise;
  const col = client.db("agenda-igreja").collection("settings");
  const doc = await col.findOne({ _id: key as unknown as never });
  return NextResponse.json({ value: doc ? (doc as unknown as { value: string }).value : null });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "superadmin") {
    return NextResponse.json({ error: "Proibido" }, { status: 403 });
  }

  const { key, value } = await req.json();
  if (!key) return NextResponse.json({ error: "Parâmetro 'key' obrigatório" }, { status: 400 });

  const client = await clientPromise;
  const col = client.db("agenda-igreja").collection("settings");
  await col.updateOne(
    { _id: key as unknown as never },
    { $set: { value } },
    { upsert: true }
  );

  return NextResponse.json({ ok: true });
}
