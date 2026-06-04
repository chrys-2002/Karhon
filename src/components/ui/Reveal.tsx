"use client";

// <Reveal> — apparition douce au scroll, façon Apple.
// Le contenu glisse légèrement vers le haut en se révélant, une seule fois,
// quand il entre dans le champ de vision. On peut cascader plusieurs blocs
// via la prop `delay`, et choisir la direction.
import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

type RevealProps = {
  children: ReactNode;
  /** Décalage de départ pour cascader (en secondes). */
  delay?: number;
  /** Direction d'où vient l'élément. */
  direction?: Direction;
  /** Durée de l'animation (secondes). */
  duration?: number;
  /** Classe CSS du conteneur. */
  className?: string;
  /** Amplitude du déplacement en pixels. */
  distance?: number;
};

const decalage = (direction: Direction, d: number) => {
  switch (direction) {
    case "up":
      return { y: d, x: 0 };
    case "down":
      return { y: -d, x: 0 };
    case "left":
      return { x: d, y: 0 };
    case "right":
      return { x: -d, y: 0 };
    default:
      return { x: 0, y: 0 };
  }
};

export default function Reveal({
  children,
  delay = 0,
  direction = "up",
  duration = 0.7,
  className,
  distance = 28,
}: RevealProps) {
  const offset = decalage(direction, distance);

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1], // même courbe que --ease-apple
      }}
    >
      {children}
    </motion.div>
  );
}
