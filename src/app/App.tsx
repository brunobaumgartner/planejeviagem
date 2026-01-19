import { useState, useEffect } from "react";
import { SplashScreen } from "./components/SplashScreen";
import { Home } from "./components/screens/Home";
import { MinhasViagens } from "./components/screens/MinhasViagens";
import { Roteiro } from "./components/screens/Roteiro";
import { Perfil } from "./components/screens/Perfil";
import { TravelPackages } from "./components/screens/TravelPackages";
import { NavigationProvider, useNavigation } from "./context/NavigationContext";
import { TripsProvider } from "./context/TripsContext";

import { useAutenticacao } from "../hooks/useAutenticacao";


function AppContent() {
  const { currentScreen, navigate } = useNavigation();
  const { usuario, carregando } = useAutenticacao();

  if (carregando) {
    return <p>Carregando...</p>;
  }

  switch (currentScreen) {
    case "packages":
      return <TravelPackages />;

    case "trips":
      return <MinhasViagens />;

    case "itinerary":
      // 🔒 SOMENTE USUÁRIO LOGADO
      if (!usuario) {
        navigate("profile");
        return null;
      }
      return <Roteiro />;

    case "profile":
      return <Perfil />;

    default:
      return <Home />;
  }
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <NavigationProvider>
      <TripsProvider>
        <AppContent />
      </TripsProvider>
    </NavigationProvider>
  );
}