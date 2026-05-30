"use client";
import Link from "next/link";
import { Phone, Mail, MapPin, Car, Home, HeartPulse, ShieldAlert, Plane, Scale, Truck, Store, Users, Anchor, TrendingUp, GraduationCap, Landmark, Briefcase, Flower2 } from "lucide-react";

const produitsParticuliers = [
  { label: "Assurance Automobile", Icon: Car },
  { label: "Assurance Habitation", Icon: Home },
  { label: "Santé Individuelle", Icon: HeartPulse },
  { label: "Assurance Accident", Icon: ShieldAlert },
  { label: "Assurance Voyage", Icon: Plane },
  { label: "Responsabilité Civile", Icon: Scale },
];

const produitsPro = [
  { label: "Automobile Flotte", Icon: Truck },
  { label: "Multirisque Pro", Icon: Store },
  { label: "Santé Groupe", Icon: Users },
  { label: "Accident Groupe", Icon: ShieldAlert },
  { label: "RC Professionnelle", Icon: Scale },
  { label: "Assurance Maritime", Icon: Anchor },
];

const produitsVie = [
  { label: "Assurance Retraite", Icon: TrendingUp },
  { label: "Assurance Étude Plus", Icon: GraduationCap },
  { label: "Vie Emprunteur", Icon: Landmark },
  { label: "Retraite Groupe", Icon: Briefcase },
  { label: "Assistance Funéraire", Icon: Flower2 },
];

const liens = [
  { href: "/", label: "Accueil" },
  { href: "/produits", label: "Nos produits" },
  { href: "/devis", label: "Demander un devis" },
  { href: "/apropos", label: "À propos" },
  { href: "/contact", label: "Contact" },
  { href: "/client", label: "Espace Client" },
];

const contacts = [
  { Icon: Phone, text: "+225 07 87 10 39 39", href: "tel:+2250787103939" },
  { Icon: Phone, text: "+225 05 76 36 72 72", href: "tel:+2250576367272" },
  { Icon: Mail, text: "infos@karhonassurance.com", href: "mailto:infos@karhonassurance.com" },
  { Icon: MapPin, text: "Abidjan, Côte d'Ivoire", href: "#" },
];

function ProduitLink({ label, Icon }: { label: string; Icon: React.ElementType }) {
  return (
    <li>
      <Link href="/produits" className="flex items-center gap-2.5 text-xs transition-all hover:text-white group" style={{ color: "#9ab8b8" }}>
        <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110" style={{ background: "rgba(42,138,138,0.15)", border: "1px solid rgba(42,138,138,0.2)" }}>
          <Icon size={11} style={{ color: "#2a8a8a" }} strokeWidth={1.8} />
        </div>
        {label}
      </Link>
    </li>
  );
}

function ColTitle({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom, #2a8a8a, #1a6a6a)" }} />
      <h4 className="font-bold text-sm uppercase tracking-widest" style={{ color: "#2a8a8a" }}>{label}</h4>
    </div>
  );
}

export default function Footer() {
  return (
    <footer style={{ background: "linear-gradient(160deg, #0f1e3a 0%, #1a2e5a 60%, #163a3a 100%)" }} className="text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-8">

        {/* Bloc logo + contact */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 pb-10" style={{ borderBottom: "1px solid rgba(42,138,138,0.25)" }}>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}>
                <span className="text-white font-bold text-xl">K</span>
              </div>
              <div>
                <span className="font-bold text-2xl text-white">ARHON</span>
                <span className="text-base ml-1 font-medium" style={{ color: "#2a8a8a" }}>Assurances</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
              Cabinet de courtage en assurances à Abidjan. Votre interlocuteur unique, neutre et indépendant.
            </p>
            <p className="text-xs mt-2" style={{ color: "#2a8a8a" }}>Agrément n°0305/MEF/DGTCP/DA du 02 SEPT 2021</p>
          </div>

          {/* Contact rapide */}
          <div className="flex flex-col gap-2.5">
            {contacts.map((item, i) => (
              <a key={i} href={item.href} className="flex items-center gap-3 text-sm transition-colors hover:text-white" style={{ color: "#9ab8b8" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(42,138,138,0.18)", border: "1px solid rgba(42,138,138,0.3)" }}>
                  <item.Icon size={13} style={{ color: "#2a8a8a" }} strokeWidth={1.8} />
                </div>
                {item.text}
              </a>
            ))}
          </div>
        </div>

        {/* Grille produits + liens */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">

          {/* Particuliers */}
          <div>
            <ColTitle label="Particuliers" />
            <ul className="space-y-2.5">
              {produitsParticuliers.map((item, i) => <ProduitLink key={i} label={item.label} Icon={item.Icon} />)}
            </ul>
          </div>

          {/* Professionnelles */}
          <div>
            <ColTitle label="Professionnelles" />
            <ul className="space-y-2.5">
              {produitsPro.map((item, i) => <ProduitLink key={i} label={item.label} Icon={item.Icon} />)}
            </ul>
          </div>

          {/* Assurance Vie */}
          <div>
            <ColTitle label="Assurance Vie" />
            <ul className="space-y-2.5">
              {produitsVie.map((item, i) => <ProduitLink key={i} label={item.label} Icon={item.Icon} />)}
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <ColTitle label="Navigation" />
            <ul className="space-y-2.5">
              {liens.map((item, i) => (
                <li key={i}>
                  <Link href={item.href} className="flex items-center gap-2.5 text-xs transition-all hover:text-white group" style={{ color: "#9ab8b8" }}>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all group-hover:scale-150" style={{ backgroundColor: "#2a8a8a" }} />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/devis" className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-xs text-white transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)", boxShadow: "0 6px 20px rgba(42,138,138,0.3)" }}>
              Devis gratuit →
            </Link>
          </div>
        </div>

        {/* Bas de page */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 text-xs" style={{ borderTop: "1px solid rgba(42,138,138,0.2)", color: "#5a7a7a" }}>
          <p>© {new Date().getFullYear()} KARHON Assurances — Tous droits réservés</p>
          <p style={{ color: "#2a8a8a" }}>Abidjan, Côte d&apos;Ivoire</p>
        </div>
      </div>
    </footer>
  );
}