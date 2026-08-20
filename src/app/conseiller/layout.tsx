import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conseiller en Assurance Interactif",
  description:
    "Utilisez l'outil interactif de KARHON Assurances pour identifier rapidement l'assurance la mieux adaptée à votre profil et à votre budget, à Abidjan et partout en Côte d'Ivoire.",
};

export default function ConseillerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
