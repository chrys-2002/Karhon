import type { NextConfig } from "next";

// En-têtes de sécurité appliqués à TOUTE la plateforme (sécurité + confidentialité).
//  - HSTS : force HTTPS (confidentialité des échanges).
//  - X-Frame-Options : empêche l'intégration dans une iframe (anti-clickjacking).
//  - X-Content-Type-Options : empêche le « MIME sniffing ».
//  - Referrer-Policy : limite les informations de provenance transmises.
//  - Permissions-Policy : coupe les capacités matérielles non utilisées.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
