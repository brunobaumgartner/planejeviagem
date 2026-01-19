/**
 * API Service - Centralized API calls to Supabase backend
 * All authenticated requests should pass through here
 */

import { projectId, publicAnonKey } from '../../utils/supabase/info';
import type { Trip, Purchase, User, CityBudgetData } from '@/types';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb`;

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getAuthHeader(accessToken?: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken || publicAnonKey}`,
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorDetails;
    try {
      errorDetails = await response.json();
    } catch {
      errorDetails = { error: await response.text() || 'Erro desconhecido' };
    }
    
    console.error('[API] Erro na resposta completa:', {
      status: response.status,
      statusText: response.statusText,
      error: errorDetails
    });
    
    throw new Error(errorDetails.error || errorDetails.message || `HTTP ${response.status}`);
  }
  return response.json();
}

// ==========================================
// TRIPS API
// ==========================================

export async function getUserTrips(userId: string, accessToken: string): Promise<Trip[]> {
  console.log('[API] getUserTrips chamado para userId:', userId);
  console.log('[API] URL:', `${BASE_URL}/trips/${userId}`);
  
  // NOTA: Usando publicAnonKey porque o servidor usa Service Role Key
  // que ignora RLS e não precisa do JWT do usuário
  const response = await fetch(`${BASE_URL}/trips/${userId}`, {
    headers: getAuthHeader(), // Sem access token = usa publicAnonKey
  });
  
  console.log('[API] Response status:', response.status, response.statusText);
  
  const data = await handleResponse<{ trips: Trip[] }>(response);
  return data.trips;
}

export async function createTrip(tripData: Partial<Trip>, accessToken: string): Promise<Trip> {
  console.log('[API] createTrip chamado');
  
  // NOTA: Usando publicAnonKey porque o servidor usa Service Role Key
  const response = await fetch(`${BASE_URL}/trips`, {
    method: 'POST',
    headers: getAuthHeader(), // Sem access token = usa publicAnonKey
    body: JSON.stringify(tripData),
  });
  const data = await handleResponse<{ trip: Trip }>(response);
  return data.trip;
}

export async function updateTrip(
  tripId: string,
  updates: Partial<Trip>,
  accessToken: string
): Promise<Trip> {
  // NOTA: Usando publicAnonKey porque o servidor usa Service Role Key
  const response = await fetch(`${BASE_URL}/trips/${tripId}`, {
    method: 'PUT',
    headers: getAuthHeader(), // Sem access token = usa publicAnonKey
    body: JSON.stringify(updates),
  });
  const data = await handleResponse<{ trip: Trip }>(response);
  return data.trip;
}

export async function deleteTrip(tripId: string, accessToken: string): Promise<void> {
  // NOTA: Usando publicAnonKey porque o servidor usa Service Role Key
  const response = await fetch(`${BASE_URL}/trips/${tripId}`, {
    method: 'DELETE',
    headers: getAuthHeader(), // Sem access token = usa publicAnonKey
  });
  await handleResponse<{ success: boolean }>(response);
}

// ==========================================
// PURCHASES API
// ==========================================

export async function createPurchase(
  data: {
    userId: string;
    tripId: string;
    amount: number;
  },
  accessToken: string
): Promise<Purchase> {
  const response = await fetch(`${BASE_URL}/purchases`, {
    method: 'POST',
    headers: getAuthHeader(accessToken),
    body: JSON.stringify(data),
  });
  const result = await handleResponse<{ purchase: Purchase }>(response);
  return result.purchase;
}

export async function getUserPurchases(
  userId: string,
  accessToken: string
): Promise<Purchase[]> {
  const response = await fetch(`${BASE_URL}/purchases/${userId}`, {
    headers: getAuthHeader(accessToken),
  });
  const data = await handleResponse<{ purchases: Purchase[] }>(response);
  return data.purchases;
}

// ==========================================
// BUDGET API
// ==========================================

export async function getCityBudget(
  cityName: string,
  accessToken?: string
): Promise<CityBudgetData> {
  const response = await fetch(`${BASE_URL}/budgets/${encodeURIComponent(cityName)}`, {
    headers: getAuthHeader(accessToken),
  });
  const data = await handleResponse<{ cityBudget: CityBudgetData }>(response);
  return data.cityBudget;
}

// ==========================================
// ADMIN API
// ==========================================

export async function getAllUsers(accessToken: string): Promise<User[]> {
  const response = await fetch(`${BASE_URL}/admin/users`, {
    headers: getAuthHeader(accessToken),
  });
  const data = await handleResponse<{ users: User[] }>(response);
  return data.users;
}

export async function getAllTrips(accessToken: string): Promise<Trip[]> {
  const response = await fetch(`${BASE_URL}/admin/trips`, {
    headers: getAuthHeader(accessToken),
  });
  const data = await handleResponse<{ trips: Trip[] }>(response);
  return data.trips;
}

export async function deliverPlanning(
  tripId: string,
  data: {
    tasks: any[];
    itinerary: any[];
  },
  accessToken: string
): Promise<void> {
  const response = await fetch(`${BASE_URL}/admin/trips/${tripId}/deliver`, {
    method: 'POST',
    headers: getAuthHeader(accessToken),
    body: JSON.stringify(data),
  });
  await handleResponse<{ success: boolean }>(response);
}

export async function updateCityBudget(
  cityName: string,
  budgetData: Partial<CityBudgetData>,
  accessToken: string
): Promise<CityBudgetData> {
  const response = await fetch(
    `${BASE_URL}/admin/city-budgets/${encodeURIComponent(cityName)}`,
    {
      method: 'PUT',
      headers: getAuthHeader(accessToken),
      body: JSON.stringify(budgetData),
    }
  );
  const data = await handleResponse<{ cityBudget: CityBudgetData }>(response);
  return data.cityBudget;
}