// ─────────────────────────────────────────────────────────────
// Journal d'audit — enregistre les actions sensibles (archivage,
// restauration, purge) avec leur auteur. Permet au gérant de savoir
// qui a fait quoi. N'interrompt jamais l'action principale en cas
// d'erreur d'écriture (try/catch silencieux).
// ─────────────────────────────────────────────────────────────
import { prisma } from "@/lib/prisma";

type ActionAudit = "archivage" | "restauration" | "purge";
type EntiteAudit = "devis" | "sinistre" | "contrat";

export async function journaliser(opts: {
  action: ActionAudit;
  entite: EntiteAudit;
  entiteId: string;
  resume?: string;
  auteurEmail: string;
  auteurNom?: string;
}): Promise<void> {
  try {
    await prisma.journalAudit.create({
      data: {
        action: opts.action,
        entite: opts.entite,
        entiteId: opts.entiteId,
        resume: opts.resume,
        auteurEmail: opts.auteurEmail,
        auteurNom: opts.auteurNom,
      },
    });
  } catch (e) {
    console.error("[audit] échec d'écriture du journal :", e);
  }
}
