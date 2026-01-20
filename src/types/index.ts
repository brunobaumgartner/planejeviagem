// User Types
export type UserRole = 'guest' | 'logged' | 'premium';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
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