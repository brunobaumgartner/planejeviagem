import {
  ArrowLeft,
  RotateCcw,
  Share,
  MoreHorizontal,
} from "lucide-react";
import { SearchBar } from "../SearchBar";
import { CategorySection } from "../CategorySection";
import { TravelCard } from "../TravelCard";
import { BottomNavigation } from "../BottomNavigation";
import { ScrollableSection } from "../ScrollableSection";
import { Logo } from "../Logo";
import { useNavigation } from "@/app/context/NavigationContext";

export function Home() {
  const { setCurrentScreen } = useNavigation();

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
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

      {/* Main Content */}
      <main className="px-4 pt-6">
        {/* Search Bar */}
        {/* <div className="mb-8">
          <SearchBar placeholder="Para onde você quer ir ou quanto quer gastar?" />
        </div> */}

        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-2xl mb-2">
            Viajar pode ser leve. Planejar também.
          </h1>
          <p className="text-sm text-gray-600">
            Organize sua viagem no seu tempo, do seu jeito e
            dentro do seu orçamento.
          </p>
        </div>

        {/* SEÇÕES ESTÁTICAS OCULTAS TEMPORARIAMENTE */}
        {/* Pacotes, Voos, Hotéis e Veículos serão substituídos por APIs reais futuramente */}

        {/* Call to Action */}
        <div className="text-center py-12 px-4 bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            ✈️ Comece a planejar sua viagem
          </h2>
          <p className="text-gray-700 mb-6 max-w-md mx-auto">
            Use nossa calculadora inteligente para descobrir quanto vai custar sua próxima aventura.
          </p>
          <button
            onClick={() => setCurrentScreen("trips")}
            className="bg-sky-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-sky-600 transition-colors inline-flex items-center gap-2 shadow-md"
          >
            Calcular orçamento →
          </button>
        </div>

        {/* Support Message */}
        <div className="text-center py-8 px-4 bg-gray-50 rounded-lg mb-6">
          <p className="text-gray-700">
            Você pode explorar tudo gratuitamente.
            <br />
            Se quiser ajuda, a gente organiza com você.
          </p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="home" />
    </div>
  );
}