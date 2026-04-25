import { MongoClient } from "mongodb";

const AGENDA_MOCK = [
  { date: "2026-04-05", preacher: "Pr. João Silva",      service: "Culto do Dia do Senhor" },
  { date: "2026-04-08", preacher: "Pr. Carlos Mendes",   service: "Culto de Oração" },
  { date: "2026-04-11", preacher: "Pr. André Santos",    service: "Culto da Família" },
  { date: "2026-04-12", preacher: "Pr. Roberto Lima",    service: "Culto do Dia do Senhor" },
  { date: "2026-04-15", preacher: "Pr. Marcos Oliveira", service: "Culto de Oração" },
  { date: "2026-04-18", preacher: "Pr. Paulo Ferreira",  service: "Culto da Família" },
  { date: "2026-04-19", preacher: "Pr. João Silva",      service: "Culto do Dia do Senhor" },
  { date: "2026-04-22", preacher: "Pr. Carlos Mendes",   service: "Culto de Oração" },
  { date: "2026-04-25", preacher: "Pr. André Santos",    service: "Culto da Família" },
  { date: "2026-04-26", preacher: "Pr. Roberto Lima",    service: "Culto do Dia do Senhor" },
  { date: "2026-04-29", preacher: "Pr. Marcos Oliveira", service: "Culto de Oração" },
  { date: "2026-05-02", preacher: "Pr. Paulo Ferreira",  service: "Culto da Família" },
  { date: "2026-05-03", preacher: "Pr. João Silva",      service: "Culto do Dia do Senhor" },
  { date: "2026-05-06", preacher: "Pr. Carlos Mendes",   service: "Culto de Oração" },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI não definida. Crie o arquivo .env.local");

  const client = new MongoClient(uri);
  await client.connect();

  const col = client.db("agenda-igreja").collection("entries");
  await col.createIndex({ date: 1 }, { unique: true });

  for (const entry of AGENDA_MOCK) {
    await col.updateOne({ date: entry.date }, { $set: entry }, { upsert: true });
  }

  console.log(`✓ ${AGENDA_MOCK.length} entradas inseridas/atualizadas`);
  await client.close();
}

seed().catch((err) => { console.error(err); process.exit(1); });
