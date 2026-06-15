// POST /api/auth/login — Connexion d'un utilisateur existant.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifierMotDePasse, genererToken, normaliserTelephone, estEmail } from "@/lib/auth";
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
    // Identifiant = email OU téléphone (on accepte aussi l'ancien champ "email").
    const { identifiant, email, motDePasse } = corps;
    const saisie = String(identifiant ?? email ?? "").trim();

    if (!saisie || !motDePasse) {
      return NextResponse.json(
        { erreur: "Identifiant et mot de passe requis." },
        { status: 400 }
      );
    }

    // Identité retenue (client ou personnel) → on remplit ces variables.
    let id = "", nom = "", prenom = "", emailCompte = "";
    let role: "client" | "agent" | "gerant" | "admin" = "client";
    let empreinte: string | null = null;

    // 1) PERSONNEL d'abord : la connexion par email cherche dans la table Admin.
    //    (Le personnel se connecte par email ; les clients par email ou téléphone.)
    if (estEmail(saisie)) {
      const admin = await prisma.admin.findUnique({ where: { email: saisie.toLowerCase() } });
      if (admin) {
        id = admin.id; nom = admin.nom; prenom = admin.prenom; emailCompte = admin.email;
        role = admin.role; empreinte = admin.motDePasse;
      }
    }

    // 2) Sinon CLIENT : par email ou par téléphone (numéro normalisé).
    if (!id) {
      const user = estEmail(saisie)
        ? await prisma.user.findUnique({ where: { email: saisie.toLowerCase() } })
        : await prisma.user.findUnique({ where: { telephone: normaliserTelephone(saisie) } });
      if (user) {
        id = user.id; nom = user.nom; prenom = user.prenom; emailCompte = user.email;
        role = "client"; empreinte = user.motDePasse; // User = toujours un client
      }
    }

    // 3) Vérifie le mot de passe.
    //    Message volontairement identique si identifiant OU mot de passe faux
    //    → on ne révèle pas si le compte existe (anti-énumération).
    //    `empreinte` peut être null (compte Google) → pas de connexion par mot de passe.
    if (!id || !empreinte || !(await verifierMotDePasse(motDePasse, empreinte))) {
      return NextResponse.json(
        { erreur: "Identifiant ou mot de passe incorrect." },
        { status: 401 }
      );
    }

    // 4) Délivre le jeton dans un cookie sécurisé.
    const token = genererToken({ userId: id, email: emailCompte, role });
    const res = NextResponse.json({
      utilisateur: { id, nom, prenom, email: emailCompte, role },
    });
    res.cookies.set(COOKIE_NAME, token, cookieOptions);
    return res;
  } catch (e) {
    console.error("[login]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
