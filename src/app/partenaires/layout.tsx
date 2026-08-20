import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nos Compagnies Partenaires",
  description:
    "KARHON Assurances travaille avec les plus grandes compagnies d'assurance de Côte d'Ivoire (NSIA, SUNU, Sanlam Allianz, SIM, Leadway et bien d'autres) pour vous offrir le meilleur choix de garanties et de tarifs.",
};

export default function PartenairesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
