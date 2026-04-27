import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const isSuperAdmin = (session.user as { role?: string }).role === "superadmin";
  return <AdminClient isSuperAdmin={isSuperAdmin} />;
}
