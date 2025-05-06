/** @type {import('next').NextConfig} */
// const cspHeader = `
//   default-src 'self' https://rakuraku.nichi.in/ https://hinanjo.nichi.in/ https://demo.hinan.telenet.co.jp/;
//   script-src 'self' 'unsafe-inline' 'unsafe-eval' https://docs.opencv.org/ https://maps.googleapis.com/ https://static.line-scdn.net/liff/edge/2/non-ios-extensions_2_22_0.js;
//   style-src 'self' 'unsafe-inline' https://fonts.googleapis.com/;
//   font-src 'self' https://fonts.googleapis.com/ https://fonts.gstatic.com/;
//   connect-src 'self' data: https://fonts.gstatic.com/ http://127.0.0.1:50080 ws://127.0.0.1:17778 https://rakuraku.nichi.in/ https://hinanjo.nichi.in/ https://rakurakuapi.nichi.in/api/ https://api.hinanjo.nichi.in/api/ https://demo.hinan.telenet.co.jp/ https://api.demo.hinan.telenet.co.jp/api/ https://maps.googleapis.com/  https://api.line.me/ https://liffsdk.line-scdn.net/;
//   img-src 'self' data: https://maps.googleapis.com/ https://maps.gstatic.com/ https://rakurakuapi.nichi.in/ https://hinanjo.nichi.in/ https://demo.hinan.telenet.co.jp/ https://dummyimage.com/;
//   frame-ancestors 'self';
//   form-action 'self';
//   worker-src 'self' blob:;
// `;

const nextConfig = {
  poweredByHeader: false,
  compiler: { styledComponents: true },
  reactStrictMode: true,
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  output: "export",
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  // eslint: {
  //   // Warning: This allows production builds to successfully complete even if
  //   // your project has ESLint errors.
  //   ignoreDuringBuilds: true,
  // },

  // async headers() {
  //   const securityHeaders = [
  //     {
  //       key: 'Content-Security-Policy',
  //       value: cspHeader.replace(/\s{2,}/g, ' ').trim(),
  //     },
  //     {
  //       key: 'X-Frame-Options',
  //       value: 'SAMEORIGIN',
  //     },
  //     {
  //       key: 'Strict-Transport-Security',
  //       value: 'max-age=31536000',
  //     },
  //     {
  //       key: 'X-Content-Type-Options',
  //       value: 'nosniff',
  //     },
  //   ];
  
  //   return [
  //     {
  //       source: '/(.*)',
  //       headers: securityHeaders,
  //     },
  //     {
  //       source: '/_next/(.*)',
  //       headers: securityHeaders,
  //     },
  //   ];
  // }
};

module.exports = nextConfig;
