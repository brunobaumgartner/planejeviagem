/**
 * WIKI GUIDE DEMO
 * 
 * Componente de demonstração da Feature 4: Guia Turístico Automático.
 * Pode ser integrado em qualquer tela do app.
 * 
 * Features:
 * ✅ Busca de cidades
 * ✅ Preview compacto
 * ✅ Modal completo
 * ✅ Exemplos de cidades populares
 */

import { useState } from 'react';
import { Search, Book, MapPin, Sparkles } from 'lucide-react';
import { CulturalGuideModal } from './CulturalGuideModal';
import { CulturalGuide } from './CulturalGuide';

const POPULAR_CITIES = [
  { name: 'Rio de Janeiro', country: 'Brasil', emoji: '🏖️' },
  { name: 'Paris', country: 'França', emoji: '🗼' },
  { name: 'Tokyo', country: 'Japão', emoji: '🗾' },
  { name: 'Nova York', country: 'EUA', emoji: '🗽' },
  { name: 'Londres', country: 'Reino Unido', emoji: '🇬🇧' },
  { name: 'Barcelona', country: 'Espanha', emoji: '🏰' },
  { name: 'Roma', country: 'Itália', emoji: '🏛️' },
  { name: 'Lisboa', country: 'Portugal', emoji: '🇵🇹' },
];

export function WikiGuideDemo() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [previewCity, setPreviewCity] = useState<string | null>(null);

  function handleCityClick(cityName: string) {
    setSelectedCity(cityName);
    setShowModal(true);
  }

  function handlePreview(cityName: string) {
    setPreviewCity(cityName);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Book className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Guia Turístico Automático
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubra informações culturais, históricas e dicas de viagem sobre qualquer cidade do mundo
          </p>
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Powered by Wikipedia API
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar cidade... (ex: Rio de Janeiro, Paris, Tokyo)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  handleCityClick(searchQuery.trim());
                  setSearchQuery('');
                }
              }}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
            />
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            Pressione Enter para buscar
          </p>
        </div>

        {/* Popular Cities */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-500" />
            Cidades Populares
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {POPULAR_CITIES.map((city) => (
              <button
                key={city.name}
                onClick={() => handleCityClick(city.name)}
                onMouseEnter={() => handlePreview(city.name)}
                className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-lg transition-all text-center"
              >
                <div className="text-4xl mb-2">{city.emoji}</div>
                <div className="font-semibold text-gray-900 mb-1">{city.name}</div>
                <div className="text-sm text-gray-500">{city.country}</div>
                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-blue-600 font-medium">
                    Ver guia →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Preview Section */}
        {previewCity && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Preview: {previewCity}</h2>
            <CulturalGuide cityName={previewCity} compact />
          </div>
        )}

        {/* Features */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            O que você encontra no Guia
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon="📖"
              title="Informação Cultural"
              description="Resumo completo sobre a história, cultura e características da cidade"
            />
            <FeatureCard
              icon="🖼️"
              title="Galeria de Fotos"
              description="Imagens dos principais pontos turísticos e monumentos históricos"
            />
            <FeatureCard
              icon="💡"
              title="Dicas Práticas"
              description="Informações sobre clima, transporte, idioma e segurança"
            />
            <FeatureCard
              icon="⏰"
              title="Linha do Tempo"
              description="Principais marcos históricos da fundação até os dias atuais"
            />
            <FeatureCard
              icon="🌍"
              title="Multi-idioma"
              description="Conteúdo disponível em Português, Inglês e Espanhol"
            />
            <FeatureCard
              icon="🔗"
              title="Links Externos"
              description="Acesso direto aos artigos completos da Wikipedia"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>
            Feature 4: Guia Turístico Automático • Desenvolvido para Planeje Fácil
          </p>
          <p className="mt-1">
            Dados fornecidos pela Wikipedia API
          </p>
        </div>
      </div>

      {/* Modal */}
      {selectedCity && (
        <CulturalGuideModal
          cityName={selectedCity}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedCity(null);
          }}
        />
      )}
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: string; 
  title: string; 
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-3xl flex-shrink-0">{icon}</div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}
