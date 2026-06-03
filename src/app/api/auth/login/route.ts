// POST /api/auth/login — Connexion d'un utilisateur existant.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifierMotDePasse, genererToken } from "@/lib/auth";
import { COOKIE_NAME, cookieOptions } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { email, motDePasse } = await req.json();

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
    if (!user || !(await verifierMotDePasse(motDePasse, user.motDePasse))) {
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
