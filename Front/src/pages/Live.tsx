import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const WS_URL = "ws://localhost:8000/ws/blur_bottles_live";

// Types pour les marques et les états
type Brand = {
  id: string;
  name: string;
};

type ProcessingStatus = 'idle' | 'connecting' | 'streaming' | 'error';

const Live: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const frameCountRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);

  const navigate = useNavigate()
  // États
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [processedFrame, setProcessedFrame] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  // Marques disponibles
  const [availableBrands] = useState<Brand[]>([
    { id: 'brand1', name: 'cristalline' },
    { id: 'brand2', name: 'eau_vive' },
  ]);

  // Marques filtrées pour la recherche
  const filteredBrands = availableBrands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fermer le menu déroulant en cliquant à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Nettoyage lors du démontage du composant
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // Connexion WebSocket et démarrage du streaming
  const startStreaming = () => {
    if (!selectedBrands.length) {
      setErrorMessage('Veuillez sélectionner au moins une marque à ne pas flouter.');
      return;
    }

    setStatus('connecting');
    setErrorMessage('');
    frameCountRef.current = 0;

    const ws = new WebSocket(WS_URL);
    socketRef.current = ws;
    lastFrameTimeRef.current = performance.now();

    ws.onopen = () => {
      console.log('WebSocket connecté');
      setStatus('streaming');
      setIsStreaming(true);
      timeoutRef.current = setTimeout(() => {
        console.error('Aucune réponse du serveur après 30 secondes');
        setErrorMessage('Aucune réponse du serveur. Vérifiez la connexion.');
        if (socketRef.current) {
          socketRef.current.close(1001, 'Aucune réponse du serveur');
        }
      }, 30000);
    };

    ws.onmessage = async (event) => {
      try {
        // Réinitialiser le timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          console.error('Aucune réponse du serveur après 30 secondes');
          setErrorMessage('Aucune réponse du serveur. Vérifiez la connexion.');
          if (socketRef.current) {
            socketRef.current.close(1001, 'Aucune réponse du serveur');
          }
        }, 30000);

        const now = performance.now();
        const timeSinceLastFrame = now - lastFrameTimeRef.current;
        lastFrameTimeRef.current = now;
        frameCountRef.current += 1;
        console.log(`Cadre traité reçu ${frameCountRef.current} après ${timeSinceLastFrame.toFixed(2)}ms`);

        // Journaliser la taille des données brutes
        console.log(`Taille des données brutes du cadre: ${(event.data.length / 1024).toFixed(2)} KB`);

        let data;
        try {
          data = JSON.parse(event.data);
        } catch (error) {
          console.error(`Erreur d'analyse JSON pour le cadre ${frameCountRef.current}:`, error, 'Données brutes:', event.data);
          setErrorMessage('Erreur lors de l\'analyse des données JSON reçues.');
          return;
        }

        if (data.type === 'pong') {
          console.log(`Pong reçu pour le cadre ${frameCountRef.current}`);
          return;
        }

        if (data.error) {
          console.error(`Erreur serveur pour le cadre ${frameCountRef.current}:`, data.error);
          setErrorMessage(data.error);
          setStatus('error');
          return;
        }

        if (data.frame) {
          try {
            if (!data.frame.match(/^[A-Za-z0-9+/=]+$/)) {
              throw new Error('Données de cadre base64 invalides');
            }
            const imgSrc = `data:image/jpeg;base64,${data.frame}`;
            const img = new Image();
            img.src = imgSrc;
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = () => reject(new Error('Échec du chargement de l\'image'));
            });
            setProcessedFrame(imgSrc);
            console.log(`Cadre traité défini avec succès ${frameCountRef.current}`);
          } catch (error) {
            console.error(`Erreur de traitement du cadre ${frameCountRef.current}:`, error);
            setErrorMessage('Erreur lors du traitement de l\'image reçue.');
            return;
          }
        }
      } catch (error) {
        console.error(`Erreur inattendue dans onmessage pour le cadre ${frameCountRef.current}:`, error);
        setErrorMessage('Erreur inattendue lors de la réception des données.');
      }
    };

    ws.onerror = (err) => {
      console.error('Erreur WebSocket:', err);
      setErrorMessage('Erreur de connexion au serveur. Vérifiez si le serveur est en cours d\'exécution.');
      setStatus('error');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    ws.onclose = (event) => {
      console.log(`WebSocket fermé: code=${event.code}, raison=${event.reason}`);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setProcessedFrame(null);
      if (event.code !== 1000 && event.code !== 1001) {
        console.log('Tentative de reconnexion dans 3 secondes...');
        setStatus('connecting');
        reconnectTimeoutRef.current = setTimeout(startStreaming, 3000);
      } else {
        console.log('Pas de tentative de reconnexion: fermeture normale ou timeout');
        setStatus('idle');
        setIsStreaming(false);
      }
    };
  };

  // Capture et envoi des cadres
  useEffect(() => {
    if (!isStreaming || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const interval = setInterval(() => {
      if (webcamRef.current && webcamRef.current.video && socketRef.current?.readyState === WebSocket.OPEN) {
        const video = webcamRef.current.video as HTMLVideoElement;
const canvas = document.createElement('canvas');
canvas.width = 320;
canvas.height = 240;
const ctx = canvas.getContext('2d');

if (ctx && video) {
  ctx.translate(canvas.width, 0); // déplacer l'origine à droite
  ctx.scale(-1, 1); // inverser horizontalement
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const base64Data = canvas.toDataURL('image/jpeg').split(',')[1];

  console.log(`Envoi du cadre inversé ${frameCountRef.current + 1}, taille: ${(base64Data.length / 1024).toFixed(2)} KB`);

  try {
    const brandNames = selectedBrands.map(brandId =>
      availableBrands.find(brand => brand.id === brandId)?.name.toLowerCase() || ''
    );
    socketRef.current.send(
      JSON.stringify({
        type: "frame",
        frame: base64Data,
        classes_no_blur: brandNames,
      })
    );
  } catch (error) {
    console.error(`Erreur d'envoi du cadre ${frameCountRef.current + 1}:`, error);
    setErrorMessage("Erreur lors de l'envoi du cadre.");
  }
}

      }
    }, 200); // ~5 FPS

    return () => clearInterval(interval);
  }, [isStreaming, selectedBrands]);

  // Arrêter le streaming
  const stopStreaming = () => {
    if (socketRef.current) {
      socketRef.current.close(1000, 'Utilisateur a arrêté le streaming');
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    setIsStreaming(false);
    setStatus('idle');
    setProcessedFrame(null);
    setErrorMessage('');
  };

  // Basculer la sélection de marque
  const toggleBrandSelection = (brandId: string) => {
    setSelectedBrands(prev =>
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  // Obtenir le nom de la marque
  const getBrandName = (brandId: string): string => {
    const brand = availableBrands.find(b => b.id === brandId);
    return brand ? brand.name : '';
  };

  // Modal de chargement
  const LoadingModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium">Connexion en cours...</p>
      </div>
    </div>
  );

  return (
    <div className=" bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* En-tête */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-center text-gray-800">Traitement Vidéo en Direct</h1>
        </div>

        {/* Contenu principal */}
        <div className="p-6">
          {/* Flux webcam */}
          <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={320}
              height={240}
              videoConstraints={{ facingMode: 'user', width: 320, height: 240 }}
              className="absolute w-0 h-0 overflow-hidden"
              onUserMediaError={() => {
                console.error("Erreur d'accès à la webcam");
                setErrorMessage("Impossible d'accéder à la webcam. Vérifiez les autorisations.");
                setStatus('error');
              }}
            />

          {/* Flux traité */}
          {processedFrame && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Flux Traité</h3>
              <div className="border rounded-lg overflow-hidden bg-black">
                <img
                  src={processedFrame}
                  alt="Cadre traité"
                  className="w-full h-64 object-contain "
                />
              </div>
            </div>
          )}

          {/* Sélection de marque */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Marques à ne pas flouter
            </label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-lg py-2 px-3 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <span className="block truncate">
                  {selectedBrands.length === 0
                    ? 'Sélectionner des marques'
                    : `${selectedBrands.length} marque(s) sélectionnée(s)`}
                </span>
                <span className="ml-2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  <div className="sticky top-0 z-10 bg-white px-2 py-2 border-b">
                    <div className="flex rounded-md shadow-sm">
                      <div className="relative flex-grow focus-within:z-10">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          ref={searchInputRef}
                          className="form-input block w-full rounded-md pl-10 sm:text-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Rechercher une marque..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {filteredBrands.map((brand) => (
                    <div
                      key={brand.id}
                      className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleBrandSelection(brand.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand.id)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        onChange={() => {}}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <label className="ml-3 block text-gray-700">
                        {brand.name}
                      </label>
                    </div>
                  ))}

                  {filteredBrands.length === 0 && (
                    <div className="px-3 py-2 text-gray-500 text-center">
                      Aucune marque trouvée
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedBrands.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedBrands.map(brandId => (
                  <div
                    key={brandId}
                    className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center"
                  >
                    {getBrandName(brandId)}
                    <button
                      className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                      onClick={() => toggleBrandSelection(brandId)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Boutons de contrôle */}
          <div className="pt-4 flex space-x-4">
            <button
              onClick={startStreaming}
              disabled={status === 'streaming' || status === 'connecting'}
              className={`flex-1 py-3 px-4 rounded-md font-medium text-white shadow-sm transition-colors ${
                (status === 'streaming' || status === 'connecting')
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {status === 'idle' && 'Démarrer le streaming'}
              {status === 'connecting' && 'Connexion...'}
              {status === 'streaming' && 'Streaming en cours...'}
              {status === 'error' && 'Réessayer'}
            </button>
            {status === 'streaming' && (
              <button
                onClick={stopStreaming}
                className="flex-1 py-3 px-4 rounded-md font-medium text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors"
              >
                Arrêter le streaming
              </button>
            )}
          </div>

          {/* Message d'erreur */}
          {errorMessage && (
            <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
          )}
        </div>
      </div>

      {/* Modal de chargement */}
      {status === 'connecting' && <LoadingModal />}

      <button
        onClick={() => navigate('/upload')}
        className="fixed bottom-4 right-4 px-5 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition"
      >
        Importer une video
      </button>
    </div>
  );
};

export default Live;