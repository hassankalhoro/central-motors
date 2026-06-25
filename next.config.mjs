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
    const toProducts = (from) => ({ source: from, destination: "/products", permanent: true });
    const product = (from, slug) => ({ source: from, destination: `/product/${slug}`, permanent: true });
    return [
      // corporate / section pages
      { source: "/auto-mobile", destination: "/products", permanent: true },
      { source: "/vision-mission", destination: "/about", permanent: true },
      { source: "/suzuki-geniune-parts", destination: "/genuine-parts", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
      // surviving models (current lineup)
      product("/swift", "swift"),
      product("/cultus", "cultus"),
      product("/wagon-r", "wagon-r"),
      // removed categories → all models
      toProducts("/heavy-bikes"),
      toProducts("/motorcycles"),
      toProducts("/products/heavy-bikes"),
      toProducts("/products/motorcycles"),
      // discontinued cars & all motorbikes → all models (no dead links)
      ...["/vitara", "/ciaz", "/mehran", "/bolan", "/apv", "/jimny", "/mega-carry",
        "/ravi-pickup", "/cargo-van-2", "/inazuma", "/inazuma-aegis", "/gsx-r-600",
        "/gs-150se-gs150", "/gr-150", "/gd-110s", "/sprinter-eco"].map(toProducts),
    ];
  },
};

export default nextConfig;
