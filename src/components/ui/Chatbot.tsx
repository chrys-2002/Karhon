"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Chatbot KARHON Assurances — FAQ intelligent (sans IA)
//
// Fonctionnement : on compare le message de l'utilisateur à une
// liste de règles (mots-clés). La première règle qui correspond
// donne la réponse. Aucune clé API, aucun backend requis.
//
// ÉVOLUTION IA (étape backend) : remplacer la fonction
// `genererReponse()` par un appel à une route API
// (ex. POST /api/chat) qui interroge un modèle de langage.
// La structure des messages reste identique.
// ─────────────────────────────────────────────────────────────

type Message = { role: "bot" | "user"; texte: string };

type Regle = { motsCles: string[]; reponse: string };

// Base de connaissances : à enrichir librement.
const REGLES: Regle[] = [
  {
    motsCles: ["devis", "tarif", "prix", "cout", "coût", "combien"],
    reponse:
      "Pour obtenir un devis gratuit, rendez-vous sur la page Devis et remplissez le formulaire. KARHON Assurances vous recontacte rapidement avec une offre personnalisée. C'est totalement gratuit.",
  },
  {
    motsCles: ["produit", "assurance", "garantie", "couverture", "auto", "santé", "sante", "vie", "habitation"],
    reponse:
      "Nous proposons des assurances IARD (auto, habitation, santé…) et VIE avec les meilleures compagnies du marché ivoirien. Consultez la page Produits pour le détail des garanties.",
  },
  {
    motsCles: ["sinistre", "accident", "déclarer", "declarer", "remboursement", "indemnisation"],
    reponse:
      "En cas de sinistre, contactez-nous au plus vite. Nous vous accompagnons dans toutes les démarches face à la compagnie d'assurance jusqu'à l'indemnisation.",
  },
  {
    motsCles: ["contact", "téléphone", "telephone", "numéro", "numero", "appeler", "joindre", "mail", "email"],
    reponse:
      "Vous pouvez nous joindre au +225 07 87 10 39 39 ou au +225 05 76 36 72 72, ou via la page Contact. Nous répondons à toutes vos questions.",
  },
  {
    motsCles: ["adresse", "bureau", "où", "ou êtes", "localisation", "situé", "situe", "venir", "itinéraire", "itineraire"],
    reponse:
      "Nos bureaux sont à Abidjan, Cocody — Angré 8ème Tranche (BP V 236). La page Contact affiche une carte avec l'itinéraire en temps réel depuis votre position.",
  },
  {
    motsCles: ["horaire", "ouvert", "heure", "ouverture", "fermé", "ferme"],
    reponse:
      "Nous sommes disponibles du lundi au vendredi. Pour un rendez-vous, appelez le +225 07 87 10 39 39 ou le +225 05 76 36 72 72, ou passez par la page Contact.",
  },
  {
    motsCles: ["courtier", "indépendant", "independant", "qui êtes", "qui etes", "karhon", "cabinet"],
    reponse:
      "KARHON Assurances est un cabinet de courtage neutre et indépendant, agréé en Côte d'Ivoire. Nous défendons exclusivement vos intérêts, sans aucun honoraire facturé au client.",
  },
  {
    motsCles: ["rendez-vous", "rendez vous", "rdv", "conseiller", "rencontrer"],
    reponse:
      "Pour prendre rendez-vous avec un conseiller, appelez le +225 07 87 10 39 39 ou le +225 05 76 36 72 72, ou laissez vos coordonnées sur la page Contact. Nous revenons vers vous rapidement.",
  },
];

const SUGGESTIONS = ["Demander un devis", "Vos produits", "Déclarer un sinistre", "Vous contacter"];

const MESSAGE_ACCUEIL: Message = {
  role: "bot",
  texte:
    "Bonjour 👋 Je suis l'assistant virtuel de KARHON Assurances. Comment puis-je vous aider ? Choisissez un sujet ci-dessous ou posez votre question.",
};

// Cœur du « moteur » : trouve la meilleure réponse selon les mots-clés.
function genererReponse(message: string): string {
  const m = message.toLowerCase();
  for (const regle of REGLES) {
    if (regle.motsCles.some((mot) => m.includes(mot))) {
      return regle.reponse;
    }
  }
  return "Je n'ai pas la réponse précise à cette question, mais un conseiller KARHON Assurances se fera un plaisir de vous aider : +225 07 87 10 39 39 ou +225 05 76 36 72 72, ou via la page Contact.";
}

