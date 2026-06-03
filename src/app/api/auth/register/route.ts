// POST /api/auth/register — Inscription d'un nouveau client.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hacherMotDePasse, genererToken } from "@/lib/auth";
import { COOKIE_NAME, cookieOptions } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { nom, prenom, email, telephone, motDePasse, adresse } = await req.json();

    // 1) Validation basique des champs obligatoires.
    if (!nom || !prenom || !email || !telephone || !motDePasse) {
      return NextResponse.json(
        { erreur: "Tous les champs obligatoires doivent être renseignés." },
        { status: 400 }
      );
    }
    if (motDePasse.length < 6) {
      return NextResponse.json(
        { erreur: "Le mot de passe doit contenir au moins 6 caractères." },
        { status: 400 }
      );
    }

    // Normalise l'email (minuscules + espaces retirés) pour rester cohérent
    // avec la connexion : un compte = un email unique, quelle que soit la casse.
    const emailNormalise = String(email).trim().toLowerCase();

    // 2) Vérifie qu'aucun compte n'existe déjà avec cet email.
    const existant = await prisma.user.findUnique({ where: { email: emailNormalise } });
    if (existant) {
      return NextResponse.json(
        { erreur: "Un compte existe déjà avec cet email." },
        { status: 409 }
      );
    }

    // 3) Hache le mot de passe puis crée l'utilisateur.
    const empreinte = await hacherMotDePasse(motDePasse);
    const user = await prisma.user.create({
      data: { nom, prenom, email: emailNormalise, telephone, adresse, motDePasse: empreinte },
    });

    // 4) Délivre un jeton et le pose dans un cookie sécurisé.
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
    console.error("[register]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
