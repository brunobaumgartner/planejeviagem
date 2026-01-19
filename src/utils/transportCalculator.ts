/**
 * Sistema de cálculo dinâmico de transporte
 * Calcula custos baseado em origem, destino, época, tipo e classe
 */

import type { TransportType, FlightClass, BusClass } from '@/types';

// Coordenadas de 100+ cidades do mundo (6 continentes)
export const CITY_COORDINATES: Record<string, { lat: number; lng: number; state: string }> = {
  // Brasil
  'São Paulo': { lat: -23.5505, lng: -46.6333, state: 'SP' },
  'Rio de Janeiro': { lat: -22.9068, lng: -43.1729, state: 'RJ' },
  'Salvador': { lat: -12.9714, lng: -38.5014, state: 'BA' },
  'Florianópolis': { lat: -27.5954, lng: -48.5480, state: 'SC' },
  'Porto Alegre': { lat: -30.0346, lng: -51.2177, state: 'RS' },
  'Foz do Iguaçu': { lat: -25.5469, lng: -54.5882, state: 'PR' },
  'Gramado': { lat: -29.3789, lng: -50.8744, state: 'RS' },
  'Fortaleza': { lat: -3.7172, lng: -38.5433, state: 'CE' },
  'Recife': { lat: -8.0476, lng: -34.8770, state: 'PE' },
  'Natal': { lat: -5.7945, lng: -35.2110, state: 'RN' },
  'Maceió': { lat: -9.6658, lng: -35.7350, state: 'AL' },
  'João Pessoa': { lat: -7.1195, lng: -34.8450, state: 'PB' },
  'Belo Horizonte': { lat: -19.9167, lng: -43.9345, state: 'MG' },
  'Brasília': { lat: -15.8267, lng: -47.9218, state: 'DF' },
  'Curitiba': { lat: -25.4284, lng: -49.2733, state: 'PR' },
  'Manaus': { lat: -3.1190, lng: -60.0217, state: 'AM' },
  'Belém': { lat: -1.4558, lng: -48.5039, state: 'PA' },
  'São Luís': { lat: -2.5387, lng: -44.2825, state: 'MA' },
  'Goiânia': { lat: -16.6869, lng: -49.2648, state: 'GO' },
  'Guarulhos': { lat: -23.4538, lng: -46.5333, state: 'SP' },
  'Campinas': { lat: -22.9099, lng: -47.0626, state: 'SP' },
  'Vitória': { lat: -20.3155, lng: -40.3128, state: 'ES' },
  
  // Europa
  'Lisboa': { lat: 38.7223, lng: -9.1393, state: 'Portugal' },
  'Porto': { lat: 41.1579, lng: -8.6291, state: 'Portugal' },
  'Madrid': { lat: 40.4168, lng: -3.7038, state: 'Espanha' },
  'Barcelona': { lat: 41.3874, lng: 2.1686, state: 'Espanha' },
  'Paris': { lat: 48.8566, lng: 2.3522, state: 'França' },
  'Londres': { lat: 51.5074, lng: -0.1278, state: 'Reino Unido' },
  'Roma': { lat: 41.9028, lng: 12.4964, state: 'Itália' },
  'Milão': { lat: 45.4642, lng: 9.1900, state: 'Itália' },
  'Berlim': { lat: 52.5200, lng: 13.4050, state: 'Alemanha' },
  'Munique': { lat: 48.1351, lng: 11.5820, state: 'Alemanha' },
  'Amsterdã': { lat: 52.3676, lng: 4.9041, state: 'Holanda' },
  'Bruxelas': { lat: 50.8503, lng: 4.3517, state: 'Bélgica' },
  'Viena': { lat: 48.2082, lng: 16.3738, state: 'Áustria' },
  'Praga': { lat: 50.0755, lng: 14.4378, state: 'República Tcheca' },
  'Budapeste': { lat: 47.4979, lng: 19.0402, state: 'Hungria' },
  'Atenas': { lat: 37.9838, lng: 23.7275, state: 'Grécia' },
  'Dublin': { lat: 53.3498, lng: -6.2603, state: 'Irlanda' },
  'Copenhague': { lat: 55.6761, lng: 12.5683, state: 'Dinamarca' },
  'Estocolmo': { lat: 59.3293, lng: 18.0686, state: 'Suécia' },
  'Oslo': { lat: 59.9139, lng: 10.7522, state: 'Noruega' },
  'Helsinque': { lat: 60.1695, lng: 24.9354, state: 'Finlândia' },
  'Varsóvia': { lat: 52.2297, lng: 21.0122, state: 'Polônia' },
  'Zurique': { lat: 47.3769, lng: 8.5417, state: 'Suíça' },
  'Genebra': { lat: 46.2044, lng: 6.1432, state: 'Suíça' },
  
  // América do Norte
  'Nova York': { lat: 40.7128, lng: -74.0060, state: 'Estados Unidos' },
  'Los Angeles': { lat: 34.0522, lng: -118.2437, state: 'Estados Unidos' },
  'Chicago': { lat: 41.8781, lng: -87.6298, state: 'Estados Unidos' },
  'Miami': { lat: 25.7617, lng: -80.1918, state: 'Estados Unidos' },
  'São Francisco': { lat: 37.7749, lng: -122.4194, state: 'Estados Unidos' },
  'Las Vegas': { lat: 36.1699, lng: -115.1398, state: 'Estados Unidos' },
  'Washington': { lat: 38.9072, lng: -77.0369, state: 'Estados Unidos' },
  'Boston': { lat: 42.3601, lng: -71.0589, state: 'Estados Unidos' },
  'Seattle': { lat: 47.6062, lng: -122.3321, state: 'Estados Unidos' },
  'Orlando': { lat: 28.5383, lng: -81.3792, state: 'Estados Unidos' },
  'Toronto': { lat: 43.6532, lng: -79.3832, state: 'Canadá' },
  'Vancouver': { lat: 49.2827, lng: -123.1207, state: 'Canadá' },
  'Montreal': { lat: 45.5017, lng: -73.5673, state: 'Canadá' },
  'Cidade do México': { lat: 19.4326, lng: -99.1332, state: 'México' },
  'Cancún': { lat: 21.1619, lng: -86.8515, state: 'México' },
  'Guadalajara': { lat: 20.6597, lng: -103.3496, state: 'México' },
  
  // América do Sul
  'Buenos Aires': { lat: -34.6037, lng: -58.3816, state: 'Argentina' },
  'Córdoba': { lat: -31.4201, lng: -64.1888, state: 'Argentina' },
  'Mendoza': { lat: -32.8895, lng: -68.8458, state: 'Argentina' },
  'Santiago': { lat: -33.4489, lng: -70.6693, state: 'Chile' },
  'Lima': { lat: -12.0464, lng: -77.0428, state: 'Peru' },
  'Cusco': { lat: -13.5319, lng: -71.9675, state: 'Peru' },
  'Bogotá': { lat: 4.7110, lng: -74.0721, state: 'Colômbia' },
  'Cartagena': { lat: 10.3910, lng: -75.4794, state: 'Colômbia' },
  'Medellín': { lat: 6.2442, lng: -75.5812, state: 'Colômbia' },
  'Quito': { lat: -0.1807, lng: -78.4678, state: 'Equador' },
  'Montevidéu': { lat: -34.9011, lng: -56.1645, state: 'Uruguai' },
  'Caracas': { lat: 10.4806, lng: -66.9036, state: 'Venezuela' },
  'La Paz': { lat: -16.5000, lng: -68.1500, state: 'Bolívia' },
  
  // Ásia
  'Tóquio': { lat: 35.6762, lng: 139.6503, state: 'Japão' },
  'Osaka': { lat: 34.6937, lng: 135.5023, state: 'Japão' },
  'Kyoto': { lat: 35.0116, lng: 135.7681, state: 'Japão' },
  'Pequim': { lat: 39.9042, lng: 116.4074, state: 'China' },
  'Xangai': { lat: 31.2304, lng: 121.4737, state: 'China' },
  'Hong Kong': { lat: 22.3193, lng: 114.1694, state: 'China' },
  'Seul': { lat: 37.5665, lng: 126.9780, state: 'Coreia do Sul' },
  'Bangkok': { lat: 13.7563, lng: 100.5018, state: 'Tailândia' },
  'Singapura': { lat: 1.3521, lng: 103.8198, state: 'Singapura' },
  'Dubai': { lat: 25.2048, lng: 55.2708, state: 'Emirados Árabes' },
  'Abu Dhabi': { lat: 24.4539, lng: 54.3773, state: 'Emirados Árabes' },
  'Délhi': { lat: 28.7041, lng: 77.1025, state: 'Índia' },
  'Mumbai': { lat: 19.0760, lng: 72.8777, state: 'Índia' },
  'Istambul': { lat: 41.0082, lng: 28.9784, state: 'Turquia' },
  'Tel Aviv': { lat: 32.0853, lng: 34.7818, state: 'Israel' },
  'Jerusalém': { lat: 31.7683, lng: 35.2137, state: 'Israel' },
  
  // Oceania
  'Sydney': { lat: -33.8688, lng: 151.2093, state: 'Austrália' },
  'Melbourne': { lat: -37.8136, lng: 144.9631, state: 'Austrália' },
  'Brisbane': { lat: -27.4698, lng: 153.0251, state: 'Austrália' },
  'Auckland': { lat: -36.8485, lng: 174.7633, state: 'Nova Zelândia' },
  'Wellington': { lat: -41.2865, lng: 174.7762, state: 'Nova Zelândia' },
  
  // África
  'Cairo': { lat: 30.0444, lng: 31.2357, state: 'Egito' },
  'Cidade do Cabo': { lat: -33.9249, lng: 18.4241, state: 'África do Sul' },
  'Joanesburgo': { lat: -26.2041, lng: 28.0473, state: 'África do Sul' },
  'Marrakech': { lat: 31.6295, lng: -7.9811, state: 'Marrocos' },
  'Casablanca': { lat: 33.5731, lng: -7.5898, state: 'Marrocos' },
  'Nairobi': { lat: -1.2921, lng: 36.8219, state: 'Quênia' },
};

