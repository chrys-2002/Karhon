// POST /api/chat — Assistant conversationnel KARHON propulsé par Mistral AI.
//
// Le navigateur n'appelle JAMAIS Mistral directement : la clé API reste ici,
// côté serveur (variable d'environnement MISTRAL_API_KEY). Le front envoie
// l'historique de la conversation ; on y ajoute un "system prompt" qui donne
// à l'IA sa personnalité et ses connaissances sur KARHON Assurances.
import { NextResponse } from "next/server";
import { verifierLimite } from "@/lib/rateLimit";

// Modèle rapide et économique (palier gratuit). "mistral-small-latest" suffit
// largement pour un assistant FAQ conversationnel.
const MODELE = "mistral-small-latest";
const ENDPOINT = "https://api.mistral.ai/v1/chat/completions";

// Connaissances + règles de comportement de l'assistant.
const SYSTEM_PROMPT = `Tu es l'assistant virtuel de KARHON Assurances, un cabinet de courtage en assurances neutre et indépendant, agréé en Côte d'Ivoire (agrément n°0305/MEF/DGTCP/DA du 02 SEPT 2021).

TON RÔLE :
- Renseigner les visiteurs sur les services de KARHON et les orienter.
- Répondre en français, de façon chaleureuse, claire et concise (2 à 4 phrases en général).

INFORMATIONS SUR KARHON :
- Activité : courtage en assurances. KARHON est l'interlocuteur unique du client, défend exclusivement ses intérêts, sans honoraires facturés au client.
- Produits IARD : Automobile, Habitation (Multirisque), Assurance Santé, Individuelle Accident, Voyage, Responsabilité Civile, Flotte automobile, Multirisque Professionnelle, RC Professionnelle, Assurance Maritime.
- Produits VIE : Assurance Retraite, Étude Plus (épargne études), Vie Emprunteur, Assistance Funéraire.
- Bureaux : Abidjan, Cocody — Angré 8ème Tranche (BP V 236).
- Téléphones : +225 07 87 10 39 39 et +225 05 76 36 72 72.
- Email : infos@karhonassurance.com.
- Disponibilité : du lundi au vendredi.

RÈGLES IMPORTANTES :
- Ne JAMAIS inventer de tarif, de prix ou de montant précis. Pour un prix, invite à demander une cotation gratuite sur la page Cotation (le client doit être connecté pour l'envoyer).
- Pour un sinistre : rassure et invite à contacter le cabinet au plus vite par téléphone ; KARHON accompagne le client dans toutes les démarches jusqu'à l'indemnisation.
- Si tu ne connais pas une information précise, dis-le honnêtement et oriente vers un conseiller (+225 07 87 10 39 39 ou +225 05 76 36 72 72, ou la page Contact). N'invente jamais.
- Reste toujours professionnel et bienveillant. N'évoque pas que tu es une IA sauf si on te le demande directement.`;

type MessageEntrant = { role: "user" | "bot"; texte: string };

export async function POST(req: Request) {
  // Protège le budget Mistral : 15 messages par minute et par IP.
  const limite = verifierLimite(req, "chat", 15, 60_000);
  if (limite) return limite;

  try {
    const cle = process.env.MISTRAL_API_KEY;
    if (!cle) {
      console.error("[chat] MISTRAL_API_KEY manquante");
      return NextResponse.json(
        { erreur: "Assistant indisponible pour le moment." },
        { status: 503 }
      );
    }

    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ erreur: "Message vide." }, { status: 400 });
    }

    // On ne garde que les 12 derniers échanges pour limiter la taille/le coût.
    const recents: MessageEntrant[] = messages.slice(-12);

    // Format Mistral (compatible OpenAI) : system + alternance user/assistant.
    const messagesMistral = [
      { role: "system", content: SYSTEM_PROMPT },
      ...recents.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.texte,
      })),
    ];

    const reponse = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cle}`,
      },
      body: JSON.stringify({
        model: MODELE,
        messages: messagesMistral,
        temperature: 0.6,
        max_tokens: 400,
      }),
    });

    if (!reponse.ok) {
      const detail = await reponse.text();
      console.error("[chat] Mistral erreur", reponse.status, detail);
      return NextResponse.json(
        { erreur: "L'assistant n'a pas pu répondre. Réessayez dans un instant." },
        { status: 502 }
      );
    }

    const data = await reponse.json();
    const texte =
      data?.choices?.[0]?.message?.content?.trim() ??
      "Je n'ai pas pu formuler de réponse. Un conseiller KARHON peut vous aider : +225 07 87 10 39 39 ou +225 05 76 36 72 72.";

    return NextResponse.json({ reponse: texte });
  } catch (e) {
    console.error("[chat]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
