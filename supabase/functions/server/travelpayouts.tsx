import { Hono } from "npm:hono";

const app = new Hono();

const TRAVELPAYOUTS_TOKEN = Deno.env.get("TRAVELPAYOUTS_TOKEN");

// Cache para dados estáticos
let citiesCache: any[] | null = null;
let airlinesCache: any[] | null = null;

// Função para carregar cidades
async function loadCities(): Promise<any[]> {
  if (citiesCache) {
    return citiesCache;
  }

  try {
    console.log("[Travelpayouts] Carregando dados de cidades...");
    const response = await fetch(
      `https://api.travelpayouts.com/data/en-GB/cities.json`
    );
    
    if (!response.ok) {
      console.error("[Travelpayouts] Erro ao carregar cidades:", response.status);
      return [];
    }
    
    const data = await response.json();
    citiesCache = data;
    console.log(`[Travelpayouts] ✅ ${data.length} cidades carregadas`);
    return data;
  } catch (error) {
    console.error("[Travelpayouts] Erro ao carregar cidades:", error);
    return [];
  }
}

// Função para carregar companhias aéreas
async function loadAirlines(): Promise<any[]> {
  if (airlinesCache) {
    return airlinesCache;
  }

  try {
    console.log("[Travelpayouts] Carregando dados de companhias aéreas...");
    const response = await fetch(
      `https://api.travelpayouts.com/data/en-GB/airlines.json`
    );
    
    if (!response.ok) {
      console.error("[Travelpayouts] Erro ao carregar airlines:", response.status);
      return [];
    }
    
    const data = await response.json();
    airlinesCache = data;
    console.log(`[Travelpayouts] ✅ ${data.length} companhias aéreas carregadas`);
    return data;
  } catch (error) {
    console.error("[Travelpayouts] Erro ao carregar airlines:", error);
    return [];
  }
}

// Função para buscar nome da cidade por código IATA
function getCityName(code: string, cities: any[]): string {
  const city = cities.find((c: any) => c.code === code);
  return city?.name || code;
}

// Função para buscar nome da companhia aérea por código IATA
function getAirlineName(code: string, airlines: any[]): string {
  const airline = airlines.find((a: any) => a.code === code || a.iata === code);
  return airline?.name || code;
}

// Interface para resposta da API
interface FlightOffer {
  origin: string;
  destination: string;
  destination_name?: string;
  price: number;
  airline: string;
  flight_number?: number;
  departure_at: string;
  return_at: string;
  expires_at: string;
}

// Interface para dados da API Travelpayouts (formato real)
interface TravelpayoutsFlightData {
  value: number;
  trip_class: number;
  show_to_affiliates: boolean;
  origin: string;
  destination: string;
  depart_date: string;
  return_date: string;
  number_of_changes: number;
  found_at: string;
  distance: number;
  actual: boolean;
  airline?: string;
  flight_number?: number;
}