export default function Chatbot() {
  const [ouvert, setOuvert] = useState(false);
  const [messages, setMessages] = useState<Message[]>([MESSAGE_ACCUEIL]);
  const [saisie, setSaisie] = useState("");
  const [enAttente, setEnAttente] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);
  const panneauRef = useRef<HTMLDivElement>(null);
  const bulleRef = useRef<HTMLButtonElement>(null);

  // Fait défiler vers le dernier message à chaque ajout.
  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, ouvert, enAttente]);

  // Ferme le chat si on clique en dehors de la fenêtre et du bouton.
  // Aucune couche superposée → la page n'est jamais bloquée.
  useEffect(() => {
    if (!ouvert) return;
    const handler = (e: MouseEvent) => {
      const cible = e.target as Node;
      if (
        panneauRef.current && !panneauRef.current.contains(cible) &&
        bulleRef.current && !bulleRef.current.contains(cible)
      ) {
        setOuvert(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ouvert]);

  // Envoie le message à l'assistant IA (route /api/chat).
  // En cas d'échec réseau/serveur, on retombe sur la FAQ par mots-clés
  // pour ne jamais laisser l'utilisateur sans réponse.
  const envoyer = async (texte: string) => {
    const contenu = texte.trim();
    if (!contenu || enAttente) return;

    // 1) Affiche immédiatement le message de l'utilisateur.
    const historique: Message[] = [...messages, { role: "user", texte: contenu }];
    setMessages(historique);
    setSaisie("");
    setEnAttente(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // On envoie l'historique (sans le message d'accueil) pour le contexte.
        body: JSON.stringify({ messages: historique.slice(1) }),
      });
      const data = await res.json();
      const reponse =
        (res.ok && data?.reponse) ? data.reponse : genererReponse(contenu);
      setMessages((prev) => [...prev, { role: "bot", texte: reponse }]);
    } catch {
      // Repli hors-ligne : FAQ par mots-clés.
      setMessages((prev) => [...prev, { role: "bot", texte: genererReponse(contenu) }]);
    } finally {
      setEnAttente(false);
    }
  };

  return (
    <>
      {/* Bouton bulle flottante */}
      <motion.button
        ref={bulleRef}
        type="button"
        aria-label={ouvert ? "Fermer le chat" : "Ouvrir le chat"}
        onClick={() => setOuvert((o) => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl"
        style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={ouvert ? "close" : "open"}
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.18 }}
            className="flex items-center justify-center"
          >
            {ouvert ? <X size={26} /> : <MessageCircle size={26} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {/* Fenêtre de chat (aucune couche plein écran → page jamais bloquée) */}
      <AnimatePresence>
        {ouvert && (
        <motion.div
          ref={panneauRef}
          initial={{ opacity: 0, scale: 0.85, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 16 }}
          transition={{ type: "spring", stiffness: 320, damping: 26, mass: 0.8 }}
          className="fixed bottom-24 right-5 z-50 flex w-[92vw] max-w-sm flex-col overflow-hidden rounded-3xl border bg-white shadow-2xl"
          style={{ borderColor: "#e0ecec", height: "min(70vh, 520px)", transformOrigin: "bottom right" }}
        >
          {/* En-tête */}
          <div
            className="flex items-center gap-3 px-5 py-4 text-white"
            style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
              <Bot size={22} />
            </div>
            <div className="leading-tight">
              <p className="font-semibold">Assistant KARHON</p>
              <p className="text-xs text-white/70">En ligne · réponse immédiate</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" style={{ backgroundColor: "#f5fbfb" }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                  style={
                    msg.role === "user"
                      ? { backgroundColor: "#1a2e5a", color: "#ffffff" }
                      : { backgroundColor: "#ffffff", color: "#374151", border: "1px solid #e0ecec" }
                  }
                >
                  {msg.texte}
                </div>
              </div>
            ))}

            {/* Suggestions rapides (seulement au début) */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => envoyer(s)}
                    className="rounded-full border px-3 py-1.5 text-xs font-medium transition hover:scale-[1.03]"
                    style={{ borderColor: "#cfe3e3", color: "#1a2e5a", backgroundColor: "#ffffff" }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Indicateur « en train d'écrire » pendant l'appel à l'IA */}
            {enAttente && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl px-4 py-3" style={{ backgroundColor: "#ffffff", border: "1px solid #e0ecec" }}>
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: "#2a8a8a" }}
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={finRef} />
          </div>

          {/* Zone de saisie */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              envoyer(saisie);
            }}
            className="flex items-center gap-2 border-t px-3 py-3"
            style={{ borderColor: "#e0ecec" }}
          >
            <input
              value={saisie}
              onChange={(e) => setSaisie(e.target.value)}
              disabled={enAttente}
              placeholder={enAttente ? "L'assistant répond…" : "Écrivez votre message…"}
              className="flex-1 rounded-full border px-4 py-2.5 text-sm outline-none focus:ring-2 disabled:opacity-60"
              style={{ borderColor: "#cfe3e3" }}
            />
            <button
              type="submit"
              aria-label="Envoyer"
              disabled={!saisie.trim() || enAttente}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:scale-105 disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}
            >
              <Send size={18} />
            </button>
          </form>
        </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
