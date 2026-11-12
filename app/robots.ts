
import type { MetadataRoute } from "next";

const baseUrl = "https://ordenentusfinanzas.vercel.app";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: [
                "/api/",
                "/hoy",
                "/admin",
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
