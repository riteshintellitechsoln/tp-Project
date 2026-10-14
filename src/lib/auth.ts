// import NextAuth from "next-auth";
// import Credentials from "next-auth/providers/credentials";
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import bcrypt from "bcryptjs";
// import { db } from "@/lib/db";
// import { authConfig } from "@/lib/auth.config";
// import { loginSchema } from "@/lib/validations/auth";

// // Full NextAuth instance — Node runtime only (Prisma + bcrypt live here).
// // One Credentials provider serves BOTH login audiences from the single
// // /login page:
// //   1. Admin (back office)      — checked first, against the Admin table
// //   2. User  ("My Library")     — fallback, against the User table, only if
// //                                 that account has a password set
// //
// // The spec's "POST /api/auth/login" and "POST /api/auth/logout" are served
// // by NextAuth's own catch-all route (app/api/auth/[...nextauth]/route.ts) —
// // specifically POST /api/auth/callback/credentials for sign-in and
// // POST /api/auth/signout for sign-out. Reinventing those endpoints by hand
// // would just re-implement what NextAuth already does correctly (CSRF
// // protection, cookie handling, JWT signing).
// export const { handlers, auth, signIn, signOut } = NextAuth({
//   ...authConfig,
//   adapter: PrismaAdapter(db),
//   providers: [
//     Credentials({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(rawCredentials) {
//         const parsed = loginSchema.safeParse(rawCredentials);
//         if (!parsed.success) return null;
//         const { email, password } = parsed.data;

//         // 1. Admin login
//         const admin = await db.admin.findUnique({ where: { email } });
//         if (admin?.isActive) {
//           const validPassword = await bcrypt.compare(password, admin.password);
//           if (validPassword) {
//             // Fire-and-forget — don't block sign-in on this write.
//             void db.admin.update({
//               where: { id: admin.id },
//               data: { lastLoginAt: new Date() },
//             });
//             return {
//               id: admin.id,
//               email: admin.email,
//               name: admin.name,
//               role: admin.role,
//             };
//           }
//         }

//         // 2. User login (My Library) — only if a password was ever set.
//         const user = await db.user.findUnique({ where: { email } });
//         if (user?.password) {
//           const validPassword = await bcrypt.compare(password, user.password);
//           if (validPassword) {
//             return {
//               id: user.id,
//               email: user.email,
//               name: user.name ?? user.email,
//               role: "USER" as const,
//             };
//           }
//         }

//         // Same generic null for "no such account" and "wrong password" —
//         // never reveal which one it was.
//         return null;
//       },
//     }),
//   ],
//   callbacks: {
//     ...authConfig.callbacks,
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id as string;
//         token.role = (user as { role: (typeof token)["role"] }).role;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (session.user) {
//         session.user.id = token.id;
//         session.user.role = token.role;
//       }
//       return session;
//     },
//   },
// });




import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { db } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";
import { loginSchema } from "@/lib/validations/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // adapter: PrismaAdapter(db),
  adapter: PrismaAdapter(db) as never,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const admin = await db.admin.findUnique({ where: { email } });
        if (admin?.isActive) {
          const validPassword = await bcrypt.compare(password, admin.password);
          if (validPassword) {
            void db.admin.update({
              where: { id: admin.id },
              data: { lastLoginAt: new Date() },
            });
            return {
              id: admin.id,
              email: admin.email,
              name: admin.name,
              role: admin.role,
            };
          }
        }

        const user = await db.user.findUnique({ where: { email } });
        if (user?.password) {
          const validPassword = await bcrypt.compare(password, user.password);
          if (validPassword) {
            return {
              id: user.id,
              email: user.email,
              name: user.name ?? user.email,
              role: "USER" as const,
            };
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({
      token,
      user,
      trigger,
      session,
    }: {
      token: JWT;
      user?: User;
      trigger?: "signIn" | "signUp" | "update";
      session?: { name?: unknown };
    }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      // Profile edits call useSession().update({ name }) so the navbar
      // reflects the new name without signing out and back in.
      if (trigger === "update" && typeof session?.name === "string" && session.name.trim()) {
        token.name = session.name.trim();
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
});