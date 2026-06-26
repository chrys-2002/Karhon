// ─────────────────────────────────────────────────────────────
// Service d'envoi d'emails — KARHON Assurances
//
// Utilise l'API REST de Resend (https://resend.com) directement via fetch,
// sans dépendance npm supplémentaire. La clé reste 100 % côté serveur.
//
// Configuration (.env) :
//   RESEND_API_KEY = re_xxxxxxxx           (obligatoire pour envoyer)
//   EMAIL_FROM     = "KARHON Assurances <contact@tondomaine.com>"
//                    (l'expéditeur ; le domaine doit être vérifié chez Resend.
//                     À défaut, Resend n'autorise que onboarding@resend.dev
//                     vers l'adresse du propriétaire du compte.)
//
// Dégradation propre : si RESEND_API_KEY est absent, on NE plante PAS —
// la fonction renvoie { ok:false, erreur } pour que la relance interne
// (marquage + WhatsApp) fonctionne quand même.
// ─────────────────────────────────────────────────────────────

type ParamsEmail = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

type ResultatEmail = { ok: true } | { ok: false; erreur: string };

export async function envoyerEmail({ to, subject, html, text }: ParamsEmail): Promise<ResultatEmail> {
  const cle = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "KARHON Assurances <onboarding@resend.dev>";

  if (!cle) {
    return { ok: false, erreur: "Service email non configuré (RESEND_API_KEY manquant)." };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cle}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html, text }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, erreur: data?.message || `Échec de l'envoi (HTTP ${res.status}).` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, erreur: (e as Error).message || "Erreur réseau lors de l'envoi." };
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
