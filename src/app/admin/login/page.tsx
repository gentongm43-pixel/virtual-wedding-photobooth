import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import LoginForm from "./login-form";

export default async function AdminLoginPage() {
  if (await getAdminUser()) redirect("/admin/dashboard");
  return <LoginForm />;
}
