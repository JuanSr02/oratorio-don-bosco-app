import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // En dev lo apagamos para que no capee molestamente los reloads
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: process.env.DEV_ORIGIN ? [process.env.DEV_ORIGIN] : ['192.168.1.12'],
  images: {
    formats: ['image/webp'],
  },
}

export default withPWA(nextConfig);
