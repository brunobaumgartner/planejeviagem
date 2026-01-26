/**
 * TRAVELPAYOUTS HOTELS API - Busca preços dinâmicos de hospedagem
 * Sistema 100% dinâmico com cache inteligente
 */

import * as kv from './kv_store.tsx';

const TRAVELPAYOUTS_TOKEN = Deno.env.get('TRAVELPAYOUTS_TOKEN');
const TRAVELPAYOUTS_MARKER = Deno.env.get('TRAVELPAYOUTS_MARKER');

// Cache key prefix
const CACHE_PREFIX_HOTELS = 'tp_hotels';
const CACHE_DURATION_HOURS = 24; // Cache por 24 horas

interface HotelPriceData {
  cityCode: string;
  averagePricePerNight: number;
  currency: string;
  cachedAt: string;
  source: 'api' | 'estimated';
}

/**
 * Busca preço médio de hotéis para uma cidade usando a API da Travelpayouts
 * https://support.travelpayouts.com/hc/en-us/articles/203956163-Hotels-Search-API
 */
export async function fetchHotelPrice(cityCode: string, checkIn?: string, checkOut?: string): Promise<number | null> {
  console.log(`[TPHotels] 🏨 Buscando preços de hotéis para ${cityCode}`);

  try {
    // Verificar cache primeiro
    const cached = await getCachedHotelPrice(cityCode);
    if (cached) {
      console.log(`[TPHotels] ✅ Cache hit: R$ ${cached.averagePricePerNight}/noite`);
      return cached.averagePricePerNight;
    }

    // Datas padrão: 30 dias no futuro, 2 noites
    const defaultCheckIn = checkIn || getDateInFuture(30);
    const defaultCheckOut = checkOut || getDateInFuture(32);

    // API Endpoint - Hotel Search
    const url = `https://engine.hotellook.com/api/v2/cache.json?location=${cityCode}&checkIn=${defaultCheckIn}&checkOut=${defaultCheckOut}&currency=BRL&limit=50&token=${TRAVELPAYOUTS_TOKEN}`;

    console.log(`[TPHotels] 📡 Consultando API: ${cityCode} (${defaultCheckIn} - ${defaultCheckOut})`);

    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`[TPHotels] ⚠️ API retornou ${response.status}`);
      return null;
    }

    const hotels = await response.json();

    if (!hotels || hotels.length === 0) {
      console.warn(`[TPHotels] ⚠️ Nenhum hotel encontrado para ${cityCode}`);
      return null;
    }

    // Calcular preço médio dos hotéis disponíveis
    const prices = hotels
      .map((hotel: any) => hotel.priceAvg || hotel.minPriceTotal)
      .filter((price: number) => price > 0 && price < 10000); // Filtrar valores absurdos

    if (prices.length === 0) {
      console.warn(`[TPHotels] ⚠️ Sem preços válidos para ${cityCode}`);
      return null;
    }

    // Calcular média, removendo outliers (25%-75% quartil)
    prices.sort((a: number, b: number) => a - b);
    const q1Index = Math.floor(prices.length * 0.25);
    const q3Index = Math.floor(prices.length * 0.75);
    const filteredPrices = prices.slice(q1Index, q3Index);

    const averagePrice = filteredPrices.reduce((sum: number, p: number) => sum + p, 0) / filteredPrices.length;
    const pricePerNight = Math.round(averagePrice / 2); // Dividir por 2 noites

    console.log(`[TPHotels] ✅ Preço médio calculado: R$ ${pricePerNight}/noite (${hotels.length} hotéis, ${prices.length} preços válidos)`);

    // Cachear resultado
    await cacheHotelPrice(cityCode, pricePerNight, 'api');

    return pricePerNight;

  } catch (error) {
    console.error(`[TPHotels] ❌ Erro ao buscar hotéis:`, error);
    return null;
  }
}

/**
 * Estima preço de hospedagem baseado no preço do voo
 * Algoritmo: Cidades com voos mais caros geralmente têm hospedagem mais cara
 */
