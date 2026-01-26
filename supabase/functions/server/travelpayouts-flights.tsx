/**
 * TRAVELPAYOUTS FLIGHTS API - Busca de preços de voos
 * Duas estratégias: busca em massa vs busca específica
 */

import airportCodes from "npm:airport-codes";
import * as kv from "./kv_store.tsx";

const TRAVELPAYOUTS_TOKEN = Deno.env.get("TRAVELPAYOUTS_TOKEN");
const TRAVELPAYOUTS_MARKER = Deno.env.get(
  "TRAVELPAYOUTS_MARKER",
);

// Cache configuration
const CACHE_PREFIX_ALL = "tp_flights_all";
const CACHE_PREFIX_SPECIFIC = "tp_flights_specific";
const CACHE_DURATION_HOURS = 24;

interface FlightDestination {
  destination: string;
  destinationName: string;
  price: number;
  airline: string;
  departureDate: string;
  returnDate: string;
  currency: string;
}

interface AllDestinationsResult {
  origin: string;
  destinations: FlightDestination[];
  totalDestinations: number;
  cachedAt: string;
  source: "api" | "cache";
}

// Busca por código IATA
const getCityName = (iataCode) => {
  const airport = airportCodes.findWhere({
    iata: iataCode.toUpperCase(),
  });
  return airport
    ? airport.get("city") + " - " + iataCode
    : "Cidade não encontrada";
};

/**
 * ========================================
 * FUNÇÃO 1: BUSCAR TODOS OS DESTINOS
 * ========================================
 * Usa o endpoint /prices/cheap SEM especificar destination
 * Retorna TODOS os destinos disponíveis em UMA ÚNICA chamada!
 */

export async function fetchAllDestinationsWithPrices(
  originCode: string,
): Promise<AllDestinationsResult | null> {
  console.log(
    `[TPFlights] 🌍 Buscando TODOS os destinos de ${originCode}`,
  );

  try {
    // Verificar cache primeiro
    const cached = await getCachedAllDestinations(originCode);
    if (cached) {
      console.log(
        `[TPFlights] ✅ Cache hit: ${cached.destinations.length} destinos`,
      );
      return cached;
    }

    // Buscar da API - ENDPOINT QUE RETORNA TODOS OS DESTINOS!
    // Documentação: https://support.travelpayouts.com/hc/en-us/articles/203956163
    const url = `https://api.travelpayouts.com/v1/prices/cheap?origin=${originCode}&currency=BRL&token=${TRAVELPAYOUTS_TOKEN}`;

    console.log(
      `[TPFlights] 📡 Consultando API (todos os destinos)`,
    );

    const response = await fetch(url, {
      headers: { "X-Access-Token": TRAVELPAYOUTS_TOKEN || "" },
    });

    if (!response.ok) {
      console.error(
        `[TPFlights] ❌ API retornou ${response.status}`,
      );
      return null;
    }

    const data = await response.json();

    if (!data.success || !data.data) {
      console.warn(`[TPFlights] ⚠️ API retornou sem dados`);
      return null;
    }

    // Processar resposta
    // Formato: { "data": { "LON": { "0": { "price": 2500, ... } } } }
    const destinations: FlightDestination[] = [];

    for (const [destCode, flights] of Object.entries(
      data.data,
    )) {
      // Pegar o voo mais barato para cada destino
      const flightOptions = Object.values(flights as any);
      if (flightOptions.length === 0) continue;

      // Encontrar menor preço
      let cheapestFlight: any = null;
      let minPrice = Infinity;

      for (const flight of flightOptions) {
        if (flight.price && flight.price < minPrice) {
          minPrice = flight.price;
          cheapestFlight = flight;
        }
      }
      
      if (cheapestFlight) {
        destinations.push({
          destination: destCode,
          destinationName:
            cheapestFlight.destination || destCode,
          price: cheapestFlight.price,
          airline: cheapestFlight.airline || "",
          departureDate: cheapestFlight.departure_at || "",
          returnDate: cheapestFlight.return_at || "",
          currency: "BRL",
        });
      }
    }

    // Ordenar por preço (mais barato primeiro)
    destinations.sort((a, b) => a.price - b.price);

    console.log(
      `[TPFlights] ✅ ${destinations.length} destinos encontrados em UMA ÚNICA chamada!`,
    );

    const result: AllDestinationsResult = {
      origin: originCode,
      destinations,
      totalDestinations: destinations.length,
      cachedAt: new Date().toISOString(),
      source: "api",
    };

    // Cachear resultado
    await cacheAllDestinations(originCode, result);

    return result;
  } catch (error) {
    console.error(
      `[TPFlights] ❌ Erro ao buscar todos destinos:`,
      error,
    );
    return null;
  }
}

/**
 * ========================================
 * FUNÇÃO 2: BUSCAR DESTINO ESPECÍFICO
 * ========================================
 * Usa o endpoint /prices/cheap COM destination especificado
 * Para quando o usuário quer ver preço de uma cidade específica
 */
