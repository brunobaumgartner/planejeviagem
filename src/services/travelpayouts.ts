/**
 * Travelpayouts Affiliate Service
 * Gera links de afiliado para voos, hotéis, carros e tours
 */

// Destinos populares com códigos IATA
export const POPULAR_DESTINATIONS = [
  { name: 'Londres', code: 'LON', country: 'Reino Unido', emoji: '🇬🇧', hotelCity: 'London' },
  { name: 'Paris', code: 'PAR', country: 'França', emoji: '🇫🇷', hotelCity: 'Paris' },
  { name: 'Nova York', code: 'NYC', country: 'EUA', emoji: '🇺🇸', hotelCity: 'New York' },
  { name: 'Tóquio', code: 'TYO', country: 'Japão', emoji: '🇯🇵', hotelCity: 'Tokyo' },
  { name: 'Barcelona', code: 'BCN', country: 'Espanha', emoji: '🇪🇸', hotelCity: 'Barcelona' },
  { name: 'Dubai', code: 'DXB', country: 'EAU', emoji: '🇦🇪', hotelCity: 'Dubai' },
  { name: 'Roma', code: 'ROM', country: 'Itália', emoji: '🇮🇹', hotelCity: 'Rome' },
  { name: 'Amsterdam', code: 'AMS', country: 'Holanda', emoji: '🇳🇱', hotelCity: 'Amsterdam' },
  { name: 'Bangkok', code: 'BKK', country: 'Tailândia', emoji: '🇹🇭', hotelCity: 'Bangkok' },
  { name: 'Cancún', code: 'CUN', country: 'México', emoji: '🇲🇽', hotelCity: 'Cancun' },
  { name: 'Lisboa', code: 'LIS', country: 'Portugal', emoji: '🇵🇹', hotelCity: 'Lisbon' },
  { name: 'Buenos Aires', code: 'BUE', country: 'Argentina', emoji: '🇦🇷', hotelCity: 'Buenos Aires' },
  { name: 'Miami', code: 'MIA', country: 'EUA', emoji: '🇺🇸', hotelCity: 'Miami' },
  { name: 'Sydney', code: 'SYD', country: 'Austrália', emoji: '🇦🇺', hotelCity: 'Sydney' },
  { name: 'Berlim', code: 'BER', country: 'Alemanha', emoji: '🇩🇪', hotelCity: 'Berlin' },
];


interface FlightLinkParams {
  origin: string; // Código IATA da origem (ex: 'SAO')
  destination: string; // Código IATA do destino (ex: 'LON')
  marker: string; // ID do afiliado Travelpayouts
  depart_date?: string; // Data de ida (YYYY-MM-DD)
  return_date?: string; // Data de volta (YYYY-MM-DD)
  adults?: number; // Número de adultos
  currency?: string; // Moeda (BRL, USD, EUR)
}

interface HotelLinkParams {
  cityName: string; // Nome da cidade
  marker: string; // ID do afiliado
  checkIn?: string; // Data de check-in (YYYY-MM-DD)
  checkOut?: string; // Data de check-out (YYYY-MM-DD)
  adults?: number; // Número de adultos
  currency?: string; // Moeda
}

interface CarLinkParams {
  cityName: string; // Nome da cidade
  marker: string; // ID do afiliado
  pickupDate?: string; // Data de retirada (YYYY-MM-DD)
  returnDate?: string; // Data de devolução (YYYY-MM-DD)
  currency?: string; // Moeda
}

interface TourLinkParams {
  cityName: string; // Nome da cidade
  marker: string; // ID do afiliado
  currency?: string; // Moeda
}

/**
 * Gera link de afiliado para busca de voos
 */
export function generateFlightLink(params: FlightLinkParams): string {
  const {
    origin,
    destination,
    marker,
    depart_date,
    return_date,
    adults = 1,
    currency = 'BRL',
  } = params;

  // Usando Aviasales (motor de busca do Travelpayouts)
  const baseUrl = 'https://www.aviasales.com/search';
  
  // Formato: SAO2312LON3012 (origem + data ida + destino + data volta)
  const today = new Date();
  const departDate = depart_date || formatDate(addDays(today, 30));
  const returnDate = return_date || formatDate(addDays(today, 37));
  
  const departFormatted = departDate.replace(/-/g, '').slice(2); // YYMMDD
  const returnFormatted = returnDate.replace(/-/g, '').slice(2); // YYMMDD
  
  const searchString = `${origin}${departFormatted}${destination}${returnFormatted}`;

  const urlParams = new URLSearchParams({
    marker,
    locale: 'pt',
    currency,
  });

  return `${baseUrl}/${searchString}?${urlParams.toString()}`;
}

// Funções auxiliares para datas
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Seleciona N destinos aleatórios da lista de destinos populares
 */
