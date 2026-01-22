import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Plus, Save, Trash2, DollarSign, MapPin, Edit2, RefreshCw } from 'lucide-react';

interface CityBudget {
  id: string;
  city_name: string;
  country: string;
  daily_budgets: {
    economy: number;
    medium: number;
    comfort: number;
  };
  last_updated: string;
}

export function BudgetEditor() {
  const { getAccessToken } = useAuth();
  const [budgets, setBudgets] = useState<CityBudget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingBudget, setEditingBudget] = useState<CityBudget | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  
  // Autocomplete states
  const [originInput, setOriginInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setIsFetchingData(true);

      const accessToken = await getAccessToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/admin/city-budgets`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-User-Token': accessToken || '',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar orçamentos');
      }

      const data = await response.json();
      
      // Log seguro sem referências circulares
      const firstBudget = data.budgets?.[0];
      const budgetSample = firstBudget ? {
        id: firstBudget.id,
        city_name: firstBudget.city_name,
        hasId: !!firstBudget.id,
        idType: typeof firstBudget.id,
        allKeys: Object.keys(firstBudget)
      } : null;
      
      console.log('[Admin] Orçamentos carregados:', {
        count: data.budgets?.length || 0,
        sample: budgetSample,
        allHaveIds: data.budgets?.every((b: CityBudget) => !!b.id),
        rawFirstBudget: firstBudget ? JSON.stringify(firstBudget) : null
      });
      
      // Filtrar orçamentos sem ID válido
      const validBudgets = (data.budgets || []).filter((b: CityBudget) => {
        const isValid = b.id && b.id !== 'undefined' && !b.id.startsWith('new-');
        return isValid;
      });
      
      if (validBudgets.length !== data.budgets?.length) {
        console.warn('[Admin] Alguns orçamentos foram filtrados por não terem ID válido:', {
          total: data.budgets?.length,
          válidos: validBudgets.length,
          filtrados: (data.budgets?.length || 0) - validBudgets.length,
          filtradosCidades: data.budgets
            ?.filter((b: CityBudget) => !b.id || b.id === 'undefined' || b.id.startsWith('new-'))
            .map((b: CityBudget) => ({ city: b.city_name, id: b.id }))
        });
      }
      
      setBudgets(validBudgets);
    } catch (err: any) {
      console.error('[Admin] Erro ao carregar orçamentos:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsFetchingData(false);
    }
  };

  const handleSaveBudget = async (budget: CityBudget) => {
    try {
      // Validação básica
      if (!budget.city_name || !budget.country) {
        alert('Por favor, preencha o nome da cidade e o país');
        return;
      }

      const isNew = budget.id?.startsWith('new-') || false;
      
      // Validação crítica: garantir que orçamentos existentes tenham ID válido
      if (!isNew && (!budget.id || budget.id === 'undefined')) {
        console.error('[Admin] Tentativa de atualizar orçamento sem ID válido:', {
          id: budget.id,
          city: budget.city_name,
          country: budget.country
        });
        alert('Erro: Este orçamento não possui um ID válido. Por favor, recarregue a página e tente novamente.');
        return;
      }
      
      // Verificar se a cidade já existe (apenas para novos orçamentos)
      if (isNew) {
        const existingCity = budgets.find(
          b => b.city_name.toLowerCase() === budget.city_name.toLowerCase()
        );
        if (existingCity) {
          alert(`A cidade "${budget.city_name}" já existe no sistema. Use a edição para atualizar seus valores.`);
          return;
        }
      } else {
        // Para edição, verificar se outro orçamento já usa esse nome
        const existingCity = budgets.find(
          b => b.id !== budget.id && b.city_name.toLowerCase() === budget.city_name.toLowerCase()
        );
        if (existingCity) {
          alert(`Já existe outra cidade com o nome "${budget.city_name}". Escolha um nome diferente.`);
          return;
        }
      }

      const url = isNew
        ? `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/admin/city-budgets`
        : `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/admin/city-budgets/${budget.id}`;

      const method = isNew ? 'POST' : 'PUT';

      console.log(`[Admin] ${isNew ? 'Criando' : 'Atualizando'} orçamento:`, {
        id: budget.id,
        city: budget.city_name,
        method,
        url
      });

      const accessToken = await getAccessToken();
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken || '',
        },
        body: JSON.stringify({
          city_name: budget.city_name,
          country: budget.country,
          daily_budgets: budget.daily_budgets,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[Admin] Erro na resposta:', errorData);
        const errorMsg = errorData.details 
          ? `${errorData.error}\n\nDetalhes: ${errorData.details}`
          : errorData.error || 'Erro ao salvar orçamento';
        throw new Error(errorMsg);
      }

      const result = await response.json();
      console.log('[Admin] Orçamento salvo com sucesso:', result);
      
      setEditingBudget(null);
      setIsEditing(false);
      fetchBudgets();
    } catch (err: any) {
      console.error('[Admin] Erro ao salvar orçamento:', err);
      alert(err.message || 'Erro ao salvar orçamento');
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (!confirm('Tem certeza que deseja excluir este orçamento?')) {
      return;
    }

    try {
      const accessToken = await getAccessToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/admin/city-budgets/${budgetId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-User-Token': accessToken || '',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao excluir orçamento');
      }

      console.log('[Admin] Orçamento excluído com sucesso');
      fetchBudgets();
    } catch (err: any) {
      console.error('[Admin] Erro ao excluir orçamento:', err);
      alert(err.message);
    }
  };

  const startEditing = (budget?: CityBudget) => {
    if (budget) {
      const budgetInfo = {
        id: budget.id,
        city: budget.city_name,
        hasId: !!budget.id
      };
      console.log('[Admin] Iniciando edição de orçamento:', budgetInfo);
      
      setEditingBudget({
        id: budget.id, // Garantir que o ID está sendo preservado
        city_name: budget.city_name || '',
        country: budget.country || '',
        daily_budgets: {
          economy: budget.daily_budgets?.economy || 0,
          medium: budget.daily_budgets?.medium || 0,
          comfort: budget.daily_budgets?.comfort || 0,
        },
        last_updated: budget.last_updated || new Date().toISOString(),
      });
      setIsEditing(false); // Editando existente
    } else {
      // Criar novo
      console.log('[Admin] Criando novo orçamento');
      setEditingBudget({
        id: `new-${Date.now()}`,
        city_name: '',
        country: '',
        daily_budgets: {
          economy: 150,
          medium: 300,
          comfort: 500,
        },
        last_updated: new Date().toISOString(),
      });
      setIsEditing(true); // Criando novo
    }
  };

  const fetchCityData = async () => {
    if (!editingBudget) return;
    
    if (!editingBudget.city_name || !editingBudget.country) {
      alert('Por favor, preencha o nome da cidade e o país primeiro');
      return;
    }

    try {
      setIsFetchingData(true);
      console.log('[Admin] Buscando dados para:', editingBudget.city_name, editingBudget.country);

      const accessToken = await getAccessToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/api/city-data?city=${encodeURIComponent(editingBudget.city_name)}&country=${encodeURIComponent(editingBudget.country)}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-User-Token': accessToken || '',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar dados da cidade');
      }

      const data = await response.json();
      console.log('[Admin] Dados recebidos:', data);

      if (data.dailyBudgets) {
        setEditingBudget({
          ...editingBudget,
          daily_budgets: {
            economy: Math.round(data.dailyBudgets.economy),
            medium: Math.round(data.dailyBudgets.medium),
            comfort: Math.round(data.dailyBudgets.comfort),
          },
        });
        alert(`✅ Dados atualizados com sucesso!\n\nÍndice de custo: ${data.costIndex}\nÚltima atualização: ${new Date(data.lastUpdated).toLocaleString('pt-BR')}`);
      } else {
        alert('❌ Não foi possível obter dados atualizados para esta cidade. Use os valores padrão.');
      }
    } catch (err: any) {
      console.error('[Admin] Erro ao buscar dados:', err);
      alert(`Erro ao buscar dados: ${err.message}\n\nVocê pode preencher os valores manualmente.`);
    } finally {
      setIsFetchingData(false);
    }
  };

  // Autocomplete functions
  const searchAddress = async (query: string, isOrigin: boolean) => {
    if (query.length < 3) {
      if (isOrigin) {
        setOriginSuggestions([]);
        setShowOriginDropdown(false);
      } else {
        setDestinationSuggestions([]);
        setShowDestinationDropdown(false);
      }
      return;
    }

    try {
      const accessToken = await getAccessToken();
      
      // Usar rota do backend para evitar CORS
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/api/geocode?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-User-Token': accessToken || '',
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar endereços');
      }

      const cities = await response.json();
      
      if (isOrigin) {
        setOriginSuggestions(cities);
        setShowOriginDropdown(cities.length > 0);
      } else {
        setDestinationSuggestions(cities);
        setShowDestinationDropdown(cities.length > 0);
      }
    } catch (error) {
      console.error('[Autocomplete] Erro ao buscar endereços:', error);
      // Não mostrar erro ao usuário, apenas limpar sugestões
      if (isOrigin) {
        setOriginSuggestions([]);
        setShowOriginDropdown(false);
      } else {
        setDestinationSuggestions([]);
        setShowDestinationDropdown(false);
      }
    }
  };

  const selectAddress = (place: any, isOrigin: boolean) => {
    const cityName = place.address?.city || place.address?.town || place.address?.village || place.name;
    const country = place.address?.country || '';
    const state = place.address?.state || '';
    
    // Criar display limpo: "Cidade, Estado, País"
    const parts = [cityName];
    if (state && state !== cityName) {
      parts.push(state);
    }
    if (country) {
      parts.push(country);
    }
    const displayName = parts.join(', ');

    if (isOrigin) {
      setOriginInput(displayName);
      setShowOriginDropdown(false);
    } else {
      setDestinationInput(displayName);
      setShowDestinationDropdown(false);
      
      // Auto-preencher cidade e país com base no destino
      if (editingBudget) {
        setEditingBudget({
          ...editingBudget,
          city_name: cityName,
          country: country
        });
      }
    }
  };

  const initializeInternationalBudgets = async () => {
    if (!confirm('Isso irá adicionar/atualizar orçamentos para 80+ cidades internacionais. Deseja continuar?')) {
      return;
    }

    try {
      setIsInitializing(true);
      console.log('[Admin] Inicializando orçamentos internacionais...');

      const accessToken = await getAccessToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/admin/init-international-budgets`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-User-Token': accessToken || '',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao inicializar orçamentos');
      }

      const result = await response.json();
      console.log('[Admin] Resultado da inicialização:', result);
      
      alert(`✅ ${result.message}\n\nDetalhes:\n${result.stats.created} criados\n${result.stats.updated} atualizados\n${result.stats.errors} erros`);
      
      // Recarregar a lista
      fetchBudgets();
    } catch (err: any) {
      console.error('[Admin] Erro ao inicializar orçamentos:', err);
      alert(`❌ Erro: ${err.message}`);
    } finally {
      setIsInitializing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Carregando orçamentos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-medium">Erro ao carregar orçamentos</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={fetchBudgets}
          className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 rounded text-sm font-medium transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orçamentos por Cidade</h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure os valores médios de custo diário para cada destino
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={initializeInternationalBudgets}
            disabled={isInitializing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isInitializing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}
            title="Adicionar/atualizar orçamentos de 80+ cidades internacionais"
          >
            <RefreshCw className={`w-4 h-4 ${isInitializing ? 'animate-spin' : ''}`} />
            {isInitializing ? 'Inicializando...' : '🌍 Init Internacional'}
          </button>
          <button
            onClick={() => startEditing()}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar Cidade
          </button>
        </div>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <DollarSign className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">ℹ️ Sistema de Transporte Dinâmico</p>
            <p className="text-blue-700">
              Os custos de transporte (avião, ônibus, carro) agora são calculados automaticamente com base na origem, 
              destino, época do ano, tipo de transporte, classe e número de passageiros. Aqui você configura apenas 
              os orçamentos diários de hospedagem, alimentação e atividades.
            </p>
          </div>
        </div>
      </div>

      {/* Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((budget) => (
          <div key={budget.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{budget.city_name}</h3>
                  <p className="text-sm text-gray-500">{budget.country}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEditing(budget)}
                  disabled={!budget.id}
                  className={`p-2 rounded-lg transition-colors ${
                    budget.id 
                      ? 'hover:bg-gray-100' 
                      : 'opacity-50 cursor-not-allowed bg-gray-100'
                  }`}
                  title={budget.id ? 'Editar' : 'Orçamento sem ID válido'}
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDeleteBudget(budget.id)}
                  disabled={!budget.id}
                  className={`p-2 rounded-lg transition-colors ${
                    budget.id 
                      ? 'hover:bg-red-50' 
                      : 'opacity-50 cursor-not-allowed bg-gray-100'
                  }`}
                  title={budget.id ? 'Excluir' : 'Orçamento sem ID válido'}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-2">Orçamento Diário</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="p-2 bg-green-50 rounded">
                    <div className="text-xs text-green-700 font-medium">Econômico</div>
                    <div className="font-semibold text-green-900">R$ {budget.daily_budgets?.economy || 0}</div>
                  </div>
                  <div className="p-2 bg-blue-50 rounded">
                    <div className="text-xs text-blue-700 font-medium">Médio</div>
                    <div className="font-semibold text-blue-900">R$ {budget.daily_budgets?.medium || 0}</div>
                  </div>
                  <div className="p-2 bg-purple-50 rounded">
                    <div className="text-xs text-purple-700 font-medium">Conforto</div>
                    <div className="font-semibold text-purple-900">R$ {budget.daily_budgets?.comfort || 0}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
              Atualizado em: {new Date(budget.last_updated).toLocaleDateString('pt-BR')}
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create Modal */}
      {editingBudget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h3 className="text-xl font-bold text-gray-900">
                {isEditing ? 'Adicionar Nova Cidade' : 'Editar Orçamento'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                ID: {editingBudget.id || 'UNDEFINED'} | Tipo: {isEditing ? 'NOVO' : 'EDIÇÃO'}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Address Fields with Autocomplete */}
              <div className="grid grid-cols-2 gap-4">
                {/* Origin */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📍 Endereço de Origem
                  </label>
                  <input
                    type="text"
                    value={originInput}
                    onChange={(e) => {
                      setOriginInput(e.target.value);
                      searchAddress(e.target.value, true);
                    }}
                    onFocus={() => originSuggestions.length > 0 && setShowOriginDropdown(true)}
                    onBlur={() => setTimeout(() => setShowOriginDropdown(false), 200)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="Ex: São Paulo, Brasil"
                  />
                  {showOriginDropdown && originSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {originSuggestions.map((place, idx) => {
                        const city = place.address?.city || place.address?.town || place.address?.village || place.name;
                        const state = place.address?.state || '';
                        const country = place.address?.country || '';
                        const displayText = state ? `${city}, ${state}` : `${city}, ${country}`;
                        
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => selectAddress(place, true)}
                            className="w-full px-3 py-2 text-left hover:bg-sky-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900 text-sm">{displayText}</div>
                            <div className="text-xs text-gray-500">{place.type}</div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Destination */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🎯 Endereço de Destino
                  </label>
                  <input
                    type="text"
                    value={destinationInput}
                    onChange={(e) => {
                      setDestinationInput(e.target.value);
                      searchAddress(e.target.value, false);
                    }}
                    onFocus={() => destinationSuggestions.length > 0 && setShowDestinationDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDestinationDropdown(false), 200)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="Ex: Rio de Janeiro, Brasil"
                  />
                  {showDestinationDropdown && destinationSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {destinationSuggestions.map((place, idx) => {
                        const city = place.address?.city || place.address?.town || place.address?.village || place.name;
                        const state = place.address?.state || '';
                        const country = place.address?.country || '';
                        const displayText = state ? `${city}, ${state}` : `${city}, ${country}`;
                        
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => selectAddress(place, false)}
                            className="w-full px-3 py-2 text-left hover:bg-sky-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900 text-sm">{displayText}</div>
                            <div className="text-xs text-gray-500 capitalize">{place.type}</div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Auto-populated City Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">✅ Informações Auto-Preenchidas:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Cidade:</span>
                    <span className="ml-2 font-medium text-gray-900">{editingBudget.city_name || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">País:</span>
                    <span className="ml-2 font-medium text-gray-900">{editingBudget.country || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Daily Budgets */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Orçamento Diário (R$)</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Econômico</label>
                    <input
                      type="number"
                      value={editingBudget.daily_budgets?.economy || 0}
                      onChange={(e) => setEditingBudget({
                        ...editingBudget,
                        daily_budgets: { 
                          economy: Number(e.target.value) || 0,
                          medium: editingBudget.daily_budgets?.medium || 0,
                          comfort: editingBudget.daily_budgets?.comfort || 0,
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Médio</label>
                    <input
                      type="number"
                      value={editingBudget.daily_budgets?.medium || 0}
                      onChange={(e) => setEditingBudget({
                        ...editingBudget,
                        daily_budgets: { 
                          economy: editingBudget.daily_budgets?.economy || 0,
                          medium: Number(e.target.value) || 0,
                          comfort: editingBudget.daily_budgets?.comfort || 0,
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Conforto</label>
                    <input
                      type="number"
                      value={editingBudget.daily_budgets?.comfort || 0}
                      onChange={(e) => setEditingBudget({
                        ...editingBudget,
                        daily_budgets: { 
                          economy: editingBudget.daily_budgets?.economy || 0,
                          medium: editingBudget.daily_budgets?.medium || 0,
                          comfort: Number(e.target.value) || 0,
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Fetch Data Button */}
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                <p className="text-sm text-sky-900 mb-3">
                  <strong>💡 Dica:</strong> Preencha o nome da cidade e país, depois clique em "Buscar Dados Atualizados" 
                  para obter valores baseados em índices reais de custo de vida.
                </p>
                <button
                  onClick={fetchCityData}
                  disabled={isFetchingData || !editingBudget.city_name || !editingBudget.country}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isFetchingData || !editingBudget.city_name || !editingBudget.country
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-sky-500 hover:bg-sky-600 text-white'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${isFetchingData ? 'animate-spin' : ''}`} />
                  {isFetchingData ? 'Buscando...' : 'Buscar Dados Atualizados'}
                </button>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setEditingBudget(null);
                  setIsEditing(false);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSaveBudget(editingBudget)}
                className="flex items-center gap-2 px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}