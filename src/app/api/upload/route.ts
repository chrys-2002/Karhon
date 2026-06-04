// Route /api/upload — génère un jeton sécurisé pour l'upload direct vers Vercel Blob.
//
// Fonctionnement (upload « client ») :
//   1) Le navigateur appelle upload() de @vercel/blob/client, qui ping cette route.
//   2) onBeforeGenerateToken vérifie que l'utilisateur est connecté et impose
//      les types d'images autorisés + une taille maximale.
//   3) Le navigateur envoie ensuite le fichier DIRECTEMENT à Vercel Blob
//      (sans passer par cette fonction serverless → pas de limite de 4,5 Mo).
//
// Sécurité :
//   - Connexion obligatoire (exigerAuth) : un anonyme ne peut pas uploader.
//   - Seules les images PNG / JPG / WEBP sont acceptées.
//   - Taille bornée (8 Mo) pour éviter les abus.
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { exigerAuth } from "@/lib/session";

export async function POST(req: Request): Promise<NextResponse> {
  const body = (await req.json()) as HandleUploadBody;

  try {
    const resultat = await handleUpload({
      body,
      request: req,
      // Appelé AVANT de délivrer le jeton d'upload.
      onBeforeGenerateToken: async () => {
        const auth = await exigerAuth();
        if (auth instanceof NextResponse) {
          // Non connecté → on refuse l'upload.
          throw new Error("Connexion requise pour envoyer un document.");
        }
        return {
          allowedContentTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
          maximumSizeInBytes: 8 * 1024 * 1024, // 8 Mo
          // On garde une trace du propriétaire dans le jeton.
          tokenPayload: JSON.stringify({ userId: auth.userId }),
        };
      },
      // Appelé une fois le fichier réellement stocké (côté Vercel).
      onUploadCompleted: async () => {
        // Rien de spécial ici : l'URL est renvoyée au client par upload().
      },
    });

    return NextResponse.json(resultat);
  } catch (e) {
    return NextResponse.json(
      { erreur: (e as Error).message || "Upload impossible." },
      { status: 400 }
    );
  }
}
