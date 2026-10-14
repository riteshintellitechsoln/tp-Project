"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Bookmark, Compass, Library, Sparkles } from "lucide-react";
import { SearchBar } from "@/components/layout/search-bar";
import { UserNav } from "@/components/layout/user-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import type { NavCategory } from "@/actions/categories";

import { SavedCountBadge } from "@/components/layout/saved-count-badge";

// const navLinks = [
//   { href: "/category", label: "Explore", icon: Compass },
//   { href: "/my-library", label: "My library", icon: Library },
//   { href: "/saved", label: "Saved", icon: Bookmark },
// ];

const navLinks = [
  { href: "/category", label: "Explore", icon: Compass },
  { href: "/my-library", label: "My library", icon: Library },
  { href: "/saved", label: "Saved", icon: Bookmark },
];


export function Navbar({ categories }: { categories: NavCategory[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();

  useMotionValueEvent(scrollYProgress, "change", () => {
    setScrolled(window.scrollY > 8);
  });

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`sticky top-0 z-40 border-b bg-white/90 text-[#06396d] backdrop-blur-xl transition-shadow duration-300 ${
        scrolled ? "border-slate-200 shadow-md" : "border-slate-200/80 shadow-none"
      }`}
    >
      <div className="flex h-16 items-center gap-2 px-4 sm:h-[72px] sm:gap-3 sm:px-6">
        <MobileNav categories={categories} />

        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="itbusinessbook home">
          <motion.span
            whileHover={{ scale: 1.06 }}
            transition={{ type: "spring", stiffness: 350, damping: 15 }}
            className="block h-10 w-10 overflow-hidden rounded-md shadow-md shadow-blue-900/20 sm:h-11 sm:w-11"
          >
            <Image
              src="/itbusinessbook-logo.png"
              alt="IT BusinessBook logo"
              width={331}
              height={331}
              priority
              className="h-full w-full object-contain"
            />
          </motion.span>
          <span className="leading-none">
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500 sm:block">
              Research library
            </span>
            <span className="font-display text-lg font-bold tracking-tight sm:text-xl">itbusinessbook</span>
          </span>
        </Link>

        <nav
          className="ml-3 hidden items-center gap-1 lg:flex"
          aria-label="Primary navigation"
          onMouseLeave={() => setHovered(null)}
        >
          {/* {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onMouseEnter={() => setHovered(href)}
              className="relative inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors"
            > */}

            {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onMouseEnter={() => setHovered(href)}
              className="relative inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              {href === "/saved" && <SavedCountBadge />}
              {hovered === href && (
                <motion.span
                  layoutId="navbar-hover-highlight"
                  className="absolute inset-0 rounded-md bg-slate-100"
                  transition={{ type: "spring", stiffness: 500, damping: 32 }}
                />
              )}
              <span className="relative z-10 inline-flex items-center gap-1.5">
                <Icon className="h-4 w-4" /> {label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden w-full max-w-sm xl:block">
          <SearchBar />
        </div>

        <div className="hidden items-center gap-1 text-xs text-slate-500 md:flex xl:hidden">
          <motion.span
            animate={{ rotate: [0, 15, 0, -15, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="flex text-amber-500"
          >
            <Sparkles className="h-3.5 w-3.5" />
          </motion.span>
          Curated weekly
        </div>

        <div className="ml-auto xl:ml-3">
          <UserNav />
        </div>
      </div>

      {/* Scroll progress bar */}
      <motion.div
        className="h-[2px] origin-left bg-gradient-to-r from-[#123b6d] via-primary to-[#08a7aa]"
        style={{ scaleX: scrollYProgress }}
      />
    </motion.header>
  );
}