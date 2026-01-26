import { ExchangeSystem } from "./components/screens/ExchangeSystem";
import { Guide } from "./components/screens/Guide";
import { Signup } from "./components/screens/Signup";
import { Admin } from "./components/screens/Admin";
import { ForgotPassword } from "./components/screens/ForgotPassword";
import { ResetPassword } from "./components/screens/ResetPassword";
import { SplashScreen } from "./components/SplashScreen";
import { PaymentCallback } from "./components/screens/PaymentCallback";
import { useState, useEffect } from "react";
import { Home } from "./components/screens/Home";
import { TravelPackages } from "./components/screens/TravelPackages";
import { MinhasViagens } from "./components/screens/MinhasViagens";
import { Roteiro } from "./components/screens/Roteiro";
import { Perfil } from "./components/screens/Perfil";
import { Login } from "./components/screens/Login";
import { TestAuthButton } from "./components/TestAuthButton";
import { WikiGuideDemo } from "./components/WikiGuideDemo";
import { TripPlanner } from "./components/screens/TripPlanner";
import { NavigationProvider, useNavigation } from "./context/NavigationContext";
import { TripsProvider } from "./context/TripsContext";
import { AuthProvider } from "./context/AuthContext";
import { NotificationsProvider } from "./context/NotificationsContext";
import { useSharedTrip } from "./hooks/useSharedTrip";
import { AcceptSharedTripModal } from "./components/AcceptSharedTripModal";
import { TestHelper } from "./components/TestHelper";

// Mostrar TestHelper apenas em desenvolvimento
const isDev = import.meta.env.DEV;

function AppContent() {
  const { currentScreen, setCurrentScreen } = useNavigation();
  const sharedTripData = useSharedTrip();
  const [showSharedModal, setShowSharedModal] = useState(false);

  // Debug - adicionar banner visual quando detectar link
  const [debugInfo, setDebugInfo] = useState("");

  // Detectar pathname de reset de senha ou hash do Supabase
  useEffect(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    const fullUrl = window.location.href;
    
    console.log('[App] 🔍 Verificando URL para detecção de rotas especiais...');
    console.log('[App]   - Full URL:', fullUrl);
    console.log('[App]   - Pathname:', path);
    console.log('[App]   - Hash:', hash);
    
    // Detectar erro de link expirado/inválido no hash
    if (hash.includes('error=access_denied') || 
        hash.includes('error_code=otp_expired') ||
        hash.includes('error_description=Email')) {
      console.log('[App] ❌ Link de reset expirado ou inválido detectado');
      // Redirecionar para tela de reset com flag de erro
      setCurrentScreen('reset-password');
      return;
    }
    
    // Verificar se é um link de reset de senha (pathname ou hash com access_token)
    const isResetPassword = path.includes('/reset-password') || 
                           (hash.includes('access_token=') && hash.includes('type=recovery'));
    
    if (isResetPassword) {
      console.log('[App] 🔐 ✅ Link de reset de senha detectado - redirecionando para tela de reset...');
      console.log('[App] Pathname:', path);
      console.log('[App] Hash:', hash.substring(0, 100) + '...');
      setCurrentScreen('reset-password');
      return;
    }
    
    console.log('[App] ℹ️ Não é um link de reset de senha');
    
    // Detectar links de compartilhamento de viagem
    if (hash && (hash.includes('share=') || hash.includes('tripId='))) {
      const info = `🔍 DEBUG: Hash detectado! ${hash}`;
      console.log(info);
      setDebugInfo(info);
    }
  }, [setCurrentScreen]);

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
      <div className="w-full max-w-[80%] mx-auto lg:max-w-[80vw]">
        {(() => {
          switch (currentScreen) {
            case "packages":
              return <TravelPackages />;
            case "trips":
              return <MinhasViagens />;
            case "itinerary":
              return <Roteiro />;
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
            case "exchange":
              return <ExchangeSystem />;
            case "guide":
              return <Guide />;
            case "trip-planner":
              return <TripPlanner />;
            default:
              // Detectar hash #wiki-guide para mostrar demo da Feature 4
              if (window.location.hash === '#wiki-guide') {
                return <WikiGuideDemo />;
              }
              return <Home />;
          }
        })()}
      </div>
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