// Route /api/propositions/[id]/choisir
//   POST → le client choisit cette proposition (compagnie) pour son devis.
//          Marque la proposition comme choisie, notifie le personnel (email),
//          et passe le devis en "accepté". L'agent poursuit ensuite jusqu'à
//          la souscription (après paiement).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerAuth } from "@/lib/session";
import { envoyerEmail } from "@/lib/email";

// Adresse de notification du personnel KARHON.
const EMAIL_STAFF = "infos@karhonassurance.com";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await exigerAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;

    // Récupère la proposition + son devis (+ client) pour vérifier la propriété.
    const proposition = await prisma.proposition.findUnique({
      where: { id },
      include: {
        devis: { include: { user: { select: { nom: true, prenom: true, email: true } }, produit: { select: { nom: true } } } },
      },
    });
    if (!proposition) {
      return NextResponse.json({ erreur: "Proposition introuvable." }, { status: 404 });
    }
    // Le client ne peut choisir que sur SON propre devis.
    if (proposition.devis.userId !== auth.userId) {
      return NextResponse.json({ erreur: "Accès refusé." }, { status: 403 });
    }

    // Réinitialise les autres propositions du devis, puis marque celle-ci.
    await prisma.proposition.updateMany({
      where: { devisId: proposition.devisId },
      data: { choisie: false, dateChoix: null },
    });
    const maj = await prisma.proposition.update({
      where: { id },
      data: { choisie: true, dateChoix: new Date() },
    });

    // Le devis passe en "accepté" (le client a fait son choix).
    await prisma.devis.update({ where: { id: proposition.devisId }, data: { statut: "accepte" } });

    // Notifie le personnel par email (best-effort : on continue si échec).
    const c = proposition.devis.user;
    await envoyerEmail({
      to: EMAIL_STAFF,
      subject: `KARHON — Choix client : ${proposition.compagnie}`,
      html: `<p>Le client <strong>${c.prenom} ${c.nom}</strong> (${c.email}) a choisi la compagnie <strong>${proposition.compagnie}</strong> pour son devis ${proposition.devis.produit?.nom ?? ""}.</p>
             <p>Merci de poursuivre la cotation jusqu'à la souscription (après paiement).</p>`,
    }).catch(() => {});

    return NextResponse.json({ proposition: maj });
  } catch (e) {
    console.error("[propositions choisir]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
