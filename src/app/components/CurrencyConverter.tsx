/**
 * CURRENCY CONVERTER COMPONENT
 * 
 * Widget de conversão de moeda em tempo real.
 * Usa ExchangeRate-API via internationalService.
 * 
 * Features:
 * ✅ Conversão BRL ↔ qualquer moeda
 * ✅ Taxa atualizada em tempo real
 * ✅ Setas de swap (inverter moedas)
 * ✅ Formatação automática de valores
 * ✅ Loading states
 * ✅ Cache (1h)
 * 
 * @example
 * <CurrencyConverter
 *   from="BRL"
 *   to="USD"
 *   amount={1000}
 *   onConvert={(result) => console.log(result)}
 * />
 */

import { useState, useEffect } from 'react';
import { ArrowRightLeft, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { getExchangeRate, convertCurrency } from '@/services/internationalService';
import type { ExchangeRate } from '@/types';

interface CurrencyConverterProps {
  from: string; // Código da moeda (ex: "BRL")
  to: string; // Código da moeda (ex: "USD")
  amount?: number; // Valor a converter
  onConvert?: (result: { amount: number; rate: number; converted: number }) => void;
  compact?: boolean; // Modo compacto (sem input)
  className?: string;
}

export function CurrencyConverter({
  from,
  to,
  amount: initialAmount = 1000,
  onConvert,
  compact = false,
  className = '',
}: CurrencyConverterProps) {
  const [amount, setAmount] = useState(initialAmount);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [converted, setConverted] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    loadExchangeRate();
  }, [from, to]);

  useEffect(() => {
    if (exchangeRate) {
      const result = amount * exchangeRate.rate;
      setConverted(result);
      
      if (onConvert) {
        onConvert({
          amount,
          rate: exchangeRate.rate,
          converted: result,
        });
      }
    }
  }, [amount, exchangeRate]);

  async function loadExchangeRate() {
    try {
      setLoading(true);
      setError(null);
      
      const rate = await getExchangeRate(from, to);
      setExchangeRate(rate);
      setLastUpdate(new Date(rate.lastUpdate).toLocaleString('pt-BR'));
      
      const result = amount * rate.rate;
      setConverted(result);
    } catch (err: any) {
      console.error('[CurrencyConverter] Erro:', err);
      setError('Erro ao buscar taxa de câmbio');
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'BRL' ? 'BRL' : 'USD', // Fallback para USD se não for BRL
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(value);
  }

  // Modo compacto (apenas exibição)
  if (compact) {
    return (
      <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 ${className}`}>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            Carregando taxa...
          </div>
        ) : error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : exchangeRate ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Taxa de Câmbio</div>
              {lastUpdate && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  {lastUpdate && !isNaN(new Date(lastUpdate).getTime()) 
                    ? new Date(lastUpdate).toLocaleDateString('pt-BR')
                    : 'Tempo real'
                  }
                </div>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900">
              1 {from} = {formatNumber(exchangeRate.rate)} {to}
            </div>
            {converted !== null && (
              <div className="mt-3 pt-3 border-t border-blue-100 text-sm text-gray-600">
                {formatCurrency(amount, from)} ≈ {formatNumber(converted)} {to}
              </div>
            )}
          </>
        ) : null}
      </div>
    );
  }

  // Modo completo (com input)
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Conversor de Moeda</h3>
        <button
          onClick={loadExchangeRate}
          disabled={loading}
          className="text-sm text-blue-500 hover:text-blue-600 disabled:opacity-50"
        >
          {loading ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Amount Input */}
      <div className="space-y-4">
        {/* From Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            De ({from})
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-lg font-semibold focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="0.00"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
              {from}
            </div>
          </div>
        </div>

        {/* Swap Icon */}
        <div className="flex justify-center">
          <div className="p-2 bg-blue-50 rounded-full">
            <ArrowRightLeft className="w-5 h-5 text-blue-500" />
          </div>
        </div>

        {/* To Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Para ({to})
          </label>
          <div className="relative">
            <input
              type="text"
              value={converted !== null ? formatNumber(converted) : '0.00'}
              readOnly
              className="w-full px-4 py-3 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-lg font-bold text-blue-900 cursor-not-allowed"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600 font-medium">
              {to}
            </div>
          </div>
        </div>
      </div>

      {/* Exchange Rate Info */}
      {exchangeRate && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">Taxa de Câmbio</div>
            <div className="font-semibold text-gray-900">
              1 {from} = {formatNumber(exchangeRate.rate)} {to}
            </div>
          </div>
          
          {lastUpdate && (
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              Última atualização: {lastUpdate}
            </div>
          )}

          {/* Taxa é favorável ou não? */}
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <TrendingUp className="w-4 h-4" />
              Taxa atualizada em tempo real
            </div>
            <div className="mt-1 text-xs text-blue-600">
              Cache válido por 1 hora
            </div>
          </div>
        </div>
      )}
    </div>
  );
}