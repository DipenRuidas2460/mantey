const headers = require("./headers");
const next_config = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        hostname: "**",
      },
    ],
  },
  i18n: {
    defaultLocale: "en",
    locales: ["en", "bn", "ar", "fr"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers,
      },
    ];
  },
  env: {
    APP_ENV: process.env.NODE_ENV,
    APP_SSL: process.env.NEXT_PUBLIC_APP_SSL,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

module.exports = next_config;
