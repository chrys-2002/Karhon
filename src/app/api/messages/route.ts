// Routes /api/messages — messagerie client ↔ rédacteur.
//   GET    ?count=1            → nombre de messages non lus (pour le badge)
//   GET    (staff)             → boîte de réception : 1 conversation par client
//   GET    (staff) ?userId=ID  → le fil complet avec ce client
//   GET    (client)            → le fil du client connecté
//   POST                       → envoyer un message (texte + pièces jointes)
//   DELETE { ids, action }     → archiver ou supprimer des messages sélectionnés
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerAuth } from "@/lib/session";
import { notifierAgents, notifierClient } from "@/lib/notifications";

const ROLES_STAFF = ["agent", "gerant", "admin"];
const BLOB_OK = /\|https:\/\/[a-z0-9.-]+\.blob\.vercel-storage\.com\//i;

export async function GET(req: Request): Promise<NextResponse> {
  const auth = await exigerAuth();
  if (auth instanceof NextResponse) return auth;
  const estStaff = ROLES_STAFF.includes(auth.role);
  const url = new URL(req.url);

  try {
    // Compteur de non-lus (pour la pastille de l'onglet).
    if (url.searchParams.get("count") === "1") {
      const where = estStaff
        ? { expediteur: "client", lu: false, archive: false }
        : { userId: auth.userId, expediteur: "staff", lu: false, archive: false };
      const nonLus = await prisma.message.count({ where });
      return NextResponse.json({ nonLus });
    }

    // Pagination commune (on ne charge jamais tout le fil d'un coup).
    const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
    const pageSize = Math.min(100, Math.max(5, Number(url.searchParams.get("pageSize") ?? "30") || 30));

    if (estStaff) {
      const userId = url.searchParams.get("userId");
      // Fil avec un client précis (page = lot de messages les plus récents).
      if (userId) {
        const [recents, client, total] = await Promise.all([
          prisma.message.findMany({ where: { userId, archive: false }, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
          prisma.user.findUnique({ where: { id: userId }, select: { nom: true, prenom: true, email: true, telephone: true } }),
          prisma.message.count({ where: { userId, archive: false } }),
        ]);
        return NextResponse.json({ messages: recents.reverse(), client, total, page, pageSize });
      }
      // Boîte de réception : dernier message de chaque conversation.
      const derniers = await prisma.message.findMany({
        where: { archive: false },
        orderBy: { createdAt: "desc" },
        distinct: ["userId"],
        take: 60,
        include: { user: { select: { nom: true, prenom: true, email: true } } },
      });
      const nonLusParUser = await prisma.message.groupBy({
        by: ["userId"],
        where: { expediteur: "client", lu: false, archive: false },
        _count: { _all: true },
      });
      const mapNonLus: Record<string, number> = {};
      for (const g of nonLusParUser) mapNonLus[g.userId] = g._count._all;
      const conversations = derniers.map((m) => ({
        userId: m.userId,
        client: m.user,
        dernier: { contenu: m.contenu, expediteur: m.expediteur, createdAt: m.createdAt, piecesJointes: m.piecesJointes },
        nonLus: mapNonLus[m.userId] ?? 0,
      }));
      return NextResponse.json({ conversations });
    }

    // Client : aperçu pour la vue « section » (dernier message + compteurs).
    if (url.searchParams.get("apercu") === "1") {
      const [dernier, total, nonLus] = await Promise.all([
        prisma.message.findFirst({ where: { userId: auth.userId, archive: false }, orderBy: { createdAt: "desc" } }),
        prisma.message.count({ where: { userId: auth.userId, archive: false } }),
        prisma.message.count({ where: { userId: auth.userId, expediteur: "staff", lu: false, archive: false } }),
      ]);
      return NextResponse.json({ dernier, total, nonLus });
    }
    // Client : son fil, paginé (lot des plus récents).
    const [recents, total] = await Promise.all([
      prisma.message.findMany({ where: { userId: auth.userId, archive: false }, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.message.count({ where: { userId: auth.userId, archive: false } }),
    ]);
    return NextResponse.json({ messages: recents.reverse(), total, page, pageSize });
  } catch (e) {
    console.error("[messages GET]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  const auth = await exigerAuth();
  if (auth instanceof NextResponse) return auth;
  const estStaff = ROLES_STAFF.includes(auth.role);

  try {
    const body = await req.json().catch(() => ({}));
    const contenu = String(body?.contenu ?? "").trim().slice(0, 4000);
    const piecesJointes = Array.isArray(body?.piecesJointes)
      ? body.piecesJointes.filter((d: unknown): d is string => typeof d === "string" && BLOB_OK.test(d)).slice(0, 6)
      : [];

    if (!contenu && piecesJointes.length === 0) {
      return NextResponse.json({ erreur: "Message vide." }, { status: 400 });
    }

    if (estStaff) {
      const userId = String(body?.userId ?? "");
      if (!userId) return NextResponse.json({ erreur: "Destinataire manquant." }, { status: 400 });
      const client = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, prenom: true } });
      if (!client) return NextResponse.json({ erreur: "Client introuvable." }, { status: 404 });

      const message = await prisma.message.create({
        data: {
          userId,
          expediteur: "staff",
          auteurEmail: auth.email,
          contenu,
          piecesJointes,
          contexte: typeof body?.contexte === "string" ? body.contexte.slice(0, 20) : null,
          contexteId: typeof body?.contexteId === "string" ? body.contexteId.slice(0, 60) : null,
        },
      });
      // Un signalement de pièce (depuis « Signaler un document ») produit une
      // notification explicite, au lieu d'un simple « nouveau message ».
      const estSignal = body?.signal === true;
      await notifierClient({
        userId,
        email: client.email,
        type: "message",
        titre: estSignal ? "Une pièce de votre dossier est à corriger" : "Nouveau message de KARHON",
        message: contenu
          ? contenu.slice(0, 160)
          : estSignal
            ? "Un document doit être renvoyé corrigé. Ouvrez votre messagerie."
            : "Un rédacteur vous a écrit au sujet de vos documents.",
        ref: "conv", // ouvre directement la conversation côté client
      });
      return NextResponse.json({ message }, { status: 201 });
    }

    // Client → rédacteurs.
    const message = await prisma.message.create({
      data: { userId: auth.userId, expediteur: "client", contenu, piecesJointes },
    });
    await notifierAgents({
      type: "message",
      titre: "Nouveau message client",
      message: contenu ? contenu.slice(0, 160) : "Un client a renvoyé un document.",
      ref: auth.userId, // ouvre directement la conversation de ce client côté rédacteur
    });
    return NextResponse.json({ message }, { status: 201 });
  } catch (e) {
    console.error("[messages POST]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}

// DELETE — archive ou supprime les messages sélectionnés.
//   Corps : { ids: string[], action: "archiver" | "supprimer" }
//   Un client ne peut agir que sur SES messages ; le personnel sur tous.
export async function DELETE(req: Request): Promise<NextResponse> {
  const auth = await exigerAuth();
  if (auth instanceof NextResponse) return auth;
  const estStaff = ROLES_STAFF.includes(auth.role);

  try {
    const body = await req.json().catch(() => ({}));
    const ids = Array.isArray(body?.ids)
      ? body.ids.filter((x: unknown): x is string => typeof x === "string").slice(0, 200)
      : [];
    const action = body?.action === "supprimer" ? "supprimer" : "archiver";
    if (ids.length === 0) {
      return NextResponse.json({ erreur: "Aucun message sélectionné." }, { status: 400 });
    }

    const where = estStaff ? { id: { in: ids } } : { id: { in: ids }, userId: auth.userId };

    if (action === "supprimer") {
      const res = await prisma.message.deleteMany({ where });
      return NextResponse.json({ ok: true, action, nombre: res.count });
    }
    const res = await prisma.message.updateMany({ where, data: { archive: true, archiveLe: new Date() } });
    return NextResponse.json({ ok: true, action, nombre: res.count });
  } catch (e) {
    console.error("[messages DELETE]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