// Buscar ofertas de voos (Latest Prices)
app.get("/search", async (c) => {
  try {
    const origin = c.req.query("origin") || "SAO";
    const destination = c.req.query("destination") || "";
    const departureDate = c.req.query("departure_date") || "";
    const returnDate = c.req.query("return_date") || "";
    const limit = c.req.query("limit") || "1000";

    console.log(`[Travelpayouts] ========================================`);
    console.log(`[Travelpayouts] Nova requisição de busca de voos`);
    console.log(`[Travelpayouts] Parâmetros:`, { origin, destination, departureDate, returnDate, limit });

    if (!TRAVELPAYOUTS_TOKEN) {
      console.error(`[Travelpayouts] ❌ TRAVELPAYOUTS_TOKEN não configurado!`);
      return c.json({ error: "TRAVELPAYOUTS_TOKEN não configurado" }, 500);
    }

    console.log(`[Travelpayouts] ✅ Token configurado (${TRAVELPAYOUTS_TOKEN.length} chars)`);
    console.log(`[Travelpayouts] Buscando voos de ${origin} para ${destination || "qualquer destino"}`);

    // API de preços mais recentes da Travelpayouts
    // Documentação: https://support.travelpayouts.com/hc/en-us/articles/203956163-Travel-insights-Data-API
    let apiUrl = `https://api.travelpayouts.com/v2/prices/latest?currency=brl&origin=${origin}&limit=${limit}&token=${TRAVELPAYOUTS_TOKEN}`;
    
    if (destination) {
      apiUrl += `&destination=${destination}`;
    }
    
    if (departureDate) {
      apiUrl += `&beginning_of_period=${departureDate}`;
    }

    console.log(`[Travelpayouts] URL da API (sem token):`, apiUrl.replace(TRAVELPAYOUTS_TOKEN, 'HIDDEN'));

    const response = await fetch(apiUrl);
    
    console.log(`[Travelpayouts] Status da resposta: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Travelpayouts] ❌ Erro na API: ${response.status}`);
      console.error(`[Travelpayouts] Resposta de erro:`, errorText);
      return c.json({ 
        error: `Erro ao buscar voos: ${response.statusText}`,
        status: response.status,
        details: errorText
      }, response.status);
    }

    const data = await response.json();
    
    console.log(`[Travelpayouts] Resposta da API:`, {
      success: data.success,
      dataLength: data.data?.length || 0,
      hasData: !!data.data,
      sampleData: data.data?.[0]
    });
    
    // Carregar cidades e companhias aéreas
    const cities = await loadCities();
    const airlines = await loadAirlines();

    console.log(`[Travelpayouts] Exemplo de mapeamento para o primeiro voo:`, {
      destinationCode: data.data?.[0]?.destination,
      destinationMapped: getCityName(data.data?.[0]?.destination, cities),
      airlineCode: data.data?.[0]?.airline,
      airlineMapped: getAirlineName(data.data?.[0]?.airline || "", airlines),
    });

    // Mapear dados para o formato esperado pelo frontend
    const mappedFlights: FlightOffer[] = (data.data || []).map((flight: TravelpayoutsFlightData) => {
      const cityName = getCityName(flight.destination, cities);
      const airlineName = getAirlineName(flight.airline || "", airlines);
      
      return {
        origin: flight.origin,
        destination: flight.destination,
        destination_name: cityName,
        price: flight.value,
        airline: airlineName,
        flight_number: flight.flight_number,
        departure_at: flight.depart_date,
        return_at: flight.return_date,
        expires_at: flight.found_at,
      };
    });

    // Log de exemplo de datas para debug
    if (mappedFlights.length > 0) {
      console.log(`[Travelpayouts] DEBUG - Exemplo de datas do primeiro voo:`, {
        departure_at: mappedFlights[0].departure_at,
        return_at: mappedFlights[0].return_at,
        departureDate_filtro: departureDate,
        returnDate_filtro: returnDate,
      });
    }

    // Filtrar por datas exatas se fornecidas
    let filteredFlights = mappedFlights;
    
    if (departureDate) {
      console.log(`[Travelpayouts] Filtrando por data de partida exata: ${departureDate}`);
      console.log(`[Travelpayouts] Total de voos antes do filtro de partida: ${filteredFlights.length}`);
      
      filteredFlights = filteredFlights.filter(flight => {
        const matches = flight.departure_at === departureDate;
        if (!matches && filteredFlights.indexOf(flight) < 3) {
          console.log(`[Travelpayouts] DEBUG - Voo rejeitado: ${flight.departure_at} !== ${departureDate}`);
        }
        return matches;
      });
      
      console.log(`[Travelpayouts] Voos após filtro de partida: ${filteredFlights.length}`);
    }
    
    if (returnDate) {
      console.log(`[Travelpayouts] Filtrando por data de retorno exata: ${returnDate}`);
      console.log(`[Travelpayouts] Total de voos antes do filtro de retorno: ${filteredFlights.length}`);
      
      filteredFlights = filteredFlights.filter(flight => {
        const matches = flight.return_at === returnDate;
        if (!matches && filteredFlights.indexOf(flight) < 3) {
          console.log(`[Travelpayouts] DEBUG - Voo rejeitado: ${flight.return_at} !== ${returnDate}`);
        }
        return matches;
      });
      
      console.log(`[Travelpayouts] Voos após filtro de retorno: ${filteredFlights.length}`);
    }
    
    console.log(`[Travelpayouts] ✅ ${filteredFlights.length} voos após filtros (total inicial: ${data.data?.length || 0})`);
    console.log(`[Travelpayouts] ========================================`);

    return c.json({
      success: true,
      flights: filteredFlights,
      total: filteredFlights.length,
    });
  } catch (error) {
    console.error("[Travelpayouts] ❌ Exceção ao buscar voos:", error);
    console.error("[Travelpayouts] Stack:", error instanceof Error ? error.stack : 'N/A');
    return c.json({ 
      error: error instanceof Error ? error.message : "Erro ao buscar voos" 
    }, 500);
  }
});

// Buscar destinos populares (Monthly prices)
app.get("/popular", async (c) => {
  try {
    const origin = c.req.query("origin") || "SAO";

    if (!TRAVELPAYOUTS_TOKEN) {
      return c.json({ error: "TRAVELPAYOUTS_TOKEN não configurado" }, 500);
    }

    console.log(`[Travelpayouts] Buscando destinos populares de ${origin}`);

    // API de preços mensais para encontrar destinos populares
    const apiUrl = `https://api.travelpayouts.com/v2/prices/month-matrix?currency=brl&origin=${origin}&show_to_affiliates=true&token=${TRAVELPAYOUTS_TOKEN}`;

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error(`[Travelpayouts] Erro na API: ${response.status}`);
      return c.json({ 
        error: `Erro ao buscar destinos: ${response.statusText}`,
        status: response.status 
      }, response.status);
    }

    const data = await response.json();
    
    console.log(`[Travelpayouts] Encontrados ${data.data?.length || 0} destinos`);

    return c.json({
      success: true,
      destinations: data.data || [],
      total: data.data?.length || 0,
    });
  } catch (error) {
    console.error("[Travelpayouts] Erro ao buscar destinos:", error);
    return c.json({ 
      error: error instanceof Error ? error.message : "Erro ao buscar destinos" 
    }, 500);
  }
});

// Buscar informações de cidade por código IATA
app.get("/city/:code", async (c) => {
  try {
    const code = c.req.param("code");

    if (!TRAVELPAYOUTS_TOKEN) {
      return c.json({ error: "TRAVELPAYOUTS_TOKEN não configurado" }, 500);
    }

    // API de dados de cidades
    const apiUrl = `https://api.travelpayouts.com/data/en/cities.json?token=${TRAVELPAYOUTS_TOKEN}`;

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error(`[Travelpayouts] Erro na API: ${response.status}`);
      return c.json({ 
        error: `Erro ao buscar informações da cidade: ${response.statusText}`,
        status: response.status 
      }, response.status);
    }

    const cities = await response.json();
    const city = cities.find((c: any) => c.code === code);

    if (!city) {
      return c.json({ error: "Cidade não encontrada" }, 404);
    }

    return c.json({
      success: true,
      city,
    });
  } catch (error) {
    console.error("[Travelpayouts] Erro ao buscar cidade:", error);
    return c.json({ 
      error: error instanceof Error ? error.message : "Erro ao buscar cidade" 
    }, 500);
  }
});

export default app;