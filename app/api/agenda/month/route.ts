import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import type { AgendaEntry } from "@/lib/agenda";

export async function GET(req: NextRequest) {
  const year = req.nextUrl.searchParams.get("year");
  const month = req.nextUrl.searchParams.get("month");

  if (!year || !month) {
    return NextResponse.json({ error: "Parâmetros 'year' e 'month' obrigatórios" }, { status: 400 });
  }

  const prefix = `${year}-${month.padStart(2, "0")}`;
  const client = await clientPromise;
  const db = client.db("agenda-igreja");

  const [entries, settingDoc] = await Promise.all([
    db.collection<AgendaEntry>("entries")
      .find({ date: { $regex: `^${prefix}` } }, { projection: { _id: 0 } })
      .toArray(),
    db.collection("settings").findOne({ _id: "schedulingLimit" as unknown as never }),
  ]);

  const schedulingLimit = settingDoc ? (settingDoc as unknown as { value: string }).value : null;
  return NextResponse.json({ entries, schedulingLimit });
}
