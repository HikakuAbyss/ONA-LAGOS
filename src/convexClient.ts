import { ConvexReactClient } from "convex/react";

// Initialize Convex React Client
// Fits standard Vite VITE_ prefix as well as Vercel NEXT_PUBLIC_ defaults
// Type-cast import.meta to any to prevent missing property compile errors
const metaEnv = (import.meta as any).env || {};
const convexUrl = 
  (metaEnv.VITE_CONVEX_URL as string) || 
  (metaEnv.NEXT_PUBLIC_CONVEX_URL as string) || 
  "";

if (!convexUrl) {
  console.warn(
    "Convex Warning: VITE_CONVEX_URL or NEXT_PUBLIC_CONVEX_URL is not set. " +
    "Convex features will operate in disconnected/fallback mode until set in your env."
  );
}

export const convexClient = new ConvexReactClient(convexUrl);
