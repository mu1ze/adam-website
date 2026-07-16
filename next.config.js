import withMDX from '@next/mdx';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  allowedDevOrigins: ['192.168.2.41', 'localhost:3369'],
};

const mdxConfig = withMDX({
  extension: /\.mdx?$/,
});

export default mdxConfig(nextConfig);
