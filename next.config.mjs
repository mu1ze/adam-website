/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.2.41', 'localhost:3369'],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
