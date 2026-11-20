import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { AdminDashboard } from "./AdminDashboard";

export const runtime = "edge";
export const metadata: Metadata = { title: "Leads & Clients — Empower" };

export default async function AdminPage() {
  await requireUser(["admin"]);
  return <AdminDashboard />;
}
