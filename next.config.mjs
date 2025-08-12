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
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; media-src 'self' blob: data:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; font-src 'self' https://cdnjs.cloudflare.com; frame-src 'self';"
          }
        ],
      },
      {
        source: '/contents/video/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, HEAD, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Origin, X-Requested-With, Content-Type, Accept, Range'
          },
          {
            key: 'Access-Control-Expose-Headers',
            value: 'Content-Length, Content-Range'
          }
        ],
      },
      {
        source: '/video/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, HEAD, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Origin, X-Requested-With, Content-Type, Accept, Range'
          },
          {
            key: 'Access-Control-Expose-Headers',
            value: 'Content-Length, Content-Range'
          }
        ],
      }
    ]
  },
  // 정적 파일 서빙을 위한 설정
  async rewrites() {
    return [
      {
        source: '/contents/:path*',
        destination: '/contents/:path*',
      },
      {
        source: '/video/:path*',
        destination: '/contents/video/:path*',
      }
    ]
  }
};

export default nextConfig;
