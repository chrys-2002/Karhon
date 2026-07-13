// Garde de sécurité côté SERVEUR pour tout le back-office (/admin).
// S'exécute à chaque requête, AVANT le rendu de la page. Contrairement au
// middleware (non exécuté par Turbopack en dev), un layout serveur est
// toujours évalué. Seul le PERSONNEL connecté peut accéder au back-office ;
// tout le reste est redirigé vers la connexion appropriée.
import { redirect } from "next/navigation";
import { getUtilisateurConnecte } from "@/lib/session";

const ROLES_STAFF = ["agent", "gerant", "admin"];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getUtilisateurConnecte();
  // Toute personne qui n'est pas un membre du personnel connecté (visiteur,
  // ou client connecté) est renvoyée OBLIGATOIREMENT vers la page de connexion
  // du personnel. On n'entre jamais dans le back-office par simple URL.
  if (!session || !ROLES_STAFF.includes(session.role)) redirect("/acces-equipe");
  return <>{children}</>;
}
