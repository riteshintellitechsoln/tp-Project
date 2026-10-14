"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  animate,
  useInView,
  useMotionValue,
  useSpring,
  type Variants,
} from "framer-motion";
import { ArrowRight, BookOpen, Search, TrendingUp } from "lucide-react";

interface HeroStat {
  label: string;
  value: string;
}

interface HeroCover {
  slug: string;
  coverImageUrl: string;
  title: string;
}

// const MotionLink = motion(Link);
const MotionLink = motion.create(Link);

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

function StatValue({ value }: { value: string }) {
  const match = value.match(/^([\d,]+)(.*)$/);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(match ? `0${match[2]}` : value);

  useEffect(() => {
    if (!match || !inView) return;
    const target = parseInt((match[1] ?? "0").replace(/,/g, ""), 10);
    const suffix = match[2];
    const controls = animate(0, target, {
      duration: 1.1,
      ease: "easeOut",
      onUpdate(latest) {
        setDisplay(Math.round(latest).toLocaleString() + suffix);
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return <span ref={ref}>{display}</span>;
}

function CoverStack({ covers }: { covers: HeroCover[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springX = useSpring(mx, { stiffness: 60, damping: 18 });
  const springY = useSpring(my, { stiffness: 60, damping: 18 });

  function handleMouseMove(e: React.MouseEvent) {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    mx.set(px * 24);
    my.set(py * 24);
  }

  function handleMouseLeave() {
    mx.set(0);
    my.set(0);
  }

  // const items = covers.slice(0, 3);
  const items = (covers ?? []).slice(0, 3);
  const layout = [
    { rotate: -8, x: -70, y: 10, z: 10, float: 3.4 },
    { rotate: 2, x: 0, y: -18, z: 30, float: 4.2 },
    { rotate: 9, x: 70, y: 14, z: 20, float: 3.8 },
  ];
  const DEFAULT_POS = { rotate: 0, x: 0, y: 0, z: 10, float: 4 };

  if (items.length === 0) return null;

  return (
    <div
      ref={wrapRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative mx-auto h-72 w-full max-w-md sm:h-80"
    >
      
            {items.map((cover, i) => {
        const pos = layout[i % layout.length] ?? DEFAULT_POS;
        return (
          <motion.div
            key={cover.slug + i}
            className="absolute left-1/2 top-1/2"
            style={{
              x: springX,
              y: springY,
              zIndex: pos.z,
            }}
            initial={{ opacity: 0, scale: 0.8, rotate: pos.rotate }}
            animate={{ opacity: 1, scale: 1, rotate: pos.rotate }}
            transition={{ duration: 0.6, delay: 0.3 + i * 0.1, ease: "easeOut" }}
          >
            <motion.div
              animate={{ y: [0, -pos.float * 4, 0] }}
              transition={{
                duration: pos.float,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.4,
              }}
              style={{
                translateX: pos.x - 64,
                translateY: pos.y - 90,
              }}
              whileHover={{ scale: 1.06, rotate: 0 }}
              className="h-44 w-32 sm:h-52 sm:w-36"
            >
              <Link
                href={`/book/${cover.slug}`}
                aria-label={cover.title}
                className="block h-full w-full overflow-hidden rounded-xl border-4 border-white shadow-2xl"
              >
                <img
                  src={cover.coverImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </Link>
            </motion.div>
          </motion.div>
        );
      })}

      <motion.div
        className="absolute -right-2 top-2 z-40 flex items-center gap-1 rounded-full border border-primary/15 bg-white/90 px-3 py-1 text-[11px] font-semibold text-primary shadow-lg backdrop-blur"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <TrendingUp className="h-3 w-3" />
        Trending this week
      </motion.div>
    </div>
  );
}

export function Hero({ stats, covers }: { stats: HeroStat[]; covers: HeroCover[] }) {
  return (
    <section className="relative overflow-hidden border-b bg-white">
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_10%_15%,rgba(37,99,235,.16),transparent_26rem)]"
        animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_90%_10%,rgba(20,184,166,.16),transparent_24rem)]"
        animate={{ scale: [1, 1.18, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_50%_100%,rgba(168,85,247,.10),transparent_22rem)]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-0 opacity-[0.035] [background-image:linear-gradient(#0f172a_1px,transparent_1px),linear-gradient(90deg,#0f172a_1px,transparent_1px)] [background-size:36px_36px]"
      />
      <div className="container relative z-10 grid gap-12 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
        <motion.div
          className="text-center lg:text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={itemVariants}
            className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-3 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur lg:mx-0"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="hero-pulse-ring absolute h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            Free research, curated for professionals
          </motion.div>
          <motion.h1
            variants={itemVariants}
            className="mx-auto mt-5 max-w-xl font-display text-4xl font-extrabold tracking-tight text-[#06396d] sm:text-5xl lg:mx-0 lg:text-6xl"
          >
            Research that helps you move with{" "}
            <span className="bg-gradient-to-r from-[#06396d] via-primary to-[#08a7aa] bg-clip-text text-transparent">
              confidence.
            </span>
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg lg:mx-0"
          >
            Discover trusted white papers, reports, case studies, and eBooks for your next important decision.
          </motion.p>
          <motion.div
            variants={itemVariants}
            className="mt-7 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
          >
            <MotionLink
              href="/category"
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 350, damping: 18 }}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-shadow hover:shadow-xl hover:shadow-primary/35"
            >
              Explore topics <ArrowRight className="h-4 w-4" />
            </MotionLink>
            <MotionLink
              href="/search"
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 350, damping: 18 }}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition-shadow hover:border-primary/30 hover:shadow-md"
            >
              <Search className="h-4 w-4" /> Search the library
            </MotionLink>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="mx-auto mt-10 grid max-w-xl grid-cols-3 gap-3 lg:mx-0"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 300, damping: 16 }}
                className="rounded-xl border border-white/60 bg-white/70 px-3 py-3 text-left shadow-md backdrop-blur"
              >
                <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{stat.label}</dt>
                <dd className="font-display text-xl font-bold text-[#06396d]">
                  <StatValue value={stat.value} />
                </dd>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500 lg:justify-start"
          >
            <BookOpen className="h-3.5 w-3.5" /> No subscription needed
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
        >
          <CoverStack covers={covers} />
        </motion.div>
      </div>
      <style>{`
        .hero-pulse-ring {
          animation: hero-pulse 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes hero-pulse {
          0% { transform: scale(1); opacity: 0.7; }
          75%, 100% { transform: scale(2.6); opacity: 0; }
        }
      `}</style>
    </section>
  );
}