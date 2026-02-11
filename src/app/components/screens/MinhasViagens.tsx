import { useState, useEffect } from 'react';
import { 
  Plus, Calendar, MapPin, Plane, Star, Share2, FileText, CheckSquare, 
  Trash2, Edit2, Eye, CheckCircle2, Circle, Sparkles, Edit3, Package,
  ArrowLeft, MoreHorizontal, RotateCcw
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { useTrips } from '@/app/context/TripsContext';
import { useNavigation } from '@/app/context/NavigationContext';
import { AddTripModal } from '@/app/components/AddTripModal';
import { EditTripModal } from '@/app/components/EditTripModal';
import { ShareTripModal } from '@/app/components/ShareTripModal';
import { ItineraryEditor } from '@/app/components/ItineraryEditor';
import { PurchasePlanningModal } from '@/app/components/PurchasePlanningModal';
import { PackingListModal } from '@/app/components/PackingListModal';
import { AddTaskModal } from '@/app/components/AddTaskModal';
import { TaskAttachments } from '@/app/components/TaskAttachments';
import { Logo } from '@/app/components/Logo';
import { BottomNavigation } from '@/app/components/BottomNavigation';
import { TopNavigation } from '@/app/components/TopNavigation';
import { EmptyState } from '@/app/components/ui/EmptyState';
import type { Trip, TaskAttachment } from '@/types/trip';
import { projectId, publicAnonKey } from '/utils/supabase/info';

// Função auxiliar para formatar data no padrão brasileiro
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

export function MinhasViagens() {
  const { trips, toggleTask, addTrip, deleteTrip, addTask, deleteTask, updateTrip, selectTrip, selectedTrip } = useTrips();
  const { user } = useAuth();
  const { setCurrentScreen } = useNavigation();
  const [showAddTripModal, setShowAddTripModal] = useState(false);
  const [showEditTripModal, setShowEditTripModal] = useState(false);
  const [selectedTripForEdit, setSelectedTripForEdit] = useState<Trip | null>(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showItineraryEditor, setShowItineraryEditor] = useState(false);
  const [selectedTripForTask, setSelectedTripForTask] = useState<string | null>(null);
  const [selectedTripForPurchase, setSelectedTripForPurchase] = useState<Trip | null>(null);
  const [selectedTripForItinerary, setSelectedTripForItinerary] = useState<Trip | null>(null);
  const [selectedTripForShare, setSelectedTripForShare] = useState<Trip | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedTripForPacking, setSelectedTripForPacking] = useState<Trip | null>(null);
  const [showPackingModal, setShowPackingModal] = useState(false);
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [hasCheckedAutoOpen, setHasCheckedAutoOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [planningPrice, setPlanningPrice] = useState<number | null>(null);

  // Buscar preço do planejamento do banco de dados
  useEffect(() => {
    const fetchPlanningPrice = async () => {
      try {
        // Adicionar timestamp para evitar cache
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
          // CORREÇÃO: Backend retorna planning_package_price, não planning_price
          setPlanningPrice(data.planning_package_price || 49.90);
          console.log('[MinhasViagens] ✅ Preço carregado:', data.planning_package_price);
        } else {
          console.warn('[MinhasViagens] ⚠️ Erro ao carregar preço, usando fallback');
          setPlanningPrice(49.90);
        }
      } catch (error) {
        console.error('[MinhasViagens] ❌ Erro ao buscar preço:', error);
        setPlanningPrice(49.90); // Fallback
      }
    };

    fetchPlanningPrice();
  }, []); // Executar apenas uma vez ao montar

  // Auto-abrir modal de adicionar viagem se não houver viagens
  useEffect(() => {
    if (!hasCheckedAutoOpen && trips.length === 0) {
      // Pequeno delay para garantir que o componente renderizou
      const timer = setTimeout(() => {
        setShowAddTripModal(true);
        setHasCheckedAutoOpen(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [trips.length, hasCheckedAutoOpen]);

  const handleAddTask = (tripId: string, tripDestination: string) => {
    setSelectedTripForTask(tripId);
    setShowAddTaskModal(true);
  };

  const handleTaskSubmit = (taskText: string) => {
    if (selectedTripForTask) {
      addTask(selectedTripForTask, taskText);
    }
  };

  const handleUpdateTaskAttachments = async (tripId: string, taskId: string, attachments: TaskAttachment[]) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    const updatedTasks = trip.tasks.map(task =>
      task.id === taskId ? { ...task, attachments } : task
    );

    await updateTrip(tripId, { tasks: updatedTasks });
  };

  const selectedTripData = trips.find(t => t.id === selectedTripForTask);

  const handleSaveItinerary = async (itinerary: any[]) => {
    if (!selectedTripForItinerary) return;
    
    console.log('[MinhasViagens] Salvando roteiro...', itinerary);
    
    // Primeiro seleciona a viagem no context
    selectTrip(selectedTripForItinerary.id);
    
    // Salva o itinerário
    await updateTrip(selectedTripForItinerary.id, { itinerary });
    
    console.log('[MinhasViagens] ✅ Roteiro salvo com sucesso!');
    
    // Fecha o modal
    setShowItineraryEditor(false);
    
    // Navega para a tela de roteiro
    setCurrentScreen('itinerary');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-0">
      
      <main className="px-3 sm:px-4 pt-4 sm:pt-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl mb-1">Minhas Viagens</h1>
            <p className="text-xs sm:text-sm text-gray-600">Organize e acompanhe seus planos</p>
          </div>
          <button 
            onClick={() => setShowAddTripModal(true)}
            className="p-2.5 sm:p-3 bg-sky-500 text-white rounded-full shadow-lg hover:bg-sky-600 transition-colors"
          >
            <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {trips.length === 0 ? (
          <EmptyState
            icon={Plane}
            title="Nenhuma viagem planejada"
            description="Comece a planejar sua próxima aventura criando sua primeira viagem"
            action={{
              label: "Criar nova viagem",
              onClick: () => setShowAddTripModal(true)
            }}
          />
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {trips.map((trip) => (
              <div key={trip.id} className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg mb-1 truncate">{trip.destination}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">{formatDate(trip.startDate)}-{formatDate(trip.endDate)}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">{trip.budget}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botões de ação - grid responsivo */}
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-3">
                  <button
                    onClick={() => {
                      setSelectedTripForEdit(trip);
                      setShowEditTripModal(true);
                    }}
                    className="flex flex-col items-center gap-1 px-1 sm:px-2 py-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="text-[10px] sm:text-xs font-medium">Editar</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedTripForPacking(trip);
                      setShowPackingModal(true);
                    }}
                    className="flex flex-col items-center gap-1 px-1 sm:px-2 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="text-[10px] sm:text-xs font-medium">Bagagem</span>
                  </button>
                  
                  {/* Botão compartilhar - apenas para usuários logados */}
                  {user && user.role !== 'guest' ? (
                    <button
                      onClick={() => {
                        setSelectedTripForShare(trip);
                        setShowShareModal(true);
                      }}
                      className="flex flex-col items-center gap-1 px-1 sm:px-2 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="text-[10px] sm:text-xs font-medium">Compartilhar</span>
                    </button>
                  ) : (
                    <div className="opacity-50 cursor-not-allowed">
                      <div className="flex flex-col items-center gap-1 px-1 sm:px-2 py-2 bg-gray-50 text-gray-400 rounded-lg">
                        <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="text-[10px] sm:text-xs font-medium">Compartilhar</span>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => {
                      if (confirm(`Deseja realmente excluir a viagem para ${trip.destination}?`)) {
                        deleteTrip(trip.id);
                      }
                    }}
                    className="flex flex-col items-center gap-1 px-1 sm:px-2 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="text-[10px] sm:text-xs font-medium">Excluir</span>
                  </button>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Progresso</span>
                    <span className="text-sky-500">{trip.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-sky-500 h-2 rounded-full transition-all"
                      style={{ width: `${trip.progress}%` }}
                    />
                  </div>
                </div>

                {/* Botão de comprar planejamento - apenas para usuários logados */}
                {user && user.role !== 'guest' && trip.status === 'planning' && (
                  <div className="mb-3">
                    <button
                      onClick={() => {
                        setSelectedTripForPurchase(trip);
                        setShowPurchaseModal(true);
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg font-medium hover:from-amber-500 hover:to-orange-600 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Comprar Planejamento Personalizado</span>
                    </button>
                    <p className="text-xs text-center text-gray-500 mt-1">
                      R$ {planningPrice?.toFixed(2).replace('.', ',')} • Entrega em até 48h úteis
                    </p>
                  </div>
                )}

                {/* Botão de criar roteiro manual - APENAS PREMIUM */}
                {user && user.role === 'premium' && (
                  <div className="mb-3">
                    <button
                      onClick={() => {
                        setSelectedTripForItinerary(trip);
                        setShowItineraryEditor(true);
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>{trip.itinerary && trip.itinerary.length > 0 ? 'Editar Roteiro' : 'Criar Roteiro Premium'}</span>
                    </button>
                    <p className="text-xs text-center text-purple-600 mt-1 font-medium">
                      💎 Recurso Exclusivo Premium
                    </p>
                  </div>
                )}

                {/* Status da viagem */}
                {trip.status !== 'planning' && (
                  <div className="mb-3">
                    {trip.status === 'purchased' && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm font-medium text-amber-800">
                          ⏳ Aguardando confirmação de pagamento
                        </p>
                      </div>
                    )}
                    {trip.status === 'in_progress' && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">
                          🎨 Planejamento em criação
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Nossos especialistas estão criando seu roteiro personalizado
                        </p>
                      </div>
                    )}
                    {trip.status === 'delivered' && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-800">
                          ✅ Planejamento entregue!
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Veja seu roteiro completo na aba Roteiro
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  {trip.tasks.map((task) => (
                    <div key={task.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 group">
                        <button
                          onClick={() => toggleTask(trip.id, task.id)}
                          className="flex items-center gap-2 flex-1"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-sky-500 flex-shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                          )}
                          <span
                            className={`text-sm ${
                              task.completed ? "line-through text-gray-400" : "text-gray-700"
                            }`}
                          >
                            {task.text}
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Deseja excluir a tarefa "${task.text}"?`)) {
                              deleteTask(trip.id, task.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                      
                      {/* Anexos da tarefa */}
                      <div className="mt-2 pl-7">
                        <TaskAttachments
                          taskId={task.id}
                          attachments={task.attachments || []}
                          onUpdate={(attachments) => handleUpdateTaskAttachments(trip.id, task.id, attachments)}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => handleAddTask(trip.id, trip.destination)}
                    className="w-full mt-2 py-2 border-2 border-dashed border-gray-300 text-gray-600 text-sm rounded-lg hover:border-sky-300 hover:text-sky-500 transition-colors"
                  >
                    + Adicionar tarefa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNavigation activeTab="trips" />

      <AddTripModal
        isOpen={showAddTripModal}
        onClose={() => setShowAddTripModal(false)}
        onSubmit={addTrip}
      />

      <EditTripModal
        isOpen={showEditTripModal}
        onClose={() => {
          setShowEditTripModal(false);
          setSelectedTripForEdit(null);
        }}
        onSubmit={(tripData) => {
          if (selectedTripForEdit) {
            updateTrip(selectedTripForEdit.id, tripData);
          }
        }}
        trip={selectedTripForEdit}
      />

      <AddTaskModal
        isOpen={showAddTaskModal}
        onClose={() => {
          setShowAddTaskModal(false);
          setSelectedTripForTask(null);
        }}
        onSubmit={handleTaskSubmit}
        tripDestination={selectedTripData?.destination || ""}
      />

      <PurchasePlanningModal
        isOpen={showPurchaseModal}
        onClose={() => {
          setShowPurchaseModal(false);
          setSelectedTripForPurchase(null);
        }}
        trip={selectedTripForPurchase}
      />

      <ItineraryEditor
        isOpen={showItineraryEditor}
        onClose={() => {
          setShowItineraryEditor(false);
          setSelectedTripForItinerary(null);
        }}
        trip={selectedTripForItinerary}
        onSave={handleSaveItinerary}
      />
      
      <ShareTripModal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setSelectedTripForShare(null);
        }}
        trip={selectedTripForShare}
      />
      
      <PackingListModal
        isOpen={showPackingModal}
        onClose={() => {
          setShowPackingModal(false);
          setSelectedTripForPacking(null);
        }}
        trip={selectedTripForPacking}
        onUpdate={(packingItems) => {
          if (selectedTripForPacking) {
            updateTrip(selectedTripForPacking.id, { packingItems });
          }
        }}
      />
    </div>
  );
}