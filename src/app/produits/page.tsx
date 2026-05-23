"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function ProduitsPage() {
  const [activeCategorie, setActiveCategorie] = useState("particuliers");
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const produits = {
    particuliers: [
      { id: "auto", nom: "Assurance Automobile", icone: "🚗", description: "Couvre les dommages causés avec ou à un véhicule", details: ["Responsabilité Civile", "Dommages tous accidents", "Vol et incendie", "Bris de glace", "Assistance 24h/24"], options: ["Particulier", "Flotte", "Deux roues"] },
      { id: "habitation", nom: "Assurance Habitation", icone: "🏠", description: "Couvre les habitations des particuliers", details: ["Incendie", "Dégâts des eaux", "Vol", "Bris de glace", "Responsabilité Civile"], options: ["Appartement", "Immeuble", "Villa"] },
      { id: "sante", nom: "Santé Individuelle", icone: "🏥", description: "Rembourse les frais médicaux (maladie, maternité, invalidité)", details: ["Consultations", "Hospitalisation", "Médicaments", "Analyses", "Soins dentaires", "Maternité", "Invalidité"], options: ["Individuelle", "Famille"] },
      { id: "accident", nom: "Individuelle Accident", icone: "⚠️", description: "Indemnise les dommages corporels suite à un accident", details: ["Décès", "Invalidité permanente", "Incapacité temporaire", "Frais médicaux", "Prestations complémentaires"], options: ["Individuelle", "Famille"] },
      { id: "voyage", nom: "Assurance Voyage", icone: "✈️", description: "Couverture multirisques personnalisée pour les voyageurs", details: ["Annulation", "Rapatriement", "Perte de bagages", "Assistance médicale", "Responsabilité Civile à l'étranger"], options: ["Voyage individuel", "Famille", "Affaires"] },
      { id: "rc", nom: "Responsabilité Civile", icone: "⚖️", description: "Couvre la responsabilité de l'assuré envers les tiers", details: ["Dommages corporels", "Dommages matériels", "Dommages immatériels", "Défense pénale"], options: ["Particulier", "Famille"] }
    ],
    professionnels: [
      { id: "autoflotte", nom: "Automobile Flotte", icone: "🚛", description: "Protection pour flotte d'entreprise", details: ["Responsabilité Civile Flotte", "Dommages tous accidents", "Vol et incendie", "Assistance 24h/24", "Gestion des sinistres"], options: ["TPE", "PME", "Grandes entreprises"] },
      { id: "mrpro", nom: "Multirisque Professionnelle", icone: "🏢", description: "Couverture complète biens + responsabilités", details: ["Incendie", "Vol", "Dégâts des eaux", "Bris de glaces", "Responsabilité Civile exploitation/professionnelle"], options: ["TPE", "PME", "Grandes entreprises"] },
      { id: "santegroupe", nom: "Santé Groupe", icone: "👥", description: "Couverture santé collective pour les employés", details: ["Consultations", "Hospitalisation", "Médicaments", "Soins dentaires", "Optique", "Maternité"], options: ["Entreprise", "Association", "Collectivité"] },
      { id: "accidentgroupe", nom: "Individuelle Accident Groupe", icone: "👥⚠️", description: "Version collective de l'assurance accident pour les salariés", details: ["Décès", "Invalidité", "Incapacité", "Frais médicaux", "Prestations complémentaires"], options: ["Salariés", "Employés", "Membres"] },
      { id: "rcpro", nom: "RC Civile et Professionnelle", icone: "⚖️🏢", description: "Couvre la responsabilité de l'entreprise envers les tiers", details: ["Responsabilité Civile exploitation", "Responsabilité Civile professionnelle", "Responsabilité Civile après livraison", "Défense pénale"], options: ["Profession libérale", "Commerce", "Industrie"] },
      { id: "maritime", nom: "Assurance Maritime", icone: "⛴️", description: "Indemnisation des sinistres maritimes", details: ["Casco", "Marchandises transportées", "Responsabilité Civile exploitant", "Fret", "Corps de navire"], options: ["Navires", "Marchandises", "Transporteurs"] }
    ],
    vie: [
      { id: "retraite", nom: "Assurance Retraite", icone: "👴", description: "Constitution d'un capital ou rente pour la retraite", details: ["Épargne flexible", "Versement libre ou programmé", "Rente viagère garantie", "Avantage fiscal", "Réversion possible"], options: ["Individuelle", "Groupe", "TNS"] },
      { id: "etudes", nom: "Étude Plus", icone: "📚", description: "Épargne dédiée au financement des études des enfants", details: ["Épargne programmée", "Capital garanti", "Frais de scolarité", "Avantage fiscal", "Versement unique ou fractionné"], options: ["Études supérieures", "Études internationales"] },
      { id: "emprunteur", nom: "Prêt bancaire / Vie emprunteur", icone: "🏦", description: "Couvre le remboursement d'un prêt en cas de décès ou invalidité", details: ["Décès", "Perte totale et irréversible d'autonomie", "Invalidité permanente", "Incapacité de travail", "Perte d'emploi"], options: ["Prêt immobilier", "Prêt personnel", "Prêt professionnel"] },
      { id: "retraitegroupe", nom: "Retraite complémentaire groupe", icone: "👥👴", description: "Version collective de la retraite, souscrite par l'employeur", details: ["Épargne salariale", "Rente viagère", "Avantage fiscal entreprise", "Gestion pilotée"], options: ["Grands groupes", "PME", "Associations"] },
      { id: "obseques", nom: "Assistance funéraire", icone: "🕊️", description: "Prise en charge des frais funéraires", details: ["Capital décès", "Prise en charge des obsèques", "Libre choix des prestataires", "Frais d'obsèques garantis", "Transmission du capital"], options: ["Individuelle", "Conjoint", "Famille"] }
    ]
  };

  const categories = [
    { id: "particuliers", nom: "Particuliers", icone: "👤", description: "Protection pour vous et votre famille" },
    { id: "professionnels", nom: "Professionnels", icone: "🏢", description: "Solutions pour votre activité" },
    { id: "vie", nom: "Assurances Vie", icone: "💝", description: "Préparez votre avenir" }
  ];

  const getProduits = () => {
    if (activeCategorie === "particuliers") return produits.particuliers;
    if (activeCategorie === "professionnels") return produits.professionnels;
    return produits.vie;
  };

  const currentCategory = categories.find(c => c.id === activeCategorie);

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Nos produits d'assurance</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">KARHON Assurances vous propose une gamme complète de solutions adaptées à vos besoins</p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategorie(cat.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeCategorie === cat.id
                  ? "bg-blue-900 text-white shadow-lg scale-105"
                  : "bg-white text-gray-700 hover:shadow-md border border-gray-200"
              }`}
            >
              <span className="text-xl">{cat.icone}</span>
              <span>{cat.nom}</span>
            </button>
          ))}
        </div>

        {/* Description catégorie */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{currentCategory?.nom}</h2>
          <p className="text-gray-500">{currentCategory?.description}</p>
        </div>

        {/* Grille produits */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getProduits().map((produit, index) => (
            <div key={produit.id} className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 ${isVisible ? 'animate-scaleIn' : 'opacity-0'}`} style={{animationDelay: `${index * 0.1}s`}}>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">{produit.icone}</div>
                  <h3 className="text-xl font-bold text-gray-800">{produit.nom}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">{produit.description}</p>
                
                <div className="border-t border-gray-100 pt-3 mb-4">
                  <h4 className="font-semibold text-gray-700 text-sm mb-2">Garanties incluses :</h4>
                  <ul className="space-y-1">
                    {produit.details.slice(0, 4).map((detail, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="text-green-500 text-xs">✓</span> {detail}
                      </li>
                    ))}
                    {produit.details.length > 4 && (
                      <li className="text-sm text-gray-400">+{produit.details.length - 4} autres garanties</li>
                    )}
                  </ul>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 text-sm mb-2">Formules disponibles :</h4>
                  <div className="flex flex-wrap gap-2">
                    {produit.options.map((option, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{option}</span>
                    ))}
                  </div>
                </div>
                
                <Link href="/devis">
                  <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-all">
                    Demander un devis
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Section avantages */}
        <div className="mt-16 bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl p-8 text-white">
          <h3 className="text-2xl font-bold text-center mb-6">Pourquoi choisir KARHON ?</h3>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div><div className="text-3xl mb-2">🎯</div><p className="font-semibold">Un interlocuteur unique</p><p className="text-blue-200 text-sm">Gestion personnalisée</p></div>
            <div><div className="text-3xl mb-2">🤝</div><p className="font-semibold">Neutre et indépendant</p><p className="text-blue-200 text-sm">Votre intérêt d'abord</p></div>
            <div><div className="text-3xl mb-2">💰</div><p className="font-semibold">Sans honoraires</p><p className="text-blue-200 text-sm">Services gratuits</p></div>
            <div><div className="text-3xl mb-2">⚡</div><p className="font-semibold">Devis sous 48h</p><p className="text-blue-200 text-sm">Réponse rapide</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
