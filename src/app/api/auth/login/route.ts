// POST /api/auth/login — Connexion d'un utilisateur existant.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifierMotDePasse, genererToken } from "@/lib/auth";
import { COOKIE_NAME, cookieOptions } from "@/lib/session";
import { verifierLimite } from "@/lib/rateLimit";

export async function POST(req: Request) {
  // Anti-brute-force : 8 tentatives de connexion par minute et par IP.
  const limite = verifierLimite(req, "login", 8, 60_000);
  if (limite) return limite;

  try {
    // Corps JSON invalide ou absent → 400 (et non 500).
    const corps = await req.json().catch(() => null);
    if (!corps || typeof corps !== "object") {
      return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
    }
    const { email, motDePasse } = corps;

    if (!email || !motDePasse) {
      return NextResponse.json(
        { erreur: "Email et mot de passe requis." },
        { status: 400 }
      );
    }

    // Normalise l'email : minuscules + espaces retirés.
    // Évite qu'une simple différence de casse/espace soit vue comme un mauvais identifiant.
    const emailNormalise = String(email).trim().toLowerCase();

    // 1) Cherche l'utilisateur par email.
    const user = await prisma.user.findUnique({ where: { email: emailNormalise } });

    // 2) Vérifie le mot de passe.
    //    Message volontairement identique si email OU mot de passe faux
    //    → on ne révèle pas si l'email existe (bonne pratique de sécurité).
    // user.motDePasse peut être null (compte créé via Google) → pas de
    // connexion par mot de passe possible ; message volontairement identique.
    if (!user || !user.motDePasse || !(await verifierMotDePasse(motDePasse, user.motDePasse))) {
      return NextResponse.json(
        { erreur: "Email ou mot de passe incorrect." },
        { status: 401 }
      );
    }

    // 3) Délivre le jeton dans un cookie sécurisé.
    const token = genererToken({ userId: user.id, email: user.email, role: user.role });
    const res = NextResponse.json({
      utilisateur: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
      },
    });
    res.cookies.set(COOKIE_NAME, token, cookieOptions);
    return res;
  } catch (e) {
    console.error("[login]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
