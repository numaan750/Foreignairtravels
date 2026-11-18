/** @type {import('next').NextConfig} */
const nextConfig = {
   images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  // Ticket Sync: lets other websites use this website's domain; the request is forwarded to the backend.
  async rewrites() {
    const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000").replace(/\/+$/, "");
    return [
      {
        source: "/api/group-ticket-integrations/export",
        destination: `${backendUrl}/api/group-ticket-integrations/export`,
      },
    ];
  },
  /* config options here */
  experimental: {
    agentFeedback: true,
    agentUpgrade: "security",
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
