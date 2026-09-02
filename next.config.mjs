import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

/** @type {import("next").NextConfig} */
const nextConfig = {
  // Disable React running twice as it messes up with iframes
  reactStrictMode: false,
  typedRoutes: true,

  // colorthief's Node.js entry point depends on sharp, which can't run in
  // the Workers runtime. It's only ever called client-side on an
  // HTMLImageElement, so keep it out of the server bundle entirely.
  serverExternalPackages: ["colorthief"],

  // Configure asset prefix for CDN or subdirectory support
  assetPrefix: process.env.ASSET_PREFIX || undefined,
  
  // Configure image domains for Next.js Image component
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.archive.org",
      },
    ],
  },
  
  // Turbopack configuration
  turbopack: {
    rules: {
      // Handle SVG imports with ?url as file URLs
      "*.svg?url": {
        loaders: ["file-loader"],
        as: "*.svg",
      },
      // Handle all other SVG imports as React components
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  async redirects() {
    const isProduction = process.env.NODE_ENV === "production";
    const isManifestEnabled = !isProduction || process.env.MANIFEST_ROUTE_FORCE_ENABLE === "true";

    const redirects = [
      {
        source: "/read/experimental/:identifier",
        destination: "/read/:identifier",
        permanent: true,
      },
    ];

    if (isProduction && !isManifestEnabled) {
      redirects.push({
        source: "/read/manifest/:path*",
        destination: "/",
        permanent: false,
      });
    }

    return redirects;
  }
};

export default nextConfig;
