
import type { MetadataRoute } from "next";

const baseUrl = "https://ordenentusfinanzas.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: `${baseUrl}/onboarding`,
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${baseUrl}/privacy`,
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            changeFrequency: "yearly",
            priority: 0.3,
        },
    ];
}
