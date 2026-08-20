import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demander un Devis Gratuit",
  description:
    "Obtenez votre cotation d'assurance gratuite en 3 étapes avec KARHON Assurances. Un conseiller vous recontacte rapidement avec les meilleures offres du marché ivoirien, sans engagement.",
};

export default function DevisLayout({ children }: { children: React.ReactNode }) {
  return children;
}
