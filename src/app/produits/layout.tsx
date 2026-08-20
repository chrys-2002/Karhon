import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nos Produits d'Assurance",
  description:
    "Découvrez toutes les assurances proposées par KARHON Assurances à Abidjan : automobile, habitation, santé, voyage, responsabilité civile, retraite, prévoyance. Comparaison gratuite entre plusieurs compagnies partenaires.",
};

export default function ProduitsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
