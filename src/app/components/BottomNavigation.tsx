import { Home, CheckSquare, Map, User } from "lucide-react";
import { useNavigation } from "@/app/context/NavigationContext";

interface BottomNavigationProps {
  activeTab?: "home" | "trips" | "itinerary" | "profile";
}

export function BottomNavigation({ activeTab }: BottomNavigationProps) {
  const { currentScreen, setCurrentScreen } = useNavigation();
  const active = activeTab || currentScreen;

  const navItems = [
    { id: "home" as const, icon: Home, label: "Explorar" },
    { id: "trips" as const, icon: CheckSquare, label: "Minhas viagens" },
    { id: "itinerary" as const, icon: Map, label: "Roteiro" },
    { id: "profile" as const, icon: User, label: "Minha conta" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 max-w-md mx-auto">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.label}
              onClick={() => setCurrentScreen(item.id)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive ? "text-sky-500" : "text-gray-400"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}