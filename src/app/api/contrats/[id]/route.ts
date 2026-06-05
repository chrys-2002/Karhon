// Route /api/contrats/[id]
//   PATCH  → restaure un contrat archivé (gérant).
//   DELETE → suppression douce (archivage) par le personnel ;
//            ?purge=1 → suppression définitive (gérant uniquement).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerStaff, exigerGerant } from "@/lib/session";
import { journaliser } from "@/lib/audit";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await exigerStaff();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const body = await req.json();

    const existant = await prisma.contrat.findUnique({
      where: { id },
      include: { produit: { select: { nom: true } }, user: { select: { nom: true, prenom: true } } },
    });
    if (!existant) {
      return NextResponse.json({ erreur: "Contrat introuvable." }, { status: 404 });
    }
    const resume = `Contrat ${existant.numeroContrat} (${existant.produit?.nom ?? ""}) — ${existant.user?.prenom ?? ""} ${existant.user?.nom ?? ""}`.trim();

    if (body?.restaurer === true) {
      const g = await exigerGerant();
      if (g instanceof NextResponse) return g;
      const contrat = await prisma.contrat.update({
        where: { id },
        data: { supprime: false, supprimePar: null, supprimeLe: null },
        include: { produit: { select: { nom: true, type: true } }, user: { select: { nom: true, prenom: true, email: true, telephone: true } } },
      });
      await journaliser({ action: "restauration", entite: "contrat", entiteId: id, resume, auteurEmail: auth.email });
      return NextResponse.json({ contrat });
    }

    return NextResponse.json({ erreur: "Action non reconnue." }, { status: 400 });
  } catch (e) {
    console.error("[contrats PATCH]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await exigerStaff();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const purge = new URL(req.url).searchParams.get("purge") === "1";

    const existant = await prisma.contrat.findUnique({
      where: { id },
      include: { produit: { select: { nom: true } }, user: { select: { nom: true, prenom: true } } },
    });
    if (!existant) {
      return NextResponse.json({ erreur: "Contrat introuvable." }, { status: 404 });
    }
    const resume = `Contrat ${existant.numeroContrat} (${existant.produit?.nom ?? ""}) — ${existant.user?.prenom ?? ""} ${existant.user?.nom ?? ""}`.trim();

    if (purge) {
      const g = await exigerGerant();
      if (g instanceof NextResponse) return g;
      await prisma.contrat.delete({ where: { id } });
      await journaliser({ action: "purge", entite: "contrat", entiteId: id, resume, auteurEmail: auth.email });
      return NextResponse.json({ ok: true, purge: true });
    }

    await prisma.contrat.update({
      where: { id },
      data: { supprime: true, supprimePar: auth.email, supprimeLe: new Date() },
    });
    await journaliser({ action: "archivage", entite: "contrat", entiteId: id, resume, auteurEmail: auth.email });
    return NextResponse.json({ ok: true, archive: true });
  } catch (e) {
    console.error("[contrats DELETE]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
