import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { X, Plus, Trash2, Save, Calendar, CheckCircle } from 'lucide-react';
import { TaskAttachments } from '@/app/components/TaskAttachments';
import type { TaskAttachment } from '@/types';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  attachments?: TaskAttachment[];
}

interface Activity {
  id: string;
  time: string;
  title: string;
  location: string;
  duration: string;
  rating?: number;
  notes?: string;
}

interface ItineraryDay {
  day: number;
  date: string;
  activities: Activity[];
}

interface DeliverPlanningProps {
  trip: any;
  onClose: () => void;
  onDelivered: () => void;
}

export function DeliverPlanning({ trip, onClose, onDelivered }: DeliverPlanningProps) {
  const { session } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'checklist' | 'itinerary'>('checklist');

  // Inicializar checklist
  const [checklist, setChecklist] = useState<Task[]>(() => {
    if (trip.tasks && trip.tasks.length > 0) {
      return trip.tasks;
    }
    return [
      { id: 'task-1', text: 'Comprar passagens aéreas', completed: false },
      { id: 'task-2', text: 'Reservar hotel', completed: false },
      { id: 'task-3', text: 'Fazer seguro viagem', completed: false },
    ];
  });

  // Inicializar roteiro
  const [itinerary, setItinerary] = useState<ItineraryDay[]>(() => {
    if (trip.itinerary && trip.itinerary.length > 0) {
      return trip.itinerary;
    }

    // Gerar dias automaticamente
    const days: ItineraryDay[] = [];
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    for (let i = 0; i < diffDays; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      
      const dayNum = date.getDate();
      const month = monthNames[date.getMonth()];

      days.push({
        day: i + 1,
        date: `${dayNum} ${month}`,
        activities: [],
      });
    }

    return days;
  });

  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  // Funções de Checklist
  const addTask = () => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      text: '',
      completed: false,
    };
    setChecklist([...checklist, newTask]);
  };

  const updateTask = (id: string, text: string) => {
    setChecklist(checklist.map(task => 
      task.id === id ? { ...task, text } : task
    ));
  };

  const updateTaskAttachments = (id: string, attachments: TaskAttachment[]) => {
    setChecklist(checklist.map(task =>
      task.id === id ? { ...task, attachments } : task
    ));
  };

  const removeTask = (id: string) => {
    setChecklist(checklist.filter(task => task.id !== id));
  };

  // Funções de Roteiro
  const addActivity = (dayIndex: number) => {
    const newActivity: Activity = {
      id: `activity-${Date.now()}`,
      time: '09:00',
      title: '',
      location: '',
      duration: '2h',
    };

    setItinerary(prev => {
      const updated = [...prev];
      updated[dayIndex].activities.push(newActivity);
      return updated;
    });
  };

  const updateActivity = (
    dayIndex: number,
    activityId: string,
    field: keyof Activity,
    value: string | number
  ) => {
    setItinerary(prev => {
      const updated = [...prev];
      const activityIndex = updated[dayIndex].activities.findIndex(a => a.id === activityId);
      if (activityIndex !== -1) {
        updated[dayIndex].activities[activityIndex] = {
          ...updated[dayIndex].activities[activityIndex],
          [field]: value,
        };
      }
      return updated;
    });
  };

  const removeActivity = (dayIndex: number, activityId: string) => {
    setItinerary(prev => {
      const updated = [...prev];
      updated[dayIndex].activities = updated[dayIndex].activities.filter(a => a.id !== activityId);
      return updated;
    });
  };

  const handleDeliver = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Validar checklist
      const validChecklist = checklist.filter(task => task.text.trim() !== '');
      if (validChecklist.length === 0) {
        setError('Adicione pelo menos uma tarefa ao checklist');
        return;
      }

      // Validar roteiro
      const hasActivities = itinerary.some(day => day.activities.length > 0);
      if (!hasActivities) {
        setError('Adicione pelo menos uma atividade ao roteiro');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/admin/trips/${trip.id}/deliver`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-User-Token': session?.access_token || '',
          },
          body: JSON.stringify({
            tasks: validChecklist,
            itinerary,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao entregar planejamento');
      }

      console.log('[Admin] Planejamento entregue com sucesso');
      onDelivered();
    } catch (err: any) {
      console.error('[Admin] Erro ao entregar planejamento:', err);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Entregar Planejamento</h2>
            <p className="text-sm text-gray-600 mt-1">
              {trip.destination} • {trip.start_date} até {trip.end_date}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setCurrentTab('checklist')}
            className={`
              px-4 py-3 border-b-2 font-medium text-sm transition-colors
              ${currentTab === 'checklist'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'}
            `}
          >
            Checklist
          </button>
          <button
            onClick={() => setCurrentTab('itinerary')}
            className={`
              px-4 py-3 border-b-2 font-medium text-sm transition-colors
              ${currentTab === 'itinerary'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'}
            `}
          >
            Roteiro Dia a Dia
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Checklist Tab */}
          {currentTab === 'checklist' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  Crie um checklist personalizado de preparação para a viagem
                </p>
                <button
                  onClick={addTask}
                  className="flex items-center gap-2 px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Tarefa
                </button>
              </div>

              <div className="space-y-2">
                {checklist.map((task) => (
                  <div key={task.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <input
                        type="text"
                        value={task.text}
                        onChange={(e) => updateTask(task.id, e.target.value)}
                        placeholder="Digite a tarefa..."
                        className="flex-1 bg-transparent border-none focus:outline-none text-gray-900"
                      />
                      <button
                        onClick={() => removeTask(task.id)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    <TaskAttachments
                      taskId={task.id}
                      attachments={task.attachments || []}
                      onUpdate={(attachments) => updateTaskAttachments(task.id, attachments)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Itinerary Tab */}
          {currentTab === 'itinerary' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Crie um roteiro dia a dia com atividades, horários e locais
              </p>

              {itinerary.map((day, dayIndex) => (
                <div key={day.day} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        Dia {day.day} - {day.date}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({day.activities.length} {day.activities.length === 1 ? 'atividade' : 'atividades'})
                      </span>
                    </div>
                  </button>

                  {expandedDay === day.day && (
                    <div className="p-4 space-y-3">
                      {day.activities.map((activity) => (
                        <div key={activity.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Horário
                              </label>
                              <input
                                type="time"
                                value={activity.time}
                                onChange={(e) => updateActivity(dayIndex, activity.id, 'time', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Duração
                              </label>
                              <input
                                type="text"
                                value={activity.duration}
                                onChange={(e) => updateActivity(dayIndex, activity.id, 'duration', e.target.value)}
                                placeholder="Ex: 2h"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Título da Atividade
                            </label>
                            <input
                              type="text"
                              value={activity.title}
                              onChange={(e) => updateActivity(dayIndex, activity.id, 'title', e.target.value)}
                              placeholder="Ex: Visita ao Cristo Redentor"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Local
                            </label>
                            <input
                              type="text"
                              value={activity.location}
                              onChange={(e) => updateActivity(dayIndex, activity.id, 'location', e.target.value)}
                              placeholder="Ex: Corcovado, Rio de Janeiro"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            />
                          </div>

                          <div className="flex justify-end">
                            <button
                              onClick={() => removeActivity(dayIndex, activity.id)}
                              className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remover
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => addActivity(dayIndex)}
                        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Atividade
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            onClick={handleDeliver}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Marcar como Entregue
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}