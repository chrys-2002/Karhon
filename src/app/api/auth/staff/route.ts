// POST /api/auth/staff — Connexion RÉSERVÉE au personnel (rédacteurs + gérant).
//
// Mesure de sécurité : le personnel ne se connecte pas par la page publique.
// Cette route authentifie UNIQUEMENT des comptes de la table Admin, exige un
// CODE D'ACCÈS partagé en plus de l'e-mail et du mot de passe, et applique une
// limitation des tentatives (anti-force brute).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifierMotDePasse, genererToken } from "@/lib/auth";
import { COOKIE_NAME, cookieOptions } from "@/lib/session";
import { verifierLimite } from "@/lib/rateLimit";

// Code d'accès attendu. À définir dans l'environnement (STAFF_ACCESS_CODE).
// En développement, une valeur par défaut permet de tester ; en production,
// si le code n'est pas configuré, la connexion est refusée (fermeture sûre).
const CODE_ATTENDU =
  process.env.STAFF_ACCESS_CODE ?? (process.env.NODE_ENV !== "production" ? "equipe-karhon" : "");

export async function POST(req: Request) {
  // Anti-brute-force : 5 tentatives par minute et par IP (plus strict que le public).
  const limite = verifierLimite(req, "staff-login", 5, 60_000);
  if (limite) return limite;

  try {
    const corps = await req.json().catch(() => null);
    if (!corps || typeof corps !== "object") {
      return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
    }
    const email = String(corps.email ?? "").trim().toLowerCase();
    const motDePasse = String(corps.motDePasse ?? "");
    const code = String(corps.code ?? "");

    if (!email || !motDePasse || !code) {
      return NextResponse.json({ erreur: "E-mail, mot de passe et code d'accès requis." }, { status: 400 });
    }

    // On vérifie le code, le compte et le mot de passe, puis on renvoie un message
    // UNIQUE en cas d'échec (on ne révèle pas lequel des trois est faux).
    const admin = await prisma.admin.findUnique({ where: { email } });
    const codeOk = CODE_ATTENDU !== "" && code === CODE_ATTENDU;
    const motDePasseOk = admin ? await verifierMotDePasse(motDePasse, admin.motDePasse) : false;

    if (!codeOk || !admin || !motDePasseOk) {
      return NextResponse.json({ erreur: "Accès refusé. Vérifiez vos informations." }, { status: 401 });
    }

    // Jeton de session avec le rôle réel (agent ou gérant).
    const token = genererToken({ userId: admin.id, email: admin.email, role: admin.role });
    const res = NextResponse.json({
      utilisateur: { id: admin.id, nom: admin.nom, prenom: admin.prenom, email: admin.email, role: admin.role },
    });
    res.cookies.set(COOKIE_NAME, token, cookieOptions);
    return res;
  } catch (e) {
    console.error("[staff-login]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
