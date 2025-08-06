import { NextConfig } from "next"

// Different CSP for development vs production
const getCSP = (isDev: boolean) => {
  const baseDirectives = [
    "default-src 'self'",
    "img-src 'self' https://i.scdn.co data:",
    "connect-src 'self' https://accounts.spotify.com",
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ];

  if (isDev) {
    // More permissive for development
    baseDirectives.push(
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-eval needed for Next.js dev
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self' https://accounts.spotify.com ws: wss:" // WebSocket for HMR
    );
  } else {
    // Strict for production
    baseDirectives.push(
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "upgrade-insecure-requests"
    );
  }

  return baseDirectives.join('; ');
};

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: getCSP(process.env.NODE_ENV === 'development')
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
];

const config: NextConfig = {
  // Allow dev origins for cross-origin requests
  allowedDevOrigins: ['127.0.0.1:3000', 'localhost:3000'],
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
        port: '',
        pathname: '/image/**',
      },
    ],
  },
  async headers() {
    // Only apply security headers in production for cleaner development
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: getCSP(true)
            }
          ],
        },
      ];
    }
    
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  // Enforce HTTPS in production
  async redirects() {
    return process.env.NODE_ENV === 'production' ? [
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
        destination: 'https://inmural.vercel.app/:path*',
        permanent: true,
      },
    ] : [];
  },
}

export default config
