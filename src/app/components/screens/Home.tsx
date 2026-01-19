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

  // Mock data for demonstrations
  const flights = [
    {
      id: 1,
      imageUrl:
        "https://images.unsplash.com/photo-1574444851660-e549a835d4ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    },
    {
      id: 2,
      imageUrl:
        "https://images.unsplash.com/photo-1574444851660-e549a835d4ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    },
    {
      id: 3,
      imageUrl:
        "https://images.unsplash.com/photo-1574444851660-e549a835d4ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    },
    {
      id: 4,
      imageUrl:
        "https://images.unsplash.com/photo-1574444851660-e549a835d4ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    },
  ];

  const hotels = [
    {
      id: 1,
      imageUrl:
        "https://images.unsplash.com/photo-1731336478850-6bce7235e320?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    },
    {
      id: 2,
      imageUrl:
        "https://images.unsplash.com/photo-1731336478850-6bce7235e320?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    },
    {
      id: 3,
      imageUrl:
        "https://images.unsplash.com/photo-1731336478850-6bce7235e320?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    },
    {
      id: 4,
      imageUrl:
        "https://images.unsplash.com/photo-1731336478850-6bce7235e320?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    },
  ];

  const vehicles = [
    {
      id: 1,
      imageUrl:
        "https://images.unsplash.com/photo-1760976396211-5546ce83a400?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    },
    {
      id: 2,
      imageUrl:
        "https://images.unsplash.com/photo-1760976396211-5546ce83a400?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    },
    {
      id: 3,
      imageUrl:
        "https://images.unsplash.com/photo-1760976396211-5546ce83a400?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    },
    {
      id: 4,
      imageUrl:
        "https://images.unsplash.com/photo-1760976396211-5546ce83a400?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    },
  ];

  const packages = [
    {
      id: 1,
      imageUrl:
        "https://images.unsplash.com/photo-1706208224221-0944db693705?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    },
    {
      id: 2,
      imageUrl:
        "https://images.unsplash.com/photo-1706208224221-0944db693705?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    },
    {
      id: 3,
      imageUrl:
        "https://images.unsplash.com/photo-1706208224221-0944db693705?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    },
    {
      id: 4,
      imageUrl:
        "https://images.unsplash.com/photo-1706208224221-0944db693705?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    },
  ];

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
        <div className="mb-8">
          <SearchBar placeholder="Para onde você quer ir ou quanto quer gastar?" />
        </div>

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

        {/* Packages Section - Com botão para ver todos */}
        <CategorySection
          title="Pacotes prontos"
          subtitle="Ideias de viagens já organizadas para você adaptar"
          actionButton={
            <button
              onClick={() => setCurrentScreen("packages")}
              className="text-sm text-sky-600 hover:text-sky-700 font-medium"
            >
              Ver todos →
            </button>
          }
        >
          <ScrollableSection>
            {packages.map((pkg) => (
              <TravelCard
                key={pkg.id}
                imageUrl={pkg.imageUrl}
              />
            ))}
          </ScrollableSection>
        </CategorySection>
        {/* Flights Section */}
        <CategorySection
          title="Voos"
          subtitle="Compare opções e entenda o custo da viagem"
        >
          <ScrollableSection>
            {flights.map((flight) => (
              <TravelCard
                key={flight.id}
                imageUrl={flight.imageUrl}
              />
            ))}
          </ScrollableSection>
        </CategorySection>

        {/* Hotels Section */}
        <CategorySection
          title="Hotéis"
          subtitle="Veja opções de hospedagem para o seu estilo e orçamento"
        >
          <ScrollableSection>
            {hotels.map((hotel) => (
              <TravelCard
                key={hotel.id}
                imageUrl={hotel.imageUrl}
              />
            ))}
          </ScrollableSection>
        </CategorySection>

        {/* Vehicles Section */}
        <CategorySection
          title="Veículos"
          subtitle="Aluguel de carros e transporte no destino"
        >
          <ScrollableSection>
            {vehicles.map((vehicle) => (
              <TravelCard
                key={vehicle.id}
                imageUrl={vehicle.imageUrl}
              />
            ))}
          </ScrollableSection>
        </CategorySection>

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