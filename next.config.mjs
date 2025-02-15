/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@vercel/blob"],
  images: {
    domains: ["lh3.googleusercontent.com", "avatars.githubusercontent.com"],
  },
};

export default nextConfig;
