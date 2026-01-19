import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Plane,
  Hotel,
  Car,
  Star,
  MoreHorizontal,
} from "lucide-react";
import { BottomNavigation } from "../BottomNavigation";
import { Logo } from "../Logo";
import { useNavigation } from "@/app/context/NavigationContext";

interface TravelPackage {
  id: number;
  destination: string;
  country: string;
  imageUrl: string;
  duration: string;
  price: number;
  currency: string;
  rating: number;
  reviews: number;
  highlights: string[];
  includes: {
    flights: boolean;
    hotel: boolean;
    car: boolean;
    meals: boolean;
  };
  travelers: string;
  category: string;
}

export function TravelPackages() {
  const { setCurrentScreen } = useNavigation();

  // Mock data - será substituído por dados de APIs
  const packages: TravelPackage[] = [
    {
      id: 1,
      destination: "Paris",
      country: "França",
      imageUrl:
        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
      duration: "5 dias, 4 noites",
      price: 3500,
      currency: "BRL",
      rating: 4.8,
      reviews: 234,
      highlights: ["Torre Eiffel", "Louvre", "Versalhes"],
      includes: {
        flights: true,
        hotel: true,
        car: false,
        meals: true,
      },
      travelers: "2 adultos",
      category: "Romance",
    },
    {
      id: 2,
      destination: "Tóquio",
      country: "Japão",
      imageUrl:
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
      duration: "7 dias, 6 noites",
      price: 5800,
      currency: "BRL",
      rating: 4.9,
      reviews: 189,
      highlights: ["Templo Sensoji", "Monte Fuji", "Shibuya"],
      includes: {
        flights: true,
        hotel: true,
        car: false,
        meals: false,
      },
      travelers: "2 adultos",
      category: "Cultura",
    },
    {
      id: 3,
      destination: "Cancún",
      country: "México",
      imageUrl:
        "https://images.unsplash.com/photo-1518638150340-f706e86654de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
      duration: "4 dias, 3 noites",
      price: 2800,
      currency: "BRL",
      rating: 4.7,
      reviews: 456,
      highlights: [
        "Praias paradisíacas",
        "Chichen Itzá",
        "Tulum",
      ],
      includes: {
        flights: true,
        hotel: true,
        car: true,
        meals: true,
      },
      travelers: "2 adultos",
      category: "Praia",
    },
    {
      id: 4,
      destination: "Roma",
      country: "Itália",
      imageUrl:
        "https://images.unsplash.com/photo-1552832230-c0197dd311b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
      duration: "6 dias, 5 noites",
      price: 4200,
      currency: "BRL",
      rating: 4.9,
      reviews: 312,
      highlights: ["Coliseu", "Vaticano", "Fontana di Trevi"],
      includes: {
        flights: true,
        hotel: true,
        car: false,
        meals: true,
      },
      travelers: "2 adultos",
      category: "História",
    },
    {
      id: 5,
      destination: "Dubai",
      country: "Emirados Árabes",
      imageUrl:
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
      duration: "5 dias, 4 noites",
      price: 6500,
      currency: "BRL",
      rating: 4.8,
      reviews: 278,
      highlights: ["Burj Khalifa", "Safari no deserto", "Mall"],
      includes: {
        flights: true,
        hotel: true,
        car: true,
        meals: false,
      },
      travelers: "2 adultos",
      category: "Luxo",
    },
    {
      id: 6,
      destination: "Buenos Aires",
      country: "Argentina",
      imageUrl:
        "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
      duration: "4 dias, 3 noites",
      price: 1800,
      currency: "BRL",
      rating: 4.6,
      reviews: 167,
      highlights: ["Tango", "Caminito", "Puerto Madero"],
      includes: {
        flights: true,
        hotel: true,
        car: false,
        meals: false,
      },
      travelers: "2 adultos",
      category: "Cultura",
    },
  ];

  const categories = [
    "Todos",
    "Romance",
    "Praia",
    "Cultura",
    "História",
    "Luxo",
    "Aventura",
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
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
      <main>
        {/* Hero Section */}
        <div className="bg-white px-4 pt-6 pb-4">
          <h1 className="text-2xl mb-2">Modelos de Viagens</h1>
          <p className="text-sm text-gray-600 mb-4">
            Pacotes prontos com custos aproximados para você
            adaptar
          </p>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  category === "Todos"
                    ? "bg-sky-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Info Banner */}
        <div className="mx-4 my-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-900">
            💡 <strong>Dica:</strong> Os preços são aproximados
            e podem variar. Use como referência para planejar
            seu orçamento.
          </p>
        </div>

        {/* Packages Grid */}
        <div className="px-4 space-y-4 pb-6">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} package={pkg} />
          ))}
        </div>

        {/* API Info Footer */}
        <div className="mx-4 mb-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-600 text-center mb-2">
            Informações atualizadas em tempo real
          </p>
          <div className="flex justify-center gap-4 text-xs text-gray-500">
            <span>🌤️ Clima</span>
            <span>💱 Câmbio</span>
            <span>📍 Mapas</span>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="home" />
    </div>
  );
}

function PackageCard({
  package: pkg,
}: {
  package: TravelPackage;
}) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative h-48">
        <img
          src={pkg.imageUrl}
          alt={pkg.destination}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow-md">
          <span className="text-xs font-medium text-gray-700">
            {pkg.category}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h3 className="text-xl text-white mb-1">
            {pkg.destination}
          </h3>
          <div className="flex items-center gap-1 text-white/90 text-sm">
            <MapPin className="w-3 h-3" />
            <span>{pkg.country}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">
              {pkg.rating}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            ({pkg.reviews} avaliações)
          </span>
        </div>

        {/* Duration and Travelers */}
        <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{pkg.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{pkg.travelers}</span>
          </div>
        </div>

        {/* Highlights */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">
            Principais atrações:
          </p>
          <div className="flex flex-wrap gap-1">
            {pkg.highlights.map((highlight, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
              >
                {highlight}
              </span>
            ))}
          </div>
        </div>

        {/* Includes */}
        <div className="flex gap-3 mb-4 pb-4 border-b border-gray-100">
          <div
            className={`flex items-center gap-1 text-xs ${pkg.includes.flights ? "text-green-600" : "text-gray-300"}`}
          >
            <Plane className="w-4 h-4" />
            <span>Voo</span>
          </div>
          <div
            className={`flex items-center gap-1 text-xs ${pkg.includes.hotel ? "text-green-600" : "text-gray-300"}`}
          >
            <Hotel className="w-4 h-4" />
            <span>Hotel</span>
          </div>
          <div
            className={`flex items-center gap-1 text-xs ${pkg.includes.car ? "text-green-600" : "text-gray-300"}`}
          >
            <Car className="w-4 h-4" />
            <span>Carro</span>
          </div>
          <div
            className={`flex items-center gap-1 text-xs ${pkg.includes.meals ? "text-green-600" : "text-gray-300"}`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Refeições</span>
          </div>
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">A partir de</p>
            <p className="text-2xl text-sky-600">
              R$ {pkg.price.toLocaleString("pt-BR")}
            </p>
            <p className="text-xs text-gray-500">por pessoa</p>
          </div>
          <button className="bg-sky-500 text-white px-6 py-3 rounded-lg hover:bg-sky-600 transition-colors">
            Ver detalhes
          </button>
        </div>
      </div>
    </div>
  );
}