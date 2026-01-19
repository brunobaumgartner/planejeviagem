import { useState } from "react";
import { 
  Plus, ChevronRight, Calendar, MapPin, CheckCircle, 
  MoreVertical, Trash2, Circle, CheckCircle2, ArrowLeft,
  RotateCcw, Share, MoreHorizontal
} from "lucide-react";
import { BottomNavigation } from "../BottomNavigation";
import { useTrips } from "@/app/context/TripsContext";
import { AddTripModal } from "../AddTripModal";
import { AddTaskModal } from "../AddTaskModal";
import { Logo } from "../Logo";

export function MinhasViagens() {
  const { trips, toggleTask, addTrip, deleteTrip, addTask, deleteTask } = useTrips();
  const [showAddTripModal, setShowAddTripModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedTripForTask, setSelectedTripForTask] = useState<string | null>(null);
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);

  const handleAddTask = (tripId: string, tripDestination: string) => {
    setSelectedTripForTask(tripId);
    setShowAddTaskModal(true);
  };

  const handleTaskSubmit = (taskText: string) => {
    if (selectedTripForTask) {
      addTask(selectedTripForTask, taskText);
    }
  };

  const selectedTripData = trips.find(t => t.id === selectedTripForTask);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 z-10">
        <div className="flex items-center justify-between">
          <div className="w-10">
            <button className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
          <Logo
            size={32}
            variant="full"
            className="text-sky-500"
          />
          <div className="flex items-center gap-1">
            
            <button className="p-2">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl mb-1">Minhas Viagens</h1>
            <p className="text-sm text-gray-600">Organize e acompanhe seus planos</p>
          </div>
          <button 
            onClick={() => setShowAddTripModal(true)}
            className="p-3 bg-sky-500 text-white rounded-full shadow-lg hover:bg-sky-600 transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-4 inline-block p-4 bg-gray-200 rounded-full">
              <MapPin className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl mb-2">Nenhuma viagem planejada</h2>
            <p className="text-gray-600 mb-6">Comece a planejar sua próxima aventura</p>
            <button 
              onClick={() => setShowAddTripModal(true)}
              className="px-6 py-3 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors"
            >
              Criar nova viagem
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map((trip) => (
              <div key={trip.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg mb-1">{trip.destination}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {trip.startDate}-{trip.endDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {trip.budget}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedTrip(expandedTrip === trip.id ? null : trip.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {expandedTrip === trip.id && (
                  <div className="mb-3 p-3 bg-red-50 rounded-lg">
                    <button
                      onClick={() => {
                        if (confirm(`Deseja realmente excluir a viagem para ${trip.destination}?`)) {
                          deleteTrip(trip.id);
                          setExpandedTrip(null);
                        }
                      }}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 w-full"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Excluir viagem</span>
                    </button>
                  </div>
                )}

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

                <div className="space-y-2">
                  {trip.tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-2 group">
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

      <AddTaskModal
        isOpen={showAddTaskModal}
        onClose={() => {
          setShowAddTaskModal(false);
          setSelectedTripForTask(null);
        }}
        onSubmit={handleTaskSubmit}
        tripDestination={selectedTripData?.destination || ""}
      />
    </div>
  );
}