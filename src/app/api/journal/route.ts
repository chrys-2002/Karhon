// Route /api/journal
//   GET → le journal d'audit (archivages, restaurations, purges).
//         Réservé au gérant : c'est l'outil de contrôle des rédacteurs.
//
// Recherche + filtres + pagination CÔTÉ SERVEUR : conçu pour rester rapide
// même avec des centaines de milliers d'entrées (on ne charge jamais tout).
//   ?q=...        → recherche plein texte (résumé, auteur, type, action…)
//   ?action=...   → filtre par action (archivage | restauration | purge)
//   ?entite=...   → filtre par type d'élément (devis | sinistre | contrat)
//   ?page=1&pageSize=20
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerGerant } from "@/lib/session";
import type { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  const auth = await exigerGerant();
  if (auth instanceof NextResponse) return auth;

  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") ?? "").trim();
    const action = url.searchParams.get("action") ?? "";
    const entite = url.searchParams.get("entite") ?? "";
    const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
    const pageSize = Math.min(100, Math.max(5, Number(url.searchParams.get("pageSize") ?? "20") || 20));
    const tri = url.searchParams.get("tri") ?? "date";
    const sens = url.searchParams.get("sens") === "asc" ? "asc" : "desc";
    const periode = url.searchParams.get("periode") ?? "tout";

    // Construit le filtre : chaque mot de la recherche doit apparaître quelque part.
    const conditions: Prisma.JournalAuditWhereInput[] = [];
    if (action) conditions.push({ action });
    if (entite) conditions.push({ entite });

    // Filtre par période (sur la date de l'action). Côte d'Ivoire = UTC.
    if (periode !== "tout") {
      const now = new Date();
      const debutJour = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
      let depuis: number | null = null;
      let jusqua: number | null = null;
      if (periode === "aujourdhui") depuis = debutJour;
      else if (periode === "hier") { depuis = debutJour - 86_400_000; jusqua = debutJour; }
      else if (periode === "semaine") { const j = now.getUTCDay() || 7; depuis = debutJour - (j - 1) * 86_400_000; }
      else if (periode === "mois") depuis = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
      else if (periode === "annee") depuis = Date.UTC(now.getUTCFullYear(), 0, 1);
      if (depuis !== null) conditions.push({ createdAt: jusqua !== null ? { gte: new Date(depuis), lt: new Date(jusqua) } : { gte: new Date(depuis) } });
    }
    if (q) {
      for (const mot of q.split(/\s+/).filter(Boolean)) {
        conditions.push({
          OR: [
            { resume: { contains: mot, mode: "insensitive" } },
            { auteurEmail: { contains: mot, mode: "insensitive" } },
            { auteurNom: { contains: mot, mode: "insensitive" } },
            { entiteId: { contains: mot, mode: "insensitive" } },
            { action: { contains: mot, mode: "insensitive" } },
            { entite: { contains: mot, mode: "insensitive" } },
          ],
        });
      }
    }
    const where: Prisma.JournalAuditWhereInput = conditions.length ? { AND: conditions } : {};

    // Champ de tri (par défaut la date).
    const champTri = tri === "auteur" ? "auteurEmail" : tri === "action" ? "action" : tri === "entite" ? "entite" : "createdAt";
    const orderBy = { [champTri]: sens } as Prisma.JournalAuditOrderByWithRelationInput;

    const [entrees, total] = await Promise.all([
      prisma.journalAudit.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.journalAudit.count({ where }),
    ]);

    return NextResponse.json({ entrees, total, page, pageSize });
  } catch (e) {
    console.error("[journal GET]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}

// ── DELETE : supprimer une entrée du journal (?id=…) ou tout vider (?all=1).
//   Réservé au gérant.
export async function DELETE(req: Request) {
  const auth = await exigerGerant();
  if (auth instanceof NextResponse) return auth;

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const all = url.searchParams.get("all") === "1";

    if (all) {
      const { count } = await prisma.journalAudit.deleteMany({});
      return NextResponse.json({ ok: true, supprimees: count });
    }
    if (!id) {
      return NextResponse.json({ erreur: "Identifiant manquant." }, { status: 400 });
    }
    await prisma.journalAudit.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[journal DELETE]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
