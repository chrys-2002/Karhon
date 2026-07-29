// Route /api/contact
//   POST → un visiteur envoie un message depuis la page Contact.
//          Le message est transmis par e-mail au cabinet (EMAIL_OPS).
import { NextResponse } from "next/server";
import { envoyerEmail, gabaritNotification } from "@/lib/email";

const EMAIL_OPS = process.env.EMAIL_OPS ?? "infos@karhonassurance.com";

const MOTIFS: Record<string, string> = {
  devis: "Demande de cotation",
  sinistre: "Déclaration de sinistre",
  rendezvous: "Prise de rendez-vous",
  information: "Demande d'information",
};

export async function POST(req: Request) {
  try {
    const { nom, prenom, telephone, email, motif, message } = await req.json().catch(() => ({}));

    // Validation minimale : un contact (email ou téléphone) et un message.
    const emailOk = typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const telOk = typeof telephone === "string" && telephone.replace(/\D/g, "").length >= 6;
    if (!message || !String(message).trim()) {
      return NextResponse.json({ erreur: "Le message est obligatoire." }, { status: 400 });
    }
    if (!emailOk && !telOk) {
      return NextResponse.json({ erreur: "Indiquez un email ou un téléphone valide pour être recontacté." }, { status: 400 });
    }

    const nomComplet = `${prenom ?? ""} ${nom ?? ""}`.trim() || "Visiteur du site";
    const motifLisible = MOTIFS[motif] ?? "Message";

    const corps =
      `Nouveau message depuis le formulaire de contact.\n\n` +
      `Nom : ${nomComplet}\n` +
      `Email : ${emailOk ? email.trim() : "—"}\n` +
      `Téléphone : ${telOk ? telephone.trim() : "—"}\n` +
      `Type de demande : ${motifLisible}\n\n` +
      `Message :\n${String(message).trim()}`;

    const envoi = await envoyerEmail({
      to: EMAIL_OPS,
      subject: `Contact site — ${motifLisible} — ${nomComplet}`,
      html: gabaritNotification({ titre: `Nouveau message — ${motifLisible}`, message: corps }),
      text: corps,
      // « Répondre » renverra directement vers le visiteur (si email valide).
      replyTo: emailOk ? email.trim() : undefined,
    });

    if (!envoi.ok) {
      console.error("[contact] email:", envoi.erreur);
      return NextResponse.json(
        {
          erreur: "Votre message n'a pas pu être envoyé pour le moment. Réessayez ou appelez-nous.",
          // Détail technique (diagnostic) : à retirer une fois l'envoi opérationnel.
          detail: envoi.erreur,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[contact POST]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
