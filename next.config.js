const fs = require('fs');
const path = require('path');

/**
 * Dynamically get all rc-* packages in node_modules
 */
function getRcPackages() {
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  return fs
    .readdirSync(nodeModulesPath)
    .filter(name => name.startsWith('rc-'));
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compiler: { styledComponents: true },
  reactStrictMode: true,
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  swcMinify: true,
  output: "export",
  images: {
    unoptimized: true,
  },

   transpilePackages: [
    ...getRcPackages(),
     '@ant-design/icons-svg',
     '@rc-component',
  ],
};

module.exports = nextConfig;
