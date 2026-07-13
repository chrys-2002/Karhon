// Route /api/contrats/[id]
//   PATCH  → restaure un contrat archivé (gérant).
//   DELETE → suppression douce (archivage) par le personnel ;
//            ?purge=1 → suppression définitive (gérant uniquement).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerAuth, exigerStaff, exigerGerant } from "@/lib/session";
import { journaliser } from "@/lib/audit";
import { notifierClient } from "@/lib/notifications";

const ROLES_STAFF = ["agent", "gerant", "admin"];

// ── GET : un contrat précis (pour l'impression / le reçu) ────
//   Le client ne peut voir QUE son contrat ; le personnel voit tout.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await exigerAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const contrat = await prisma.contrat.findUnique({
      where: { id },
      include: {
        produit: { select: { nom: true, type: true, garanties: true } },
        user: { select: { nom: true, prenom: true, email: true, telephone: true, adresse: true } },
      },
    });
    if (!contrat) {
      return NextResponse.json({ erreur: "Contrat introuvable." }, { status: 404 });
    }

    const estStaff = ROLES_STAFF.includes(auth.role);
    if (!estStaff && contrat.userId !== auth.userId) {
      return NextResponse.json({ erreur: "Accès refusé." }, { status: 403 });
    }

    return NextResponse.json({ contrat });
  } catch (e) {
    console.error("[contrat GET]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}

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

    // Le rédacteur joint l'attestation d'assurance (document Vercel Blob) et le
    // client en est notifié. Format attendu : "Libellé|url".
    if (typeof body?.attestation === "string" && body.attestation.trim()) {
      const att = body.attestation.trim().slice(0, 600);
      if (!/https:\/\/[a-z0-9.-]+\.blob\.vercel-storage\.com\//i.test(att)) {
        return NextResponse.json({ erreur: "Document d'attestation invalide." }, { status: 400 });
      }
      const contrat = await prisma.contrat.update({
        where: { id },
        data: { attestation: att },
        include: {
          produit: { select: { nom: true, type: true } },
          user: { select: { id: true, nom: true, prenom: true, email: true, telephone: true } },
        },
      });
      if (contrat.user?.id) {
        await notifierClient({
          userId: contrat.user.id,
          email: contrat.user.email,
          type: "statut",
          titre: "Votre attestation d'assurance est disponible",
          message: `Votre attestation pour « ${existant.produit?.nom ?? "votre contrat"} » (n° ${existant.numeroContrat}) est disponible dans votre espace, rubrique Souscriptions.`,
          onglet: "souscriptions",
          ref: id,
        });
      }
      return NextResponse.json({ contrat });
    }

    // Re-catégorisation d'une souscription (particulier / professionnel / transport).
    if (typeof body?.segment === "string") {
      const SEGMENTS_OK = ["particulier", "professionnel", "transport"];
      if (!SEGMENTS_OK.includes(body.segment)) {
        return NextResponse.json({ erreur: "Catégorie invalide." }, { status: 400 });
      }
      const contrat = await prisma.contrat.update({
        where: { id },
        data: { segment: body.segment },
        include: { produit: { select: { nom: true, type: true } }, user: { select: { nom: true, prenom: true, email: true, telephone: true } } },
      });
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
