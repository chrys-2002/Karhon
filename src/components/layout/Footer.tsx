import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-white bg-clip-text text-transparent mb-3 sm:mb-4">
              KARHON Assurances
            </h3>
            <p className="text-gray-300 text-sm">
              Cabinet de courtage en assurances à Abidjan
            </p>
            <p className="text-gray-400 mt-2 text-xs sm:text-sm">
              Agrément n°0305/MEF/DGTCP/DA du 02 SEPT 2021
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-base sm:text-lg">Nos produits</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/devis" className="hover:text-orange-400 transition-colors">Assurance Auto</Link></li>
              <li><Link href="/devis" className="hover:text-orange-400 transition-colors">Assurance Habitation</Link></li>
              <li><Link href="/devis" className="hover:text-orange-400 transition-colors">Assurance Santé</Link></li>
              <li><Link href="/devis" className="hover:text-orange-400 transition-colors">Assurance Vie</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-base sm:text-lg">Liens rapides</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/" className="hover:text-orange-400 transition-colors">Accueil</Link></li>
              <li><Link href="/produits" className="hover:text-orange-400 transition-colors">Produits</Link></li>
              <li><Link href="/devis" className="hover:text-orange-400 transition-colors">Devis</Link></li>
              <li><Link href="/contact" className="hover:text-orange-400 transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-base sm:text-lg">Contact</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-center space-x-2">📞 <span>+225 07 07 10 87 43</span></li>
              <li className="flex items-center space-x-2 break-all">✉️ <span>contact@karhon-assurances.ci</span></li>
              <li className="flex items-center space-x-2">📍 <span>Abidjan, Côte d'Ivoire</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400 text-xs sm:text-sm">
          <p>&copy; {new Date().getFullYear()} KARHON Assurances - Tous droits réservés</p>
        </div>
      </div>
    </footer>
  );
}
