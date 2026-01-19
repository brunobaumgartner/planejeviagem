import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface BudgetData {
  cityId: string;
  cityName: string;
  budgetLevel: 'economico' | 'moderado' | 'conforto';
  flight: number;
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  total: number;
  dailyAverage: number;
  lastUpdated: string;
  currency: string;
}

interface CityDataResponse {
  budgets: BudgetData[];
  source: 'cache' | 'fresh';
  age: number; // minutos
}

/**
 * Hook para buscar dados atualizados de cidades
 */
export function useCityData(cityName: string, days: number = 5) {
  const [data, setData] = useState<CityDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cityName) {
      setLoading(false);
      return;
    }

    fetchCityData();
  }, [cityName, days]);

  const fetchCityData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/data/city/${encodeURIComponent(cityName)}?days=${days}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar dados');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Erro ao buscar dados da cidade:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    fetchCityData();
  };

  return { data, loading, error, refresh };
}

/**
 * Hook para atualizar dados de todas as cidades (admin only)
 */
export function useUpdateAllCities() {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const updateAll = async (accessToken: string) => {
    try {
      setUpdating(true);
      setError(null);
      
      console.log('[useCityData] Enviando requisição com token:', accessToken ? 'presente' : 'ausente');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/data/update-all`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-User-Token': accessToken,
          },
        }
      );
      
      console.log('[useCityData] Resposta recebida:', response.status, response.statusText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
        }
        throw new Error(errorData.error || `Erro ao atualizar dados (HTTP ${response.status})`);
      }

      const data = await response.json();
      setResult(data);
      return { success: true, data };
    } catch (err) {
      console.error('Erro ao atualizar todas as cidades:', err);
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setUpdating(false);
    }
  };

  return { updateAll, updating, error, result };
}

/**
 * Hook para obter informações do cache
 */
export function useCacheInfo() {
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCacheInfo();
  }, []);

  const fetchCacheInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/data/cache-info`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar informações do cache');
      }

      const data = await response.json();
      setInfo(data);
    } catch (err) {
      console.error('Erro ao buscar cache info:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    fetchCacheInfo();
  };

  return { info, loading, error, refresh };
}