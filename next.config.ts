import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev: allow HMR and RSC when using alternate hosts (127.0.0.1, tunnels like ngrok)
  allowedDevOrigins: [
    "127.0.0.1",
    "*.ngrok-free.dev",
    "*.ngrok.io",
    "*.ngrok.app",
  ],
  // Prefer cwd as Turbopack root when another package-lock.json exists higher in the tree (run `npm run dev` from this folder)
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
