"use client";

// template.tsx — exécuté à CHAQUE navigation (contrairement à layout.tsx qui
// persiste). Idéal pour une transition d'entrée douce entre les pages : un
// léger fondu + glissement vers le haut, façon Apple.
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
