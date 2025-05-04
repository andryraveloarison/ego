import { useState } from 'react';
import { Video, EyeOff, Users, Upload, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  return (
    <div className="font-sans">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Mettez votre marque en avant</h1>
              <p className="text-xl mb-8">Ego utilise l'IA pour flouter automatiquement toutes les marques sauf la vôtre dans vos vidéos, en quelques clics.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-6 py-3 bg-white text-blue-600 font-medium rounded-md hover:bg-gray-100"
                  onClick={() => navigate('/upload')}>
                  Démarrer gratuitement
                </button>
                
                <button className="px-6 py-3 bg-transparent border border-white text-white font-medium rounded-md hover:bg-white hover:bg-opacity-10"
                >
                  Voir la démo
                </button>
              </div>
            </div>
            <div className="bg-white bg-opacity-20 p-6 rounded-lg shadow-xl">
            <div
              className="aspect-video rounded flex items-center justify-center"
              style={{ backgroundColor: '#f6f4f0' }}
            >
              <div className="text-center">
                <img
                  src="/ego2.png"
                  alt="Logo MyMark"
                  className="h-32 w-auto cursor-pointer" // h-32 = hauteur plus grande, w-auto = conserve le ratio
                  onClick={() => navigate('/')}
                />
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div id="features" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">La solution pour promouvoir votre marque</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Notre technologie d'IA avancée floute les marques concurrentes tout en laissant la vôtre visible.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="bg-blue-100 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <Upload size={24} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Téléchargement facile</h3>
              <p className="text-gray-600">Téléchargez votre vidéo en quelques clics, quel que soit le format.</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="bg-blue-100 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <EyeOff size={24} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Floutage sélectif</h3>
              <p className="text-gray-600">Notre IA floute automatiquement toutes les marques sauf celle que vous choisissez.</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="bg-blue-100 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <CheckCircle size={24} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Résultat rapide et propre</h3>
              <p className="text-gray-600">Obtenez une vidéo mettant en avant votre marque, avec une qualité préservée.</p>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div id="how-it-works" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Comment ça fonctionne</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Un processus simple en trois étapes pour mettre votre marque en valeur</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-6 text-xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Téléchargez votre vidéo</h3>
              <p className="text-gray-600">Sélectionnez et téléchargez facilement la vidéo que vous souhaitez traiter.</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-6 text-xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Choisissez votre marque</h3>
              <p className="text-gray-600">Indiquez la marque que vous voulez garder visible, les autres seront floutées.</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-6 text-xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Téléchargez la vidéo traitée</h3>
              <p className="text-gray-600">Obtenez votre vidéo avec votre marque mise en avant, prête à être partagée.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Applications</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Ego vous aide à mettre votre marque en avant dans diverses situations</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-lg shadow-md flex">
              <div className="mr-6">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                  <Users size={20} className="text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Contenu généré par les utilisateurs</h3>
                <p className="text-gray-600 mb-4">Mettez en avant votre marque dans les vidéos soumises par les utilisateurs en floutant les autres.</p>
                <ul className="text-gray-600 space-y-2">
                  <li className="flex items-center">
                    <ArrowRight size={16} className="text-blue-600 mr-2" />
                    <span>Plateformes de médias sociaux</span>
                  </li>
                  <li className="flex items-center">
                    <ArrowRight size={16} className="text-blue-600 mr-2" />
                    <span>Sites de partage de vidéos</span>
                  </li>
                  <li className="flex items-center">
                    <ArrowRight size={16} className="text-blue-600 mr-2" />
                    <span>Forums et communautés</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md flex">
              <div className="mr-6">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                  <Video size={20} className="text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Mise en avant de la marque</h3>
                <p className="text-gray-600 mb-4">Assurez-vous que seule votre marque est visible dans vos propres productions vidéo.</p>
                <ul className="text-gray-600 space-y-2">
                  <li className="flex items-center">
                    <ArrowRight size={16} className="text-blue-600 mr-2" />
                    <span>Vidéos marketing et publicitaires</span>
                  </li>
                  <li className="flex items-center">
                    <ArrowRight size={16} className="text-blue-600 mr-2" />
                    <span>Contenu de formation et tutoriels</span>
                  </li>
                  <li className="flex items-center">
                    <ArrowRight size={16} className="text-blue-600 mr-2" />
                    <span>Présentations et conférences</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Tarifs flexibles pour tous les besoins</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Choisissez le plan qui correspond à votre volume de vidéos</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden relative min-h-[500px] px-8 pt-8 pb-20">
          <div className="p-8">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Débutant</h3>
                <p className="text-gray-600 mb-6">Idéal pour les projets personnels et ponctuels</p>
                <div className="flex items-end mb-6">
                  <span className="text-4xl font-bold text-gray-800">9€</span>
                  <span className="text-gray-600 ml-2">/mois</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-gray-600">
                    <ArrowRight size={16} className="text-blue-600 mr-2" />
                    <span>5 vidéos traitées/mois</span>
                  </li>
                  <li className="flex items-center text-gray-600">
                    <ArrowRight size={16} className="text-blue-600 mr-2" />
                    <span>Résolution standard</span>
                  </li>
                  <li className="flex items-center text-gray-600">
                    <ArrowRight size={16} className="text-blue-600 mr-2" />
                    <span>Support communautaire</span>
                  </li>
                </ul>
              </div>
              <div className="absolute bottom-[20px] left-0 right-0 px-8">
                <button className="w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700">
                  Commencer
                </button>
              </div>
              
            </div>

            <div className="bg-white border-2 border-blue-600 rounded-lg shadow-lg overflow-hidden relative">
              <div className="bg-blue-600 text-white text-center py-1 absolute top-0 left-0 right-0">
                <span className="text-sm font-medium">Recommandé</span>
              </div>
              <div className="p-8 pt-12">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Standard</h3>
                <p className="text-gray-600 mb-6">Pour les créateurs de contenu réguliers</p>
                <div className="flex items-end mb-6">
                  <span className="text-4xl font-bold text-gray-800">29€</span>
                  <span className="text-gray-600 ml-2">/mois</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-gray-600">
                    <ArrowRight size={16} className="text-blue-600 mr-2" />
                    <span>25 vidéos traitées/mois</span>
                  </li>
                  <li className="flex items-center text-gray-600">
                    <ArrowRight size={16} className="text-blue-600 mr-2" />
                    <span>Résolution HD</span>
                  </li>
                  <li className="flex items-center text-gray-600">
                    <ArrowRight size={16} className="text-blue-600 mr-2" />
                    <span>Support prioritaire</span>
                  </li>
                </ul>
              </div>
              <div className="absolute bottom-[20px] left-0 right-0 px-8">
                <button className="w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700">
                  Commencer
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden relative min-h-[500px] px-8 pt-8 pb-20">
            <div className="p-8">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Professionnel</h3>
                <p className="text-gray-600 mb-6">Pour les entreprises et les équipes importantes</p>
                <div className="flex items-end mb-6">
                  <span className="text-4xl font-bold text-gray-800">99€</span>
                  <span className="text-gray-600 ml-2">/mois</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-gray-600">
                    <ArrowRight size={16} className="text-blue-600 mr-2" />
                    <span>100 vidéos traitées/mois</span>
                  </li>
                  <li className="flex items-center text-gray-600">
                    <ArrowRight size={16} className="text-blue-600 mr-2" />
                    <span>Résolution 4K</span>
                  </li>
                  <li className="flex items-center text-gray-600">
                    <ArrowRight size={16} className="text-blue-600 mr-2" />
                    <span>API d'intégration</span>
                  </li>
                  <li className="flex items-center text-gray-600">
                    <ArrowRight size={16} className="text-blue-600 mr-2" />
                    <span>Support dédié</span>
                  </li>
                </ul>
              </div>
              <div className="absolute bottom-[20px] left-0 right-0 px-8">
                <button className="w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700">
                  Commencer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Prêt à mettre votre marque en avant ?</h2>
          <p className="text-xl text-blue-100 mb-8">Rejoignez les entreprises et créateurs qui utilisent Ego pour faire briller leur marque.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="px-6 py-3 rounded-md text-gray-800"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="px-6 py-3 bg-white text-blue-600 font-medium rounded-md hover:bg-gray-100">
              Essai gratuit de 14 jours
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Ego</h3>
              <p className="text-gray-400">La solution IA pour flouter les marques concurrentes et mettre la vôtre en avant dans vos vidéos.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white">Tarifs</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">Intégrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">À propos</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Carrières</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white">Conditions d'utilisation</a></li>
                <li><a href="#" className="hover:text-white">Accessibilité</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© {new Date().getFullYear()} Ego. Tous droits réservés.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}