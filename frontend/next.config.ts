import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Корень проекта — при запуске из frontend/ (npm run dev/build) process.cwd() = frontend
    root: process.cwd(),
  },
};

export default nextConfig;
