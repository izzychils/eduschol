import type { MetadataRoute } from "next";

const publicPaths = ["/", "/about", "/contact", "/products", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPaths.map((path) => ({
    url: `https://eduschol.xyz${path}`,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.6,
  }));
}
