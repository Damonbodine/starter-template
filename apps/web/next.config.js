/** @type {import('next').NextConfig} */

// Load and validate environment variables
const { validateEnvironment } = require('./src/lib/env');

// Validate environment on build
if (process.env.NODE_ENV !== 'test') {
  try {
    validateEnvironment();
  } catch (error) {
    console.error('Environment validation failed:', error.message);
    process.exit(1);
  }
}

const nextConfig = {
  transpilePackages: ["@starter-template/ui", "@starter-template/database", "@starter-template/shared"],
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  compress: true,
  
  // Environment configuration
  env: {
    // Make sure these are available in client-side code
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Public runtime configuration
  publicRuntimeConfig: {
    // These will be available on both server and client
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  },
  
  // Server runtime configuration
  serverRuntimeConfig: {
    // These will only be available on the server-side
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    nextAuthSecret: process.env.NEXTAUTH_SECRET,
    databaseUrl: process.env.DATABASE_URL,
    emailApiKey: process.env.RESEND_API_KEY,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  },
  
  images: {
    domains: [
      // Supabase storage domains
      'your-project.supabase.co',
      'your-staging-project.supabase.co', 
      'your-dev-project.supabase.co',
      // Other image domains
      'images.unsplash.com',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    serverComponentsExternalPackages: ['@starter-template/database'],
  },
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Bundle analyzer
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      if (!dev && !isServer) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: '../analyze/client.html',
            openAnalyzer: false,
          })
        );
      }
      return config;
    },
  }),
  
  // Security headers
  headers: async () => {
    const ContentSecurityPolicy = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ''};
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: blob: https:;
      font-src 'self' data:;
      connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL || ''} ${process.env.NEXT_PUBLIC_API_URL || ''};
      frame-src 'self';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy,
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  
  // Redirects
  redirects: async () => {
    return [
      {
        source: '/dashboard',
        destination: '/dashboard/overview',
        permanent: false,
      },
    ];
  },
  
  // Rewrites for API routes
  rewrites: async () => {
    return [
      {
        source: '/api/health',
        destination: '/api/health',
      },
    ];
  },
}

module.exports = nextConfig