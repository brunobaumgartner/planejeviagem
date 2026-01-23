// User Types
export type UserRole = 'guest' | 'logged' | 'premium';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  premiumUntil?: string; // Data de expiração do premium (ISO string)
  premiumPlan?: 'monthly' | 'annual'; // Tipo de plano premium
  homeCity?: string; // Cidade de origem do usuário
}

// Wikipedia/Cultural Guide Types
export interface WikiArticle {
  title: string;
  extract: string;
  fullUrl: string;
  thumbnail?: string;
  language: 'pt' | 'en' | 'es';
  lastModified?: string;
}

export interface WikiSection {
  title: string;
  content: string;
  level: number;
}

export interface WikiImage {
  url: string;
  title: string;
  description?: string;
}

export interface CityGuide {
  cityName: string;
  summary: string;
  history?: string;
  culture?: string;
  tourism?: string;
  tips?: string[];
  images: WikiImage[];
  article: WikiArticle;
  sections: WikiSection[];
}

// Trip Types
export interface TaskAttachment {
  id: string;
  type: 'link' | 'document' | 'image';
  name: string;
  url: string;
  size?: number; // Para documentos e imagens (em bytes)
  mimeType?: string; // Para documentos e imagens
  addedAt: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt?: string;
  attachments?: TaskAttachment[]; // Nova propriedade
}

export interface ItineraryActivity {
  id: string;
  time: string;
  title: string;
  location: string;
  duration: string;
  rating?: number;
  notes?: string;
}

export interface ItineraryDay {
  day: number;
  date: string;
  activities: ItineraryActivity[];
}

export type TripStatus = 'planning' | 'purchased' | 'in_progress' | 'delivered' | 'completed';

// Transport types
export type TransportType = 'flight' | 'bus' | 'car';
export type FlightClass = 'economy' | 'business';
export type BusClass = 'conventional' | 'sleeper';

export interface TransportPreferences {
  type: TransportType;
  flightClass?: FlightClass;
  busClass?: BusClass;
  passengers: number;
  origin: string; // Nome da cidade de origem
}

export interface Trip {
  id: string;
  userId?: string; // null for guest trips
  ownerId?: string; // ID do dono original da viagem
  isShared?: boolean; // Se a viagem foi compartilhada com este usuário
  sharedBy?: string; // ID de quem compartilhou
  permission?: 'view' | 'edit'; // Permissão do usuário atual (se for compartilhada)
  destination: string;
  origin?: string; // Cidade de origem
  country?: string; // País do destino
  startDate: string;
  endDate: string;
  budget: string;
  budgetAmount?: number; // numeric value for calculations
  transportPreferences?: TransportPreferences; // Preferências de transporte
  progress: number;
  tasks: Task[];
  packingItems?: PackingItem[]; // Lista de bagagem da viagem
  itinerary?: ItineraryDay[]; // Only for premium or purchased trips
  status: TripStatus;
  purchaseId?: string; // If planning was purchased
  createdAt: string;
  updatedAt: string;
}

// Purchase Types
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export interface Purchase {
  id: string;
  userId: string;
  tripId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: 'mercadopago' | 'stripe';
  createdAt: string;
  deliveredAt?: string;
}

// Budget Recommendation Types
export type BudgetLevel = 'economy' | 'medium' | 'comfort';
export type BudgetStatus = 'within_budget' | 'tight' | 'over_budget';

export interface BudgetRecommendation {
  dailyBudget: number;
  totalEstimated: number;
  flightEstimate: number;
  accommodationEstimate: number;
  foodEstimate: number;
  activitiesEstimate: number;
  status: BudgetStatus;
  level: BudgetLevel;
  message: string;
}

// City Budget Data
export interface CityBudget {
  id: string;
  city_name: string;
  country: string;
  daily_budgets: {
    economico: number;
    moderado: number;
    conforto: number;
  };
  last_updated?: string;
}

// ============================================
// NOVAS FUNCIONALIDADES
// ============================================

// Sistema de Notificações
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'trip_update' | 'payment' | 'system';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export type NotificationCreate = Omit<Notification, 'id' | 'created_at'>;

// Sistema de Compartilhamento
export interface SharedTrip {
  id: string;
  trip_id: string;
  shared_by: string;
  shared_with_email?: string;
  share_token: string;
  access_level: 'view' | 'edit';
  expires_at?: string;
  created_at: string;
}

export type SharedTripCreate = Omit<SharedTrip, 'id' | 'created_at' | 'share_token'>;

// Sistema de Checklist de Bagagem
export interface PackingItem {
  id: string;
  trip_id: string;
  category: 'roupas' | 'higiene' | 'eletronicos' | 'documentos' | 'medicamentos' | 'outros';
  name: string;
  quantity: number;
  packed: boolean;
  notes?: string;
  created_at: string;
}

export type PackingItemCreate = Omit<PackingItem, 'id' | 'created_at'>;

// Sistema de Documentos
export interface TripDocument {
  id: string;
  trip_id: string;
  user_id: string;
  name: string;
  type: 'passport' | 'visa' | 'ticket' | 'voucher' | 'insurance' | 'other';
  file_url: string;
  file_size: number;
  uploaded_at: string;
}

