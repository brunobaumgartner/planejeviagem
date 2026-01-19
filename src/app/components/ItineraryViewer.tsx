import React from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';

interface Activity {
  id: string;
  time: string;
  title: string;
  description: string;
  location?: string;
}

interface DayItinerary {
  day: number;
  date: string;
  activities: Activity[];
}

interface ItineraryViewerProps {
  itinerary: DayItinerary[];
  destination: string;
}

export function ItineraryViewer({ itinerary, destination }: ItineraryViewerProps) {
  if (!itinerary || itinerary.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Nenhum roteiro criado ainda</p>
        <p className="text-sm text-gray-500 mt-1">
          Clique em "Criar Roteiro" para começar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-gray-600">
        <MapPin className="w-5 h-5" />
        <h3 className="font-semibold text-lg">{destination}</h3>
      </div>

      <div className="space-y-4">
        {itinerary.map((day) => (
          <div
            key={day.day}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            {/* Day Header */}
            <div className="bg-blue-50 p-4 border-b border-gray-200">
              <h4 className="font-semibold text-gray-900">Dia {day.day}</h4>
              <p className="text-sm text-gray-600">
                {new Date(day.date).toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            {/* Activities */}
            <div className="p-4 space-y-3">
              {day.activities.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma atividade planejada
                </p>
              ) : (
                day.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {/* Time */}
                    <div className="flex items-center gap-2 text-blue-600 min-w-[80px]">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{activity.time}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900">
                        {activity.title}
                      </h5>
                      
                      {activity.location && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{activity.location}</span>
                        </div>
                      )}

                      {activity.description && (
                        <p className="text-sm text-gray-600 mt-2">
                          {activity.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
