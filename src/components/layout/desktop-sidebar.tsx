 "use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Home, Rss, ArrowRight, Sparkles } from "lucide-react";
import type { NavCategory } from "@/actions/categories";

// Client Component -- needs to be, since Framer Motion animations only run
// on the client. `categories` is still fetched server-side by the parent
// layout and just passed down as a prop, same as before.

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04 },
  },
};

const rowVariants: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

function HoverGroup({
  groupId,
  children,
}: {
  groupId: string;
  items: never[];
  children: (props: {
    isHovered: (id: string) => boolean;
    onEnter: (id: string) => void;
    onLeave: () => void;
    highlight: (id: string) => React.ReactNode;
  }) => React.ReactNode;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const highlight = (id: string) =>
    hovered === id ? (
      <motion.div
        layoutId={`hover-highlight-${groupId}`}
        className="absolute inset-0 rounded-md bg-[#e6f7f8]"
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
      />
    ) : null;

  return (
    <div onMouseLeave={() => setHovered(null)}>
      {children({
        isHovered: (id: string) => hovered === id,
        onEnter: (id: string) => setHovered(id),
        onLeave: () => setHovered(null),
        highlight,
      })}
    </div>
  );
}

export function DesktopSidebar({ categories }: { categories: NavCategory[] }) {
  const technology = categories.slice(0, 12);
  const business = categories.slice(12);
  const featuredTopic = technology[0];
  const restTechnology = technology.slice(1);

  return (
    <aside className="hidden w-60 shrink-0 border-r border-[#cbd5df] bg-white lg:block">
      <motion.div
        className="sticky top-[100px] max-h-[calc(100vh-110px)] overflow-y-auto px-4  text-[13px] leading-[1.25] text-[#06396d]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={rowVariants}>
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-md px-1 py-1 font-bold transition-colors hover:bg-[#e6f7f8]"
          >
            <motion.span
              whileHover={{ scale: 1.15, rotate: -8 }}
              transition={{ type: "spring", stiffness: 400, damping: 12 }}
              className="flex"
            >
              <Home className="h-5 w-5 fill-[#08a7aa] text-[#08a7aa]" />
            </motion.span>
            Home
          </Link>
        </motion.div>

        <nav className="mt-3" aria-label="Resource topics">
          {featuredTopic && (
            <>
              <motion.div variants={rowVariants}>
                <Link
                  href={`/category/${featuredTopic.slug}`}
                  className="group relative flex items-center gap-1.5 rounded-md px-1 py-1 font-medium transition-colors hover:text-[#00a6ad]"
                >
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#08a7aa] to-[#06396d] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    <Sparkles className="h-2.5 w-2.5" />
                    Featured
                  </span>
                </Link>
                <Link
                  href={`/category/${featuredTopic.slug}`}
                  className="mt-1 block px-1 font-semibold underline-offset-2 hover:underline"
                >
                  {featuredTopic.name}
                </Link>
              </motion.div>

              <HoverGroup groupId="technology" items={[]}>
                {({ isHovered, onEnter, highlight }) => (
                  <div className="mt-1 space-y-0.5 pl-3">
                    {restTechnology.map((category) => (
                      <motion.div key={category.id} variants={rowVariants} className="relative">
                        <AnimatePresence>{highlight(category.id)}</AnimatePresence>
                        <Link
                          href={`/category/${category.slug}`}
                          onMouseEnter={() => onEnter(category.id)}
                          className={`relative z-10 block rounded-md px-2 py-1 transition-colors ${
                            isHovered(category.id) ? "text-[#00a6ad]" : "hover:text-[#00a6ad]"
                          }`}
                        >
                          {category.name}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </HoverGroup>
            </>
          )}

          <motion.div variants={rowVariants} className="my-4 origin-left border-t border-[#153f70]" />

          <HoverGroup groupId="business" items={[]}>
            {({ isHovered, onEnter, highlight }) => (
              <div className="space-y-0.5">
                {business.map((category) => (
                  <motion.div key={category.id} variants={rowVariants} className="relative">
                    <AnimatePresence>{highlight(category.id)}</AnimatePresence>
                    <Link
                      href={`/category/${category.slug}`}
                      onMouseEnter={() => onEnter(category.id)}
                      className={`relative z-10 block rounded-md px-2 py-1 transition-colors ${
                        isHovered(category.id) ? "text-[#00a6ad]" : "hover:text-[#00a6ad]"
                      }`}
                    >
                      {category.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </HoverGroup>

          <motion.div variants={rowVariants}>
            <Link
              href="/category"
              className="group mt-2 inline-flex items-center gap-1 rounded-md px-1 py-1 font-medium transition-colors hover:bg-[#e6f7f8] hover:text-[#00a6ad]"
            >
              View All Topics
              <motion.span
                className="inline-flex"
                initial={{ x: 0 }}
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </motion.span>
            </Link>
          </motion.div>
        </nav>

        <motion.div variants={rowVariants} className="my-4 origin-left border-t border-[#153f70]" />

        <nav className="space-y-1" aria-label="Account links">
          <motion.div variants={rowVariants}>
            <a
              href="#rss"
              className="group flex items-center gap-1.5 rounded-md px-1 py-1 transition-colors hover:bg-[#e6f7f8] hover:text-[#00a6ad]"
            >
              <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                <span className="sidebar-rss-ping absolute h-3.5 w-3.5 rounded-full bg-[#08a7aa]/40" />
                <Rss className="relative h-3.5 w-3.5 text-[#08a7aa]" />
              </span>
              Get RSS Updates
            </a>
          </motion.div>
          <motion.div variants={rowVariants}>
            <Link
              href="/my-library"
              className="block rounded-md px-1 py-1 transition-colors hover:bg-[#e6f7f8] hover:text-[#00a6ad]"
            >
              My Library
            </Link>
          </motion.div>
          <motion.div variants={rowVariants}>
            <Link
              href="/login"
              className="block rounded-md px-1 py-1 transition-colors hover:bg-[#e6f7f8] hover:text-[#00a6ad]"
            >
              Sign In
            </Link>
          </motion.div>
        </nav>
      </motion.div>

      <style>{`
        .sidebar-rss-ping {
          animation: sidebar-rss-ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes sidebar-rss-ping {
          0% { transform: scale(1); opacity: 0.6; }
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </aside>
  );
}