export async function fetchSpecificFlightPrice(
  originCode: string,
  destinationCode: string,
): Promise<number | null> {
  console.log(
    `[TPFlights] ✈️ Buscando preço específico: ${originCode} → ${destinationCode}`,
  );

  try {
    // Verificar cache primeiro
    const cached = await getCachedSpecificFlight(
      originCode,
      destinationCode,
    );
    if (cached !== null) {
      console.log(`[TPFlights] ✅ Cache hit: R$ ${cached}`);
      return cached;
    }

    // Buscar da API
    const url = `https://api.travelpayouts.com/v1/prices/cheap?origin=${originCode}&destination=${destinationCode}&currency=BRL&token=${TRAVELPAYOUTS_TOKEN}`;

    console.log(
      `[TPFlights] 📡 Consultando API (destino específico)`,
    );

    const response = await fetch(url, {
      headers: { "X-Access-Token": TRAVELPAYOUTS_TOKEN || "" },
    });

    if (!response.ok) {
      console.error(
        `[TPFlights] ❌ API retornou ${response.status}`,
      );
      return null;
    }

    const data = await response.json();

    if (!data.success || !data.data) {
      console.warn(`[TPFlights] ⚠️ Sem dados para esta rota`);
      return null;
    }

    // Extrair menor preço
    const allPrices: number[] = [];

    for (const flights of Object.values(data.data)) {
      for (const flight of Object.values(flights as any)) {
        if ((flight as any).price) {
          allPrices.push((flight as any).price);
        }
      }
    }

    if (allPrices.length === 0) {
      console.warn(`[TPFlights] ⚠️ Nenhum preço encontrado`);
      return null;
    }

    const minPrice = Math.min(...allPrices);
    console.log(`[TPFlights] ✅ Menor preço: R$ ${minPrice}`);

    // Cachear resultado
    await cacheSpecificFlight(
      originCode,
      destinationCode,
      minPrice,
    );

    return minPrice;
  } catch (error) {
    console.error(
      `[TPFlights] ❌ Erro ao buscar preço específico:`,
      error,
    );
    return null;
  }
}

/**
 * ========================================
 * HELPER: Converter código IATA em nome
 * ========================================
 */
export function getDestinationName(
  destCode: string,
  allDestinations: FlightDestination[],
): string {
  const found = allDestinations.find(
    (d) => d.destination === destCode,
  );
  return found?.destinationName || destCode;
}

// ============================================
// FUNÇÕES DE CACHE
// ============================================

async function getCachedAllDestinations(
  originCode: string,
): Promise<AllDestinationsResult | null> {
  const cacheKey = `${CACHE_PREFIX_ALL}:${originCode}`;

  try {
    const cached = await kv.get(cacheKey);
    if (!cached) return null;

    const data = cached as AllDestinationsResult;
    const cachedAt = new Date(data.cachedAt);
    const expiresAt = new Date(
      cachedAt.getTime() +
        CACHE_DURATION_HOURS * 60 * 60 * 1000,
    );
    const now = new Date();

    if (now < expiresAt) {
      return { ...data, source: "cache" };
    }

    return null;
  } catch (error) {
    console.error(`[TPFlights] Erro ao ler cache:`, error);
    return null;
  }
}

async function cacheAllDestinations(
  originCode: string,
  data: AllDestinationsResult,
): Promise<void> {
  const cacheKey = `${CACHE_PREFIX_ALL}:${originCode}`;

  try {
    await kv.set(cacheKey, data);
    console.log(
      `[TPFlights] 💾 Cache salvo: ${data.totalDestinations} destinos`,
    );
  } catch (error) {
    console.error(`[TPFlights] Erro ao salvar cache:`, error);
  }
}

async function getCachedSpecificFlight(
  originCode: string,
  destCode: string,
): Promise<number | null> {
  const cacheKey = `${CACHE_PREFIX_SPECIFIC}:${originCode}:${destCode}`;

  try {
    const cached = await kv.get(cacheKey);
    if (!cached) return null;

    const data = cached as { price: number; cachedAt: string };
    const cachedAt = new Date(data.cachedAt);
    const expiresAt = new Date(
      cachedAt.getTime() +
        CACHE_DURATION_HOURS * 60 * 60 * 1000,
    );
    const now = new Date();

    if (now < expiresAt) {
      return data.price;
    }

    return null;
  } catch (error) {
    console.error(`[TPFlights] Erro ao ler cache:`, error);
    return null;
  }
}

async function cacheSpecificFlight(
  originCode: string,
  destCode: string,
  price: number,
): Promise<void> {
  const cacheKey = `${CACHE_PREFIX_SPECIFIC}:${originCode}:${destCode}`;

  try {
    await kv.set(cacheKey, {
      price,
      cachedAt: new Date().toISOString(),
    });
    console.log(
      `[TPFlights] 💾 Cache salvo: ${originCode}→${destCode} = R$ ${price}`,
    );
  } catch (error) {
    console.error(`[TPFlights] Erro ao salvar cache:`, error);
  }
}