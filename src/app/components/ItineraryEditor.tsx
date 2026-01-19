import React, { useState } from 'react';
import { X, Plus, Trash2, GripVertical, Save } from 'lucide-react';
import type { ItineraryDay, ItineraryActivity } from '@/types';

interface ItineraryEditorProps {
  isOpen: boolean;
  trip: any | null;
  onSave: (itinerary: ItineraryDay[]) => Promise<void>;
  onClose: () => void;
}

export function ItineraryEditor({
  isOpen,
  trip,
  onSave,
  onClose,
}: ItineraryEditorProps) {
  if (!isOpen || !trip) return null;

  const { id: tripId, destination, startDate, endDate, itinerary: initialItinerary } = trip;

  const [itinerary, setItinerary] = useState<ItineraryDay[]>(() => {
    if (initialItinerary && initialItinerary.length > 0) {
      return initialItinerary;
    }

    // Gerar dias automaticamente baseado nas datas
    const days: ItineraryDay[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    for (let i = 0; i < diffDays; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      
      days.push({
        day: i + 1,
        date: date.toISOString().split('T')[0],
        activities: [],
      });
    }

    return days;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  const addActivity = (dayIndex: number) => {
    const newActivity: ItineraryActivity = {
      id: `activity-${Date.now()}`,
      time: '09:00',
      title: '',
      location: '',
      duration: '1h',
      notes: '',
    };

    setItinerary((prev) => {
      const updated = [...prev];
      updated[dayIndex].activities.push(newActivity);
      return updated;
    });
  };

  const updateActivity = (
    dayIndex: number,
    activityIndex: number,
    field: keyof ItineraryActivity,
    value: string | number
  ) => {
    setItinerary((prev) => {
      const updated = [...prev];
      updated[dayIndex].activities[activityIndex][field] = value as never;
      return updated;
    });
  };

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    setItinerary((prev) => {
      const updated = [...prev];
      updated[dayIndex].activities.splice(activityIndex, 1);
      return updated;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log('[ItineraryEditor] Salvando itinerário:', JSON.stringify(itinerary, null, 2));
      await onSave(itinerary);
      console.log('[ItineraryEditor] ✅ Itinerário salvo com sucesso!');
      onClose();
    } catch (error) {
      console.error('[ItineraryEditor] Erro ao salvar:', error);
      alert('Erro ao salvar roteiro. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              ✨ Criar Roteiro Premium
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {destination} • {itinerary.length} dias
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {itinerary.map((day, dayIndex) => (
            <div
              key={day.day}
              className="border border-gray-200 rounded-lg overflow-hidden relative"
            >
              {/* Day Header */}
              <button
                onClick={() =>
                  setExpandedDay(expandedDay === day.day ? null : day.day)
                }
                className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">
                      Dia {day.day}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(day.date).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                      })}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-600">
                  {day.activities.length} atividades
                </span>
              </button>
              
              {/* Botão de adicionar (posicionado absolutamente) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addActivity(dayIndex);
                  setExpandedDay(day.day);
                }}
                className="absolute top-2 right-2 p-2 hover:bg-blue-200 rounded-lg transition-colors bg-white shadow-sm z-10"
                title="Adicionar atividade"
              >
                <Plus className="w-4 h-4 text-blue-600" />
              </button>

              {/* Activities */}
              {expandedDay === day.day && (
                <div className="p-4 space-y-3 bg-white">
                  {day.activities.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      Nenhuma atividade ainda. Clique no + para adicionar.
                    </p>
                  ) : (
                    day.activities.map((activity, activityIndex) => (
                      <div
                        key={activity.id}
                        className="border border-gray-200 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="time"
                            value={activity.time}
                            onChange={(e) =>
                              updateActivity(
                                dayIndex,
                                activityIndex,
                                'time',
                                e.target.value
                              )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            placeholder="Título da atividade"
                            value={activity.title}
                            onChange={(e) =>
                              updateActivity(
                                dayIndex,
                                activityIndex,
                                'title',
                                e.target.value
                              )
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() =>
                              removeActivity(dayIndex, activityIndex)
                            }
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>

                        <input
                          type="text"
                          placeholder="📍 Local (opcional)"
                          value={activity.location || ''}
                          onChange={(e) =>
                            updateActivity(
                              dayIndex,
                              activityIndex,
                              'location',
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <textarea
                          placeholder="Descrição da atividade (opcional)"
                          value={activity.notes}
                          onChange={(e) =>
                            updateActivity(
                              dayIndex,
                              activityIndex,
                              'notes',
                              e.target.value
                            )
                          }
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            💎 Recurso exclusivo Premium
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Roteiro
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}