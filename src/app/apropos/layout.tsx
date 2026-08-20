import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À Propos de KARHON Assurances",
  description:
    "KARHON Assurances est un cabinet de courtage en assurances agréé en Côte d'Ivoire, neutre et indépendant, qui défend exclusivement les intérêts de ses clients, sans honoraires facturés.",
};

export default function AproposLayout({ children }: { children: React.ReactNode }) {
  return children;
}
