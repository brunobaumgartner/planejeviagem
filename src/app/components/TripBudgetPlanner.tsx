import { useState, useEffect } from 'react';
import { Search, DollarSign, Calendar, MapPin, Plane, Hotel, Coffee, TrendingUp, Navigation } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

interface TripBudgetPlannerProps {
  onSearch: (data: SearchData) => void;
}

export interface SearchData {
  searchType: 'budget' | 'destination';
  budget?: number;
  destination?: string;
  origin: string;
  days: number;
  currency: string;
}

export function TripBudgetPlanner({ onSearch }: TripBudgetPlannerProps) {
  const { user } = useAuth();
  const [searchType, setSearchType] = useState<'budget' | 'destination'>('budget');
  const [budget, setBudget] = useState('');
  const [destination, setDestination] = useState('');
  const [origin, setOrigin] = useState('');
  const [days, setDays] = useState('7');
  const [currency, setCurrency] = useState('BRL');

  // Preencher origem com homeCity do usuário ao carregar
  useEffect(() => {
    if (user?.homeCity) {
      setOrigin(user.homeCity);
      console.log('[TripBudgetPlanner] Origem preenchida com:', user.homeCity);
    }
  }, [user?.homeCity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar se origem está preenchida
    if (!origin.trim()) {
      alert('Por favor, informe sua cidade de origem antes de pesquisar.');
      return;
    }
    
    const searchData: SearchData = {
      searchType,
      origin: origin.trim(),
      days: parseInt(days) || 7,
      currency
    };

    if (searchType === 'budget') {
      searchData.budget = parseFloat(budget.replace(/\D/g, '')) || 0;
    } else {
      searchData.destination = destination;
    }

    console.log('[TripBudgetPlanner] Pesquisa com origem:', searchData.origin);
    onSearch(searchData);
  };

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    
    const formatted = new Intl.NumberFormat('pt-BR').format(parseInt(numbers));
    return formatted;
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setBudget(formatted);
  };

  return (
    <div className="bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg border border-sky-200">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Planeje sua Viagem
        </h2>
        <p className="text-sm text-gray-600">
          Descubra destinos ou calcule quanto vai gastar
        </p>
      </div>

      {/* Toggle Search Type */}
      <div className="flex gap-2 mb-6 bg-white/50 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setSearchType('budget')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            searchType === 'budget'
              ? 'bg-white text-sky-600 shadow-md'
              : 'text-gray-600 hover:text-sky-600'
          }`}
        >
          <DollarSign className="w-4 h-4 inline mr-2" />
          Por Orçamento
        </button>
        <button
          type="button"
          onClick={() => setSearchType('destination')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            searchType === 'destination'
              ? 'bg-white text-sky-600 shadow-md'
              : 'text-gray-600 hover:text-sky-600'
          }`}
        >
          <MapPin className="w-4 h-4 inline mr-2" />
          Por Destino
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Origin Input - SEMPRE VISÍVEL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            De onde você vai sair? <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Ex: São Paulo, Rio de Janeiro..."
              className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                origin ? 'border-green-300 bg-green-50/50' : 'border-gray-300'
              }`}
              required
            />
          </div>
          {!user?.homeCity && (
            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
              💡 Dica: Cadastre sua cidade no perfil para preencher automaticamente
            </p>
          )}
          {user?.homeCity && origin === user.homeCity && (
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              ✓ Preenchido com sua cidade cadastrada
            </p>
          )}
        </div>

        {/* Budget or Destination Input */}
        {searchType === 'budget' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quanto você pode gastar?
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="absolute left-10 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-700 bg-transparent border-none focus:ring-0 pr-2"
              >
                <option value="BRL">R$</option>
                <option value="USD">$</option>
                <option value="EUR">€</option>
              </select>
              <input
                type="text"
                value={budget}
                onChange={handleBudgetChange}
                placeholder="5.000"
                className="w-full pl-24 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent text-lg"
                required={searchType === 'budget'}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              💡 Incluindo passagens, hospedagem e gastos diários
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Para onde você quer ir?
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Ex: Paris, Rio de Janeiro, Nova York..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required={searchType === 'destination'}
              />
            </div>
          </div>
        )}

        {/* Days Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantos dias de viagem?
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              min="1"
              max="365"
              placeholder="7"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!origin.trim()}
          className={`w-full py-4 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
            origin.trim()
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {searchType === 'budget' ? (
            <>
              <TrendingUp className="w-5 h-5" />
              Ver Destinos Disponíveis
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Calcular Custo Total
            </>
          )}
        </button>

        {!origin.trim() && (
          <p className="text-xs text-center text-amber-600">
            ⚠️ Preencha a cidade de origem para continuar
          </p>
        )}
      </form>

      {/* Info Cards */}
      <div className="mt-6 grid grid-cols-3 gap-2">
        <div className="bg-white/60 rounded-lg p-3 text-center">
          <Plane className="w-5 h-5 text-sky-500 mx-auto mb-1" />
          <p className="text-xs font-medium text-gray-700">Voos</p>
          <p className="text-xs text-gray-500">Ida + Volta</p>
        </div>
        <div className="bg-white/60 rounded-lg p-3 text-center">
          <Hotel className="w-5 h-5 text-sky-500 mx-auto mb-1" />
          <p className="text-xs font-medium text-gray-700">Hospedagem</p>
          <p className="text-xs text-gray-500">Por noite</p>
        </div>
        <div className="bg-white/60 rounded-lg p-3 text-center">
          <Coffee className="w-5 h-5 text-sky-500 mx-auto mb-1" />
          <p className="text-xs font-medium text-gray-700">Diária</p>
          <p className="text-xs text-gray-500">Alimentação</p>
        </div>
      </div>
    </div>
  );
}
