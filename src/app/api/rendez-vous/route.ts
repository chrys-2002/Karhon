// Routes /api/rendez-vous
//   POST → un client connecté demande un rendez-vous.
//   GET  → liste : un client voit LES SIENS, un membre du personnel voit TOUT.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerAuth } from "@/lib/session";
import { notifierAgents } from "@/lib/notifications";

const ROLES_STAFF = ["agent", "gerant", "admin"];

// ── POST : demander un rendez-vous ───────────────────────────
export async function POST(req: Request) {
  const auth = await exigerAuth();
  if (auth instanceof NextResponse) return auth;

  // Seul un client prend rendez-vous (le personnel gère, il ne réserve pas).
  if (ROLES_STAFF.includes(auth.role)) {
    return NextResponse.json({ erreur: "Réservé aux clients." }, { status: 403 });
  }

  try {
    const { date, heure, motif, notes } = await req.json().catch(() => ({}));

    if (!date || !heure || !motif) {
      return NextResponse.json(
        { erreur: "La date, l'heure et le motif sont obligatoires." },
        { status: 400 }
      );
    }

    // Combine date (YYYY-MM-DD) + heure (HH:MM) en un seul instant.
    const dateHeure = new Date(`${date}T${heure}:00`);
    if (Number.isNaN(dateHeure.getTime())) {
      return NextResponse.json({ erreur: "Date ou heure invalide." }, { status: 400 });
    }
    if (dateHeure.getTime() < Date.now()) {
      return NextResponse.json({ erreur: "Le créneau doit être dans le futur." }, { status: 400 });
    }

    // Pas de rendez-vous le week-end (jours non ouvrés).
    const jour = dateHeure.getDay(); // 0 = dimanche, 6 = samedi
    if (jour === 0 || jour === 6) {
      return NextResponse.json({ erreur: "Les rendez-vous ne sont pas disponibles le week-end." }, { status: 400 });
    }

    // Pas de doublon : un seul rendez-vous actif par créneau.
    const dejaPris = await prisma.rendezVous.findFirst({
      where: { dateHeure, statut: { in: ["en_attente", "confirme"] }, supprime: false },
    });
    if (dejaPris) {
      return NextResponse.json({ erreur: "Ce créneau est déjà réservé. Choisissez-en un autre." }, { status: 409 });
    }

    const rdv = await prisma.rendezVous.create({
      data: {
        userId: auth.userId,
        dateHeure,
        motif: String(motif).slice(0, 200),
        notes: typeof notes === "string" && notes.trim() ? notes.slice(0, 500) : null,
        // statut "en_attente" par défaut (défini dans le schéma).
      },
      include: { user: { select: { nom: true, prenom: true } } },
    });

    // Prévient le personnel (in-app + e-mail).
    const nomClient = `${rdv.user?.prenom ?? ""} ${rdv.user?.nom ?? ""}`.trim() || "Un client";
    const quand = dateHeure.toLocaleString("fr-FR", { timeZone: "Africa/Abidjan", day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" });
    await notifierAgents({
      type: "rendezvous",
      titre: "Nouvelle demande de rendez-vous",
      message: `${nomClient} souhaite un rendez-vous le ${quand} — motif : ${rdv.motif}.`,
      onglet: "rdv",
      ref: rdv.id,
    });

    return NextResponse.json({ rendezVous: rdv }, { status: 201 });
  } catch (e) {
    console.error("[rendez-vous POST]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}

// ── GET : lister les rendez-vous ─────────────────────────────
//   ?creneaux=AAAA-MM-JJ → renvoie juste les heures déjà prises ce jour-là
//   (sans donnée personnelle), pour griser les créneaux côté client.
export async function GET(req: Request) {
  const auth = await exigerAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const jour = new URL(req.url).searchParams.get("creneaux");
    if (jour) {
      const debut = new Date(`${jour}T00:00:00`);
      const fin = new Date(`${jour}T23:59:59`);
      if (Number.isNaN(debut.getTime())) {
        return NextResponse.json({ creneauxPris: [] });
      }
      const pris = await prisma.rendezVous.findMany({
        where: { dateHeure: { gte: debut, lte: fin }, statut: { in: ["en_attente", "confirme"] }, supprime: false },
        select: { dateHeure: true },
      });
      const creneauxPris = pris.map((p) =>
        new Date(p.dateHeure).toLocaleTimeString("fr-FR", { timeZone: "Africa/Abidjan", hour: "2-digit", minute: "2-digit" })
      );
      return NextResponse.json({ creneauxPris });
    }

    const estStaff = ROLES_STAFF.includes(auth.role);
    const rendezVous = await prisma.rendezVous.findMany({
      // On masque les rendez-vous archivés (suppression douce côté client).
      where: estStaff ? { supprime: false } : { userId: auth.userId, supprime: false },
      // Client : trié par date de création (le plus récent d'abord).
      // Personnel : trié par créneau à venir.
      orderBy: estStaff ? { dateHeure: "asc" } : { createdAt: "desc" },
      include: {
        user: estStaff
          ? { select: { nom: true, prenom: true, email: true, telephone: true } }
          : false,
      },
    });

    return NextResponse.json({ rendezVous });
  } catch (e) {
    console.error("[rendez-vous GET]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
