import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/learn/math/math-army/play": ["./src/games/math-army/index.html"],
    "/learn/math/math-kart/play": ["./src/games/math-kart/index.html"],
    "/learn/math/code-commander/play": ["./src/games/code-commander/index.html"],
    "/learn/reading/spelling-snake/play": ["./src/games/spelling-snake/index.html"],
  },
  serverExternalPackages: ["mssql"],
  poweredByHeader: false,
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    }, {
      source: "/learn/math/:game(math-army|math-kart|code-commander)/play",
      headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }],
    }, {
      source: "/learn/reading/spelling-snake/play",
      headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }],
    }];
  },
};

export default nextConfig;
