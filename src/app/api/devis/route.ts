// Routes /api/devis
//   POST → un client connecté crée une demande de devis.
//   GET  → liste des devis : un client voit LES SIENS, un admin voit TOUT.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerAuth, estGerant } from "@/lib/session";

const ROLES_STAFF = ["agent", "gerant", "admin"];

// ── POST : créer un devis ────────────────────────────────────
export async function POST(req: Request) {
  // 1) Sécurité : utilisateur connecté obligatoire.
  const auth = await exigerAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const { produitId, description, montantEstime, documents, reponses, telephoneContact } = await req.json();

    // 2) Validation des champs.
    if (!produitId || !description) {
      return NextResponse.json(
        { erreur: "Le produit et la description sont obligatoires." },
        { status: 400 }
      );
    }

    // 3) Vérifie que le produit existe réellement.
    const produit = await prisma.produit.findUnique({ where: { id: produitId } });
    if (!produit) {
      return NextResponse.json({ erreur: "Produit introuvable." }, { status: 404 });
    }

    // 4) N'accepte que des entrées "Libellé|url" pointant vers Vercel Blob.
    const docsValides = Array.isArray(documents)
      ? documents
          .filter(
            (d): d is string =>
              typeof d === "string" &&
              /\|https:\/\/[a-z0-9.-]+\.blob\.vercel-storage\.com\//i.test(d)
          )
          .slice(0, 8)
      : [];

    // 5) Réponses au questionnaire : on n'accepte qu'un objet simple
    //    { question: réponse } de taille raisonnable (sécurité).
    let reponsesValides: Record<string, string> | undefined;
    if (reponses && typeof reponses === "object" && !Array.isArray(reponses)) {
      const entrees = Object.entries(reponses as Record<string, unknown>)
        .filter(([k, v]) => typeof k === "string" && (typeof v === "string" || typeof v === "number"))
        .slice(0, 40)
        .map(([k, v]) => [k.slice(0, 200), String(v).slice(0, 1000)] as const);
      if (entrees.length) reponsesValides = Object.fromEntries(entrees);
    }

    // 6) Crée le devis, rattaché au client connecté (auth.userId).
    const devis = await prisma.devis.create({
      data: {
        userId: auth.userId,
        produitId,
        description,
        montantEstime: typeof montantEstime === "number" ? montantEstime : null,
        documents: docsValides,
        reponses: reponsesValides ?? undefined,
        telephoneContact: typeof telephoneContact === "string" ? telephoneContact.slice(0, 40) : null,
        // statut "en_attente" par défaut (défini dans le schéma).
      },
      include: { produit: true },
    });

    return NextResponse.json({ devis }, { status: 201 });
  } catch (e) {
    console.error("[devis POST]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}

// ── GET : lister les devis ───────────────────────────────────
export async function GET(req: Request) {
  const auth = await exigerAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const estStaff = ROLES_STAFF.includes(auth.role);
    const gerant = estGerant(auth.role);
    const archives = new URL(req.url).searchParams.get("archives") === "1";

    // Les archives (éléments supprimés) sont réservées au gérant.
    if (archives && !gerant) {
      return NextResponse.json({ erreur: "Action réservée au gérant." }, { status: 403 });
    }

    // Le personnel voit tout ; un client ne voit que les siens.
    // Par défaut on masque les éléments archivés (supprimés en douceur).
    const where = estStaff
      ? { supprime: archives }
      : { userId: auth.userId, supprime: false };

    const devis = await prisma.devis.findMany({
      where,
      orderBy: { dateCreation: "desc" },
      include: {
        produit: { select: { nom: true, type: true } },
        user: estStaff
          ? { select: { nom: true, prenom: true, email: true, telephone: true } }
          : false,
      },
    });

    return NextResponse.json({ devis });
  } catch (e) {
    console.error("[devis GET]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
