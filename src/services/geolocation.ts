/**
 * Serviço de Geolocalização
 * Gerencia localização do usuário e conversão para cidade
 */

interface GeolocationPosition {
  latitude: number;
  longitude: number;
}

interface CityInfo {
  city: string;
  state: string;
  country: string;
  fullName: string;
}

/**
 * Solicita permissão e obtém localização do usuário
 */
export async function getUserLocation(): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('[Geolocation] Geolocalização não suportada pelo navegador');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        // Não logar erro se for por política de permissões (muito comum em iframes/embeds)
        if (error.code === error.PERMISSION_DENIED) {
          console.warn('[Geolocation] Permissão de localização negada ou bloqueada por política');
        } else {
          console.warn('[Geolocation] Erro ao obter localização:', error.message);
        }
        resolve(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000 // 5 minutos
      }
    );
  });
}

/**
 * Converte coordenadas em nome de cidade usando Nominatim (gratuito)
 */
export async function getCityFromCoordinates(
  latitude: number,
  longitude: number
): Promise<CityInfo | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=pt-BR`,
      {
        headers: {
          'User-Agent': 'PlanejeFacil/1.0'
        }
      }
    );

    if (!response.ok) {
      console.warn('[Geolocation] Erro ao buscar cidade:', response.status);
      return null;
    }

    const data = await response.json();
    
    const city = data.address?.city || 
                 data.address?.town || 
                 data.address?.village || 
                 data.address?.state ||
                 'Desconhecido';
    const state = data.address?.state || '';
    const country = data.address?.country || 'Brasil';

    return {
      city,
      state,
      country,
      fullName: state ? `${city}, ${state}` : city
    };
  } catch (error) {
    console.warn('[Geolocation] Erro ao converter coordenadas:', error);
    return null;
  }
}

/**
 * Obtém cidade do usuário (com permissão de localização)
 */
export async function getUserCity(): Promise<CityInfo | null> {
  const location = await getUserLocation();
  
  if (!location) {
    return null;
  }

  return await getCityFromCoordinates(location.latitude, location.longitude);
}

/**
 * Salva cidade de origem do usuário no localStorage
 */
export function saveOriginCity(city: string): void {
  try {
    localStorage.setItem('user_origin_city', city);
    console.log('[Geolocation] Cidade de origem salva:', city);
  } catch (error) {
    console.error('[Geolocation] Erro ao salvar cidade:', error);
  }
}

/**
 * Recupera cidade de origem salva
 */
export function getSavedOriginCity(): string | null {
  try {
    return localStorage.getItem('user_origin_city');
  } catch (error) {
    console.error('[Geolocation] Erro ao recuperar cidade:', error);
    return null;
  }
}

/**
 * Remove cidade de origem salva
 */
export function clearOriginCity(): void {
  try {
    localStorage.removeItem('user_origin_city');
  } catch (error) {
    console.error('[Geolocation] Erro ao limpar cidade:', error);
  }
}