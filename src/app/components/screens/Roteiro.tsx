import { useState, useEffect } from 'react';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { Logo } from '@/app/components/Logo';
import { UserBadge } from '@/app/components/UserBadge';
import { TopNavigation } from '@/app/components/TopNavigation';
import { BottomNavigation } from '@/app/components/BottomNavigation';
import type { ItineraryDay, ItineraryActivity } from '@/types/trip';
import { ItineraryEditor } from '@/app/components/ItineraryEditor';
import type { Trip } from '@/types/trip';
import { useAuth } from '@/app/context/AuthContext';
import { useNavigation } from '@/app/context/NavigationContext';
import { useTrips } from '@/app/context/TripsContext';
import { 
  MapPin, 
  Calendar, 
  Plus, 
  ChevronRight, 
  Lock, 
  LogIn, 
  CheckCircle2, 
  AlertCircle, 
  Crown, 
  ShoppingCart,
  ArrowLeft,
  Bell 
} from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

// Função auxiliar para formatar data no padrão brasileiro
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

export function Roteiro() {
  const { user, isGuest, isPremium } = useAuth();
  const { setCurrentScreen } = useNavigation();
  const { trips, selectTrip } = useTrips();
  
  const [selectedTripForModal, setSelectedTripForModal] = useState<Trip | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [planningPrice, setPlanningPrice] = useState<number | null>(null);

  // Buscar preço do planejamento do banco de dados
  useEffect(() => {
    const fetchPlanningPrice = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/pricing-config`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setPlanningPrice(data.planning_package_price || 49.90);
          console.log('[Roteiro] ✅ Preço carregado:', data.planning_package_price);
        } else {
          console.warn('[Roteiro] ⚠️ Erro ao carregar preço, usando fallback');
          setPlanningPrice(49.90);
        }
      } catch (error) {
        console.error('[Roteiro] ❌ Erro ao buscar preço:', error);
        setPlanningPrice(49.90);
      }
    };

    fetchPlanningPrice();
  }, []);

  // Função para abrir modal com roteiro
  const handleOpenItinerary = (trip: Trip) => {
    setSelectedTripForModal(trip);
    setIsModalOpen(true);
  };

  // Função para fechar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTripForModal(null);
  };

  // Função para salvar roteiro editado (para Premium)
  const handleSaveItinerary = async (itinerary: ItineraryDay[]) => {
    if (!selectedTripForModal) return;
    
    // Aqui você implementaria a lógica de salvar no contexto de Trips
    // Para demo, apenas simulamos
    console.log('[Roteiro] Salvando itinerário:', itinerary);
    // await updateTripItinerary(selectedTripForModal.id, itinerary);
  };

  // GUEST: Blocked from accessing itineraries
  if (isGuest) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 lg:pb-0">
        {/* Top Navigation - Desktop only */}
        <TopNavigation activeTab="itinerary" />
        
        {/* Header - Mobile only */}
        <header className="lg:hidden sticky top-0 bg-white border-b border-gray-200 px-4 py-4 z-10">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentScreen('home')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <Logo size={32} variant="full" className="text-sky-500" />
            <div className="w-10" /> {/* Spacer para centralizar o logo */}
          </div>
        </header>

        <main className="px-4 pt-12 flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-gray-400" />
          </div>

          <h1 className="text-2xl font-semibold mb-2 text-center">
            Roteiros são exclusivos para usuários
          </h1>
          <p className="text-gray-600 text-center mb-8 max-w-md">
            Crie uma conta gratuita para acessar roteiros de viagem criados por
            nossa equipe ou crie os seus próprios.
          </p>

          <div className="w-full max-w-md space-y-3">
            <button
              onClick={() => setCurrentScreen('signup')}
              className="w-full bg-sky-500 text-white py-4 rounded-xl font-medium hover:bg-sky-600 transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Criar conta grátis
            </button>

            <button
              onClick={() => setCurrentScreen('login')}
              className="w-full border-2 border-sky-200 text-sky-500 py-4 rounded-xl font-medium hover:bg-sky-50 transition-colors"
            >
              Já tenho conta
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-xl max-w-md">
            <p className="text-sm text-blue-800 text-center">
              💡 <strong>Dica:</strong> Você pode explorar destinos e criar
              checklists como visitante, mas roteiros requerem conta.
            </p>
          </div>
        </main>

        <BottomNavigation activeTab="itinerary" />
      </div>
    );
  }

  // LOGGED USER: Show trips list
  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-0">
      {/* Top Navigation - Desktop only */}
      <TopNavigation activeTab="itinerary" />
      
      {/* Header - Mobile only */}
      <header className="lg:hidden sticky top-0 bg-white border-b border-gray-200 px-4 py-4 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentScreen('home')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <Logo size={32} variant="full" className="text-sky-500" />
          <UserBadge role={user!.role} size="sm" />
        </div>
      </header>

      <main className="px-4 pt-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Meus Roteiros</h1>
          <p className="text-sm text-gray-600">
            Clique em uma viagem para ver o roteiro detalhado
          </p>
        </div>

        {/* Empty State */}
        {trips.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Nenhuma viagem cadastrada</h2>
            <p className="text-gray-600 mb-6">
              Crie sua primeira viagem para começar a planejar
            </p>
            <button
              onClick={() => setCurrentScreen('trips')}
              className="bg-sky-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-sky-600 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Criar primeira viagem
            </button>
          </div>
        )}

        {/* Trips List */}
        {trips.length > 0 && (
          <div className="space-y-4 mb-6">
            {trips.map((trip) => {
              const hasItinerary = trip.itinerary && trip.itinerary.length > 0;
              const isPurchased = trip.status === 'purchased' || trip.status === 'delivered';
              const canViewItinerary = isPremium || isPurchased || hasItinerary;

              return (
                <button
                  key={trip.id}
                  onClick={() => canViewItinerary ? handleOpenItinerary(trip) : null}
                  className={`w-full bg-white rounded-xl p-4 shadow-sm border-2 transition-all text-left ${
                    canViewItinerary 
                      ? 'border-sky-200 hover:border-sky-400 hover:shadow-md cursor-pointer' 
                      : 'border-gray-200 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">
                          {trip.destination}
                        </h3>
                        {hasItinerary && (
                          <div className="flex items-center gap-1 bg-green-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-green-600" />
                            <span className="text-xs font-medium text-green-700">
                              Com roteiro
                            </span>
                          </div>
                        )}
                        {!hasItinerary && !canViewItinerary && (
                          <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full">
                            <AlertCircle className="w-3 h-3 text-gray-500" />
                            <span className="text-xs font-medium text-gray-600">
                              Sem roteiro
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                      </div>
                      
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          {trip.budget}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-sm text-gray-600">
                          {trip.tasks.filter(t => t.completed).length}/{trip.tasks.length} tarefas
                        </span>
                      </div>
                    </div>

                    {canViewItinerary && (
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                    )}
                  </div>

                  {!canViewItinerary && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-600">
                        {isPremium ? (
                          '📝 Crie um roteiro para esta viagem'
                        ) : (
                          '🔒 Compre o planejamento ou seja Premium para acessar roteiros'
                        )}
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* CTA Cards */}
        {trips.length > 0 && (
          <div className="space-y-4">
            {/* Premium CTA for non-premium users */}
            {!isPremium && (
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-amber-900 mb-1">
                      Crie roteiros ilimitados
                    </h3>
                    <p className="text-sm text-amber-800">
                      Com o Premium, você pode criar e editar roteiros personalizados
                      para todas as suas viagens.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentScreen('profile')}
                  className="w-full bg-amber-500 text-white py-3 rounded-xl font-medium hover:bg-amber-600 transition-colors"
                >
                  Ver plano Premium
                </button>
              </div>
            )}

            {/* Purchase Planning CTA */}
            <div className="bg-white border-2 border-sky-200 rounded-xl p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sky-900 mb-1">
                    Planejamento Profissional
                  </h3>
                  <p className="text-sm text-gray-700">
                    Nossa equipe cria um roteiro completo e personalizado para sua
                    viagem por apenas R$ {planningPrice?.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCurrentScreen('trips')}
                className="w-full bg-sky-500 text-white py-3 rounded-xl font-medium hover:bg-sky-600 transition-colors"
              >
                Comprar planejamento
              </button>
            </div>
          </div>
        )}
      </main>

      <BottomNavigation activeTab="itinerary" />

      {/* Itinerary Modal - Unificado para visualização E edição */}
      {selectedTripForModal && (
        <ItineraryEditor
          trip={selectedTripForModal}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveItinerary}
          canEdit={isPremium}
        />
      )}
    </div>
  );
}