/**
 * BUDGET VIEW - FEATURE 2
 * 
 * Visualização de orçamento multinacional
 * Mostra valores em BRL e moeda local simultaneamente
 */

import { useState, useEffect } from 'react';
import { Wallet, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { currencyService } from '@/services/currencyService';

interface BudgetItem {
  id: string;
  category: string;
  amountBRL: number;
  description?: string;
}

interface BudgetViewProps {
  items: BudgetItem[];
  currency?: string;
  showComparison?: boolean;
  className?: string;
}

export function BudgetView({
  items,
  currency = 'BRL',
  showComparison = true,
  className = '',
}: BudgetViewProps) {
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [loading, setLoading] = useState(currency !== 'BRL');

  useEffect(() => {
    if (currency !== 'BRL') {
      fetchExchangeRate();
    }
  }, [currency]);

  async function fetchExchangeRate() {
    try {
      const rate = await currencyService.getRate('BRL', currency);
      setExchangeRate(rate.rate);
      setLoading(false);
    } catch (error) {
      console.error('[BudgetView] Error fetching rate:', error);
      setLoading(false);
    }
  }

  const totalBRL = items.reduce((sum, item) => sum + item.amountBRL, 0);
  const totalLocal = totalBRL * exchangeRate;

  const categoryTotals = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = 0;
    }
    acc[item.category] += item.amountBRL;
    return acc;
  }, {} as Record<string, number>);

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      'Hospedagem': '🏨',
      'Alimentação': '🍽️',
      'Transporte': '🚗',
      'Passeios': '🎭',
      'Compras': '🛍️',
      'Outros': '📌',
    };
    return icons[category] || '💰';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Hospedagem': 'from-blue-50 to-blue-100 border-blue-200 text-blue-900',
      'Alimentação': 'from-orange-50 to-orange-100 border-orange-200 text-orange-900',
      'Transporte': 'from-green-50 to-green-100 border-green-200 text-green-900',
      'Passeios': 'from-purple-50 to-purple-100 border-purple-200 text-purple-900',
      'Compras': 'from-pink-50 to-pink-100 border-pink-200 text-pink-900',
      'Outros': 'from-gray-50 to-gray-100 border-gray-200 text-gray-900',
    };
    return colors[category] || 'from-gray-50 to-gray-100 border-gray-200 text-gray-900';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-24 bg-gray-100 rounded"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  const isInternational = currency !== 'BRL';

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Wallet className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Orçamento da Viagem</h3>
      </div>

      {/* Total Summary */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 mb-6">
        <div className="text-sm text-gray-600 mb-2">Total Estimado</div>
        
        {/* BRL Value */}
        <div className="mb-3">
          <div className="text-3xl font-bold text-blue-900 mb-1">
            {currencyService.formatCurrency(totalBRL, 'BRL')}
          </div>
          <div className="text-xs text-gray-600">Em Reais Brasileiros</div>
        </div>

        {/* Local Currency Value */}
        {isInternational && (
          <>
            <div className="flex items-center gap-2 my-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              <TrendingDown className="w-4 h-4 text-gray-400" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>

            <div>
              <div className="text-2xl font-bold text-indigo-900 mb-1">
                {currencyService.formatCurrency(totalLocal, currency)}
              </div>
              <div className="text-xs text-gray-600">
                Em {currencyService.getCurrencyName(currency)}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200/50 text-xs text-gray-600">
              Taxa de câmbio: 1 BRL = {exchangeRate.toFixed(4)} {currency}
            </div>
          </>
        )}
      </div>

      {/* Category Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Por Categoria</h4>

        {Object.entries(categoryTotals).map(([category, amount]) => {
          const percentage = (amount / totalBRL) * 100;
          const amountLocal = amount * exchangeRate;

          return (
            <div
              key={category}
              className={`bg-gradient-to-r ${getCategoryColor(category)} border rounded-xl p-4`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getCategoryIcon(category)}</span>
                  <span className="font-semibold">{category}</span>
                </div>
                <span className="text-xs bg-white/50 px-2 py-1 rounded-full">
                  {percentage.toFixed(0)}%
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xl font-bold">
                    {currencyService.formatCurrency(amount, 'BRL')}
                  </div>
                  {isInternational && (
                    <div className="text-sm opacity-75 mt-1">
                      ≈ {currencyService.formatCurrency(amountLocal, currency)}
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="h-2 bg-white/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-current opacity-60"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Items List */}
      {items.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Itens Detalhados</h4>
          
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {item.description || item.category}
                  </div>
                  <div className="text-xs text-gray-600">{item.category}</div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {currencyService.formatCurrency(item.amountBRL, 'BRL')}
                  </div>
                  {isInternational && (
                    <div className="text-xs text-gray-600">
                      {currencyService.formatCurrency(item.amountBRL * exchangeRate, currency)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison with Average */}
      {showComparison && isInternational && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-amber-900 mb-1">
                  Dica de Economia
                </div>
                <div className="text-xs text-amber-700">
                  Monitore a taxa de câmbio antes da viagem. Uma pequena variação pode
                  representar economia significativa no orçamento total.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
