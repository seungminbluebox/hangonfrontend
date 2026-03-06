import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://hangon.co.kr";

  const routes = [
    "",
    "/news/daily-report",
    "/live",
    "/fear-greed",
    "/kospi-fear-greed",
    "/currency-desk",
    "/dollar-index",
    "/earnings",
    "/credit-balance",
    "/interest-rate",
    "/market-holidays",
    "/money-flow",
    "/put-call-ratio",
    "/nasdaq-futures",
    "/kospi-night-futures",
    "/market-correlation",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  return routes;
}
