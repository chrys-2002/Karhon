// Route /api/contrats/[id]/relance
//   POST → un admin relance le client AVANT le terme de son contrat :
//          envoie un email de rappel de renouvellement, marque la relance,
//          et renvoie de quoi ouvrir un WhatsApp pré-rempli.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerAdmin } from "@/lib/session";
import { envoyerEmail, gabaritRelance } from "@/lib/email";
import { infoRelance } from "@/lib/contrats";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await exigerAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const { message } = await req.json().catch(() => ({ message: "" }));

    const contrat = await prisma.contrat.findUnique({
      where: { id },
      include: {
        user: { select: { nom: true, prenom: true, email: true, telephone: true } },
        produit: { select: { nom: true } },
      },
    });
    if (!contrat) {
      return NextResponse.json({ erreur: "Contrat introuvable." }, { status: 404 });
    }

    const finFr = new Date(contrat.dateFin).toLocaleDateString("fr-FR", {
      day: "2-digit", month: "long", year: "numeric",
    });
    const { joursRestants } = infoRelance(contrat.dateFin, contrat.dureeMois);

    const sujet = `le renouvellement de votre contrat ${contrat.produit?.nom ?? ""} (n° ${contrat.numeroContrat})`.trim();
    const corps =
      typeof message === "string" && message.trim()
        ? message.trim()
        : `Votre contrat arrive à échéance le ${finFr}${joursRestants > 0 ? ` (dans ${joursRestants} jour${joursRestants > 1 ? "s" : ""})` : ""}. ` +
          `Pour continuer à être couvert sans interruption, nous vous invitons à renouveler dès maintenant. Notre équipe se tient à votre disposition pour préparer votre nouvelle cotation.`;

    // 1) Email (peut échouer si non configuré : on continue).
    const email = await envoyerEmail({
      to: contrat.user.email,
      subject: `KARHON Assurances — Renouvellement de votre contrat`,
      html: gabaritRelance({ prenom: contrat.user.prenom, sujet, message: corps }),
    });

    // 2) Marque la relance (date + compteur).
    const maj = await prisma.contrat.update({
      where: { id },
      data: { derniereRelance: new Date(), nombreRelances: { increment: 1 } },
      include: {
        produit: { select: { nom: true, type: true } },
        user: { select: { nom: true, prenom: true, email: true, telephone: true } },
      },
    });

    return NextResponse.json({
      contrat: maj,
      email,
      whatsapp: { telephone: contrat.user.telephone, message: `Bonjour ${contrat.user.prenom}, ${corps}` },
    });
  } catch (e) {
    console.error("[contrats relance]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
