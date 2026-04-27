import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI não definido. Use: pnpm dlx tsx --env-file=.env.local scripts/seed-admin.ts");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const isSuperAdmin = args.includes("--super");
  const [emailArg, nameArg, passwordArg] = args.filter((a) => a !== "--super");

  if (!emailArg || !nameArg || !passwordArg) {
    console.error("Uso: tsx scripts/seed-admin.ts <email> <nome> <senha> [--super]");
    console.error('Exemplo: tsx scripts/seed-admin.ts admin@igreja.com "Pastor João" minhasenha123 --super');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const col = client.db("agenda-igreja").collection("users");
    await col.createIndex({ email: 1 }, { unique: true });

    const passwordHash = await bcrypt.hash(passwordArg, 12);
    const role = isSuperAdmin ? "superadmin" : "admin";
    await col.insertOne({
      email: emailArg,
      name: nameArg,
      passwordHash,
      role,
      createdAt: new Date(),
    });

    console.log(`✓ ${isSuperAdmin ? "Super admin" : "Admin"} criado: ${nameArg} <${emailArg}>`);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("E11000")) {
      console.error(`Erro: já existe um usuário com o email ${emailArg}`);
    } else {
      console.error("Erro ao criar admin:", err);
    }
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
