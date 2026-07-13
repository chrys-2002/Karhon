// Route /api/devis/[id]/paiement — gestion du paiement par le rédacteur.
//   POST { montant, lien } → envoie EN UNE FOIS le montant à régler ET le lien
//                            de paiement au client (une seule notification).
//   POST { confirmer }     → confirme la réception du paiement (cotation → "paye")
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

    // 0) Confirmation du paiement reçu.
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

    // 1) Le rédacteur envoie le montant à régler ET/OU le lien de paiement,
    //    en une seule opération, avec une seule notification au client.
    const data: { montantAPayer?: number; lienPaiement?: string } = {};
    let montantNum: number | null = null;
    let lienVal: string | null = null;

    if (body?.montant != null && body?.montant !== "") {
      const montant = Number(body.montant);
      if (!Number.isFinite(montant) || montant < 0) {
        return NextResponse.json({ erreur: "Montant invalide." }, { status: 400 });
      }
      data.montantAPayer = montant;
      montantNum = montant;
    }

    if (typeof body?.lien === "string" && body.lien.trim()) {
      const lien = body.lien.trim().slice(0, 500);
      if (!/^https?:\/\//i.test(lien)) {
        return NextResponse.json({ erreur: "Lien invalide (il doit commencer par http)." }, { status: 400 });
      }
      data.lienPaiement = lien;
      lienVal = lien;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ erreur: "Renseignez le montant et/ou le lien de paiement." }, { status: 400 });
    }

    const maj = await prisma.devis.update({ where: { id }, data });
    if (devis.user?.id) {
      const parts: string[] = [];
      if (montantNum != null) parts.push(`le montant à régler (${montantNum.toLocaleString("fr-FR")} FCFA)`);
      if (lienVal) parts.push("votre lien de paiement");
      const quoi = parts.join(" et ");
      const pluriel = parts.length > 1;
      await notifierClient({
        userId: devis.user.id,
        email: devis.user.email,
        type: "statut",
        titre: "Paiement : votre lien et le montant sont disponibles",
        message: `Pour « ${nomProduit} », ${quoi} ${pluriel ? "sont" : "est"} disponible${pluriel ? "s" : ""}. Connectez-vous pour procéder au paiement.`,
        onglet: "devis",
        ref: id,
      });
    }
    return NextResponse.json({ devis: maj });
  } catch (e) {
    console.error("[devis paiement]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
