import { Home, CheckSquare, Map, User } from "lucide-react";
import { useNavigation } from "@/app/context/NavigationContext";
import { Logo } from "./Logo";
import { NotificationBell } from "./NotificationBell";
import { useAuth } from "@/app/context/AuthContext";

interface TopNavigationProps {
  activeTab?: "home" | "trips" | "itinerary" | "profile";
}

export function TopNavigation({ activeTab }: TopNavigationProps) {
  const { currentScreen, setCurrentScreen } = useNavigation();
  const { user, isGuest } = useAuth();
  const active = activeTab || currentScreen;

  const navItems = [
    { id: "home" as const, icon: Home, label: "Início" },
    { id: "trips" as const, icon: CheckSquare, label: "Minhas viagens" },
    { id: "itinerary" as const, icon: Map, label: "Roteiro" },
    { id: "profile" as const, icon: User, label: "Minha conta" },
  ];

  return (
    <nav className="hidden lg:block sticky top-0 bg-white border-b border-gray-200 z-20 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo à esquerda */}
          <div className="flex-shrink-0">
            <Logo size={32} variant="full" className="text-sky-500" />
          </div>

          {/* Menu central */}
          <div className="flex items-center gap-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <button
                  key={item.label}
                  onClick={() => setCurrentScreen(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "text-sky-500 bg-sky-50 font-medium"
                      : "text-gray-600 hover:text-sky-500 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Notificações e usuário à direita */}
          <div className="flex items-center gap-4">
            <NotificationBell />
            {!isGuest && user && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="text-sm text-gray-700 max-w-[120px] truncate">
                  {user?.name || "Usuário"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
