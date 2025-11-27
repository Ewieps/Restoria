import { cookies } from "next/headers";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const admin = cookieStore.get("admin_session")?.value;
  if (!admin) {
    // redrect
    return <div>Please <a href="/admin/login">login</a></div>;
  }
  return <div className="admin-layout">{children}</div>;
}
