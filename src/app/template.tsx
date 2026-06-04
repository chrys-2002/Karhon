"use client";

// template.tsx — exécuté à CHAQUE navigation (contrairement à layout.tsx qui
// persiste). Transition d'entrée douce entre les pages.
//
// IMPORTANT (perf) : on anime UNIQUEMENT l'opacité, sans `transform`.
// Un transform sur ce conteneur racine casserait le `position: fixed` du
// Header (qui "sauterait" à chaque navigation) et forcerait le navigateur à
// recomposer toute la page → changements de page saccadés. Un simple fondu
// est beaucoup plus léger et reste élégant.
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
