import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/auth", "/dashboard", "/print"],
    },
    sitemap: "https://eduschol.xyz/sitemap.xml",
    host: "https://eduschol.xyz",
  };
}
