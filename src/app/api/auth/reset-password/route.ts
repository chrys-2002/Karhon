// Route POST /api/auth/reset-password
//   Reçoit { token, motDePasse }. Vérifie le jeton (hash + non expiré),
//   enregistre le nouveau mot de passe (haché) et invalide le jeton.
import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { hacherMotDePasse } from "@/lib/auth";
import { verifierLimite } from "@/lib/rateLimit";

const hash = (s: string) => createHash("sha256").update(s).digest("hex");

export async function POST(req: Request) {
  // Anti-brute-force du jeton : 6 essais par minute et par IP.
  const limite = verifierLimite(req, "reset", 6, 60_000);
  if (limite) return limite;

  try {
    const { token, motDePasse } = await req.json();

    if (!token || !motDePasse) {
      return NextResponse.json({ erreur: "Jeton et mot de passe requis." }, { status: 400 });
    }
    if (String(motDePasse).length < 6) {
      return NextResponse.json({ erreur: "Le mot de passe doit faire au moins 6 caractères." }, { status: 400 });
    }

    // Cherche un utilisateur avec ce jeton (hashé) et non expiré.
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hash(String(token)),
        resetTokenExpiry: { gt: new Date() },
      },
    });
    if (!user) {
      return NextResponse.json({ erreur: "Lien invalide ou expiré. Refaites une demande." }, { status: 400 });
    }

    // Enregistre le nouveau mot de passe et invalide le jeton.
    await prisma.user.update({
      where: { id: user.id },
      data: {
        motDePasse: await hacherMotDePasse(String(motDePasse)),
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ ok: true, message: "Mot de passe mis à jour. Vous pouvez vous connecter." });
  } catch (e) {
    console.error("[reset-password]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
