import {
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  MapPin,
  Calendar,
  CheckCircle,
  ArrowLeft,
  MoreHorizontal,
} from "lucide-react";
import { Logo } from "../Logo";
import { BottomNavigation } from "../BottomNavigation";
import { useTrips } from "@/app/context/TripsContext";

export function Perfil() {
  const { trips } = useTrips();

  const menuItems = [
    {
      icon: Settings,
      label: "Configurações",
      description: "Preferências do aplicativo",
    },
    {
      icon: HelpCircle,
      label: "Ajuda e Suporte",
      description: "Central de ajuda",
    },
  ];

  // Calcular estatísticas reais
  const totalTrips = trips.length;
  const completedTrips = trips.filter(
    (trip) => trip.progress === 100,
  ).length;
  const totalTasks = trips.reduce(
    (sum, trip) => sum + trip.tasks.length,
    0,
  );

  const stats = [
    { label: "Viagens", value: totalTrips.toString() },
    { label: "Concluídas", value: completedTrips.toString() },
    { label: "Tarefas", value: totalTasks.toString() },
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
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <User className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl mb-1">Maria Silva</h2>
              <p className="text-white/90 text-sm">
                maria.silva@email.com
              </p>
            </div>
          </div>

          <div className="flex justify-around pt-4 border-t border-white/20">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-semibold mb-1">
                  {stat.value}
                </p>
                <p className="text-white/90 text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                  index !== menuItems.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                <div className="p-2 bg-sky-100 text-sky-500 rounded-lg">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{item.label}</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    {item.description}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            );
          })}
        </div>

        {/* Support Message */}
        <div className="bg-sky-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-700 text-center">
            Precisa de ajuda para organizar sua viagem?
            <br />
            <button className="text-sky-500 font-medium mt-1">
              Fale com nosso time
            </button>
          </p>
        </div>

        {/* Logout */}
        <button className="w-full flex items-center justify-center gap-2 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
          <LogOut className="w-5 h-5" />
          <span>Sair da conta</span>
        </button>
      </main>

      <BottomNavigation activeTab="profile" />
    </div>
  );
}