"use client";

// <BackButton> — bouton de retour réutilisable, style KARHON.
// Par défaut il revient à la page précédente (router.back()). On peut aussi
// forcer une destination via `href`, et personnaliser le libellé.
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

type BackButtonProps = {
  href?: string;
  label?: string;
  className?: string;
};

export default function BackButton({
  href,
  label = "Retour",
  className = "",
}: BackButtonProps) {
  const router = useRouter();

  const onClick = () => {
    if (href) router.push(href);
    else router.back();
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ x: -4 }}
      whileTap={{ scale: 0.96 }}
      className={`group inline-flex items-center gap-2 text-sm font-semibold transition-colors ${className}`}
      style={{ color: "#1a2e5a" }}
    >
      <span
        className="flex items-center justify-center w-9 h-9 rounded-full border transition-all group-hover:shadow-md"
        style={{ borderColor: "#e0ecec", backgroundColor: "#ffffff" }}
      >
        <ArrowLeft size={17} style={{ color: "#2a8a8a" }} />
      </span>
      {label}
    </motion.button>
  );
}
