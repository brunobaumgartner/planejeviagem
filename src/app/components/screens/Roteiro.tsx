import {
  MapPin,
  Clock,
  Star,
  Navigation,
  ArrowLeft,
  MoreHorizontal,
} from "lucide-react";
import { Logo } from "../Logo";
import { BottomNavigation } from "../BottomNavigation";

export function Roteiro() {
  const itinerary = [
    {
      day: 1,
      date: "15 Mar",
      activities: [
        {
          id: 1,
          time: "09:00",
          title: "Cristo Redentor",
          location: "Corcovado",
          duration: "2h",
          rating: 4.8,
        },
        {
          id: 2,
          time: "14:00",
          title: "Pão de Açúcar",
          location: "Urca",
          duration: "3h",
          rating: 4.9,
        },
        {
          id: 3,
          time: "19:00",
          title: "Jantar em Ipanema",
          location: "Ipanema",
          duration: "2h",
          rating: 4.5,
        },
      ],
    },
    {
      day: 2,
      date: "16 Mar",
      activities: [
        {
          id: 4,
          time: "10:00",
          title: "Praia de Copacabana",
          location: "Copacabana",
          duration: "4h",
          rating: 4.7,
        },
        {
          id: 5,
          time: "15:00",
          title: "Escadaria Selarón",
          location: "Lapa",
          duration: "1h",
          rating: 4.6,
        },
      ],
    },
  ];

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
        <div className="mb-6">
          <h1 className="text-2xl mb-1">Roteiro</h1>
          <p className="text-sm text-gray-600">
            Organize seu dia a dia na viagem
          </p>
        </div>

        <div className="mb-6 p-4 bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg">Rio de Janeiro</h2>
              <p className="text-sm text-gray-600">
                15-20 Mar 2026 • 6 dias
              </p>
            </div>
            <button className="p-2 bg-sky-100 text-sky-500 rounded-lg">
              <Navigation className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {itinerary.map((dayPlan) => (
            <div key={dayPlan.day}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-12 h-12 bg-sky-500 text-white rounded-full flex items-center justify-center font-semibold">
                  {dayPlan.day}
                </div>
                <div>
                  <p className="font-medium">
                    Dia {dayPlan.day}
                  </p>
                  <p className="text-sm text-gray-600">
                    {dayPlan.date}
                  </p>
                </div>
              </div>

              <div className="ml-6 border-l-2 border-gray-200 pl-4 space-y-4">
                {dayPlan.activities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="relative pb-4"
                  >
                    <div className="absolute -left-[1.375rem] top-2 w-3 h-3 bg-sky-500 rounded-full border-2 border-white" />
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {activity.time}
                            </span>
                            <span className="text-sm text-gray-400">
                              • {activity.duration}
                            </span>
                          </div>
                          <h3 className="font-medium mb-1">
                            {activity.title}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            {activity.location}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-medium">
                            {activity.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-6 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-sky-300 hover:text-sky-500 transition-colors">
          + Adicionar dia ao roteiro
        </button>
      </main>

      <BottomNavigation activeTab="itinerary" />
    </div>
  );
}