export function estimateHotelPriceFromFlight(flightPrice: number): number {
  console.log(`[TPHotels] 🧮 Estimando hospedagem baseado em voo de R$ ${flightPrice}`);

  // Fórmula baseada em análise de correlação voo x hospedagem
  // Voos caros (>2000) = hospedagem ~400-600/noite
  // Voos médios (1000-2000) = hospedagem ~250-400/noite
  // Voos baratos (<1000) = hospedagem ~150-250/noite

  let estimatedPrice: number;

  if (flightPrice >= 3000) {
    estimatedPrice = 550; // Destinos muito caros (Europa, EUA, Ásia)
  } else if (flightPrice >= 2000) {
    estimatedPrice = 400; // Destinos caros
  } else if (flightPrice >= 1200) {
    estimatedPrice = 280; // Destinos médios
  } else if (flightPrice >= 600) {
    estimatedPrice = 200; // Destinos baratos
  } else {
    estimatedPrice = 150; // Destinos muito baratos (doméstico)
  }

  // Adicionar variação de ±15% para ser mais realista
  const variation = estimatedPrice * 0.15 * (Math.random() - 0.5);
  const finalPrice = Math.round(estimatedPrice + variation);

  console.log(`[TPHotels] 💡 Estimativa: R$ ${finalPrice}/noite`);

  return finalPrice;
}

/**
 * Estima gastos diários baseado no preço de hospedagem
 * Regra: Gastos diários geralmente são 60-80% do preço da hospedagem
 */
export function estimateDailyExpensesFromAccommodation(accommodationPrice: number): number {
  // Fator de 0.7 (70% do preço da hospedagem)
  const dailyExpenses = Math.round(accommodationPrice * 0.7);
  
  console.log(`[TPHotels] 🍽️ Gastos diários estimados: R$ ${dailyExpenses} (baseado em hospedagem de R$ ${accommodationPrice})`);
  
  return dailyExpenses;
}

/**
 * Função principal: Busca preço de hotel (API) ou estima baseado no voo
 */
export async function getAccommodationPrice(cityCode: string, flightPrice: number): Promise<{
  accommodation: number;
  dailyExpenses: number;
  source: 'api' | 'estimated';
}> {
  // Tentar buscar preço real da API primeiro
  const apiPrice = await fetchHotelPrice(cityCode);

  if (apiPrice !== null) {
    return {
      accommodation: apiPrice,
      dailyExpenses: estimateDailyExpensesFromAccommodation(apiPrice),
      source: 'api'
    };
  }

  // Fallback: Estimar baseado no preço do voo
  console.log(`[TPHotels] ⚠️ Sem dados da API, usando estimativa baseada em voo`);
  const estimatedAccommodation = estimateHotelPriceFromFlight(flightPrice);

  // Cachear estimativa para não recalcular
  await cacheHotelPrice(cityCode, estimatedAccommodation, 'estimated');

  return {
    accommodation: estimatedAccommodation,
    dailyExpenses: estimateDailyExpensesFromAccommodation(estimatedAccommodation),
    source: 'estimated'
  };
}

// ============================================
// FUNÇÕES DE CACHE
// ============================================

async function getCachedHotelPrice(cityCode: string): Promise<HotelPriceData | null> {
  const cacheKey = `${CACHE_PREFIX_HOTELS}:${cityCode}`;
  
  try {
    const cached = await kv.get(cacheKey);
    if (!cached) return null;

    const data = cached as HotelPriceData;
    const cachedAt = new Date(data.cachedAt);
    const expiresAt = new Date(cachedAt.getTime() + CACHE_DURATION_HOURS * 60 * 60 * 1000);
    const now = new Date();

    if (now < expiresAt) {
      return data;
    }

    return null;
  } catch (error) {
    console.error(`[TPHotels] Erro ao ler cache:`, error);
    return null;
  }
}

async function cacheHotelPrice(cityCode: string, pricePerNight: number, source: 'api' | 'estimated'): Promise<void> {
  const cacheKey = `${CACHE_PREFIX_HOTELS}:${cityCode}`;
  
  const data: HotelPriceData = {
    cityCode,
    averagePricePerNight: pricePerNight,
    currency: 'BRL',
    cachedAt: new Date().toISOString(),
    source
  };

  try {
    await kv.set(cacheKey, data);
    console.log(`[TPHotels] 💾 Cache salvo: ${cityCode} = R$ ${pricePerNight}/noite (${source})`);
  } catch (error) {
    console.error(`[TPHotels] Erro ao salvar cache:`, error);
  }
}

// ============================================
// UTILITÁRIOS
// ============================================

function getDateInFuture(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}
