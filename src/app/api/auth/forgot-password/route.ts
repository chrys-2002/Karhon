// Route POST /api/auth/forgot-password
//   Reçoit un email. Si un compte existe, génère un jeton de réinitialisation,
//   stocke son HASH en base (avec expiration 1h) et envoie un lien par email.
//
// Sécurité :
//   • Réponse TOUJOURS identique (qu'le compte existe ou non) → on ne révèle
//     pas quels emails sont enregistrés.
//   • On stocke seulement le HASH du jeton ; le jeton brut ne vit que dans
//     l'email. Une fuite de la base ne permet donc pas de l'utiliser.
import { NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { envoyerEmail } from "@/lib/email";
import { verifierLimite } from "@/lib/rateLimit";

const hash = (s: string) => createHash("sha256").update(s).digest("hex");

export async function POST(req: Request) {
  // Anti-spam : 4 demandes de réinitialisation par minute et par IP.
  const limite = verifierLimite(req, "forgot", 4, 60_000);
  if (limite) return limite;

  try {
    const { email } = await req.json();
    const emailNormalise = String(email || "").trim().toLowerCase();

    const reponseNeutre = NextResponse.json({
      ok: true,
      message: "Si un compte existe pour cette adresse, un lien de réinitialisation a été envoyé.",
    });

    if (!emailNormalise) return reponseNeutre;

    const user = await prisma.user.findUnique({ where: { email: emailNormalise } });
    if (!user) return reponseNeutre; // on ne révèle rien

    // Jeton brut (envoyé par email) + son hash (stocké en base).
    const jeton = randomBytes(32).toString("hex");
    const expiration = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: hash(jeton), resetTokenExpiry: expiration },
    });

    // Lien de réinitialisation (origine déduite de la requête).
    const host = req.headers.get("host") ?? "localhost:3000";
    const proto = req.headers.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
    const lien = `${proto}://${host}/client/reinitialiser?token=${jeton}`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #e0ecec;border-radius:16px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#1a2e5a,#2a8a8a);padding:24px;color:#fff">
          <h1 style="margin:0;font-size:20px">KARHON Assurances</h1>
        </div>
        <div style="padding:28px;color:#374151;font-size:15px;line-height:1.6">
          <p>Bonjour ${user.prenom || ""},</p>
          <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous (lien valable 1 heure) :</p>
          <p style="text-align:center;margin:28px 0">
            <a href="${lien}" style="background:#1a2e5a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:bold">Réinitialiser mon mot de passe</a>
          </p>
          <p style="color:#6b7280;font-size:13px">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email : votre mot de passe reste inchangé.</p>
        </div>
      </div>`;

    const envoi = await envoyerEmail({
      to: user.email,
      subject: "KARHON Assurances — Réinitialisation de votre mot de passe",
      html,
    });

    // Aide au développement : si l'email n'est pas configuré, on logge le lien
    // côté serveur pour pouvoir tester en local (jamais en production).
    if (!envoi.ok && process.env.NODE_ENV !== "production") {
      console.log("[reset] Lien de réinitialisation (dev) :", lien);
    }

    return reponseNeutre;
  } catch (e) {
    console.error("[forgot-password]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
