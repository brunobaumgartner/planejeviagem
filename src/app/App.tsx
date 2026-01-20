import { useState, useEffect } from "react";
import { Home } from "./components/screens/Home";
import { TravelPackages } from "./components/screens/TravelPackages";
import { MinhasViagens } from "./components/screens/MinhasViagens";
import { Roteiro } from "./components/screens/Roteiro";
import { Perfil } from "./components/screens/Perfil";
import { Login } from "./components/screens/Login";
import { Signup } from "./components/screens/Signup";
import { ForgotPassword } from "./components/screens/ForgotPassword";
import { ResetPassword } from "./components/screens/ResetPassword";
import { ChecklistBagagem } from "./components/screens/ChecklistBagagem";
import { SplashScreen } from "./components/SplashScreen";
import { PaymentCallback } from "./components/screens/PaymentCallback";
import { Admin } from "./components/screens/Admin";
import { TestHelper } from "./components/TestHelper";
import { AcceptSharedTripModal } from "./components/AcceptSharedTripModal";
import { NavigationProvider, useNavigation } from "./context/NavigationContext";
import { TripsProvider } from "./context/TripsContext";
import { AuthProvider } from "./context/AuthContext";
import { NotificationsProvider } from "./context/NotificationsContext";
import { useSharedTrip } from "./hooks/useSharedTrip";

// Mostrar TestHelper apenas em desenvolvimento
const isDev = import.meta.env.DEV;

function AppContent() {
  const { currentScreen } = useNavigation();
  const sharedTripData = useSharedTrip();
  const [showSharedModal, setShowSharedModal] = useState(false);

  // Debug - adicionar banner visual quando detectar link
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && (hash.includes('share=') || hash.includes('tripId='))) {
      const info = `🔍 DEBUG: Hash detectado! ${hash}`;
      console.log(info);
      setDebugInfo(info);
    }
  }, []);

  // Debug
  useEffect(() => {
    console.log('[AppContent] sharedTripData:', sharedTripData);
    if (sharedTripData.trip) {
      setDebugInfo(`✅ Viagem encontrada: ${sharedTripData.trip.destination}`);
    }
  }, [sharedTripData]);

  // Mostrar modal quando detectar link compartilhado
  useEffect(() => {
    if (sharedTripData.shouldShowModal) {
      console.log('[AppContent] Mostrando modal de viagem compartilhada');
      setShowSharedModal(true);
      setDebugInfo(`📝 Modal será exibido para: ${sharedTripData.trip?.destination}`);
    }
  }, [sharedTripData.shouldShowModal]);

  // Detectar rotas de callback de pagamento via URL
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/payment-success') || 
        path.includes('/payment-failure') || 
        path.includes('/payment-pending')) {
      // Não fazer nada, deixar o switch abaixo renderizar
    }
  }, []);

  // Check URL for payment callbacks
  const path = window.location.pathname;
  const isPaymentCallback = path.includes('/payment-success') || 
                           path.includes('/payment-failure') || 
                           path.includes('/payment-pending');
  
  if (path.includes('/payment-success')) {
    return <PaymentCallback result="success" />;
  }
  if (path.includes('/payment-failure')) {
    return <PaymentCallback result="failure" />;
  }
  if (path.includes('/payment-pending')) {
    return <PaymentCallback result="pending" />;
  }

  return (
    <>
      {(() => {
        switch (currentScreen) {
          case "packages":
            return <TravelPackages />;
          case "trips":
            return <MinhasViagens />;
          case "itinerary":
            return <Roteiro />;
          case "checklist-bagagem":
            return <ChecklistBagagem />;
          case "profile":
            return <Perfil />;
          case "login":
            return <Login />;
          case "signup":
            return <Signup />;
          case "forgot-password":
            return <ForgotPassword />;
          case "reset-password":
            return <ResetPassword />;
          case "admin":
            return <Admin />;
          default:
            return <Home />;
        }
      })()}
      {isDev && !isPaymentCallback && <TestHelper />}
      {/* Modal de aceitar viagem compartilhada */}
      {showSharedModal && sharedTripData.trip && (
        <AcceptSharedTripModal 
          isOpen={showSharedModal}
          onClose={() => {
            setShowSharedModal(false);
            // Limpar hash da URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }}
          trip={sharedTripData.trip}
          shareToken={sharedTripData.shareToken}
        />
      )}
      {/* Banner de debug */}
      {debugInfo && (
        <div style={{ position: 'fixed', top: 10, left: 10, backgroundColor: 'yellow', padding: 10, zIndex: 1000 }}>
          {debugInfo}
        </div>
      )}
    </>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Debug logging
  console.log('[App] Component mounting...');
  console.log('[App] window.location:', {
    href: window.location.href,
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash
  });

  useEffect(() => {
    console.log('[App] useEffect running - will hide splash in 2.5s');
    const timer = setTimeout(() => {
      console.log('[App] Hiding splash screen');
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  console.log('[App] Rendering... showSplash:', showSplash);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <AuthProvider>
      <NavigationProvider>
        <TripsProvider>
          <NotificationsProvider>
            <AppContent />
          </NotificationsProvider>
        </TripsProvider>
      </NavigationProvider>
    </AuthProvider>
  );
}