/**
 * CULTURAL GUIDE MODAL
 * 
 * Modal completo com guia turístico da Wikipedia para uma cidade.
 * Combina informações culturais e dicas práticas de viagem.
 * 
 * Features:
 * ✅ Abas navegáveis (Sobre, Dicas)
 * ✅ Design responsivo
 * ✅ Animações suaves
 * ✅ Seletor de idioma
 * ✅ Compartilhamento
 */

import { useState, useEffect } from 'react';
import { X, Book, Lightbulb, Share2, ExternalLink, Loader2 } from 'lucide-react';
import { TravelTips } from './TravelTips';
import { getCityGuide } from '@/services/wikiService';
import type { CityGuide } from '@/services/wikiService';

interface CulturalGuideModalProps {
  cityName: string;
  isOpen: boolean;
  onClose: () => void;
  defaultLanguage?: 'pt' | 'en' | 'es';
}

type Tab = 'about' | 'tips';

export function CulturalGuideModal({
  cityName,
  isOpen,
  onClose,
  defaultLanguage = 'pt',
}: CulturalGuideModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('about');
  const [guide, setGuide] = useState<CityGuide | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'pt' | 'en' | 'es'>(defaultLanguage);

  // Carregar guia quando modal abre
  useEffect(() => {
    if (isOpen && !guide && !loading) {
      loadGuide();
    }
  }, [isOpen]);

  async function loadGuide() {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getCityGuide(cityName, language);
      
      if (!data) {
        setError('Não foi possível carregar informações sobre esta cidade');
        return;
      }
      
      setGuide(data);
    } catch (err: any) {
      console.error('[CulturalGuideModal] Erro:', err);
      setError('Erro ao carregar guia cultural');
    } finally {
      setLoading(false);
    }
  }

  async function handleLanguageChange(newLang: 'pt' | 'en' | 'es') {
    setLanguage(newLang);
    setGuide(null);
    
    // Recarregar com novo idioma
    try {
      setLoading(true);
      const data = await getCityGuide(cityName, newLang);
      if (data) setGuide(data);
    } catch (err) {
      console.error('[CulturalGuideModal] Erro ao mudar idioma:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleShare() {
    if (!guide) return;
    
    if (navigator.share) {
      navigator.share({
        title: `Guia Cultural: ${guide.cityName}`,
        text: guide.summary,
        url: guide.article.fullUrl,
      }).catch(() => {
        // Fallback: copiar link
        navigator.clipboard.writeText(guide.article.fullUrl);
        alert('Link copiado para a área de transferência!');
      });
    } else {
      // Fallback: copiar link
      navigator.clipboard.writeText(guide.article.fullUrl);
      alert('Link copiado para a área de transferência!');
    }
  }

  if (!isOpen) return null;

  const tabs = [
    { id: 'about' as const, label: 'Sobre', icon: Book },
    { id: 'tips' as const, label: 'Dicas', icon: Lightbulb },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              {guide ? guide.cityName : cityName}
            </h2>
            <p className="text-sm text-blue-100">Guia Turístico Completo</p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Seletor de idioma */}
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-lg p-1">
              {(['pt', 'en', 'es'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  disabled={loading}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    language === lang
                      ? 'bg-white text-blue-600'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Botão compartilhar */}
            {guide && (
              <button
                onClick={handleShare}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                title="Compartilhar"
              >
                <Share2 className="w-5 h-5" />
              </button>
            )}
            
            {/* Botão fechar */}
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Carregando informações...</p>
              <p className="text-sm text-gray-500 mt-1">Buscando dados da Wikipedia</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-red-600 font-medium mb-4">{error}</p>
              <button
                onClick={loadGuide}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          ) : guide ? (
            <>
              {activeTab === 'about' && (
                <div className="space-y-6">
                  {/* Resumo principal */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Sobre {guide.cityName}
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {guide.summary}
                    </p>
                    <a
                      href={guide.article.fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      Ler artigo completo
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Galeria de imagens */}
                  {guide.images.length > 0 && (
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Galeria de Fotos
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {guide.images.map((image, index) => (
                          <div
                            key={index}
                            className="aspect-video bg-gray-100 rounded-lg overflow-hidden group cursor-pointer"
                          >
                            <img
                              src={image.url}
                              alt={image.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Informações turísticas */}
                  {guide.tourism && (
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Informações Turísticas
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {guide.tourism}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'tips' && (
                <TravelTips guide={guide} />
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-white px-6 py-3">
          <p className="text-xs text-gray-500 text-center">
            Informações obtidas da Wikipedia • Sempre verifique dados atualizados antes de viajar
          </p>
        </div>
      </div>
    </div>
  );
}