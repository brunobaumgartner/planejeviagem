import { useState } from 'react';
import { RefreshCw, Database, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { useUpdateAllCities, useCacheInfo } from '@/app/hooks/useCityData';

export function DataUpdater() {
  const { getAccessToken } = useAuth();
  const { updateAll, updating, error, result } = useUpdateAllCities();
  const { info, loading: loadingInfo, refresh: refreshInfo } = useCacheInfo();
  const [showSuccess, setShowSuccess] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleUpdate = async () => {
    const token = await getAccessToken();
    if (!token) {
      alert('Você precisa estar logado como admin');
      return;
    }

    const result = await updateAll(token);
    
    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      refreshInfo();
    }
  };

  const handleTestPost = async () => {
    const token = await getAccessToken();
    if (!token) {
      alert('Você precisa estar logado');
      return;
    }

    try {
      const response = await fetch(
        'https://nncryzbssbuhnlvqnjfc.supabase.co/functions/v1/make-server-5f5857fb/data/test-post',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-User-Token': token,
          },
        }
      );

      const data = await response.json();
      setTestResult(JSON.stringify(data, null, 2));
      console.log('[TEST] Resultado:', data);
    } catch (err) {
      setTestResult(`Erro: ${err}`);
      console.error('[TEST] Erro:', err);
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Database className="w-6 h-6" />
          <h3 className="text-xl font-bold">Sistema de Atualização de Dados</h3>
        </div>
        <p className="text-blue-100 text-sm">
          Atualize os preços de passagens, hospedagem e atividades de todas as cidades
        </p>
      </div>

      {/* Update Button */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="font-semibold text-lg mb-2">Atualização Manual</h4>
            <p className="text-sm text-gray-600 mb-4">
              Busca dados atualizados de custo de vida, passagens e hospedagem para todas as 18 cidades.
              O processo leva aproximadamente 10-15 segundos.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Dados são atualizados com base em índices de custo de vida atuais</span>
            </div>
          </div>
          <button
            onClick={handleUpdate}
            disabled={updating}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <RefreshCw className={`w-5 h-5 ${updating ? 'animate-spin' : ''}`} />
            {updating ? 'Atualizando...' : 'Atualizar Dados'}
          </button>
        </div>

        {/* Success Message */}
        {showSuccess && result && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">
                  Atualização concluída com sucesso! 🎉
                </p>
                <p className="text-sm text-green-700 mt-1">
                  {result.citiesUpdated} cidades atualizadas em {new Date(result.timestamp).toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Erro ao atualizar</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cache Status */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-lg">Status do Cache</h4>
          <button
            onClick={refreshInfo}
            disabled={loadingInfo}
            className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
          >
            <RefreshCw className={`w-4 h-4 ${loadingInfo ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        {loadingInfo ? (
          <div className="text-center py-8 text-gray-500">
            Carregando informações...
          </div>
        ) : info ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 mb-1">Total de Entradas</p>
                <p className="text-2xl font-bold text-blue-900">{info.cacheEntries}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 mb-1">Válidas</p>
                <p className="text-2xl font-bold text-green-900">
                  {info.entries?.filter((e: any) => e.isValid).length || 0}
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-600 mb-1">Expiradas (&gt;24h)</p>
                <p className="text-2xl font-bold text-orange-900">
                  {info.entries?.filter((e: any) => !e.isValid).length || 0}
                </p>
              </div>
            </div>

            {/* Cache Entries Table */}
            {info.entries && info.entries.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Cidade</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Última Atualização</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Idade</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {info.entries.slice(0, 10).map((entry: any, index: number) => {
                      // Extrair nome da cidade da key
                      const cityMatch = entry.key?.match(/city_data:([^:]+):/);
                      const cityName = cityMatch ? cityMatch[1] : 'Desconhecida';
                      
                      return (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2 px-3">{cityName}</td>
                          <td className="py-2 px-3 text-gray-600">
                            {new Date(entry.lastUpdated).toLocaleString('pt-BR')}
                          </td>
                          <td className="py-2 px-3 text-gray-600">
                            {formatTime(entry.ageMinutes)}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                entry.isValid
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-orange-100 text-orange-700'
                              }`}
                            >
                              {entry.isValid ? 'Válido' : 'Expirado'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {info.entries.length > 10 && (
                  <p className="text-sm text-gray-500 text-center mt-3">
                    Mostrando 10 de {info.entries.length} entradas
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Nenhuma informação disponível
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Como funciona:</p>
            <ul className="space-y-1 text-blue-800">
              <li>• Os dados são calculados com base em índices de custo de vida reais</li>
              <li>• Preços de passagens variam de acordo com a distância</li>
              <li>• Cache válido por 24 horas para otimizar performance</li>
              <li>• Atualizações automáticas podem ser agendadas (futuro)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Test Post Button */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="font-semibold text-lg mb-2">Teste de Post</h4>
            <p className="text-sm text-gray-600 mb-4">
              Realiza um teste de post para verificar a comunicação com o servidor.
            </p>
          </div>
          <button
            onClick={handleTestPost}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <RefreshCw className={`w-5 h-5`} />
            Testar Post
          </button>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">
                  Resultado do Teste
                </p>
                <pre className="text-sm text-gray-700 mt-1">
                  {testResult}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}