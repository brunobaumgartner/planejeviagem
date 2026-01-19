/**
 * Utilitário de Migração de Dados
 * 
 * Migra dados do localStorage (Guest) para o banco Supabase (Usuário Logado)
 */

import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '@/utils/supabase/info';
import type { Trip } from '@/types';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

interface LocalStorageData {
  trips: Trip[];
  lastSync: string | null;
}

/**
 * Busca dados do localStorage
 */
export function getLocalStorageData(): LocalStorageData {
  try {
    const tripsJson = localStorage.getItem('guestTrips');
    const trips = tripsJson ? JSON.parse(tripsJson) : [];
    const lastSync = localStorage.getItem('lastSync');
    
    return { trips, lastSync };
  } catch (error) {
    console.error('Erro ao ler localStorage:', error);
    return { trips: [], lastSync: null };
  }
}

/**
 * Verifica se há dados para migrar
 */
export function hasDataToMigrate(): boolean {
  const { trips } = getLocalStorageData();
  return trips.length > 0;
}

/**
 * Migra dados do localStorage para o banco Supabase
 */
export async function migrateLocalDataToSupabase(userId: string): Promise<{
  success: boolean;
  migrated: number;
  error?: string;
}> {
  try {
    const { trips } = getLocalStorageData();
    
    if (trips.length === 0) {
      return { success: true, migrated: 0 };
    }

    // Converter viagens do formato local para o formato do banco
    const tripsToInsert = trips.map(trip => ({
      user_id: userId,
      destination: trip.destination,
      start_date: trip.startDate,
      end_date: trip.endDate,
      budget: trip.budget,
      budget_amount: trip.budgetAmount || null,
      progress: trip.progress,
      tasks: trip.tasks || [],
      itinerary: trip.itinerary || null,
      status: trip.status || 'planning',
      created_at: trip.createdAt || new Date().toISOString(),
    }));

    // Inserir no banco
    const { data, error } = await supabase
      .from('trips')
      .insert(tripsToInsert)
      .select();

    if (error) {
      console.error('Erro ao migrar dados:', error);
      return {
        success: false,
        migrated: 0,
        error: 'Erro ao salvar dados no servidor',
      };
    }

    // Limpar localStorage após migração bem-sucedida
    clearLocalStorage();

    return {
      success: true,
      migrated: data?.length || 0,
    };
  } catch (error) {
    console.error('Erro na migração:', error);
    return {
      success: false,
      migrated: 0,
      error: 'Erro inesperado durante migração',
    };
  }
}

/**
 * Limpa dados do localStorage
 */
export function clearLocalStorage(): void {
  localStorage.removeItem('guestTrips');
  localStorage.removeItem('lastSync');
}

/**
 * Salva viagens no localStorage (para Guest)
 */
export function saveTripsToLocalStorage(trips: Trip[]): void {
  try {
    localStorage.setItem('guestTrips', JSON.stringify(trips));
    localStorage.setItem('lastSync', new Date().toISOString());
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error);
  }
}
