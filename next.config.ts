import type { NextConfig } from "next";

// Set by CI to "/<repo>" for GitHub Pages project sites, empty for user/org
// sites and custom domains. Empty locally so `next dev` serves from "/".
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Emit a fully static site into out/ for GitHub Pages.
  output: "export",
  // The Next.js image optimizer needs a server; Pages has none.
  images: { unoptimized: true },
  basePath,
};

export default nextConfig;
