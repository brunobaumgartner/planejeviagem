/**
 * GUIDE SCREEN
 * 
 * Tela principal do Guia Turístico integrada ao app.
 * Acesso fácil e intuitivo para explorar destinos.
 */

import { useState } from 'react';
import { Search, MapPin, TrendingUp, Book, X, Loader2 } from 'lucide-react';
import { BottomNavigation } from '../BottomNavigation';
import { Logo } from '../Logo';
import { NotificationBell } from '../NotificationBell';
import { CulturalGuideModal } from '../CulturalGuideModal';

const POPULAR_DESTINATIONS = [
  { name: 'Rio de Janeiro', country: 'Brasil', emoji: '🏖️', category: 'Praia' },
  { name: 'São Paulo', country: 'Brasil', emoji: '🏙️', category: 'Cidade' },
  { name: 'Salvador', country: 'Brasil', emoji: '🎭', category: 'Cultura' },
  { name: 'Paris', country: 'França', emoji: '🗼', category: 'Europa' },
  { name: 'Tokyo', country: 'Japão', emoji: '🗾', category: 'Ásia' },
  { name: 'Nova York', country: 'EUA', emoji: '🗽', category: 'América' },
  { name: 'Londres', country: 'Reino Unido', emoji: '🎡', category: 'Europa' },
  { name: 'Barcelona', country: 'Espanha', emoji: '🏰', category: 'Europa' },
  { name: 'Roma', country: 'Itália', emoji: '🏛️', category: 'Europa' },
  { name: 'Lisboa', country: 'Portugal', emoji: '🇵🇹', category: 'Europa' },
  { name: 'Buenos Aires', country: 'Argentina', emoji: '🥩', category: 'América' },
  { name: 'Dubai', country: 'Emirados Árabes', emoji: '🏜️', category: 'Oriente Médio' },
];

const CATEGORIES = [
  { id: 'all', name: 'Todos', icon: '🌍' },
  { id: 'Brasil', name: 'Brasil', icon: '🇧🇷' },
  { id: 'Europa', name: 'Europa', icon: '🇪🇺' },
  { id: 'América', name: 'América', icon: '🌎' },
  { id: 'Ásia', name: 'Ásia', icon: '🌏' },
];

export function Guide() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredDestinations = POPULAR_DESTINATIONS.filter((dest) => {
    const matchesSearch = dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dest.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || dest.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  function handleCityClick(cityName: string) {
    setSelectedCity(cityName);
    setIsModalOpen(true);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleCityClick(searchQuery.trim());
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 px-3 sm:px-4 py-3 sm:py-4 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <Logo size={28} variant="full" className="text-sky-500" />
          <NotificationBell />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-3 sm:px-4 pt-6 pb-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mb-4 shadow-lg">
            <Book className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Guia Turístico
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-2">
            Descubra história, cultura e dicas práticas sobre qualquer cidade do mundo
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-sm text-gray-700 border border-amber-200">
            <span className="text-amber-600">✨</span>
            Powered by Wikipedia
          </div>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-6">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar qualquer cidade... (Ex: Paris, Tokyo, Roma)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-amber-200 rounded-xl text-base focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </form>
          <p className="text-center text-sm text-gray-500 mt-2">
            Digite o nome da cidade e pressione Enter
          </p>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-amber-200 hover:border-amber-400'
              }`}
            >
              <span>{cat.icon}</span>
              <span className="text-sm font-medium">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {filteredDestinations.length} {filteredDestinations.length === 1 ? 'destino encontrado' : 'destinos encontrados'}
          </p>
        </div>

        {/* Destinations Grid */}
        {filteredDestinations.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredDestinations.map((dest) => (
              <button
                key={dest.name}
                onClick={() => handleCityClick(dest.name)}
                className="group bg-white rounded-xl p-5 border-2 border-amber-100 hover:border-amber-400 hover:shadow-lg transition-all text-left"
              >
                <div className="text-4xl mb-3">{dest.emoji}</div>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-amber-600 transition-colors">
                  {dest.name}
                </h3>
                <p className="text-sm text-gray-500 mb-3">{dest.country}</p>
                <div className="flex items-center gap-1 text-xs text-amber-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Ver guia</span>
                  <span>→</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-4">Nenhum destino encontrado</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              Limpar filtros
            </button>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-white rounded-xl p-6 border-2 border-amber-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Book className="w-5 h-5 text-amber-600" />
            O que você encontra no guia
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">📖</div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Informação Cultural</h4>
                <p className="text-sm text-gray-600">História, cultura e características da cidade</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🖼️</div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Galeria de Fotos</h4>
                <p className="text-sm text-gray-600">Principais pontos turísticos</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Dicas Práticas</h4>
                <p className="text-sm text-gray-600">Clima, transporte, idioma e segurança</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🌐</div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Multi-idioma</h4>
                <p className="text-sm text-gray-600">Português, Inglês e Espanhol</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="home" />

      {/* Modal */}
      {selectedCity && (
        <CulturalGuideModal
          cityName={selectedCity}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCity(null);
          }}
        />
      )}
    </div>
  );
}
