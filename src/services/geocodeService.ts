import { projectId, publicAnonKey } from '/utils/supabase/info';

export interface GeocodedCity {
  name: string;
  display_name: string;
  type: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country?: string;
  };
  lat: string;
  lon: string;
  importance?: number;
}

/**
 * Busca cidades usando Nominatim (OpenStreetMap Geocoding)
 * Nominatim é otimizado para autocomplete e busca de endereços
 * Overpass API é reservada para atrações turísticas e POIs
 */
export async function searchCities(query: string): Promise<GeocodedCity[]> {
  if (!query || query.length < 3) {
    return [];
  }

  try {
    // Usar a rota /api/geocode que usa Nominatim (rápida e otimizada para autocomplete)
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/api/geocode?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) {
      console.error('[Geocode Service] Erro na resposta:', response.status);
      return [];
    }

    const cities = await response.json();
    return cities || [];
  } catch (error) {
    console.error('[Geocode Service] Erro ao buscar cidades:', error);
    return [];
  }
}

/**
 * Formata o nome da cidade para exibição
 * Ex: "Nova Friburgo, Rio de Janeiro, Brasil"
 */
export function formatCityName(city: GeocodedCity): string {
  // Extrair informações limpas do objeto address
  const cityName = city.name;
  const state = city.address.state;
  const country = city.address.country;

  // Montar nome limpo: apenas Cidade, Estado, País
  const parts = [cityName];
  
  // Adicionar estado se existir e for diferente do nome da cidade
  if (state && state !== cityName) {
    parts.push(state);
  }
  
  // Sempre adicionar o país por último
  if (country) {
    parts.push(country);
  }

  return parts.join(', ');
}

/**
 * Extrai o nome do país da cidade
 */
export function getCountryFromCity(city: GeocodedCity): string {
  return city.address.country || '';
}