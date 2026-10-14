"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  Compass,
  LayoutDashboard,
  Library,
  LogIn,
  Menu,
  UserRound,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { SearchBar } from "@/components/layout/search-bar";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { useSavedBooksCount } from "@/hooks/use-saved-books-count";
import { isAdminRole } from "@/lib/rbac";
import type { NavCategory } from "@/actions/categories";

export function MobileNav({ categories }: { categories: NavCategory[] }) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const isAdmin = isAdminRole(session?.user?.role);
  const savedCount = useSavedBooksCount();

  const links = [
    { href: "/category", label: "Explore", icon: Compass, show: true },
    { href: "/admin", label: "Admin Dashboard", icon: LayoutDashboard, show: isAdmin },
    { href: "/my-library", label: "My Library", icon: Library, show: true },
    { href: "/saved", label: "Saved", icon: Bookmark, show: true },
    { href: "/profile", label: "My Profile", icon: UserRound, show: !!session?.user && !isAdmin },
    { href: "/login", label: "Sign In", icon: LogIn, show: !session?.user },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="-ml-2 shrink-0 lg:hidden" aria-label="Open menu">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex w-[85vw] max-w-sm flex-col gap-6 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">Travelocare</SheetTitle>
        </SheetHeader>

        <SearchBar />

        <nav className="flex flex-col gap-1">
          {links
            .filter((link) => link.show)
            .map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium hover:bg-accent"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                {label}
                {href === "/saved" && savedCount > 0 && (
                  <span className="ml-auto rounded-full bg-seal px-2 py-0.5 text-[11px] font-bold leading-none text-white">
                    {savedCount > 9 ? "9+" : savedCount}
                  </span>
                )}
              </Link>
            ))}
        </nav>

        <Separator />

        <div>
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Topics
          </p>
          <nav className="flex flex-col gap-1">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm hover:bg-accent"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto flex items-center justify-between border-t pt-4">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ModeToggle />
        </div>
      </SheetContent>
    </Sheet>
  );
}
