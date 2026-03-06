import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://hangon.co.kr";

  const routes = [
    "",
    "/news/daily-report",
    "/live",
    "/kospi-fear-greed",
    "/money-flow/domestic",
    "/kospi-night-futures",
    "/credit-balance",
    "/fear-greed",
    "/money-flow/us",
    "/nasdaq-futures",
    "/put-call-ratio",
    "/dollar-index",
    "/currency-desk",
    "/interest-rate",
    "/money-flow/safe",
    "/market-correlation",
    "/market-holidays",
    "/money-flow",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  return routes;
}
