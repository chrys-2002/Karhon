"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Chatbot from "@/components/ui/Chatbot";

// ─────────────────────────────────────────────────────────────
// AppChrome — décide si l'on affiche le « chrome » marketing
// (Header + Footer + Chatbot) autour du contenu.
//
// Sur les espaces tableau de bord (back-office admin, espace client),
// ce chrome est masqué : ces pages possèdent leur propre coquille
// (sidebar + top bar via DashboardShell).
// ─────────────────────────────────────────────────────────────

const ROUTES_SANS_CHROME = ["/admin", "/client/dashboard", "/acces-equipe", "/client/recu"];

export default function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const sansChrome = ROUTES_SANS_CHROME.some((r) => pathname === r || pathname.startsWith(`${r}/`));

  if (sansChrome) {
    // Le contenu (les pages dashboard) gère lui-même sa mise en page.
    return <main className="flex-grow">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      <Chatbot />
    </>
  );
}
