import { SearchBar } from "../SearchBar";
import { BottomNavigation } from "../BottomNavigation";
import { TopNavigation } from "../TopNavigation";
import { Logo } from "../Logo";
import { TripSuggestions } from "../TripSuggestions";
import { NotificationBell } from "../NotificationBell";
import { CulturalGuideModal } from "../CulturalGuideModal";
import { HotelSuggestionsCarousel } from "../HotelSuggestionsCarousel";
import { CarRentalWidget } from "../CarRentalWidget";
import { TourSuggestionsCarousel } from "../TourSuggestionsCarousel";
import { FlightWidget } from "../FlightWidget";
import { useState } from "react";
import { useNavigation } from "@/app/context/NavigationContext";

export function Home() {
  const { setCurrentScreen } = useNavigation();
  const [selectedCity, setSelectedCity] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectSuggestion = (suggestion: any) => {
    // Salvar dados da sugestão no localStorage
    localStorage.setItem('trip_suggestion', JSON.stringify({
      destination: suggestion.destination,
      days: parseInt(suggestion.duration) || 5,
      budget: parseFloat(suggestion.budget.match(/\d+/)?.[0] || "2000"),
    }));
    
    // Navegar para criar nova viagem
    setCurrentScreen("trips");
    
    // Scroll suave para o topo
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handler para quando selecionar uma cidade na SearchBar
  function handleCitySelect(cityName: string) {
    setSelectedCity(cityName);
    setIsModalOpen(true);
  }

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-0">
      

      {/* Main Content */}
      <main className="px-3 sm:px-4 pt-4 sm:pt-6">
        {/* Hero Section - MOVIDO PARA CIMA */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl mb-2 px-2">
            Viajar pode ser leve. Planejar também.
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 px-4">
            Organize sua viagem no seu tempo, do seu jeito e
            dentro do seu orçamento.
          </p>
        </div>

        {/* Call to Action - MOVIDO PARA DEPOIS DO GUIA TURÍSTICO */}
        <div className="text-center py-12 px-4 bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            ✈️ Comece a planejar sua viagem
          </h2>
          <p className="text-gray-700 mb-6 max-w-md mx-auto">
            Descubra destinos baseados no seu orçamento ou calcule quanto vai custar sua próxima aventura.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setCurrentScreen("trip-planner")}
              className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:from-sky-600 hover:to-blue-700 transition-colors inline-flex items-center justify-center gap-2 shadow-md"
            >
              🎯 Planejar por Orçamento
            </button>
            <button
              onClick={() => setCurrentScreen("trips")}
              className="bg-white text-sky-600 border-2 border-sky-500 px-8 py-3 rounded-xl font-medium hover:bg-sky-50 transition-colors inline-flex items-center justify-center gap-2"
            >
              📝 Criar Roteiro
            </button>
          </div>
        </div>

        {/* Trip Suggestions
        <div className="mb-6">
          <TripSuggestions onSelectSuggestion={handleSelectSuggestion} />
        </div> */}

        {/* Widget de Voos - TRAVELPAYOUTS */}
        <FlightWidget />

        {/* Hotel Suggestions Carousel - TRAVELPAYOUTS */}
        <HotelSuggestionsCarousel />

        {/* Car Rental Widget - TRAVELPAYOUTS */}
        <CarRentalWidget />

        {/* Tour Suggestions Carousel - TRAVELPAYOUTS */}
        <TourSuggestionsCarousel />

        {/* FEATURE 2: Sistema de Câmbio */}
        <div className="mb-6">
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">💱</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">Sistema de Câmbio</h3>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    NOVO
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-4">
                  Acompanhe taxas de câmbio em tempo real, veja histórico de 30 dias e descubra quanto levar em espécie vs cartão.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-white/60 text-xs font-medium text-gray-700 rounded-full">
                    📈 Histórico 30 dias
                  </span>
                  <span className="px-3 py-1 bg-white/60 text-xs font-medium text-gray-700 rounded-full">
                    💰 Calculadora
                  </span>
                  <span className="px-3 py-1 bg-white/60 text-xs font-medium text-gray-700 rounded-full">
                    🔔 Alertas
                  </span>
                </div>
                <button
                  onClick={() => setCurrentScreen("exchange")}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2"
                >
                  <span>Acessar Sistema de Câmbio</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Support Message */}
        <div className="text-center py-8 px-4 bg-gray-50 rounded-lg mb-6">
          <p className="text-gray-700">
            Você pode explorar tudo gratuitamente.
            <br />
            Se quiser ajuda, a gente organiza com você.
          </p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="home" />
      
      {/* Modal do Guia Turístico */}
      {isModalOpen && selectedCity && (
        <CulturalGuideModal
          cityName={selectedCity}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCity('');
          }}
        />
      )}
    </div>
  );
}