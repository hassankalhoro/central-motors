/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 365, // optimized images cached 1 year
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 64, 96, 128, 256],
  },

  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-DNS-Prefetch-Control", value: "on" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];
    const immutable = [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/images/:path*", headers: immutable },
      { source: "/brochures/:path*", headers: immutable },
      { source: "/brand/:path*", headers: immutable },
    ];
  },

  async redirects() {
    const product = (from, slug) => ({ source: from, destination: `/product/${slug}`, permanent: true });
    return [
      { source: "/auto-mobile", destination: "/products/automobiles", permanent: true },
      { source: "/heavy-bikes", destination: "/products/heavy-bikes", permanent: true },
      { source: "/motorcycles", destination: "/products/motorcycles", permanent: true },
      { source: "/vision-mission", destination: "/about", permanent: true },
      { source: "/suzuki-geniune-parts", destination: "/genuine-parts", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
      product("/swift", "swift"),
      product("/cultus", "cultus"),
      product("/wagon-r", "wagon-r"),
      product("/vitara", "vitara"),
      product("/ciaz", "ciaz"),
      product("/mehran", "mehran"),
      product("/bolan", "bolan"),
      product("/apv", "apv"),
      product("/jimny", "jimny"),
      product("/mega-carry", "mega-carry"),
      product("/ravi-pickup", "ravi-pickup"),
      product("/cargo-van-2", "cargo-van"),
      product("/inazuma", "inazuma"),
      product("/inazuma-aegis", "inazuma-aegis"),
      product("/gsx-r-600", "gsx-r-600"),
      product("/gs-150se-gs150", "gs-150"),
      product("/gr-150", "gr-150"),
      product("/gd-110s", "gd-110s"),
      product("/sprinter-eco", "sprinter-eco"),
    ];
  },
};

export default nextConfig;
