import type { MetadataRoute } from "next";

// Plan du site pour les moteurs de recherche : liste des pages publiques
// à explorer et indexer. Les espaces privés (/admin, /client, /api,
// /acces-equipe) ne figurent volontairement pas ici.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://karhonassurance.com";
  const maintenant = new Date();

  const pages = [
    { url: "", priorite: 1 },
    { url: "/produits", priorite: 0.9 },
    { url: "/devis", priorite: 0.9 },
    { url: "/contact", priorite: 0.8 },
    { url: "/conseiller", priorite: 0.7 },
    { url: "/apropos", priorite: 0.6 },
    { url: "/partenaires", priorite: 0.6 },
  ];

  return pages.map((p) => ({
    url: `${base}${p.url}`,
    lastModified: maintenant,
    changeFrequency: "weekly" as const,
    priority: p.priorite,
  }));
}
