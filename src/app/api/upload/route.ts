// Route /api/upload — upload « serveur » (simple et fiable).
//
// Le navigateur envoie le fichier (multipart) à cette route, qui l'upload
// elle-même vers Vercel Blob avec put(). Plus de jeton client à générer,
// plus de callback, plus de CORS : juste BLOB_READ_WRITE_TOKEN côté serveur.
//
// Sécurité :
//   - Connexion obligatoire (exigerAuth).
//   - Types autorisés : images (PNG/JPG/WEBP) + PDF.
//   - Taille bornée à 4 Mo (limite de requête serverless ~4,5 Mo ;
//     les images sont compressées côté navigateur avant l'envoi).
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { exigerAuth } from "@/lib/session";

const TYPES_OK = ["image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf"];
const TAILLE_MAX = 4 * 1024 * 1024; // 4 Mo

export async function POST(req: Request): Promise<NextResponse> {
  const auth = await exigerAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ erreur: "Aucun fichier reçu." }, { status: 400 });
    }
    if (!TYPES_OK.includes(file.type)) {
      return NextResponse.json({ erreur: "Format non accepté (PDF ou image)." }, { status: 400 });
    }
    if (file.size > TAILLE_MAX) {
      return NextResponse.json({ erreur: "Fichier trop volumineux (4 Mo maximum)." }, { status: 400 });
    }

    // Upload vers Vercel Blob (suffixe aléatoire → pas d'écrasement).
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error("[upload]", e);
    return NextResponse.json(
      { erreur: "Upload impossible. Réessayez." },
      { status: 500 }
    );
  }
}
