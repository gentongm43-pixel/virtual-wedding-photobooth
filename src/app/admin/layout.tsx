import { getAdminUser } from "@/lib/auth";
import AdminNavigation from "@/components/admin/admin-navigation";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await getAdminUser();
  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#f8f6f2] text-[#302b28] lg:flex">
      <AdminNavigation userName={user.name ?? ""} userEmail={user.email} />
      <main className="min-w-0 flex-1 pb-24 lg:pb-0">{children}</main>
    </div>
  );
}
