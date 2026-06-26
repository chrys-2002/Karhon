import type { Metadata } from "next";
import "./globals.css";
import AppChrome from "@/components/layout/AppChrome";

export const metadata: Metadata = {
  title: "KARHON Assurances - Cabinet de Courtage à Abidjan",
  description: "Courtier en assurances neutre et indépendant en Côte d'Ivoire",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="flex flex-col min-h-screen">
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