/**
 * Calcula distância entre duas cidades em km
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Determina se a data está em alta temporada
 */
function isHighSeason(date: string): boolean {
  const d = new Date(date);
  const month = d.getMonth() + 1; // 1-12
  const day = d.getDate();
  
  // Alta temporada no Brasil:
  // - Dezembro (15-31) e Janeiro completo (Verão + Férias)
  // - Fevereiro até Carnaval
  // - Julho completo (Férias de inverno)
  // - Feriados prolongados (Semana Santa, etc)
  
  if (month === 12 && day >= 15) return true;
  if (month === 1) return true;
  if (month === 2 && day <= 20) return true; // Aproximação do Carnaval
  if (month === 7) return true;
  
  return false;
}

/**
 * Calcula preço de passagem aérea
 */
function calculateFlightPrice(
  distance: number,
  flightClass: FlightClass,
  passengers: number,
  isHighSeason: boolean
): number {
  // Preço base por km (R$)
  let pricePerKm = 0.40;
  
  // Ajuste por classe
  if (flightClass === 'business') {
    pricePerKm *= 2.5; // Executiva é 2.5x mais cara
  }
  
  // Cálculo base
  let basePrice = distance * pricePerKm;
  
  // Taxa mínima para voos curtos
  if (distance < 500) {
    basePrice += 200;
  }
  
  // Desconto progressivo para voos longos
  if (distance > 2000) {
    basePrice *= 0.85;
  }
  
  // Ajuste por temporada
  if (isHighSeason) {
    basePrice *= 1.6; // Alta temporada: +60%
  }
  
  // Desconto por múltiplos passageiros (2+ passageiros: -5% cada)
  if (passengers > 1) {
    const discount = Math.min(passengers - 1, 4) * 0.05;
    basePrice *= (1 - discount);
  }
  
  // Multiplica pelo número de passageiros
  const totalPrice = basePrice * passengers;
  
  // Arredonda para múltiplo de 50
  return Math.round(totalPrice / 50) * 50;
}

