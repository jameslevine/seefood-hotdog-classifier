import type { Metadata } from "next";
import { Dashboard } from "@/components/Dashboard";

export const metadata: Metadata = {
  title: "Dashboard — SeeFood™",
  description: "Classification audit log and operational metrics.",
};

export default function DashboardPage() {
  return <Dashboard />;
}
