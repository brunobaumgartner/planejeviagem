/**
 * CURRENCY WIDGET - FEATURE 2
 * 
 * Widget compacto de conversão de moeda em tempo real
 * Mostra taxa atual, tendência e permite conversão rápida
 */

import { useState, useEffect } from 'react';
import { ArrowRightLeft, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { currencyService } from '@/services/currencyService';
import type { ExchangeRate, ExchangeTrend } from '@/services/currencyService';

interface CurrencyWidgetProps {
  from?: string;  // Opcional agora
  to?: string;    // Opcional agora
  initialAmount?: number;
  onRateChange?: (rate: number) => void;
  onCurrencyChange?: (from: string, to: string) => void;  // Novo callback
  compact?: boolean;
  className?: string;
  allowFromSelection?: boolean;  // Permite selecionar moeda de origem
  allowToSelection?: boolean;    // Permite selecionar moeda de destino
}

export function CurrencyWidget({
  from: initialFrom = 'BRL',
  to: initialTo = 'USD',
  initialAmount = 100,
  onRateChange,
  onCurrencyChange,
  compact = false,
  className = '',
  allowFromSelection = true,
  allowToSelection = true,
}: CurrencyWidgetProps) {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [amount, setAmount] = useState(initialAmount);
  const [rate, setRate] = useState<ExchangeRate | null>(null);
  const [trend, setTrend] = useState<ExchangeTrend | null>(null);
  const [converted, setConverted] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [availableCurrencies, setAvailableCurrencies] = useState<Array<{
    code: string;
    name: string;
    flag: string;
    region: string;
    symbol: string;
  }>>([]);

  // Buscar lista de moedas disponíveis ao montar
  useEffect(() => {
    async function loadCurrencies() {
      try {
        const currencies = await currencyService.getAvailableCurrencies();
        setAvailableCurrencies(currencies);
      } catch (error) {
        console.error('[CurrencyWidget] Error loading currencies:', error);
      }
    }
    loadCurrencies();
  }, []);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh a cada 5 minutos
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [from, to]);

  useEffect(() => {
    if (rate) {
      const result = amount * rate.rate;
      setConverted(parseFloat(result.toFixed(2)));
      onRateChange?.(rate.rate);
    }
  }, [amount, rate]);

  useEffect(() => {
    // Notificar mudança de moedas
    onCurrencyChange?.(from, to);
  }, [from, to]);

  async function fetchData() {
    try {
      console.log(`[CurrencyWidget] Fetching data ${from}→${to}`);
      
      const [rateData, trendData] = await Promise.all([
        currencyService.getRate(from, to),
        currencyService.getTrend(from, to),
      ]);
      
      setRate(rateData);
      setTrend(trendData);
      setLoading(false);
    } catch (error) {
      console.error('[CurrencyWidget] Error:', error);
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await fetchData();
    setTimeout(() => setRefreshing(false), 500);
  }

  function handleSwapCurrencies() {
    const temp = from;
    setFrom(to);
    setTo(temp);
  }

  function getTrendIcon() {
    if (!trend) return <Minus className="w-4 h-4 text-gray-400" />;
    
    switch (trend.trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  }

  function getTrendColor() {
    if (!trend) return 'text-gray-600';
    
    switch (trend.trend) {
      case 'up':
        return 'text-red-600';
      case 'down':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  }

  function getTrendText() {
    if (!trend) return 'Estável';
    
    const absVariation = Math.abs(trend.variation);
    
    switch (trend.trend) {
      case 'up':
        return `↑ ${absVariation}%`;
      case 'down':
        return `↓ ${absVariation}%`;
      default:
        return 'Estável';
    }
  }

  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-blue-200 rounded w-1/2 mb-3"></div>
          <div className="h-8 bg-blue-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-blue-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-sm font-medium text-gray-700">
                {from} → {to}
              </div>
              <div className="text-xl font-bold text-blue-600">
                {rate ? currencyService.formatCurrency(1 * rate.rate, to) : '-'}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end mb-1">
              {getTrendIcon()}
              <span className={`text-sm font-semibold ${getTrendColor()}`}>
                {getTrendText()}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">Conversor de Moeda</h3>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="text-blue-600 hover:text-blue-700 transition-colors"
          title="Atualizar cotação"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Taxa de Câmbio */}
      <div className="mb-4 pb-4 border-b border-blue-100">
        <div className="text-sm text-gray-600 mb-1">Taxa atual</div>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-600">
            1 {from} = {rate ? rate.rate.toFixed(4) : '-'} {to}
          </div>
          
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className={`text-sm font-semibold ${getTrendColor()}`}>
              {getTrendText()}
            </span>
          </div>
        </div>
        
        {trend && trend.variation !== 0 && (
          <div className="mt-2 text-xs text-gray-600">
            {trend.variation > 0 ? 'Subiu' : 'Caiu'} {Math.abs(trend.variation)}% nos últimos 7 dias
          </div>
        )}
      </div>

      {/* Conversor */}
      <div className="space-y-3">
        {/* Moeda de Origem */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            De
          </label>
          <div className="flex gap-2">
            {allowFromSelection ? (
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="flex-1 px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {availableCurrencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.flag} {curr.code} - {curr.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex-1 px-3 py-2 border border-blue-200 rounded-lg bg-gray-50 text-gray-700 font-medium">
                {availableCurrencies.find(c => c.code === from)?.flag} {from} - {currencyService.getCurrencyName(from)}
              </div>
            )}
          </div>
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              {currencyService.getCurrencySymbol(from)}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        {/* Botão de Swap */}
        <div className="flex items-center justify-center">
          <button
            onClick={handleSwapCurrencies}
            className="w-10 h-10 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors"
            title="Inverter moedas"
          >
            <ArrowRightLeft className="w-5 h-5 text-blue-600" />
          </button>
        </div>

        {/* Moeda de Destino */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Para
          </label>
          <div className="flex gap-2">
            {allowToSelection ? (
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="flex-1 px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {availableCurrencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.flag} {curr.code} - {curr.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex-1 px-3 py-2 border border-blue-200 rounded-lg bg-gray-50 text-gray-700 font-medium">
                {availableCurrencies.find(c => c.code === to)?.flag} {to} - {currencyService.getCurrencyName(to)}
              </div>
            )}
          </div>
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              {currencyService.getCurrencySymbol(to)}
            </span>
            <div className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg bg-blue-50 text-blue-900 font-semibold text-lg">
              {converted !== null ? converted.toFixed(2) : '0.00'}
            </div>
          </div>
        </div>
      </div>

      {/* Recomendação */}
      {trend && trend.recommendation && (
        <div className="mt-4 pt-4 border-t border-blue-100">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-xs text-blue-600 font-bold">💡</span>
            </div>
            <div className="text-xs text-gray-600">
              {trend.recommendation}
            </div>
          </div>
        </div>
      )}

      {/* Última Atualização */}
      {rate && (
        <div className="mt-3 text-xs text-gray-500 text-center">
          Atualizado: {new Date(rate.lastUpdated).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      )}
    </div>
  );
}