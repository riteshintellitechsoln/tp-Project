 "use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Linkedin,
  Twitter,
  Youtube,
  Facebook,
  Instagram,
  Mail,
  ArrowUpRight,
  ArrowUp,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import type { NavCategory } from "@/actions/categories";

// Client Component -- needs to be, since Framer Motion animations only run
// on the client. `categories` is still fetched server-side by the parent
// (marketing) layout and just passed down as a prop, same as before.
//
// /privacy and /terms are real pages built in this module (see
// src/app/(marketing)/privacy and /terms) -- the spec's 20 modules don't
// have a dedicated slot for legal pages, but a form that captures personal
// data behind a consent checkbox needs somewhere for that checkbox to link
// to, so they're added here rather than left as dead links.

const socialLinks = [
  {
    name: "Facebook",
    href: "https://facebook.com/tradehub",
    icon: Facebook,
    color: "#1877F2",
  },
  {
    name: "Instagram",
    href: "https://instagram.com/tradehub",
    icon: Instagram,
    color: "#E1306C",
  },
  {
    name: "Twitter",
    href: "https://twitter.com/tradehub",
    icon: Twitter,
    color: "#1DA1F2",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/company/tradehub",
    icon: Linkedin,
    color: "#0A66C2",
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@tradehub",
    icon: Youtube,
    color: "#FF0000",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    // transition: { duration: 0.5, ease: "easeOut" },
    transition: { duration: 0.55, ease: "easeOut" as const },
  },
};

function AnimatedLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative inline-block text-muted-foreground transition-colors hover:text-foreground ${className}`}
    >
      {children}
      <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
    </Link>
  );
}

export function Footer({ categories }: { categories: NavCategory[] }) {
  const year = new Date().getFullYear();
  const featuredCategories = categories.slice(0, 6);
  const [showTopButton, setShowTopButton] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTopButton(window.scrollY > 480);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer-shell relative overflow-hidden border-t bg-muted/30">
      {/* Animated gradient shimmer bar */}
      <div className="footer-shimmer h-[2px] w-full" />

      {/* Soft decorative color blobs -- subtle, low opacity */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl"
      />

      <motion.div
        className="container relative grid gap-10 py-12 md:grid-cols-5"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div variants={itemVariants} className="md:col-span-2">
          <Link
            href="/"
            className="group flex items-center gap-2 font-display text-lg font-bold"
          >
            <motion.span
              whileHover={{ rotate: -12, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="flex text-primary"
            >
              <BookOpen className="h-5 w-5" />
            </motion.span>
            {siteConfig.name}
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            {siteConfig.description}
          </p>

          {/* Newsletter row */}
          <form className="mt-5 flex max-w-sm items-center gap-2">
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              required
              placeholder="you@company.com"
              className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="footer-cta-gradient inline-flex h-9 shrink-0 items-center gap-1 rounded-md px-3 text-sm font-medium text-white shadow-sm transition-shadow hover:shadow-lg"
            >
              Subscribe
              <ArrowUpRight className="h-3.5 w-3.5" />
            </motion.button>
          </form>

          {/* Social icons -- brand-colored on hover */}
          <div className="mt-5 flex items-center gap-3">
            {socialLinks.map(({ name, href, icon: Icon, color }) => (
              <motion.a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${siteConfig.name} on ${name}`}
                whileHover={{ y: -3, scale: 1.12, rotate: 6 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 300, damping: 12 }}
                style={
                  {
                    "--brand-color": color,
                  } as React.CSSProperties
                }
                className="footer-social-icon relative flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground"
              >
                <Icon className="h-4 w-4" />
              </motion.a>
            ))}
            <motion.a
              href="mailto:hello@tradehub.example"
              aria-label={`Email ${siteConfig.name}`}
              whileHover={{ y: -3, scale: 1.12, rotate: 6 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 300, damping: 12 }}
              style={{ "--brand-color": "hsl(var(--primary))" } as React.CSSProperties}
              className="footer-social-icon relative flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground"
            >
              <Mail className="h-4 w-4" />
            </motion.a>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h3 className="text-sm font-semibold">Browse</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {featuredCategories.map((category) => (
              <li key={category.id}>
                <AnimatedLink href={`/category/${category.slug}`}>
                  {category.name}
                </AnimatedLink>
              </li>
            ))}
            <li>
              <Link
                href="/category"
                className="group inline-flex items-center gap-1 font-medium text-foreground transition-transform duration-200 hover:translate-x-0.5 hover:underline"
              >
                View all categories
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </li>
          </ul>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h3 className="text-sm font-semibold">Company</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <AnimatedLink href="/privacy">Privacy Policy</AnimatedLink>
            </li>
            <li>
              <AnimatedLink href="/terms">Terms of Service</AnimatedLink>
            </li>
            <li>
              <a
                href="mailto:hello@tradehub.example"
                className="group relative inline-block text-muted-foreground transition-colors hover:text-foreground"
              >
                Contact
                <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            </li>
          </ul>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h3 className="text-sm font-semibold">For Publishers</h3>
          <p className="mt-3 text-sm text-muted-foreground">
            Get your ebook, whitepaper, or report in front of thousands of
            verified business buyers.
          </p>
                   <Link
            href="/publish"
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Publish with us
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      </motion.div>

      <div className="relative border-t">
        <div className="container flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
          <nav aria-label="Legal" className="flex items-center gap-3">
            <Link href="/privacy" className="transition-colors hover:text-foreground hover:underline">
              Privacy Policy
            </Link>
            <span aria-hidden>·</span>
            <Link href="/terms" className="transition-colors hover:text-foreground hover:underline">
              Terms of Service
            </Link>
          </nav>
          <p>Downloads require a valid business email address.</p>
        </div>
      </div>

      {/* Back to top */}
      <AnimatePresence>
        {showTopButton && (
          <motion.button
            key="back-to-top"
            onClick={scrollToTop}
            aria-label="Back to top"
            initial={{ opacity: 0, y: 12, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.8 }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.94 }}
            className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
          >
            <ArrowUp className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>

      <style>{`
        .footer-shimmer {
          background: linear-gradient(
            90deg,
            #d946ef,
            hsl(var(--primary)),
            #22d3ee,
            #d946ef
          );
          background-size: 300% 100%;
          animation: footer-shimmer-move 8s linear infinite;
        }
        @keyframes footer-shimmer-move {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
        .footer-cta-gradient {
          background: linear-gradient(
            90deg,
            hsl(var(--primary)),
            #d946ef
          );
        }
        .footer-social-icon {
          transition: border-color 200ms ease, color 200ms ease, box-shadow 200ms ease;
        }
        .footer-social-icon:hover {
          border-color: var(--brand-color);
          color: var(--brand-color);
          box-shadow: 0 4px 14px -2px var(--brand-color);
        }
      `}</style>
    </footer>
  );
}