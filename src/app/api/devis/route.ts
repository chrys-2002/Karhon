// Routes /api/devis
//   POST → un client connecté crée une demande de devis.
//   GET  → liste des devis : un client voit LES SIENS, un admin voit TOUT.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerAuth } from "@/lib/session";

// ── POST : créer un devis ────────────────────────────────────
export async function POST(req: Request) {
  // 1) Sécurité : utilisateur connecté obligatoire.
  const auth = await exigerAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const { produitId, description, montantEstime, documents } = await req.json();

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

    // 5) Crée le devis, rattaché au client connecté (auth.userId).
    const devis = await prisma.devis.create({
      data: {
        userId: auth.userId,
        produitId,
        description,
        montantEstime: typeof montantEstime === "number" ? montantEstime : null,
        documents: docsValides,
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
export async function GET() {
  const auth = await exigerAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const estAdmin = auth.role === "admin";

    const devis = await prisma.devis.findMany({
      // Un client ne voit que SES devis ; l'admin les voit tous.
      where: estAdmin ? undefined : { userId: auth.userId },
      orderBy: { dateCreation: "desc" },
      include: {
        produit: { select: { nom: true, type: true } },
        // L'admin a besoin de savoir de quel client vient le devis.
        user: estAdmin
          ? { select: { nom: true, prenom: true, email: true } }
          : false,
      },
    });

    return NextResponse.json({ devis });
  } catch (e) {
    console.error("[devis GET]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
