import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import type { AgendaEntry } from "@/lib/agenda";
import { auth } from "@/auth";
import type { Session } from "next-auth";
import { publishAgendaUpdated } from "@/lib/realtime/publish";

async function getCollection() {
  const client = await clientPromise;
  return client.db("agenda-igreja").collection<AgendaEntry>("entries");
}

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "Parâmetro 'date' obrigatório" }, { status: 400 });
  }

  const col = await getCollection();
  const entry = await col.findOne({ date }, { projection: { _id: 0 } });

  if (!entry) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(entry);
}

function isSuperAdmin(session: Session | null) {
  return (session?.user as { role?: string })?.role === "superadmin";
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return new NextResponse(null, { status: 401 });
  if (!isSuperAdmin(session)) return new NextResponse(null, { status: 403 });

  const date = req.nextUrl.searchParams.get("date");
  if (!date) return NextResponse.json({ error: "Parâmetro 'date' obrigatório" }, { status: 400 });
  const col = await getCollection();
  await col.deleteOne({ date });
  void publishAgendaUpdated({ date, action: 'delete' });
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return new NextResponse(null, { status: 401 });

  const body: AgendaEntry = await req.json();
  if (!body.date || !body.preacher || !body.service) {
    return NextResponse.json({ error: "Campos obrigatórios: date, preacher, service" }, { status: 400 });
  }

  const col = await getCollection();
  const existing = await col.findOne({ date: body.date });
  if (existing && !isSuperAdmin(session)) return new NextResponse(null, { status: 403 });

  await col.updateOne({ date: body.date }, { $set: body }, { upsert: true });
  void publishAgendaUpdated({ date: body.date, action: 'upsert' });
  return NextResponse.json(body, { status: 201 });
}
