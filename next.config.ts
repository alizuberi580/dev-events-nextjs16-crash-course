import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    cacheComponents: true,
    images:{
        formats: ['image/avif', 'image/webp'],
        remotePatterns:[
            {
                protocol:'https',
                hostname:'res.cloudinary.com',
            },
            {
                protocol:'https',
                hostname:'images.unsplash.com',  // ✅ Add this
            }
        ],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
    async rewrites() {
        return [
            {
                source: "/ingest/static/:path*",
                destination: "https://us-assets.i.posthog.com/static/:path*",
            },
            {
                source: "/ingest/:path*",
                destination: "https://us.i.posthog.com/:path*",
            },
        ];
    },
    // This is required to support PostHog trailing slash API requests
    skipTrailingSlashRedirect: true,
};

export default nextConfig;
