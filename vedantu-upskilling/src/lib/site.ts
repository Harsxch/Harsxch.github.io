export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://vedantuskillacademy.com").replace(/\/$/, "");
export const SITE_NAME = "Vedantu Upskilling";
export const isDev = process.env.NODE_ENV !== "production";
