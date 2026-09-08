const path = require("path");
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Permite consumir los packages TS del monorepo sin pre-compilarlos
   // Para monorepo: le dice a Vercel dónde está la raíz
  outputFileTracingRoot: path.join(__dirname, "../../"),
  transpilePackages: [
    "@proyecto-model/types",
    "@proyecto-model/utils",
    "@proyecto-model/config",
    "@proyecto-model/styles",
  ],
  images: {
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
      },
    ],
  },
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
};

module.exports = nextConfig;
