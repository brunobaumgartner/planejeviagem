import { useState, useEffect } from 'react';
import { RefreshCw, MapPin, Loader2, DollarSign } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface Destination {
  code: string;
  name: string;
  country: string;
  countryCode: string;
  popularity: number;
  averagePrice: number | null;
  lastUpdated: string;
}

export function DestinationsCache() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState('SAO');

  useEffect(() => {
    fetchDestinations();
  }, [origin]);

  const fetchDestinations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/cached-destinations?origin=${origin}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setDestinations(data.destinations);
      } else {
        setError(data.error || 'Erro ao carregar destinos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshCache = async () => {
    if (!confirm('⚠️ Tem certeza que deseja atualizar o cache? Isso vai buscar novos dados da API Travelpayouts.')) {
      return;
    }

    setIsRefreshing(true);
    setError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/refresh-destinations-cache?origin=${origin}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        }
      );

      const data = await response.json();
      
      if (data.success) {
        await fetchDestinations();
        alert(`✅ Cache atualizado com sucesso! ${data.total} destinos carregados.`);
      } else {
        setError(data.error || 'Erro ao atualizar cache');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar cache');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
          <p className="text-gray-600">Carregando destinos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-sky-600" />
          <div>
            <h3 className="text-lg font-bold text-gray-900">Cache de Destinos da API</h3>
            <p className="text-sm text-gray-600">
              {destinations.length} destinos em cache • Origem: {origin}
            </p>
          </div>
        </div>
        <button
          onClick={handleRefreshCache}
          disabled={isRefreshing}
          className="px-4 py-2 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isRefreshing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Atualizando...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Atualizar Cache
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-900 font-semibold">Erro: {error}</p>
        </div>
      )}

      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          💡 <strong>Info:</strong> O cache é atualizado automaticamente a cada 24 horas. 
          Os destinos são buscados dinamicamente da API Travelpayouts baseado na origem selecionada.
        </p>
      </div>

      {destinations.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <p className="text-amber-900 font-semibold">Nenhum destino em cache</p>
          <p className="text-sm text-amber-800 mt-2">Clique em "Atualizar Cache" para buscar destinos da API</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Destino</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Código</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Popularidade</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Preço Médio</th>
              </tr>
            </thead>
            <tbody>
              {destinations.slice(0, 20).map((dest) => (
                <tr key={dest.code} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{dest.name}</p>
                      <p className="text-xs text-gray-500">{dest.country}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-1 bg-sky-100 text-sky-700 rounded text-xs font-mono">
                      {dest.code}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-gray-700">{dest.popularity}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {dest.averagePrice ? (
                      <div className="inline-flex items-center gap-1 text-gray-700">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold">R$ {dest.averagePrice.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {destinations.length > 20 && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Mostrando 20 de {destinations.length} destinos
            </p>
          )}
        </div>
      )}
    </div>
  );
}
