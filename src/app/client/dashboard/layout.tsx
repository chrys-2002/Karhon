// Garde de sécurité côté SERVEUR pour l'espace client (/client/dashboard).
// S'exécute à chaque requête, AVANT le rendu. L'espace client est réservé aux
// clients connectés : un visiteur non connecté est renvoyé vers la connexion,
// et un membre du personnel est renvoyé vers son propre back-office.
import { redirect } from "next/navigation";
import { getUtilisateurConnecte } from "@/lib/session";

const ROLES_STAFF = ["agent", "gerant", "admin"];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getUtilisateurConnecte();
  // Toute personne qui n'est pas un client connecté (visiteur, ou membre du
  // personnel connecté) est renvoyée OBLIGATOIREMENT vers la page de connexion
  // client. On n'entre jamais dans l'espace client par simple URL.
  if (!session || ROLES_STAFF.includes(session.role)) redirect("/client");
  return <>{children}</>;
}
