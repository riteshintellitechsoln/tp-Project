"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookText,
  BookOpen,
  FolderTree,
  Building2,
  Users,
  Contact,
  Download,
  Mail,
  BarChart3,
  Settings,
  Activity,
  FileText,
  ExternalLink,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/books", label: "Books", icon: BookText },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/companies", label: "Companies", icon: Building2 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/leads", label: "Leads", icon: Contact },
  { href: "/admin/downloads", label: "Downloads", icon: Download },
  { href: "/admin/email-logs", label: "Email Logs", icon: Mail },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/activity", label: "Activity", icon: Activity },
  { href: "/admin/publisher-requests", label: "Publisher Requests", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-2" aria-label="Admin home">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#123b6d] to-[#1d4f91] text-white shadow-md shadow-blue-900/20">
        <BookOpen className="h-5 w-5" />
      </span>
      <span className="leading-none">
        <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
          Admin panel
        </span>
        <span className="font-display text-lg font-bold tracking-tight text-[#06396d]">
          Travelocare
        </span>
      </span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 p-3">
      {NAV_ITEMS.map((item) => {
        // Exact match for /admin itself; startsWith for every nested
        // section, so /admin/books/new still highlights "Books".
        const isActive =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-[#123b6d] text-white shadow-sm"
                : "text-slate-600 hover:bg-blue-50 hover:text-[#06396d]",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
      <Link
        href="/"
        className="mt-3 flex items-center gap-2.5 rounded-lg border-t px-3 py-2 pt-4 text-sm font-medium text-slate-600 transition-colors hover:text-[#06396d]"
      >
        <ExternalLink className="h-4 w-4" />
        View site
      </Link>
    </nav>
  );
}

// Client component only because it needs usePathname() for active-link
// highlighting — everything else about the admin shell (the layout wrapping
// this, the auth check) stays server-side.
export function AdminSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 overflow-y-auto border-r bg-white lg:block">
      <div className="flex h-16 items-center border-b px-5">
        <Brand />
      </div>
      <NavLinks />
    </aside>
  );
}

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open admin menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetTitle className="sr-only">Admin navigation</SheetTitle>
        <div className="flex h-16 items-center border-b px-5">
          <Brand />
        </div>
        <NavLinks onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
