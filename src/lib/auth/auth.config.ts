import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Role } from "./rbac";

/**
 * Edge-safe auth config: no Prisma, no bcrypt, nothing that needs the Node
 * runtime. Next.js middleware runs on the Edge runtime, which cannot load
 * Prisma's generated client (it imports node:path/node:url) - so middleware
 * must build its `auth()` from THIS config only (see auth-edge.ts), never
 * from the full config in auth.ts. The real DB-backed `authorize` lives in
 * auth.ts and is only ever invoked from the (Node runtime) API route.
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
      authorize: async () => null,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        token.role = user.role as Role;
        token.influencerId = (user as { influencerId: string | null }).influencerId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.influencerId = token.influencerId;
      return session;
    },
  },
} satisfies NextAuthConfig;
