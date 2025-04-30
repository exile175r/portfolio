/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'www.notion.so'
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          }
        ],
      },
    ]
  }
};

export default nextConfig;
