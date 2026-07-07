// Route /api/devis/[id]/paiement — gestion du paiement par le rédacteur.
//   POST { montant }    → indique au client le montant (prime) à régler
//   POST { lien }       → enregistre/envoie le lien de paiement (Wave / Orange Money)
//   POST { confirmer }  → confirme la réception du paiement (cotation → "paye")
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerStaff } from "@/lib/session";
import { notifierClient } from "@/lib/notifications";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await exigerStaff();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const devis = await prisma.devis.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, prenom: true } }, produit: { select: { nom: true } } },
    });
    if (!devis) return NextResponse.json({ erreur: "Cotation introuvable." }, { status: 404 });
    const nomProduit = devis.produit?.nom ?? "votre cotation";

    // 0) Le rédacteur indique le montant (prime) à régler.
    if (body?.montant != null && body?.montant !== "") {
      const montant = Number(body.montant);
      if (!Number.isFinite(montant) || montant < 0) {
        return NextResponse.json({ erreur: "Montant invalide." }, { status: 400 });
      }
      const maj = await prisma.devis.update({ where: { id }, data: { montantAPayer: montant } });
      if (devis.user?.id) {
        await notifierClient({
          userId: devis.user.id, email: devis.user.email, type: "statut",
          titre: "Montant à régler disponible",
          message: `Le montant à régler pour « ${nomProduit} » est de ${montant.toLocaleString("fr-FR")} FCFA. Connectez-vous pour procéder au paiement.`,
          onglet: "devis",
          ref: id,
        });
      }
      return NextResponse.json({ devis: maj });
    }

    // 1) Envoi d'un lien de paiement (Wave / Orange Money).
    if (typeof body?.lien === "string" && body.lien.trim()) {
      const lien = body.lien.trim().slice(0, 500);
      if (!/^https?:\/\//i.test(lien)) {
        return NextResponse.json({ erreur: "Lien invalide (il doit commencer par http)." }, { status: 400 });
      }
      const maj = await prisma.devis.update({ where: { id }, data: { lienPaiement: lien } });
      if (devis.user?.id) {
        await notifierClient({
          userId: devis.user.id, email: devis.user.email, type: "statut",
          titre: "Lien de paiement disponible",
          message: `Votre lien de paiement pour « ${nomProduit} » est disponible. Connectez-vous pour régler votre prime.`,
          onglet: "devis",
          ref: id,
        });
      }
      return NextResponse.json({ devis: maj });
    }

    // 2) Confirmation du paiement reçu.
    if (body?.confirmer === true) {
      const maj = await prisma.devis.update({ where: { id }, data: { statut: "paye" } });
      if (devis.user?.id) {
        await notifierClient({
          userId: devis.user.id, email: devis.user.email, type: "statut",
          titre: "Paiement confirmé",
          message: `Votre paiement pour « ${nomProduit} » a bien été confirmé. Votre souscription est en cours de validation.`,
          onglet: "devis",
          ref: id,
        });
      }
      return NextResponse.json({ devis: maj });
    }

    return NextResponse.json({ erreur: "Action inconnue." }, { status: 400 });
  } catch (e) {
    console.error("[devis paiement]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
