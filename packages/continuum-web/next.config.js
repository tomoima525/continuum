/** @type {import('next').NextConfig} */
const nextConfig = {
  // fix menu issue https://github.com/tailwindlabs/headlessui/issues/681
  reactStrictMode: false,
  webpack: function (config, options) {
    if (!options.isServer) {
      config.resolve.fallback.fs = false;
    }
    config.experiments = { asyncWebAssembly: true, layers: true };
    return config;
  },
};

module.exports = nextConfig;
