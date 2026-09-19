/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable webpack disk caching to prevent ENOSPC disk space exhaustion on drive C
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
