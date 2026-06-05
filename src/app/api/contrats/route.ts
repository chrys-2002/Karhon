// Routes /api/contrats
//   POST → un admin crée un contrat À PARTIR d'un devis (souscription).
//   GET  → liste des contrats : un client voit LES SIENS, un admin voit TOUT.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerAuth, exigerAdmin } from "@/lib/session";
import { ajouterMois } from "@/lib/contrats";

// Durées de souscription autorisées (en mois).
const DUREES_VALIDES = [1, 2, 3, 6, 12];

// Génère un numéro de contrat lisible et unique (ex. "KAR-2026-3F9A2C").
function genererNumero(): string {
  const annee = new Date().getFullYear();
  const suffixe = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `KAR-${annee}-${suffixe}`;
}

// ── POST : créer un contrat depuis un devis ──────────────────
export async function POST(req: Request) {
  const auth = await exigerAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { devisId, dureeMois, primeAnnuelle, dateDebut, options } = await req.json();

    // 1) Validation de base.
    if (!devisId || !dureeMois || primeAnnuelle == null) {
      return NextResponse.json(
        { erreur: "Devis, durée et prime sont obligatoires." },
        { status: 400 }
      );
    }
    if (!DUREES_VALIDES.includes(Number(dureeMois))) {
      return NextResponse.json(
        { erreur: "Durée invalide (1, 2, 3, 6 ou 12 mois)." },
        { status: 400 }
      );
    }
    const prime = Number(primeAnnuelle);
    if (!Number.isFinite(prime) || prime < 0) {
      return NextResponse.json({ erreur: "Prime invalide." }, { status: 400 });
    }

    // 2) Le devis doit exister (on récupère client + produit).
    const devis = await prisma.devis.findUnique({ where: { id: devisId } });
    if (!devis) {
      return NextResponse.json({ erreur: "Devis introuvable." }, { status: 404 });
    }

    // 3) Dates : début (fourni ou aujourd'hui) → fin = début + durée.
    const debut = dateDebut ? new Date(dateDebut) : new Date();
    if (Number.isNaN(debut.getTime())) {
      return NextResponse.json({ erreur: "Date de début invalide." }, { status: 400 });
    }
    const fin = ajouterMois(debut, Number(dureeMois));

    // 4) Création du contrat + passage du devis en "accepté" (transaction).
    const [contrat] = await prisma.$transaction([
      prisma.contrat.create({
        data: {
          numeroContrat: genererNumero(),
          dateDebut: debut,
          dateFin: fin,
          dureeMois: Number(dureeMois),
          primeAnnuelle: prime,
          options: Array.isArray(options) ? options.filter((o) => typeof o === "string").slice(0, 20) : [],
          userId: devis.userId,
          produitId: devis.produitId,
        },
        include: {
          produit: { select: { nom: true, type: true } },
          user: { select: { nom: true, prenom: true, email: true, telephone: true } },
        },
      }),
      prisma.devis.update({ where: { id: devisId }, data: { statut: "accepte" } }),
    ]);

    return NextResponse.json({ contrat }, { status: 201 });
  } catch (e) {
    console.error("[contrats POST]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}

// ── GET : lister les contrats ────────────────────────────────
export async function GET() {
  const auth = await exigerAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const estAdmin = auth.role === "admin";

    const contrats = await prisma.contrat.findMany({
      where: estAdmin ? undefined : { userId: auth.userId },
      orderBy: { dateFin: "asc" }, // les plus proches du terme en premier
      include: {
        produit: { select: { nom: true, type: true } },
        user: estAdmin
          ? { select: { nom: true, prenom: true, email: true, telephone: true } }
          : false,
      },
    });

    return NextResponse.json({ contrats });
  } catch (e) {
    console.error("[contrats GET]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
