import { useEffect, useState } from "react";
import { useTrips } from "@/app/context/TripsContext";
import type { Trip } from "@/types";
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface SharedTripData {
  trip: Trip | null;
  shareToken: string;
  shouldShowModal: boolean;
}

export function useSharedTrip(): SharedTripData {
  const { trips } = useTrips();
  const [sharedTripData, setSharedTripData] = useState<SharedTripData>({
    trip: null,
    shareToken: "",
    shouldShowModal: false
  });

  useEffect(() => {
    // Função para processar o hash
    const processHash = async () => {
      // Verificar hash da URL (formato: #share=TOKEN&tripId=ID)
      const hash = window.location.hash.substring(1); // Remove o #
      const params = new URLSearchParams(hash);
      const shareToken = params.get('share');
      const tripId = params.get('tripId');

      console.log('[useSharedTrip] Detectando link:', { hash, shareToken, tripId });

      if (shareToken && tripId) {
        // Verificar se já aceitou essa viagem antes
        const shareInfo = localStorage.getItem(`share_${shareToken}`);
        if (shareInfo) {
          console.log('[useSharedTrip] Viagem já foi aceita anteriormente');
          // Já aceitou, não mostrar modal novamente
          return;
        }

        // Tentar buscar do backend PRIMEIRO
        try {
          console.log('[useSharedTrip] Buscando viagem do backend...');
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/shared-trips/${tripId}`,
            {
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`
              }
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log('[useSharedTrip] ✅ Viagem encontrada no backend:', data.trip);
            setSharedTripData({
              trip: data.trip,
              shareToken: shareToken,
              shouldShowModal: true
            });
            return;
          }
        } catch (error) {
          console.error('[useSharedTrip] Erro ao buscar do backend:', error);
        }

        // Fallback: Tentar carregar do localStorage
        const cachedTrip = localStorage.getItem(`shared_trip_${tripId}`);
        
        if (cachedTrip) {
          try {
            const trip = JSON.parse(cachedTrip);
            console.log('[useSharedTrip] ✅ Viagem encontrada no cache local:', trip);
            setSharedTripData({
              trip: trip,
              shareToken: shareToken,
              shouldShowModal: true
            });
            return;
          } catch (error) {
            console.error('[useSharedTrip] Erro ao carregar viagem do cache:', error);
          }
        }

        // Se não encontrou no backend nem no cache, buscar nas viagens existentes
        const originalTrip = trips.find(t => t.id === tripId);
        
        if (originalTrip) {
          console.log('[useSharedTrip] ✅ Viagem encontrada nas viagens existentes:', originalTrip);
          setSharedTripData({
            trip: originalTrip,
            shareToken: shareToken,
            shouldShowModal: true
          });
        } else {
          console.error('[useSharedTrip] ❌ Viagem não encontrada:', tripId);
        }
      }
    };

    // Processar na montagem
    processHash();

    // Escutar mudanças no hash
    window.addEventListener('hashchange', processHash);
    
    return () => {
      window.removeEventListener('hashchange', processHash);
    };
  }, [trips]);

  return sharedTripData;
}