/**
 * Calcula preço de passagem de ônibus
 */
function calculateBusPrice(
  distance: number,
  busClass: BusClass,
  passengers: number,
  isHighSeason: boolean
): number {
  // Preço base por km (R$)
  let pricePerKm = 0.15;
  
  // Ajuste por classe
  if (busClass === 'sleeper') {
    pricePerKm *= 1.8; // Leito é 80% mais caro
  }
  
  // Cálculo base
  let basePrice = distance * pricePerKm;
  
  // Taxa mínima
  if (distance < 200) {
    basePrice += 50;
  }
  
  // Ajuste por temporada
  if (isHighSeason) {
    basePrice *= 1.3; // Alta temporada: +30%
  }
  
  // Desconto por múltiplos passageiros (menos comum em ônibus)
  if (passengers >= 4) {
    basePrice *= 0.95;
  }
  
  // Multiplica pelo número de passageiros
  const totalPrice = basePrice * passengers;
  
  // Arredonda para múltiplo de 10
  return Math.round(totalPrice / 10) * 10;
}

/**
 * Calcula custo estimado de viagem de carro próprio
 */
function calculateCarCost(
  distance: number,
  passengers: number,
  isHighSeason: boolean
): number {
  // Consumo médio: 10 km/L
  // Preço gasolina: R$ 6,00/L
  // Ida e volta
  const fuelCost = (distance * 2 / 10) * 6.00;
  
  // Pedágios estimados (R$ 0.08 por km em média)
  const tollCost = distance * 2 * 0.08;
  
  // Desgaste do veículo (R$ 0.30 por km)
  const wearCost = distance * 2 * 0.30;
  
  let totalCost = fuelCost + tollCost + wearCost;
  
  // O custo não aumenta com passageiros (vantagem do carro próprio)
  // Mas pode ter um pequeno aumento por conforto/paradas
  if (passengers > 3) {
    totalCost *= 1.1;
  }
  
  // Arredonda para múltiplo de 50
  return Math.round(totalCost / 50) * 50;
}

