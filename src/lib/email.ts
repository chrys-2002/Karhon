// ─────────────────────────────────────────────────────────────
// Service d'envoi d'emails — KARHON Assurances
//
// Envoi via SMTP (serveur de messagerie Ikoula / MailEnable) à l'aide de
// Nodemailer. La plateforme ouvre une connexion SMTP authentifiée avec la
// boîte du domaine et expédie le message.
//
// Configuration (.env / variables Vercel) :
//   SMTP_HOST  = serveur d'envoi Ikoula        (ex. smtp.karhonassurance.com)
//   SMTP_PORT  = 587 (STARTTLS) ou 465 (SSL)
//   SMTP_USER  = infos@karhonassurance.com     (adresse complète de la boîte)
//   SMTP_PASS  = mot de passe de la boîte mail
//   EMAIL_FROM = "KARHON Assurances <infos@karhonassurance.com>"
//
// Dégradation propre : si la configuration SMTP est absente, on NE plante PAS,
// la fonction renvoie { ok:false, erreur } pour que le reste continue à marcher.
// ─────────────────────────────────────────────────────────────
import nodemailer from "nodemailer";

type ParamsEmail = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string; // adresse à laquelle « Répondre » renvoie (ex. le visiteur)
};

type ResultatEmail = { ok: true } | { ok: false; erreur: string };

export async function envoyerEmail({ to, subject, html, text, replyTo }: ParamsEmail): Promise<ResultatEmail> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM ?? (user ? `KARHON Assurances <${user}>` : undefined);

  if (!host || !user || !pass || !from) {
    return { ok: false, erreur: "Service email non configuré (SMTP_HOST / SMTP_USER / SMTP_PASS / EMAIL_FROM manquants)." };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // 465 = connexion SSL directe ; 587 = STARTTLS
      auth: { user, pass },
      // Beaucoup de serveurs mutualisés (MailEnable/Ikoula) présentent un
      // certificat auto-signé ou au nom du serveur : on tolère la validation
      // pour éviter les échecs de connexion.
      tls: { rejectUnauthorized: false },
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      socketTimeout: 20_000,
    });

    await transporter.sendMail({ from, to, subject, html, text, replyTo });
    return { ok: true };
  } catch (e) {
    return { ok: false, erreur: (e as Error).message || "Erreur lors de l'envoi SMTP." };
  }
}

// ── Gabarit HTML générique de notification, aux couleurs KARHON ─
export function gabaritNotification(opts: {
  titre: string;
  message: string;
  lienTexte?: string;   // ex. "Ouvrir mon espace"
  lienUrl?: string;     // ex. "https://karhonassurance.com/client/dashboard"
}): string {
  const { titre, message, lienTexte, lienUrl } = opts;
  const bouton =
    lienTexte && lienUrl
      ? `<p style="margin-top:24px"><a href="${lienUrl}" style="display:inline-block;background:linear-gradient(135deg,#1a2e5a,#2a8a8a);color:#fff;text-decoration:none;padding:12px 22px;border-radius:12px;font-size:14px;font-weight:600">${lienTexte}</a></p>`
      : "";
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;border:1px solid #e0ecec;border-radius:16px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#1a2e5a,#2a8a8a);padding:24px 28px;color:#fff">
      <h1 style="margin:0;font-size:20px">KARHON Assurances</h1>
      <p style="margin:6px 0 0;font-size:13px;opacity:.8">Cabinet de courtage — Abidjan</p>
    </div>
    <div style="padding:28px;color:#374151;font-size:15px;line-height:1.6">
      <h2 style="margin:0 0 12px;font-size:17px;color:#1a2e5a">${titre}</h2>
      <p style="white-space:pre-line;margin:0">${message}</p>
      ${bouton}
    </div>
    <div style="background:#f5fbfb;padding:16px 28px;color:#9ca3af;font-size:12px;text-align:center">
      Abidjan, Cocody — Angré 8ème Tranche · infos@karhonassurance.com
    </div>
  </div>`;
}

// ── Gabarit HTML d'une relance, aux couleurs KARHON ─────────────
export function gabaritRelance(opts: {
  prenom: string;
  sujet: string;       // ex. "votre demande de devis Assurance Auto"
  message: string;     // corps personnalisé saisi par le courtier
}): string {
  const { prenom, sujet, message } = opts;
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;border:1px solid #e0ecec;border-radius:16px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#1a2e5a,#2a8a8a);padding:24px 28px;color:#fff">
      <h1 style="margin:0;font-size:20px">KARHON Assurances</h1>
      <p style="margin:6px 0 0;font-size:13px;opacity:.8">Cabinet de courtage — Abidjan</p>
    </div>
    <div style="padding:28px;color:#374151;font-size:15px;line-height:1.6">
      <p>Bonjour ${prenom},</p>
      <p>Nous revenons vers vous concernant <strong>${sujet}</strong>.</p>
      <p style="white-space:pre-line">${message}</p>
      <p style="margin-top:24px">Pour toute question, contactez-nous au
        <strong style="color:#1a2e5a">+225 07 87 10 39 39</strong> ou
        <strong style="color:#1a2e5a">+225 05 76 36 72 72</strong>.</p>
      <p style="margin-top:24px;color:#6b7280">Bien cordialement,<br/>L'équipe KARHON Assurances</p>
    </div>
    <div style="background:#f5fbfb;padding:16px 28px;color:#9ca3af;font-size:12px;text-align:center">
      Abidjan, Cocody — Angré 8ème Tranche · infos@karhonassurance.com
    </div>
  </div>`;
}
