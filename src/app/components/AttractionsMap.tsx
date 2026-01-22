/**
 * ATTRACTIONS MAP COMPONENT
 * 
 * Mapa interativo com pontos turísticos usando Leaflet (OpenStreetMap).
 * Usa Overpass API via internationalService.
 * 
 * Features:
 * ✅ Mapa interativo
 * ✅ Markers de pontos turísticos
 * ✅ Popup com informações
 * ✅ Filtros por tipo
 * ✅ Loading states
 * ✅ Fallback se não carregar
 * 
 * @example
 * <AttractionsMap
 *   center={[48.8566, 2.3522]} // Paris
 *   onAttractionClick={(attraction) => console.log(attraction)}
 * />
 */

import { useEffect, useRef, useState } from 'react';
import { MapPin, Filter, X } from 'lucide-react';
import type { TouristAttraction, ItineraryDay } from '@/types';
import { getAttractions } from '@/services/internationalService';

// Importar Leaflet dinamicamente para evitar erro SSR
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';

interface AttractionsMapProps {
  center: [number, number]; // [lat, lon]
  radius?: number; // Raio em metros (padrão: 5000m)
  zoom?: number; // Nível de zoom inicial
  onAttractionClick?: (attraction: TouristAttraction) => void;
  className?: string;
  itinerary?: ItineraryDay[]; // Lista de dias da viagem
  onAddToDay?: (attraction: TouristAttraction, dayIndex: number) => void; // Callback para adicionar
}

const ATTRACTION_TYPES = [
  { key: 'all', label: 'Todos', icon: '🗺️' },
  { key: 'museum', label: 'Museus', icon: '🏛️' },
  { key: 'monument', label: 'Monumentos', icon: '🗿' },
  { key: 'attraction', label: 'Atrações', icon: '⭐' },
  { key: 'viewpoint', label: 'Mirantes', icon: '👁️' },
  { key: 'gallery', label: 'Galerias', icon: '🎨' },
  { key: 'theme_park', label: 'Parques', icon: '🎢' },
];

