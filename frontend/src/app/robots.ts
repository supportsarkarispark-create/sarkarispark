import { MetadataRoute } from "next"
import { getSiteUrl } from "@/lib/utils"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl()

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/profile",
          "/profile/*",
          "/dashboard",
          "/dashboard/*",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/profile/*",
          "/dashboard/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
