import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, GripVertical, Save, MapPin, ChevronDown, ChevronUp, Map as MapIcon, Edit2, DollarSign } from 'lucide-react';
import type { ItineraryDay, ItineraryActivity, Attraction } from '@/types';
import { AttractionsMap } from '@/app/components/AttractionsMap';
import { geocodeLocation } from '@/services/internationalService';
import { CurrencyWidget } from '@/app/components/CurrencyWidget';
import { CashCalculator } from '@/app/components/CashCalculator';

interface ItineraryEditorProps {
  isOpen: boolean;
  trip: any | null;
  onSave: (itinerary: ItineraryDay[]) => Promise<void>;
  onClose: () => void;
  canEdit?: boolean; // Se false, será apenas visualização
}

export function ItineraryEditor({
  isOpen,
  trip,
  onSave,
  onClose,
  canEdit = true,
}: ItineraryEditorProps) {
  if (!isOpen || !trip) return null;

  const { id: tripId, destination, startDate, endDate, itinerary: initialItinerary } = trip;

  const [itinerary, setItinerary] = useState<ItineraryDay[]>(() => {
    if (initialItinerary && initialItinerary.length > 0) {
      return initialItinerary;
    }

    // Gerar dias automaticamente baseado nas datas
    const days: ItineraryDay[] = [];
    const start = new Date(startDate + 'T00:00:00'); // Adicionar horário para evitar timezone
    const end = new Date(endDate + 'T00:00:00');
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // Corrigido: floor + 1

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
  const [isEditing, setIsEditing] = useState(canEdit); // Modo de edição/visualização
  const [showMap, setShowMap] = useState(false);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [loadingCoords, setLoadingCoords] = useState(false);

  // Geocodificar destino quando o modal abrir
  useEffect(() => {
    if (isOpen && trip && !coordinates) {
      loadCoordinates();
    }
  }, [isOpen, trip]);

  const loadCoordinates = async () => {
    if (!trip) return;
    
    setLoadingCoords(true);
    try {
      console.log('🌍 Tentando geocodificar destino:', trip.destination);
      const results = await geocodeLocation(trip.destination);
      
      if (results && results.length > 0 && results[0].lat && results[0].lon) {
        const lat = Number(results[0].lat);
        const lon = Number(results[0].lon);
        
        if (isNaN(lat) || isNaN(lon)) {
          console.error('❌ Coordenadas inválidas:', results[0]);
          return;
        }
        
        const coords: [number, number] = [lat, lon];
        console.log('✅ Coordenadas definidas:', coords);
        setCoordinates(coords);
      }
    } catch (error) {
      console.error('❌ Erro ao geocodificar destino:', error);
    } finally {
      setLoadingCoords(false);
    }
  };

  const handleAddAttractionToDay = (attraction: Attraction, dayIndex: number) => {
    if (!canEdit) return;

    const newActivity: ItineraryActivity = {
      id: `activity-${Date.now()}`,
      time: '09:00',
      title: attraction.name,
      location: attraction.name,
      duration: '2h',
      notes: attraction.type ? `📍 ${attraction.type}` : '',
    };

    setItinerary((prev) => {
      const updated = [...prev];
      updated[dayIndex].activities.push(newActivity);
      return updated;
    });

    // Expandir o dia para mostrar a atividade adicionada
    setExpandedDay(dayIndex + 1);
    
    console.log(`✅ Atração "${attraction.name}" adicionada ao Dia ${dayIndex + 1}`);
  };

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

  // Formatar data no padrão brasileiro sem problemas de timezone
  const formatDateBR = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    });
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
                      {formatDateBR(day.date)}
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

          {/* Mapa de Pontos Turísticos */}
          <div className="mt-8">
            <button
              onClick={() => setShowMap(!showMap)}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-sky-50 to-blue-50 hover:from-sky-100 hover:to-blue-100 rounded-xl transition-all border border-sky-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center">
                  <MapIcon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-gray-900">Pontos Turísticos Próximos</h3>
                  <p className="text-sm text-gray-600">
                    {showMap ? 'Ocultar mapa' : 'Ver atrações, monumentos, parques e mais'}
                  </p>
                </div>
              </div>
              {showMap ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {showMap && (
              <div className="mt-4">
                {loadingCoords ? (
                  <div className="bg-gray-100 rounded-xl p-12 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-sm text-gray-600">Carregando mapa...</p>
                  </div>
                ) : coordinates ? (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <AttractionsMap
                      center={coordinates}
                      radius={10000}
                      zoom={13}
                      itinerary={canEdit ? itinerary : undefined}
                      onAddToDay={canEdit ? handleAddAttractionToDay : undefined}
                    />
                    <div className="p-3 bg-gray-50 border-t border-gray-200">
                      <p className="text-xs text-gray-600 text-center">
                        {canEdit ? (
                          '💡 Clique nos marcadores para ver detalhes e adicionar ao roteiro'
                        ) : (
                          '💡 Veja as principais atrações turísticas próximas ao destino'
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 rounded-xl p-6 border border-amber-200 text-center">
                    <MapIcon className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                    <p className="text-sm text-amber-800">
                      Não foi possível carregar o mapa para este destino.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* FEATURE 2: Informações de Câmbio (apenas viagens internacionais) */}
          {trip.isInternational && trip.destinationCurrency && (
            <div className="mt-8 space-y-6">
              {/* Header da seção */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Informações de Câmbio</h3>
                  <p className="text-sm text-gray-600">
                    Sistema completo para planejamento financeiro internacional
                  </p>
                </div>
              </div>

              {/* Widget de Conversão */}
              <div>
                <CurrencyWidget
                  from="BRL"
                  to={trip.destinationCurrency}
                  initialAmount={trip.budgetAmount || 1000}
                  compact={false}
                  onRateChange={(rate) => {
                    console.log('[ItineraryEditor] Taxa atualizada:', rate);
                  }}
                />
              </div>

              {/* Calculadora de Espécie */}
              {trip.budgetAmount && (
                <div>
                  <CashCalculator
                    totalBudget={trip.budgetAmount}
                    days={itinerary.length}
                    destination={trip.destination}
                    currency={trip.destinationCurrency}
                  />
                </div>
              )}

              {/* Info adicional */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-900">
                  💡 <strong>Dica:</strong> Acompanhe as taxas de câmbio diariamente e configure alertas
                  para ser notificado quando a moeda atingir o valor desejado.{' '}
                  <button
                    onClick={() => {
                      // Navegar para tela de câmbio completa
                      window.open('#/exchange', '_blank');
                    }}
                    className="underline font-semibold hover:text-blue-700"
                  >
                    Acessar sistema completo →
                  </button>
                </p>
              </div>
            </div>
          )}
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