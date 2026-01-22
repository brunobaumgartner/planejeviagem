/**
 * EXCHANGE RATE CHART - FEATURE 2
 * 
 * Gráfico de histórico de taxa de câmbio (últimos 30 dias)
 * Mostra variação histórica e tendência
 */

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import { currencyService } from '@/services/currencyService';
import type { ExchangeHistory } from '@/services/currencyService';

interface ExchangeRateChartProps {
  from: string;
  to: string;
  days?: number;
  height?: number;
  className?: string;
}

export function ExchangeRateChart({
  from,
  to,
  days = 30,
  height = 300,
  className = '',
}: ExchangeRateChartProps) {
  const [history, setHistory] = useState<ExchangeHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(days);

  useEffect(() => {
    fetchHistory();
  }, [from, to, selectedPeriod]);

  async function fetchHistory() {
    try {
      setLoading(true);
      console.log(`[ExchangeRateChart] Fetching history ${from}→${to} (${selectedPeriod} days)`);
      
      const data = await currencyService.getHistory(from, to, selectedPeriod);
      setHistory(data);
    } catch (error) {
      console.error('[ExchangeRateChart] Error:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStats() {
    if (!history || history.history.length === 0) {
      return { min: 0, max: 0, avg: 0, variation: 0 };
    }

    const rates = history.history.map(h => h.rate);
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
    
    const firstRate = rates[0];
    const lastRate = rates[rates.length - 1];
    const variation = ((lastRate - firstRate) / firstRate) * 100;

    return {
      min: min.toFixed(4),
      max: max.toFixed(4),
      avg: avg.toFixed(4),
      variation: variation.toFixed(2),
    };
  }

  function getTrendIcon(variation: number) {
    if (variation > 1) return <TrendingUp className="w-5 h-5 text-red-500" />;
    if (variation < -1) return <TrendingDown className="w-5 h-5 text-green-500" />;
    return <Minus className="w-5 h-5 text-gray-400" />;
  }

  const stats = getStats();

  if (loading) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!history) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="text-center text-gray-500">
          Não foi possível carregar o histórico
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Histórico de Câmbio
          </h3>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {[7, 15, 30].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period}d
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
          <div className="text-xs text-blue-600 font-medium mb-1">Atual</div>
          <div className="text-lg font-bold text-blue-900">
            {history.currentRate.toFixed(4)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
          <div className="text-xs text-green-600 font-medium mb-1">Mínima</div>
          <div className="text-lg font-bold text-green-900">{stats.min}</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3">
          <div className="text-xs text-red-600 font-medium mb-1">Máxima</div>
          <div className="text-lg font-bold text-red-900">{stats.max}</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
          <div className="text-xs text-purple-600 font-medium mb-1">Média</div>
          <div className="text-lg font-bold text-purple-900">{stats.avg}</div>
        </div>
      </div>

      {/* Variation Badge */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {getTrendIcon(parseFloat(stats.variation))}
        <span
          className={`text-sm font-semibold ${
            parseFloat(stats.variation) > 0
              ? 'text-red-600'
              : parseFloat(stats.variation) < 0
              ? 'text-green-600'
              : 'text-gray-600'
          }`}
        >
          {parseFloat(stats.variation) > 0 ? '+' : ''}
          {stats.variation}% no período
        </span>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <AreaChart
            data={history.history}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              domain={['dataMin - 0.01', 'dataMax + 0.01']}
              tickFormatter={(value) => value.toFixed(3)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
              }}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });
              }}
              formatter={(value: number) => [
                `${value.toFixed(4)} ${to}`,
                `Taxa`,
              ]}
            />
            <Area
              type="monotone"
              dataKey="rate"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorRate)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Info Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 text-center">
        Dados históricos de {from} para {to} • Últimos {selectedPeriod} dias
      </div>
    </div>
  );
}
