import withMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  allowedDevOrigins: ['192.168.2.41', 'localhost:3369', '127.0.0.1'],
  turbopack: {
    root: '/Users/dvlli/Websites/adam-website',
  },
};

const mdxConfig = withMDX({
  extension: /\.mdx?$/,
});

export default mdxConfig(nextConfig);
