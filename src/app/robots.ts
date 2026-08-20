import type { MetadataRoute } from "next";

// Indique aux robots des moteurs de recherche ce qu'ils peuvent explorer.
// Les espaces privés (back-office, espace client, API, connexion personnel)
// sont exclus : aucune information confidentielle ne doit être indexée.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/client", "/api", "/acces-equipe"],
    },
    sitemap: "https://karhonassurance.com/sitemap.xml",
  };
}
