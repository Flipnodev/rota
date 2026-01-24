import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@rota/ui", "@rota/utils", "@rota/i18n"],
  outputFileTracingRoot: path.join(__dirname, "../../"),
  allowedDevOrigins: ["192.168.10.167"],
};

export default nextConfig;
