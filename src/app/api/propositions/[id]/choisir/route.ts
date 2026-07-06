// Route /api/propositions/[id]/choisir
//   POST → le client choisit cette proposition pour sa cotation et indique son
//          mode de paiement (carte bancaire / Wave / Orange Money). La cotation passe en
//          "choisi" (en attente de paiement). Le rédacteur enverra ensuite le
//          lien de paiement, confirmera le paiement, puis validera la souscription.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerAuth } from "@/lib/session";
import { notifierAgents } from "@/lib/notifications";

const MODES: Record<string, string> = { carte: "Carte bancaire", wave: "Wave", orange_money: "Orange Money" };

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await exigerAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const corps = await req.json().catch(() => ({}));
    const mode = typeof corps?.modePaiement === "string" && MODES[corps.modePaiement] ? corps.modePaiement : null;
    if (!mode) {
      return NextResponse.json({ erreur: "Choisissez un mode de paiement." }, { status: 400 });
    }

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

    // La cotation passe en "en_cours" (offre retenue ; le rédacteur communique
    // ensuite le montant, le client paie, puis le rédacteur valide la souscription).
    await prisma.devis.update({
      where: { id: proposition.devisId },
      data: { statut: "en_cours", modePaiement: mode },
    });

    // Notifie le personnel (in-app + e-mail, best-effort).
    const c = proposition.devis.user;
    const offre = proposition.compagnie || "une offre";
    await notifierAgents({
      type: "choix",
      titre: `Choix client : ${offre} (${MODES[mode]})`,
      message: `${c.prenom} ${c.nom} (${c.email}) a choisi ${offre} pour sa cotation ${proposition.devis.produit?.nom ?? ""}, paiement par ${MODES[mode]}. Envoyez le lien de paiement puis validez la souscription.`,
      onglet: "devis",
      ref: proposition.devisId,
    });

    return NextResponse.json({ proposition: maj });
  } catch (e) {
    console.error("[propositions choisir]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