export type TripDocumentCreate = Omit<TripDocument, 'id' | 'uploaded_at'>;

// ============================================
// SISTEMA DE CONFIGURAÇÕES DE PREÇOS
// ============================================

export interface PricingConfig {
  // Planos Premium
  premium_monthly_price: number;
  premium_annual_price: number;
  
  // Pacote de planejamento de viagem
  planning_package_price: number;
  
  // Modo de teste (gratuito)
  test_mode: boolean;
  
  // Última atualização
  updated_at: string;
  updated_by?: string;
}

export type PricingConfigUpdate = Partial<Omit<PricingConfig, 'updated_at'>>;

// ============================================
// SISTEMA DE VIAGENS INTERNACIONAIS
// ============================================

// REST Countries API Types
export interface Country {
  name: {
    common: string; // Nome comum (ex: "Brazil")
    official: string; // Nome oficial (ex: "Federative Republic of Brazil")
    nativeName: Record<string, { official: string; common: string }>;
  };
  cca2: string; // Código de 2 letras (ex: "BR")
  cca3: string; // Código de 3 letras (ex: "BRA")
  capital?: string[]; // Capitais do país
  region: string; // Região (ex: "Americas")
  subregion?: string; // Sub-região (ex: "South America")
  languages?: Record<string, string>; // Idiomas (ex: { "por": "Portuguese" })
  currencies?: Record<string, { name: string; symbol: string }>; // Moedas
  flag: string; // Emoji da bandeira
  flags: {
    png: string;
    svg: string;
    alt?: string;
  };
  coatOfArms?: {
    png?: string;
    svg?: string;
  };
  population: number;
  area?: number; // Área em km²
  timezones: string[]; // Fusos horários
  borders?: string[]; // Países vizinhos (códigos)
  latlng: [number, number]; // Coordenadas [lat, lng]
  car: {
    side: 'left' | 'right'; // Lado da direção
  };
  idd: {
    root: string; // Código de discagem (ex: "+55")
    suffixes?: string[];
  };
  tld?: string[]; // Top-level domain (ex: [".br"])
  independent?: boolean;
  landlocked?: boolean; // Sem saída para o mar
}

// ExchangeRate-API Types
export interface ExchangeRate {
  base: string; // Moeda base (ex: "BRL")
  target: string; // Moeda alvo (ex: "USD")
  rate: number; // Taxa de câmbio
  lastUpdate: string; // ISO timestamp da última atualização
}

export interface ExchangeRatesResponse {
  result: string; // "success" | "error"
  base_code: string; // Código da moeda base
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  time_next_update_utc: string;
  conversion_rates: Record<string, number>; // { "USD": 0.20, "EUR": 0.18, ... }
}

// Overpass API Types (OpenStreetMap)
export interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>; // { "name": "Eiffel Tower", "tourism": "attraction", ... }
  center?: { lat: number; lon: number }; // Para ways/relations
}

export interface TouristAttraction {
  id: string;
  name: string;
  type: string; // museum, monument, viewpoint, etc
  lat: number;
  lon: number;
  address?: string;
  website?: string;
  openingHours?: string;
  phone?: string;
  wikipedia?: string;
  rating?: number;
  description?: string; // From Wikipedia
  image?: string; // From Wikipedia
}

// Wikipedia API Types
export interface WikipediaSummary {
  title: string;
  extract: string; // Resumo (texto)
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  coordinates?: {
    lat: number;
    lon: number;
  };
  pageUrl: string;
}

// International City Data
export interface InternationalCity {
  id: string;
  name: string;
  country: string; // Nome do país
  countryCode: string; // Código ISO (ex: "FR")
  region: string; // Região (ex: "Europe")
  lat: number;
  lon: number;
  population?: number;
  timezone: string;
  currency: string; // Código da moeda (ex: "EUR")
  currencySymbol: string; // Símbolo (ex: "€")
  language: string; // Idioma principal
  flagEmoji: string; // Emoji da bandeira
  flagUrl: string; // URL da bandeira (SVG)
}

// Extended Trip with International Support
export interface InternationalTrip extends Trip {
  isInternational: boolean; // Se é viagem internacional
  countryCode?: string; // Código do país de destino
  destinationCurrency?: string; // Moeda do destino
  exchangeRate?: number; // Taxa de câmbio (BRL → moeda local)
  budgetInLocalCurrency?: number; // Orçamento na moeda local
  culturalInfo?: WikipediaSummary; // Informações culturais
  attractions?: TouristAttraction[]; // Pontos turísticos
  emergencyInfo?: {
    police: string;
    ambulance: string;
    fire: string;
    consulate?: string;
  };
}

// Cache Types
export interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// API Response Wrappers
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean; // Se veio do cache
}

// Search Types
export interface CountrySearchResult {
  code: string; // Código ISO
  name: string;
  flag: string; // Emoji
  region: string;
}

export interface CitySearchResult {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  flag: string;
  population?: number;
}