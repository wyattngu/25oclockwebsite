import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/data/products";
import { collections } from "@/lib/data/collections";
import { staticPages } from "@/lib/data/pages";

const BASE_URL = "https://25oclockhome.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = ["", "/campaign", "/pages/contact"].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
  }));

  const collectionRoutes: MetadataRoute.Sitemap = collections.map((c) => ({
    url: `${BASE_URL}/collections/${c.handle}`,
    lastModified: new Date(),
  }));

  const productRoutes: MetadataRoute.Sitemap = getAllProducts().map((p) => ({
    url: `${BASE_URL}/products/${p.handle}`,
    lastModified: new Date(p.createdAt),
  }));

  const pageRoutes: MetadataRoute.Sitemap = staticPages.map((p) => ({
    url: `${BASE_URL}/pages/${p.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...collectionRoutes, ...productRoutes, ...pageRoutes];
}
