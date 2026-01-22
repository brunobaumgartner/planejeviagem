/**
 * EXCHANGE SYSTEM SCREEN - FEATURE 2
 * 
 * Tela completa do Sistema de Câmbio + Orçamento Multinacional
 * Demonstra todas as funcionalidades da Feature 2
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { CurrencyWidget } from '../CurrencyWidget';
import { ExchangeRateChart } from '../ExchangeRateChart';
import { CashCalculator } from '../CashCalculator';
import { BudgetView } from '../BudgetView';
import { ExchangeAlerts } from '../ExchangeAlerts';
import { currencyService } from '@/services/currencyService';
import { BottomNavigation } from '../BottomNavigation';
import { useNavigation } from '@/app/context/NavigationContext';

interface ExchangeSystemProps {
  onBack?: () => void;
}

export function ExchangeSystem({ onBack }: ExchangeSystemProps) {
  const { setCurrentScreen } = useNavigation();
  const [selectedFromCurrency, setSelectedFromCurrency] = useState('BRL');
  const [selectedToCurrency, setSelectedToCurrency] = useState('USD');
  const [currentRate, setCurrentRate] = useState(5.0);
  const [totalBudget, setTotalBudget] = useState(5000);
  const [tripDays, setTripDays] = useState(7);
  const [destination, setDestination] = useState('United States');
  const [popularCurrencies, setPopularCurrencies] = useState<Array<{
    code: string;
    name: string;
    flag: string;
    destination: string;
  }>>([]);

  // Buscar moedas populares da API
  useEffect(() => {
    async function loadPopularCurrencies() {
      try {
        const allCurrencies = await currencyService.getAvailableCurrencies();
        
        // Filtrar as 12 moedas mais populares
        const popularCodes = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'MXN', 'ARS', 'KRW', 'INR'];
        const popular = allCurrencies
          .filter(c => popularCodes.includes(c.code))
          .map(c => ({
            code: c.code,
            name: c.name,
            flag: c.flag,
            destination: getDestinationForCurrency(c.code),
          }));
        
        setPopularCurrencies(popular);
      } catch (error) {
        console.error('[ExchangeSystem] Error loading currencies:', error);
      }
    }
    loadPopularCurrencies();
  }, []);

  // Mapear código de moeda para destino
  function getDestinationForCurrency(code: string): string {
    const map: Record<string, string> = {
      'USD': 'United States',
      'EUR': 'France',
      'GBP': 'United Kingdom',
      'JPY': 'Japan',
      'AUD': 'Australia',
      'CAD': 'Canada',
      'CHF': 'Switzerland',
      'CNY': 'China',
      'MXN': 'Mexico',
      'ARS': 'Argentina',
      'KRW': 'South Korea',
      'INR': 'India',
    };
    return map[code] || code;
  }

  // Mock budget items - REMOVIDO (vazio até ter dados reais)
  const budgetItems: any[] = [];
  
  // Função de voltar
  function handleBack() {
    if (onBack) {
      onBack();
    } else {
      setCurrentScreen('home');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sistema de Câmbio</h1>
                <p className="text-sm text-gray-600">Orçamento Multinacional</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Currency Selector */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Selecione a Moeda</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {popularCurrencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => {
                  setSelectedToCurrency(currency.code);
                  setDestination(currency.destination);
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedToCurrency === currency.code
                    ? 'bg-blue-50 border-blue-500 shadow-lg scale-105'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="text-3xl mb-2">{currency.flag}</div>
                <div className="font-bold text-sm text-gray-900">{currency.code}</div>
                <div className="text-xs text-gray-600 truncate">{currency.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Widgets */}
          <div className="lg:col-span-1 space-y-6">
            {/* Currency Widget - Compact */}
            <CurrencyWidget
              from={selectedFromCurrency}
              to={selectedToCurrency}
              initialAmount={100}
              onRateChange={(rate) => setCurrentRate(rate)}
              compact={false}
            />

            {/* Budget Controls */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Configurações da Viagem
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orçamento Total (BRL)
                  </label>
                  <input
                    type="number"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duração (dias)
                  </label>
                  <input
                    type="number"
                    value={tripDays}
                    onChange={(e) => setTripDays(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="7"
                  />
                </div>
              </div>
            </div>

            {/* Exchange Alerts */}
            <ExchangeAlerts
              from={selectedFromCurrency}
              to={selectedToCurrency}
              currentRate={currentRate}
            />
          </div>

          {/* Right Column - Charts and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Exchange Rate Chart */}
            <ExchangeRateChart
              from={selectedFromCurrency}
              to={selectedToCurrency}
              days={30}
              height={320}
            />

            {/* Cash Calculator */}
            <CashCalculator
              totalBudget={totalBudget}
              days={tripDays}
              destination={destination}
              currency={selectedToCurrency}
            />

            {/* Budget View */}
            <BudgetView
              items={budgetItems}
              currency={selectedToCurrency}
              showComparison={true}
            />
          </div>
        </div>

        {/* Feature Info */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white mb-24">
          <h2 className="text-2xl font-bold mb-4">✨ Feature 2: Sistema de Câmbio Completo</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-2xl">💱</span>
                Conversão em Tempo Real
              </h3>
              <p className="text-blue-100 text-sm">
                Widget de conversão de moeda com taxas atualizadas a cada 5 minutos
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-2xl">📈</span>
                Histórico de 30 Dias
              </h3>
              <p className="text-blue-100 text-sm">
                Gráfico interativo mostrando variação histórica e tendências
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-2xl">💰</span>
                Calculadora de Espécie
              </h3>
              <p className="text-blue-100 text-sm">
                Recomendação inteligente de quanto levar em dinheiro vs cartão
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-2xl">🔔</span>
                Alertas de Variação
              </h3>
              <p className="text-blue-100 text-sm">
                Notificações quando a moeda atingir o valor desejado
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-2xl">🌍</span>
                Orçamento Multinacional
              </h3>
              <p className="text-blue-100 text-sm">
                Visualize gastos em BRL e moeda local simultaneamente
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                Melhor Momento para Comprar
              </h3>
              <p className="text-blue-100 text-sm">
                Análise de tendência e recomendação do melhor momento
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-blue-400">
            <p className="text-sm text-blue-100">
              🎯 <strong>Status:</strong> Feature 2 - 100% Implementada • 
              5 componentes • 4 APIs • Sistema completo de câmbio e orçamento multinacional
            </p>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation activeTab="home" />
    </div>
  );
}