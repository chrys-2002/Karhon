// Route /api/sinistres/[id]/relance
//   POST → un admin relance le client sur son sinistre : marque la relance,
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

    const sinistre = await prisma.sinistre.findUnique({
      where: { id },
      include: {
        user: { select: { nom: true, prenom: true, email: true, telephone: true } },
      },
    });
    if (!sinistre) {
      return NextResponse.json({ erreur: "Sinistre introuvable." }, { status: 404 });
    }

    const sujet = `votre déclaration de sinistre ${sinistre.typeAssurance ?? ""}`.trim();
    const corps =
      typeof message === "string" && message.trim()
        ? message.trim()
        : "Votre dossier de sinistre suit son cours. Nous vous accompagnons dans toutes les démarches jusqu'à l'indemnisation et reviendrons vers vous dès qu'il y a du nouveau.";

    const email = await envoyerEmail({
      to: sinistre.user.email,
      subject: `KARHON Assurances — ${sujet}`,
      html: gabaritRelance({ prenom: sinistre.user.prenom, sujet, message: corps }),
    });

    const maj = await prisma.sinistre.update({
      where: { id },
      data: { derniereRelance: new Date(), nombreRelances: { increment: 1 } },
      include: {
        user: { select: { nom: true, prenom: true, email: true, telephone: true } },
      },
    });

    return NextResponse.json({
      sinistre: maj,
      email,
      whatsapp: { telephone: sinistre.user.telephone, message: `Bonjour ${sinistre.user.prenom}, ${corps}` },
    });
  } catch (e) {
    console.error("[sinistres relance]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
