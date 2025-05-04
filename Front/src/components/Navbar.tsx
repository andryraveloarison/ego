import { useNavigate } from 'react-router-dom';

export default function Navbar() {

  const navigate = useNavigate();

    return (
      <div className="font-sans">
        {/* Navigation */}
        <nav className="bg-white shadow px-6 py-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center">
            <img
              src="/ego2.png"
              alt="Logo MyMark"
              className="h-20 cursor-pointer"
              onClick={() => navigate('/')}
            />
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600" onClick={() => navigate('/#features')}>
                Fonctionnalités</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600" onClick={() => navigate('/#how-it-works')}>
                Utilisation</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600" onClick={() => navigate('/#pricing')}>
                Tarifs</a>
            </div>
            <div>
              <button className="px-4 py-2 text-blue-600 rounded-md border border-blue-600 mr-2">Se connecter</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md">Essai gratuit</button>
            </div>
          </div>
        </nav>

    </div>

    );
}

