import type { MetadataRoute } from "next";
import { SEO_SALARY_LEVELS, toSalarySlug } from "@/lib/takehome";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/about", "/privacy", "/ops"];
  const staticUrls = staticPaths.map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const salaryUrls = SEO_SALARY_LEVELS.map((salary) => ({
    url: `${baseUrl}/takehome/${toSalarySlug(salary)}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticUrls, ...salaryUrls];
}
