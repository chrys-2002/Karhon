// Types pour KARHON Assurances

export type Role = 'client' | 'admin';

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse?: string;
  role: Role;
  dateInscription: Date;
}

export interface Devis {
  id: string;
  userId: string;
  produitId: string;
  dateCreation: Date;
  statut: 'en_attente' | 'en_cours' | 'envoye' | 'accepte' | 'refuse';
  montantEstime?: number;
  description: string;
  documents?: string[];
}

export interface Contrat {
  id: string;
  numeroContrat: string;
  userId: string;
  produitId: string;
  dateDebut: Date;
  dateFin: Date;
  primeAnnuelle: number;
  statut: 'actif' | 'suspendu' | 'resilie';
  options: string[];
}

export interface Sinistre {
  id: string;
  contratId: string;
  dateSurvenance: Date;
  dateDeclaration: Date;
  description: string;
  montantIndemnise?: number;
  statut: 'declare' | 'en_cours' | 'indemnise' | 'refuse';
  documents: string[];
}

export interface RendezVous {
  id: string;
  userId: string;
  dateHeure: Date;
  statut: 'en_attente' | 'confirme' | 'annule' | 'termine';
  motif: string;
  notes?: string;
}

export interface Produit {
  id: string;
  nom: string;
  type: 'IARD' | 'VIE';
  categorie: string;
  description: string;
  garanties: string[];
  imageUrl?: string;
}
