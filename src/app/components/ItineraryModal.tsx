import { X, MapPin, Clock, Star, Navigation, Calendar, Edit } from 'lucide-react';
import type { Trip, ItineraryDay } from '@/types';

interface ItineraryModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  canEdit: boolean;
}

export function ItineraryModal({ trip, isOpen, onClose, onEdit, canEdit }: ItineraryModalProps) {
  if (!isOpen) return null;

  const hasItinerary = trip.itinerary && trip.itinerary.length > 0;

  // Mock data para demonstração caso não tenha itinerário
  const mockItinerary: ItineraryDay[] = [
    {
      day: 1,
      date: trip.startDate,
      activities: [
        {
          id: '1',
          time: '09:00',
          title: 'Chegada e Check-in',
          location: trip.destination,
          duration: '2h',
        },
        {
          id: '2',
          time: '14:00',
          title: 'Explorar o centro',
          location: trip.destination,
          duration: '3h',
        },
      ],
    },
  ];

  const itinerary = hasItinerary ? trip.itinerary : mockItinerary;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white w-full sm:w-[90%] sm:max-w-2xl max-h-[90vh] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{trip.destination}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <Calendar className="w-4 h-4" />
              <span>{trip.startDate} - {trip.endDate}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {canEdit && onEdit && (
              <button
                onClick={onEdit}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Editar roteiro"
              >
                <Edit className="w-5 h-5 text-sky-600" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {!hasItinerary && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800">
                ℹ️ Este é um roteiro de exemplo. {canEdit ? 'Clique em "Editar" para criar seu roteiro personalizado.' : 'Compre o planejamento ou seja Premium para ter roteiros completos.'}
              </p>
            </div>
          )}

          <div className="space-y-8">
            {itinerary.map((dayPlan: ItineraryDay) => (
              <div key={dayPlan.day}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                    {dayPlan.day}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Dia {dayPlan.day}</p>
                    <p className="text-sm text-gray-600">{dayPlan.date}</p>
                  </div>
                </div>

                <div className="ml-6 border-l-2 border-gray-200 pl-6 space-y-4">
                  {dayPlan.activities.map((activity, index) => (
                    <div key={activity.id} className="relative">
                      <div className="absolute -left-[1.875rem] top-3 w-4 h-4 bg-sky-500 rounded-full border-4 border-white shadow" />
                      
                      <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700">
                                {activity.time}
                              </span>
                              {activity.duration && (
                                <span className="text-sm text-gray-500">
                                  • {activity.duration}
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">
                              {activity.title}
                            </h3>
                            {activity.location && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                {activity.location}
                              </div>
                            )}
                            {activity.notes && (
                              <p className="text-sm text-gray-600 mt-2 italic">
                                {activity.notes}
                              </p>
                            )}
                          </div>
                          {activity.rating && (
                            <div className="flex items-center gap-1 bg-amber-100 px-2 py-1 rounded-lg ml-3">
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                              <span className="text-sm font-bold text-amber-700">
                                {activity.rating}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {hasItinerary && (
            <div className="mt-8 p-4 bg-sky-50 rounded-xl border border-sky-200">
              <p className="text-sm text-sky-800 text-center">
                📍 Use o botão de navegação para abrir rotas no mapa
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
