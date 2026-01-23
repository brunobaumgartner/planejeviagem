import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook para obter geolocalização do usuário
 * Tenta usar a API de geolocalização do browser
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    city: null,
    loading: false,
    error: null,
  });

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocalização não suportada pelo navegador',
        loading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Tentar obter cidade usando Nominatim (OpenStreetMap)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            {
              headers: {
                'User-Agent': 'PlanejeFacil/1.0',
              },
            }
          );

          const data = await response.json();
          const city = data.address?.city || data.address?.town || data.address?.village || null;

          setState({
            latitude,
            longitude,
            city,
            loading: false,
            error: null,
          });
        } catch (error) {
          console.error('Erro ao obter cidade:', error);
          setState({
            latitude,
            longitude,
            city: null,
            loading: false,
            error: 'Não foi possível obter a cidade',
          });
        }
      },
      (error) => {
        let errorMessage = 'Erro ao obter localização';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            // Não mostrar erro no console se for bloqueio por política
            // (comum em iframes e ambientes embarcados)
            errorMessage = 'Permissão de localização negada';
            console.warn('[useGeolocation] Permissão negada ou bloqueada por política');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Localização não disponível';
            console.warn('[useGeolocation] Localização não disponível');
            break;
          case error.TIMEOUT:
            errorMessage = 'Tempo limite excedido';
            console.warn('[useGeolocation] Timeout ao obter localização');
            break;
          default:
            console.warn('[useGeolocation] Erro desconhecido:', error.message);
        }

        setState({
          latitude: null,
          longitude: null,
          city: null,
          loading: false,
          error: errorMessage,
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // Cache de 5 minutos
      }
    );
  };

  return {
    ...state,
    requestLocation,
  };
}