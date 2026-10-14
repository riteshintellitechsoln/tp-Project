"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, Library, LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isAdminRole } from "@/lib/rbac";

// Session-aware account area. Three states:
//   1. loading  — render nothing (avoids a flash of "Sign In" before the
//      session resolves on first paint)
//   2. signed out — a plain "Sign In" button to /login
//   3. signed in — an avatar-style dropdown; Admins get an extra
//      "Admin Dashboard" entry, everyone gets "My Library" and "Sign out"
export function UserNav() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-9 w-9" aria-hidden />;
  }

  if (!session?.user) {
    return (
      <Button asChild size="sm">
        <Link href="/login">Sign In</Link>
      </Button>
    );
  }

  const isAdmin = isAdminRole(session.user.role);
  const initial = (session.user.name ?? session.user.email ?? "?").charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          aria-label="Account menu"
        >
          {initial}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
          {session.user.name && (
            <span className="block truncate font-medium text-foreground">
              {session.user.name}
            </span>
          )}
          {session.user.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="cursor-pointer">
              <LayoutDashboard />
              Admin Dashboard
            </Link>
          </DropdownMenuItem>
        )}
        {!isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer">
              <UserRound />
              My Profile
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/my-library" className="cursor-pointer">
            <Library />
            My Library
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
