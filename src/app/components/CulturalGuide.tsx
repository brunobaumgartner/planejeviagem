/**
 * CULTURAL GUIDE COMPONENT
 * 
 * Exibe guia cultural completo da cidade com informações da Wikipedia.
 * 
 * Features:
 * ✅ Resumo cultural e histórico
 * ✅ Seções navegáveis (História, Cultura, Turismo)
 * ✅ Galeria de imagens
 * ✅ Links para Wikipedia
 * ✅ Seletor de idioma (pt/en/es)
 * ✅ Loading states
 * ✅ Design responsivo
 */

import { useState, useEffect } from 'react';
import { Book, Globe, Image as ImageIcon, ExternalLink, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { getCityGuide } from '@/services/wikiService';
import type { CityGuide } from '@/services/wikiService';

interface CulturalGuideProps {
  cityName: string;
  defaultLanguage?: 'pt';
  compact?: boolean; // Versão compacta para cards
}

export function CulturalGuide({
  cityName,
  defaultLanguage = 'pt',
  compact = false,
}: CulturalGuideProps) {
  const [guide, setGuide] = useState<CityGuide | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'pt'>(defaultLanguage);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['history'])); // Começar com História expandida

  useEffect(() => {
    loadGuide();
  }, [cityName, language]);

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
      console.error('[CulturalGuide] Erro:', err);
      setError('Erro ao carregar guia cultural');
    } finally {
      setLoading(false);
    }
  }

  function toggleSection(sectionId: string) {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  }

  // Versão compacta para cards
  if (compact) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            Carregando informações...
          </div>
        ) : error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : guide ? (
          <>
            <div className="flex items-start gap-3 mb-3">
              <Book className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 mb-1">{guide.cityName || destination}</h4>
                <p className="text-sm text-gray-600 line-clamp-3">{guide.summary || 'Informações culturais não disponíveis no momento.'}</p>
              </div>
            </div>
            
            {guide.article?.fullUrl && (
              <a
                href={guide.article.fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
              >
                Ler mais
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </>
        ) : null}
      </div>
    );
  }

  // Versão completa
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Book className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Guia Cultural</h3>
              <p className="text-sm text-gray-600">Informações da Wikipedia</p>
            </div>
          </div>
          
          {/* Seletor de idioma */}
          <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm">
            {(['pt'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  language === lang
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <p className="text-gray-600">Carregando informações culturais...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-3">
              <Globe className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadGuide}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : guide ? (
          <div className="space-y-6">
            {/* História */}
            {guide.history && (
              <div>
                <button
                  onClick={() => toggleSection('history')}
                  className="flex items-center justify-between w-full text-left mb-3"
                >
                  <h4 className="text-lg font-semibold text-gray-900">História</h4>
                  {expandedSections.has('history') ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                {expandedSections.has('history') && (
                  <p className="text-gray-700 leading-relaxed">{guide.history}</p>
                )}
              </div>
            )}

            {/* Cultura */}
            {guide.culture && (
              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={() => toggleSection('culture')}
                  className="flex items-center justify-between w-full text-left mb-3"
                >
                  <h4 className="text-lg font-semibold text-gray-900">Cultura</h4>
                  {expandedSections.has('culture') ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                {expandedSections.has('culture') && (
                  <p className="text-gray-700 leading-relaxed">{guide.culture}</p>
                )}
              </div>
            )}

            {/* Turismo */}
            {guide.tourism && (
              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={() => toggleSection('tourism')}
                  className="flex items-center justify-between w-full text-left mb-3"
                >
                  <h4 className="text-lg font-semibold text-gray-900">Informações Turísticas</h4>
                  {expandedSections.has('tourism') ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                {expandedSections.has('tourism') && (
                  <p className="text-gray-700 leading-relaxed">{guide.tourism}</p>
                )}
              </div>
            )}

            {/* Galeria de Imagens */}
            {guide.images.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={() => toggleSection('images')}
                  className="flex items-center justify-between w-full text-left mb-3"
                >
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-semibold text-gray-900">Galeria</h4>
                    <span className="text-sm text-gray-500">({guide.images.length} fotos)</span>
                  </div>
                  {expandedSections.has('images') ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                {expandedSections.has('images') && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {guide.images.map((image, index) => (
                      <div
                        key={index}
                        className="aspect-video bg-gray-100 rounded-lg overflow-hidden group cursor-pointer"
                      >
                        <img
                          src={image.url}
                          alt={image.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Link para artigo completo */}
            <div className="pt-4 border-t border-gray-100">
              <a
                href={guide.article.fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Globe className="w-4 h-4" />
                Ver artigo completo na Wikipedia
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}