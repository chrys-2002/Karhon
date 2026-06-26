// ─────────────────────────────────────────────────────────────
// Notifications KARHON — centre in-app (table notifications) + e-mail.
//
//   • notifierAgents(...) : prévient le personnel (nouvelle demande,
//     déclaration, choix d'offre…). Une notif "agent" + un e-mail à
//     la boîte d'exploitation.
//   • notifierClient(...) : prévient un client précis (proposition
//     reçue, changement de statut…). Une notif "client" + un e-mail
//     au client.
//
// Tout est « best-effort » : si l'e-mail échoue ou si la base est
// indisponible, on n'interrompt JAMAIS le flux principal (la demande
// du client aboutit quand même).
// ─────────────────────────────────────────────────────────────
import { prisma } from "@/lib/prisma";
import { envoyerEmail, gabaritNotification } from "@/lib/email";

const EMAIL_OPS = process.env.EMAIL_OPS ?? "infos@karhonassurance.com";
const APP_URL = (process.env.APP_URL ?? "https://karhonassurance.com").replace(/\/$/, "");

type Base = { type: string; titre: string; message: string };

// Onglet du back-office ciblé selon le type de notification (clic → bon onglet).
const ONGLET_AGENT: Record<string, string> = {
  devis: "devis",
  sinistre: "sinistres",
  rendezvous: "rdv",
  choix: "devis",
  message: "messages",
};
// Onglet de l'espace client ciblé selon le type.
const ONGLET_CLIENT: Record<string, string> = {
  proposition: "devis",
  message: "messages",
};

// Construit un lien interne avec onglet + référence éventuelle (ex. conversation).
function construireLien(base: string, onglet: string, ref?: string): string {
  const params = new URLSearchParams();
  if (onglet) params.set("onglet", onglet);
  if (ref) params.set("ref", ref);
  const q = params.toString();
  return q ? `${base}?${q}` : base;
}

// Prévient TOUT le personnel (notif visible dans le back-office + e-mail).
export async function notifierAgents(opts: Base & { lien?: string; onglet?: string; ref?: string }): Promise<void> {
  const onglet = opts.onglet ?? ONGLET_AGENT[opts.type] ?? "";
  const lien = construireLien("/admin", onglet, opts.ref);
  try {
    await prisma.notification.create({
      data: { cible: "agent", type: opts.type, titre: opts.titre, message: opts.message, lien },
    });
  } catch (e) {
    console.error("[notif:agent:db]", e);
  }
  try {
    await envoyerEmail({
      to: EMAIL_OPS,
      subject: `KARHON — ${opts.titre}`,
      html: gabaritNotification({ titre: opts.titre, message: opts.message, lienTexte: "Ouvrir le back-office", lienUrl: `${APP_URL}${lien}` }),
    });
  } catch (e) {
    console.error("[notif:agent:mail]", e);
  }
}

// Prévient UN client (notif dans son espace + e-mail s'il a une adresse).
export async function notifierClient(
  opts: Base & { userId: string; email?: string | null; lien?: string; onglet?: string; ref?: string }
): Promise<void> {
  const onglet = opts.onglet ?? ONGLET_CLIENT[opts.type] ?? "";
  const lien = construireLien("/client/dashboard", onglet, opts.ref);
  try {
    await prisma.notification.create({
      data: { cible: "client", userId: opts.userId, type: opts.type, titre: opts.titre, message: opts.message, lien },
    });
  } catch (e) {
    console.error("[notif:client:db]", e);
  }
  if (opts.email) {
    try {
      await envoyerEmail({
        to: opts.email,
        subject: `KARHON — ${opts.titre}`,
        html: gabaritNotification({ titre: opts.titre, message: opts.message, lienTexte: "Ouvrir mon espace", lienUrl: `${APP_URL}${lien}` }),
      });
    } catch (e) {
      console.error("[notif:client:mail]", e);
    }
  }
}
