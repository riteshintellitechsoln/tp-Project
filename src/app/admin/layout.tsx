import { requireAdmin } from "@/lib/session";
import { AdminSidebar, AdminMobileNav } from "@/components/admin/sidebar";
import { UserNav } from "@/components/layout/user-nav";
import { ModeToggle } from "@/components/shared/mode-toggle";

// middleware.ts (Module 5) already blocks unauthenticated/non-admin
// requests to /admin/* at the edge — requireAdmin() here is deliberate
// defense-in-depth, not redundancy: it also gives every admin page a
// typed, guaranteed-non-null session without re-deriving that check itself.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-slate-50/60">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/90 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-2">
            <AdminMobileNav />
            <p className="text-sm font-medium text-[#06396d]">Admin Panel</p>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <UserNav />
          </div>
        </header>
        <main className="flex-1 overflow-x-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
