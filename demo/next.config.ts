import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  reactStrictMode: true,
  // The CI command runs `tsc --noEmit` separately. This prevents Next from
  // spawning a second TypeScript subprocess in restricted build sandboxes.
  typescript: { ignoreBuildErrors: true },
  experimental: { useTypeScriptCli: false },
};

export default nextConfig;
