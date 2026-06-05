// Route /api/devis/[id]/relance
//   POST → un admin relance le client : marque la relance en base,
//          envoie un email, et renvoie de quoi ouvrir un WhatsApp pré-rempli.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerAdmin } from "@/lib/session";
import { envoyerEmail, gabaritRelance } from "@/lib/email";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await exigerAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const { message } = await req.json().catch(() => ({ message: "" }));

    const devis = await prisma.devis.findUnique({
      where: { id },
      include: {
        user: { select: { nom: true, prenom: true, email: true, telephone: true } },
        produit: { select: { nom: true } },
      },
    });
    if (!devis) {
      return NextResponse.json({ erreur: "Devis introuvable." }, { status: 404 });
    }

    const sujet = `votre demande de devis ${devis.produit?.nom ?? ""}`.trim();
    const corps =
      typeof message === "string" && message.trim()
        ? message.trim()
        : "Votre demande est bien suivie par nos équipes. Nous restons à votre disposition pour avancer ensemble sur votre offre personnalisée.";

    // 1) Envoi de l'email (peut échouer si non configuré : on continue).
    const email = await envoyerEmail({
      to: devis.user.email,
      subject: `KARHON Assurances — ${sujet}`,
      html: gabaritRelance({ prenom: devis.user.prenom, sujet, message: corps }),
    });

    // 2) Marque la relance en base (date + compteur).
    const maj = await prisma.devis.update({
      where: { id },
      data: { derniereRelance: new Date(), nombreRelances: { increment: 1 } },
      include: {
        produit: { select: { nom: true, type: true } },
        user: { select: { nom: true, prenom: true, email: true, telephone: true } },
      },
    });

    return NextResponse.json({
      devis: maj,
      email,
      whatsapp: { telephone: devis.user.telephone, message: `Bonjour ${devis.user.prenom}, ${corps}` },
    });
  } catch (e) {
    console.error("[devis relance]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
