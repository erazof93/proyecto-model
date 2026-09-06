/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // TypeORM carga drivers de forma dinámica (mysql2, oracledb, mongodb...).
  // Marcarlo como external evita que el bundler de server intente resolver
  // esos require() opcionales y rompa el build.
  serverExternalPackages: ["typeorm"],
  // Permite consumir los packages TS del monorepo sin pre-compilarlos
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
