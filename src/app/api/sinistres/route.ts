// Routes /api/sinistres
//   POST → un client connecté déclare un sinistre.
//   GET  → liste des sinistres : un client voit LES SIENS, un admin voit TOUT.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerAuth, estGerant } from "@/lib/session";

const ROLES_STAFF = ["agent", "gerant", "admin"];

// ── POST : déclarer un sinistre ──────────────────────────────
export async function POST(req: Request) {
  // 1) Sécurité : utilisateur connecté obligatoire.
  const auth = await exigerAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const { typeAssurance, dateSurvenance, heureSurvenance, lieu, description, montantEstime, documents } = await req.json();

    // 2) Validation des champs obligatoires.
    if (!typeAssurance || !dateSurvenance || !description) {
      return NextResponse.json(
        { erreur: "Le type d'assurance, la date et la description sont obligatoires." },
        { status: 400 }
      );
    }

    // 3) La date de survenance doit être valide et non future.
    const date = new Date(dateSurvenance);
    if (Number.isNaN(date.getTime()) || date.getTime() > Date.now()) {
      return NextResponse.json(
        { erreur: "Date du sinistre invalide." },
        { status: 400 }
      );
    }

    // 4) N'accepte que des entrées "Libellé|url" pointant vers Vercel Blob
    //    (sécurité : empêche d'injecter une URL arbitraire en base).
    const docsValides = Array.isArray(documents)
      ? documents
          .filter(
            (d): d is string =>
              typeof d === "string" &&
              /\|https:\/\/[a-z0-9.-]+\.blob\.vercel-storage\.com\//i.test(d)
          )
          .slice(0, 12)
      : [];

    // 5) Crée le sinistre, rattaché au client connecté (auth.userId).
    const sinistre = await prisma.sinistre.create({
      data: {
        userId: auth.userId,
        typeAssurance: String(typeAssurance),
        dateSurvenance: date,
        heureSurvenance: typeof heureSurvenance === "string" ? heureSurvenance.slice(0, 5) : null,
        lieu: typeof lieu === "string" ? lieu.slice(0, 200) : null,
        description: String(description),
        montantEstime: typeof montantEstime === "number" ? montantEstime : null,
        documents: docsValides,
        // statut "declare" par défaut (défini dans le schéma).
      },
    });

    return NextResponse.json({ sinistre }, { status: 201 });
  } catch (e) {
    console.error("[sinistres POST]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}

// ── GET : lister les sinistres ───────────────────────────────
export async function GET(req: Request) {
  const auth = await exigerAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const estStaff = ROLES_STAFF.includes(auth.role);
    const gerant = estGerant(auth.role);
    const archives = new URL(req.url).searchParams.get("archives") === "1";

    if (archives && !gerant) {
      return NextResponse.json({ erreur: "Action réservée au gérant." }, { status: 403 });
    }

    const where = estStaff
      ? { supprime: archives }
      : { userId: auth.userId, supprime: false };

    const sinistres = await prisma.sinistre.findMany({
      where,
      orderBy: { dateDeclaration: "desc" },
      include: {
        user: estStaff
          ? { select: { nom: true, prenom: true, email: true, telephone: true } }
          : false,
      },
    });

    return NextResponse.json({ sinistres });
  } catch (e) {
    console.error("[sinistres GET]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
