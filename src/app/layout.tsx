import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppChrome from "@/components/layout/AppChrome";

export const metadata: Metadata = {
  metadataBase: new URL("https://karhonassurance.com"),
  title: {
    default: "KARHON Assurances - Cabinet de Courtage à Abidjan",
    template: "%s | KARHON Assurances",
  },
  description:
    "KARHON Assurances, courtier en assurances neutre et indépendant à Abidjan (Cocody, Angré). Devis gratuit pour vos assurances auto, habitation, santé, voyage et vie.",
  keywords: [
    "assurance Abidjan",
    "courtier assurance Côte d'Ivoire",
    "assurance auto Abidjan",
    "assurance habitation",
    "assurance santé Côte d'Ivoire",
    "KARHON Assurances",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "KARHON Assurances",
    title: "KARHON Assurances - Cabinet de Courtage à Abidjan",
    description:
      "Courtier en assurances neutre et indépendant en Côte d'Ivoire. Devis gratuit, sans honoraires.",
  },
};

// Échelle correcte sur mobile (largeur du périphérique).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen" suppressHydrationWarning>
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
