import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Types pour les marques et les états
type Brand = {
  id: string;
  name: string;
};

type VideoProcessingStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

export default function BrandBlurApp() {
  // Référence au fichier vidéo
  const videoInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  
  // États
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<VideoProcessingStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Liste des marques disponibles
  const [availableBrands, setAvailableBrands] = useState<Brand[]>([
    { id: 'brand1', name: 'cristalline' },
    { id: 'brand2', name: 'eau_vive' },
  ]);

  // Marques sélectionnées pour le floutage
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  // Fermer le dropdown quand on clique ailleurs
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

  // Nettoyer les URLs des objets blob lors du démontage
  useEffect(() => {
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
      if (processedVideoUrl) {
        URL.revokeObjectURL(processedVideoUrl);
      }
    };
  }, [videoPreviewUrl, processedVideoUrl]);

  // Filtrer les marques selon la recherche
  const filteredBrands = availableBrands.filter(brand => 
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gérer la sélection de fichier vidéo avec validation améliorée
  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier les formats supportés
      const supportedFormats = ['video/mp4', 'video/webm', 'video/quicktime'];
      if (!supportedFormats.includes(file.type)) {
        setErrorMessage('Format vidéo non supporté. Utilisez MP4, WebM ou MOV.');
        setVideoFile(null);
        return;
      }

      // Vérifier si le navigateur peut lire le type MIME
      const video = document.createElement('video');
      video.preload = 'metadata';
      const canPlay = video.canPlayType(file.type);
      if (canPlay === '') {
        setErrorMessage(`Le navigateur ne supporte pas le format ${file.type}. Convertissez-le en MP4 ou WebM.`);
        setVideoFile(null);
        return;
      }

      // Vérifier la lecture effective
      const url = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        setVideoFile(file);
        setVideoPreviewUrl(URL.createObjectURL(file));
        setProcessedVideoUrl(null);
        setStatus('idle');
        setErrorMessage('');
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        setErrorMessage('Erreur lors de la lecture de la vidéo. Vérifiez le fichier ou convertissez-le.');
        setVideoFile(null);
      };
      video.src = url;
    }
  };

  // Gérer le drag and drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('video/')) {
        handleVideoChange({ target: { files: [file] } } as any);
      } else {
        setErrorMessage('Veuillez sélectionner un fichier vidéo valide.');
      }
    }
  };

  // Gérer la sélection/déselection d'une marque
  const toggleBrandSelection = (brandId: string) => {
    setSelectedBrands(prev => 
      prev.includes(brandId) 
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };
  
  // Obtenir le nom d'une marque
  const getBrandName = (brandId: string): string => {
    const brand = availableBrands.find(b => b.id === brandId);
    return brand ? brand.name : '';
  };

  // Envoyer la vidéo à l'API
  const processVideo = async () => {
    if (!videoFile || selectedBrands.length === 0) {
      setErrorMessage('Veuillez sélectionner une vidéo et au moins une marque à ne pas flouter.');
      return;
    }

    try {
      setStatus('uploading');
      setProgress(0);

      // URL de l'API
      const apiUrl = "http://localhost:8000/blur_bottles/";
      
      // Créer FormData pour l'envoi selon la structure de l'API
      const formData = new FormData();
      formData.append('video', videoFile);
      
      // Extraire les noms des marques à partir des IDs sélectionnés
      const brandNames = selectedBrands.map(brandId => 
        availableBrands.find(brand => brand.id === brandId)?.name.toLowerCase() || ''
      );
      
      // Ajout des classes à ne pas flouter (noms des marques)
      brandNames.forEach(brandName => {
        formData.append('classes_no_blur', brandName);
      });

      // Envoyer la requête à l'API
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Erreur API: ${response.status}`);
      }

      // Obtenir le blob de la réponse
      const videoBlob = await response.blob();
      
      // Vérifier le type de contenu
      const contentType = response.headers.get('content-type') || 'video/mp4'; // Fallback to MP4 if not specified
      console.log('Content-Type:', contentType);
      console.log('Blob size:', videoBlob.size, 'bytes');

      if (!contentType.includes('video')) {
        throw new Error('La réponse de l\'API n\'est pas une vidéo valide.');
      }

      if (videoBlob.size === 0) {
        throw new Error('La vidéo retournée par l\'API est vide.');
      }

      // Créer une Blob avec le type MIME correct
      const typedBlob = new Blob([videoBlob], { type: contentType });
      const processedUrl = URL.createObjectURL(typedBlob);
      console.log('Processed Video URL:', processedUrl);

      // Vérifier si le navigateur peut lire ce type de vidéo
      const video = document.createElement('video');
      const canPlay = video.canPlayType(contentType);
      if (canPlay === '') {
        throw new Error(`Le navigateur ne peut pas lire le format ${contentType}. Téléchargez la vidéo pour la lire avec un lecteur compatible.`);
      }

      setProcessedVideoUrl(processedUrl);
      setStatus('completed');
      setProgress(100);
      
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message || 'Une erreur est survenue lors du traitement de la vidéo.');
      console.error('Erreur de traitement:', error);
    }
  };

  // Modal de chargement
  const LoadingModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium">
          {status === 'uploading' ? 'Envoi de la vidéo...' : 'Traitement en cours...'}
        </p>
      </div>
    </div>
  );

  return (
    <div className=" bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-lg overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-center text-gray-800">Télécharger votre vidéo</h1>
        </div>
        
        {/* Corps principal */}
        <div className="p-6">
          {/* Zone de dépôt */}
          {!videoFile && (
            <div 
              ref={dropzoneRef}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
              }`}
              onClick={() => videoInputRef.current?.click()}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-700 font-medium mb-1">Cliquez pour télécharger ou glissez-déposez</p>
              <p className="text-gray-500 text-sm">Formats supportés: MP4, WebM, MOV</p>
              <input
                type="file"
                ref={videoInputRef}
                onChange={handleVideoChange}
                accept="video/*"
                className="hidden"
              />
            </div>
          )}
          
          {/* Aperçu de la vidéo */}
          {videoFile && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-700">Aperçu</h3>
                <button 
                  onClick={() => {
                    setVideoFile(null);
                    setVideoPreviewUrl(null);
                    setProcessedVideoUrl(null);
                    setSelectedBrands([]);
                    setStatus('idle');
                  }}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Changer de vidéo
                </button>
              </div>
              <div className="border rounded-lg overflow-hidden bg-black">
                <video 
                  src={videoPreviewUrl || undefined} 
                  controls 
                  className="w-full h-64 object-contain"
                  onError={(e) => {
                    console.error('Erreur de lecture de la vidéo:', e);
                    setErrorMessage('Erreur lors de la lecture de la vidéo. Vérifiez le format ou convertissez-le.');
                  }}
                >
                  Votre navigateur ne supporte pas la lecture de cette vidéo.
                </video>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {videoFile.name} ({Math.round(videoFile.size / 1024 / 1024 * 10) / 10} MB)
              </div>
            </div>
          )}
          
          {/* Sélection des marques */}
          {videoFile && (
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
                    {/* Barre de recherche */}
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
                    
                    {/* Liste des marques */}
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
              
              {/* Tags des marques sélectionnées */}
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
          )}
          
          {/* Bouton de traitement */}
          <div className="pt-4">
            <button
              onClick={processVideo}
              disabled={!videoFile || selectedBrands.length === 0 || status === 'uploading' || status === 'processing'}
              className={`w-full py-3 px-4 rounded-md font-medium text-white shadow-sm transition-colors ${
                !videoFile || selectedBrands.length === 0 || status === 'uploading' || status === 'processing'
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {status === 'idle' && 'Traiter la vidéo'}
              {status === 'uploading' && 'Traitement en cours...'}
              {status === 'processing' && 'Traitement en cours...'}
              {status === 'completed' && 'Traiter a nouveau'}
              {status === 'error' && 'Réessayer'}
            </button>
          
            
            {/* Messages d'erreur */}
            {errorMessage && (
              <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
            )}
          </div>
          
          {/* Section résultat */}
          {processedVideoUrl && status === 'completed' && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Résultat</h3>
              <div className="border rounded-lg overflow-hidden bg-black">
                <video 
                  src={processedVideoUrl} 
                  controls 
                  className="w-full h-64 object-contain"
                  onError={(e) => {
                    console.error('Erreur de lecture de la vidéo:', e);
                    setErrorMessage('Impossible de lire la vidéo traitée. Téléchargez-la pour la lire avec un lecteur compatible.');
                  }}
                >
                  Votre navigateur ne supporte pas la lecture de cette vidéo. Téléchargez-la pour la lire avec un lecteur compatible.
                </video>
              </div>
              <div className="mt-4 flex justify-end">
                <a 
                  href={processedVideoUrl} 
                  download="video_floutee.mp4"
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                  onClick={(e) => {
                    if (!processedVideoUrl) {
                      e.preventDefault();
                      setErrorMessage('Aucune vidéo disponible pour le téléchargement.');
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Télécharger la vidéo
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de chargement */}
      {(status === 'uploading' || status === 'processing') && <LoadingModal />}

      <button
        onClick={() => navigate('/live')}
        className="fixed bottom-4 right-4 px-5 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition"
      >
        Tester avec webcam
      </button>


    </div>
  );
}

// Modal de chargement
const LoadingModal = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-700 font-medium">
        {status === 'uploading' ? 'Envoi de la vidéo...' : 'Traitement en cours...'}
      </p>
    </div>
  </div>
);