export function AttractionsMap({
  center,
  radius = 10000, // Aumentado para 10km para pegar mais atrações
  zoom = 13,
  onAttractionClick,
  className = '',
  itinerary,
  onAddToDay,
}: AttractionsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);
  
  const [attractions, setAttractions] = useState<TouristAttraction[]>([]);
  const [filteredAttractions, setFilteredAttractions] = useState<TouristAttraction[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Carregar Leaflet CSS e JS
  useEffect(() => {
    // Adicionar CSS do Leaflet
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Carregar Leaflet JS
    import('leaflet').then(() => {
      setLeafletLoaded(true);
    });

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Carregar atrações
  useEffect(() => {
    loadAttractions();
  }, [center, radius]);

  // Filtrar atrações por tipo
  useEffect(() => {
    if (selectedType === 'all') {
      setFilteredAttractions(attractions);
    } else {
      setFilteredAttractions(attractions.filter(a => a.type === selectedType));
    }
  }, [selectedType, attractions]);

  // Inicializar mapa
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || leafletMapRef.current) return;

    import('leaflet').then(L => {
      if (!mapRef.current) return;

      // Criar mapa
      const map = L.default.map(mapRef.current).setView(center, zoom);

      // Adicionar camada de tiles (OpenStreetMap)
      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      leafletMapRef.current = map;
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [leafletLoaded]);

  // Atualizar markers no mapa
  useEffect(() => {
    if (!leafletMapRef.current || !leafletLoaded) return;

    import('leaflet').then(L => {
      const map = leafletMapRef.current;
      if (!map) return;

      // Remover markers antigos
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Adicionar novos markers
      filteredAttractions.forEach(attraction => {
        // Criar conteúdo do popup
        let popupContent = `
          <div class="p-3 min-w-[200px]">
            <h3 class="font-bold text-base mb-1">${attraction.name}</h3>
            <p class="text-sm text-gray-600 mb-2">${getAttractionTypeLabel(attraction.type)}</p>
            ${attraction.address ? `<p class="text-xs text-gray-500 mb-1">📍 ${attraction.address}</p>` : ''}
            ${attraction.openingHours ? `<p class="text-xs text-gray-500 mb-1">🕒 ${attraction.openingHours}</p>` : ''}
            ${attraction.website ? `<a href="${attraction.website}" target="_blank" class="text-xs text-blue-500 hover:underline block mb-2">🌐 Website</a>` : ''}
        `;

        // Adicionar botões de dias se disponível
        if (itinerary && itinerary.length > 0 && onAddToDay) {
          popupContent += `
            <div class="mt-3 pt-3 border-t border-gray-200">
              <p class="text-xs font-medium text-gray-700 mb-2">📅 Adicionar ao roteiro:</p>
              <div class="flex flex-wrap gap-1.5">
          `;
          
          itinerary.forEach((day, dayIndex) => {
            popupContent += `
              <button 
                onclick="window.addAttractionToDay(${dayIndex}, '${attraction.name}', '${attraction.type}', ${attraction.lat}, ${attraction.lon})"
                class="px-2.5 py-1 bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium rounded-md transition-colors"
              >
                Dia ${day.day}
              </button>
            `;
          });
          
          popupContent += `
              </div>
            </div>
          `;
        }

        popupContent += `</div>`;

        const marker = L.default.marker([attraction.lat, attraction.lon])
          .addTo(map)
          .bindPopup(popupContent);

        marker.on('click', () => {
          if (onAttractionClick) {
            onAttractionClick(attraction);
          }
        });

        markersRef.current.push(marker);
      });

      // Registrar função global para adicionar atração
      if (onAddToDay) {
        (window as any).addAttractionToDay = (dayIndex: number, name: string, type: string, lat: number, lon: number) => {
          const attraction: TouristAttraction = {
            name,
            type,
            lat,
            lon,
          };
          onAddToDay(attraction, dayIndex);
          console.log(`✅ Atração "${name}" adicionada ao Dia ${dayIndex + 1}`);
        };
      }

      // Ajustar zoom para mostrar todos os markers
      if (filteredAttractions.length > 0) {
        const bounds = L.default.latLngBounds(
          filteredAttractions.map(a => [a.lat, a.lon] as [number, number])
        );
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    });
  }, [filteredAttractions, leafletLoaded]);

  async function loadAttractions() {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getAttractions(center[0], center[1], radius);
      setAttractions(data);
      setFilteredAttractions(data);
      
      // Se não houver atrações, não é um erro - apenas informativo
      if (data.length === 0) {
        console.log('[AttractionsMap] ℹ️ Nenhuma atração encontrada nesta região');
      }
    } catch (err: any) {
      // Erro real - apenas log, sem mostrar erro na UI
      console.log('[AttractionsMap] ℹ️ Não foi possível carregar atrações');
      setAttractions([]);
      setFilteredAttractions([]);
    } finally {
      setLoading(false);
    }
  }

  function getAttractionTypeLabel(type: string): string {
    const found = ATTRACTION_TYPES.find(t => t.key === type);
    return found ? `${found.icon} ${found.label}` : type;
  }

  if (!leafletLoaded) {
    return (
      <div className={`bg-gray-100 rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <div className="text-gray-600">Carregando mapa...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Filtros */}
      <div className="absolute top-4 left-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filtrar por tipo:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {ATTRACTION_TYPES.map(type => (
            <button
              key={type.key}
              onClick={() => setSelectedType(type.key)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${selectedType === type.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {type.icon} {type.label}
            </button>
          ))}
        </div>
        {filteredAttractions.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            {filteredAttractions.length} {filteredAttractions.length === 1 ? 'atração encontrada' : 'atrações encontradas'}
          </div>
        )}
      </div>

      {/* Loading/Error Overlay */}
      {(loading || error) && (
        <div className="absolute inset-0 z-[1001] bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center">
          {loading ? (
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
              <div className="text-gray-700 font-medium">Buscando pontos turísticos...</div>
            </div>
          ) : error ? (
            <div className="text-center max-w-sm">
              <div className="text-red-500 text-4xl mb-2">❌</div>
              <div className="text-gray-900 font-medium mb-2">{error}</div>
              <button
                onClick={loadAttractions}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* Mapa */}
      <div
        ref={mapRef}
        className="w-full h-full min-h-[400px] rounded-xl overflow-hidden"
      />
    </div>
  );
}