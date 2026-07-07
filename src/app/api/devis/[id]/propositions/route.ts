// Route /api/devis/[id]/propositions
//   POST → un membre du personnel envoie une OU PLUSIEURS propositions (cotations)
//          de compagnies partenaires pour ce devis (fiche PDF + prime optionnelle).
//          Corps accepté : { propositions: [{ compagnie, documents, prime?, message? }, …] }
//          (rétro-compatible avec l'ancien format à une seule proposition).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerStaff } from "@/lib/session";
import { notifierClient } from "@/lib/notifications";

const BLOB_OK = /\|https:\/\/[a-z0-9.-]+\.blob\.vercel-storage\.com\//i;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await exigerStaff();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const corps = await req.json().catch(() => ({}));

    // On accepte un tableau "propositions" OU l'ancien format à plat.
    const brut = Array.isArray(corps?.propositions)
      ? corps.propositions
      : [{ compagnie: corps?.compagnie, documents: corps?.documents, prime: corps?.prime, message: corps?.message }];

    // Le devis doit exister.
    const devis = await prisma.devis.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, prenom: true } }, produit: { select: { nom: true } } },
    });
    if (!devis) {
      return NextResponse.json({ erreur: "Cotation introuvable." }, { status: 404 });
    }

    // Validation de chaque proposition : au moins une fiche de cotation.
    // La compagnie n'est plus obligatoire (le rédacteur envoie juste la cotation).
    const aCreer: { devisId: string; compagnie: string; documents: string[]; prime: number | null; message: string | null }[] = [];
    for (const p of brut) {
      const docsValides = Array.isArray(p?.documents)
        ? p.documents.filter((d: unknown): d is string => typeof d === "string" && BLOB_OK.test(d)).slice(0, 6)
        : [];
      if (docsValides.length === 0) {
        return NextResponse.json({ erreur: "Joignez au moins une fiche de cotation (PDF) par proposition." }, { status: 400 });
      }
      aCreer.push({
        devisId: id,
        compagnie: typeof p.compagnie === "string" ? p.compagnie.slice(0, 80) : "",
        documents: docsValides,
        prime: typeof p.prime === "number" ? p.prime : null,
        message: typeof p.message === "string" && p.message.trim() ? p.message.slice(0, 500) : null,
      });
    }

    if (aCreer.length === 0) {
      return NextResponse.json({ erreur: "Aucune proposition valide à envoyer." }, { status: 400 });
    }

    // Création groupée + passage du devis en "envoyé".
    await prisma.$transaction([
      prisma.proposition.createMany({ data: aCreer }),
      prisma.devis.update({ where: { id }, data: { statut: "envoye" } }),
    ]);

    // Une SEULE notification au client, même pour plusieurs propositions.
    if (devis.user?.id) {
      await notifierClient({
        userId: devis.user.id,
        email: devis.user.email,
        type: "proposition",
        titre: aCreer.length > 1 ? `${aCreer.length} nouvelles offres vous attendent` : "Une nouvelle offre vous attend",
        message: `${aCreer.length} proposition(s) de cotation ${aCreer.length > 1 ? "ont" : "a"} été ajoutée(s) à votre cotation « ${devis.produit?.nom ?? "produit"} ». Connectez-vous pour comparer et choisir.`,
        onglet: "devis",
        ref: devis.id,
      });
    }

    return NextResponse.json({ ok: true, nombre: aCreer.length }, { status: 201 });
  } catch (e) {
    console.error("[propositions POST]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