export function getRandomDestinations(count: number = 6): typeof POPULAR_DESTINATIONS {
  const shuffled = [...POPULAR_DESTINATIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Gera sugestões de voos a partir de uma origem
 */
export function generateFlightSuggestions(
  originCode: string,
  marker: string,
  count: number = 6
) {
  const destinations = getRandomDestinations(count);

  return destinations.map((dest) => ({
    destination: dest,
    link: generateFlightLink({
      origin: originCode,
      destination: dest.code,
      marker,
      currency: 'BRL',
      adults: 1,
    }),
  }));
}

/**
 * Gera link de afiliado para busca de hotéis (Booking.com via Travelpayouts)
 */
export function generateHotelLink(params: HotelLinkParams): string {
  const {
    cityName,
    marker,
    checkIn,
    checkOut,
    adults = 2,
    currency = 'BRL',
  } = params;

  // Travelpayouts Hotels White Label - estrutura correta
  const baseUrl = 'https://search.hotellook.com';
  
  // Gerar datas padrão se não fornecidas (30 dias no futuro + 7 dias de estadia)
  const today = new Date();
  const defaultCheckIn = checkIn || formatDate(addDays(today, 30));
  const defaultCheckOut = checkOut || formatDate(addDays(today, 37));
  
  const urlParams = new URLSearchParams({
    marker,
    language: 'pt',
    currency,
    destination: cityName,
    adults: adults.toString(),
    checkIn: defaultCheckIn,
    checkOut: defaultCheckOut,
  });

  return `${baseUrl}?${urlParams.toString()}`;
}

/**
 * Gera link de afiliado para aluguel de carros (via Rentalcars/Travelpayouts)
 */
export function generateCarRentalLink(params: CarLinkParams): string {
  const {
    cityName,
    marker,
    pickupDate,
    returnDate,
    currency = 'BRL',
  } = params;

  // Gerar datas padrão se não fornecidas (30 dias no futuro + 7 dias de aluguel)
  const today = new Date();
  const defaultPickup = pickupDate || formatDate(addDays(today, 30));
  const defaultReturn = returnDate || formatDate(addDays(today, 37));
  
  const pickupParts = defaultPickup.split('-');
  const returnParts = defaultReturn.split('-');

  // Usando link direto do Rentalcars (requer programa de afiliados próprio)
  const baseUrl = 'https://www.rentalcars.com/SearchResults.do';
  
  const urlParams = new URLSearchParams({
    affiliateCode: marker,
    adplat: 'travelers',
    preflang: 'pt',
    city: cityName,
    currency,
    puDateDay: pickupParts[2],
    puDateMonth: pickupParts[1],
    puDateYear: pickupParts[0],
    doDateDay: returnParts[2],
    doDateMonth: returnParts[1],
    doDateYear: returnParts[0],
    puHour: '10',
    puMinute: '00',
    doHour: '10',
    doMinute: '00',
  });

  return `${baseUrl}?${urlParams.toString()}`;
}

/**
 * Gera link de afiliado para tours e atividades (GetYourGuide via Travelpayouts)
 */
export function generateTourLink(params: TourLinkParams): string {
  const {
    cityName,
    marker,
    currency = 'BRL',
  } = params;

  // GetYourGuide - usando link direto com partner_id
  // Formato correto: https://www.getyourguide.com/{city}-tours/tc-{city_id}
  // Como não temos city_id, vamos usar busca com query mais específica
  const baseUrl = 'https://www.getyourguide.com/s';
  
  const urlParams = new URLSearchParams({
    q: cityName,
    partner_id: marker,
    currency,
    // Adiciona filtro para mostrar apenas tours populares
    'filter[sortBy]': 'popularity',
  });

  return `${baseUrl}?${urlParams.toString()}`;
}

/**
 * Gera sugestões de hotéis para destinos populares
 */
export function generateHotelSuggestions(
  marker: string,
  count: number = 6
) {
  const destinations = getRandomDestinations(count);

  return destinations.map((dest) => ({
    destination: dest,
    link: generateHotelLink({
      cityName: dest.hotelCity,
      marker,
      currency: 'BRL',
      adults: 2,
    }),
  }));
}

/**
 * Gera sugestões de aluguel de carros para destinos populares
 */
export function generateCarRentalSuggestions(
  marker: string,
  count: number = 6
) {
  const destinations = getRandomDestinations(count);

  return destinations.map((dest) => ({
    destination: dest,
    link: generateCarRentalLink({
      cityName: dest.hotelCity,
      marker,
      currency: 'BRL',
    }),
  }));
}

/**
 * Gera sugestões de tours e atividades para destinos populares
 */
export function generateTourSuggestions(
  marker: string,
  count: number = 6
) {
  const destinations = getRandomDestinations(count);

  return destinations.map((dest) => ({
    destination: dest,
    link: generateTourLink({
      cityName: dest.hotelCity,
      marker,
      currency: 'BRL',
    }),
  }));
}


// Preços médios de hotéis por noite
export const ESTIMATED_HOTEL_PRICES: Record<string, number> = {
  LON: 450,
  PAR: 380,
  NYC: 520,
  TYO: 350,
  BCN: 280,
  DXB: 600,
  ROM: 320,
  AMS: 340,
  BKK: 180,
  CUN: 400,
  LIS: 250,
  BUE: 200,
  MIA: 380,
  SYD: 420,
  BER: 300,
};

// Preços médios de aluguel de carros por dia
export const ESTIMATED_CAR_PRICES: Record<string, number> = {
  LON: 180,
  PAR: 150,
  NYC: 200,
  TYO: 220,
  BCN: 120,
  DXB: 160,
  ROM: 140,
  AMS: 130,
  BKK: 100,
  CUN: 170,
  LIS: 110,
  BUE: 90,
  MIA: 150,
  SYD: 180,
  BER: 140,
};

// Preços médios de tours/atividades
export const ESTIMATED_TOUR_PRICES: Record<string, number> = {
  LON: 280,
  PAR: 250,
  NYC: 320,
  TYO: 300,
  BCN: 180,
  DXB: 350,
  ROM: 220,
  AMS: 200,
  BKK: 150,
  CUN: 280,
  LIS: 160,
  BUE: 140,
  MIA: 240,
  SYD: 300,
  BER: 190,
};