export interface TransportCalculationParams {
  origin: string;
  destination: string;
  transportType: TransportType;
  flightClass?: FlightClass;
  busClass?: BusClass;
  passengers: number;
  startDate: string;
}

export interface TransportCalculationResult {
  distance: number;
  cost: number;
  costPerPerson: number;
  isHighSeason: boolean;
  breakdown: {
    baseCost: number;
    seasonalAdjustment: number;
    classMultiplier: number;
    totalCost: number;
  };
}

/**
 * Função principal: Calcula custo de transporte
 */
export function calculateTransportCost(params: TransportCalculationParams): TransportCalculationResult {
  const { origin, destination, transportType, flightClass, busClass, passengers, startDate } = params;
  
  // Obter coordenadas
  const originCoords = CITY_COORDINATES[origin];
  const destCoords = CITY_COORDINATES[destination];
  
  // Se alguma cidade não for encontrada, usar estimativa genérica
  if (!originCoords || !destCoords) {
    console.warn(`⚠️ Cidade não encontrada no sistema de coordenadas: ${!originCoords ? origin : destination}`);
    console.warn('📍 Usando cálculo estimado baseado em distância padrão...');
    
    // Usar distância média para viagens nacionais/internacionais
    const estimatedDistance = 2000; // km (distância média)
    const highSeason = isHighSeason(startDate);
    
    let cost = 0;
    let baseCost = 0;
    let classMultiplier = 1;
    let seasonalAdjustment = 0;
    
    switch (transportType) {
      case 'flight':
        const fc = flightClass || 'economy';
        classMultiplier = fc === 'business' ? 2.5 : 1.0;
        cost = calculateFlightPrice(estimatedDistance, fc, passengers, highSeason);
        baseCost = calculateFlightPrice(estimatedDistance, fc, passengers, false);
        seasonalAdjustment = highSeason ? baseCost * 0.6 : 0;
        break;
        
      case 'bus':
        const bc = busClass || 'conventional';
        classMultiplier = bc === 'sleeper' ? 1.8 : 1.0;
        cost = calculateBusPrice(estimatedDistance, bc, passengers, highSeason);
        baseCost = calculateBusPrice(estimatedDistance, bc, passengers, false);
        seasonalAdjustment = highSeason ? baseCost * 0.3 : 0;
        break;
        
      case 'car':
        cost = calculateCarCost(estimatedDistance, passengers, highSeason);
        baseCost = calculateCarCost(estimatedDistance, passengers, false);
        seasonalAdjustment = 0;
        break;
    }
    
    return {
      distance: estimatedDistance,
      cost,
      costPerPerson: Math.round(cost / passengers),
      isHighSeason: highSeason,
      breakdown: {
        baseCost,
        seasonalAdjustment,
        classMultiplier,
        totalCost: cost,
      },
    };
  }
  
  // Calcular distância
  const distance = calculateDistance(
    originCoords.lat,
    originCoords.lng,
    destCoords.lat,
    destCoords.lng
  );
  
  // Verificar temporada
  const highSeason = isHighSeason(startDate);
  
  // Calcular custo baseado no tipo de transporte
  let cost = 0;
  let baseCost = 0;
  let classMultiplier = 1;
  let seasonalAdjustment = 0;
  
  switch (transportType) {
    case 'flight':
      const fc = flightClass || 'economy';
      classMultiplier = fc === 'business' ? 2.5 : 1.0;
      cost = calculateFlightPrice(distance, fc, passengers, highSeason);
      baseCost = calculateFlightPrice(distance, fc, passengers, false);
      seasonalAdjustment = highSeason ? baseCost * 0.6 : 0;
      break;
      
    case 'bus':
      const bc = busClass || 'conventional';
      classMultiplier = bc === 'sleeper' ? 1.8 : 1.0;
      cost = calculateBusPrice(distance, bc, passengers, highSeason);
      baseCost = calculateBusPrice(distance, bc, passengers, false);
      seasonalAdjustment = highSeason ? baseCost * 0.3 : 0;
      break;
      
    case 'car':
      cost = calculateCarCost(distance, passengers, highSeason);
      baseCost = calculateCarCost(distance, passengers, false);
      seasonalAdjustment = 0; // Carro próprio não tem variação sazonal significativa
      break;
  }
  
  return {
    distance: Math.round(distance),
    cost,
    costPerPerson: Math.round(cost / passengers),
    isHighSeason: highSeason,
    breakdown: {
      baseCost,
      seasonalAdjustment,
      classMultiplier,
      totalCost: cost,
    },
  };
}

/**
 * Obtém lista de cidades disponíveis
 */
export function getAvailableCities(): string[] {
  return Object.keys(CITY_COORDINATES).sort();
}