import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/** Edge-runtime-safe `auth()` for middleware only. See auth.config.ts. */
export const { auth } = NextAuth(authConfig);
