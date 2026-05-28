"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ background: "linear-gradient(135deg, #1a2e5a, #0f1e3a)" }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4" style={{ color: "#2a8a8a" }}>
              KARHON Assurances
            </h3>
            <p className="text-gray-300 text-sm">Cabinet de courtage en assurances à Abidjan</p>
            <p className="text-gray-400 mt-2 text-xs sm:text-sm">
              Agrément n°0305/MEF/DGTCP/DA du 02 SEPT 2021
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-base sm:text-lg" style={{ color: "#2a8a8a" }}>Nos produits</h4>
            <ul className="space-y-2 text-sm">
              {["Assurance Auto", "Assurance Habitation", "Assurance Santé", "Assurance Vie"].map((p) => (
                <li key={p}>
                  <Link href="/devis" className="transition-colors hover:text-white" style={{ color: "#9ab8b8" }}>
                    {p}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-base sm:text-lg" style={{ color: "#2a8a8a" }}>Liens rapides</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/", label: "Accueil" },
                { href: "/produits", label: "Produits" },
                { href: "/devis", label: "Devis" },
                { href: "/contact", label: "Contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-white" style={{ color: "#9ab8b8" }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-base sm:text-lg" style={{ color: "#2a8a8a" }}>Contact</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-center gap-2">📞 <span>+225 07 07 10 87 43</span></li>
              <li className="flex items-center gap-2 break-all">✉️ <span>contact@karhon-assurances.ci</span></li>
              <li className="flex items-center gap-2">📍 <span>Abidjan, Côte d&apos;Ivoire</span></li>
            </ul>
          </div>
        </div>
        <div
          className="border-t mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400 text-xs sm:text-sm"
          style={{ borderColor: "#2a4a7a" }}
        >
          <p>© {new Date().getFullYear()} KARHON Assurances - Tous droits réservés</p>
        </div>
      </div>
    </footer>
  );
}