import withPWA from "next-pwa";

const nextConfig = {
  turbopack: {},
} satisfies import("next").NextConfig;

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
})(nextConfig as unknown as Parameters<ReturnType<typeof withPWA>>[0]);
