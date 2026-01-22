/**
 * CASH CALCULATOR - FEATURE 2
 * 
 * Calculadora: "Quanto levar em espécie?"
 * Recomenda divisão entre dinheiro e cartão baseado no destino
 */

import { useState, useEffect } from 'react';
import { Wallet, CreditCard, AlertCircle, CheckCircle2, Calculator } from 'lucide-react';
import { currencyService } from '@/services/currencyService';
import type { CashCalculation } from '@/services/currencyService';

interface CashCalculatorProps {
  totalBudget: number;
  days: number;
  destination: string;
  currency?: string;
  onCalculate?: (result: CashCalculation) => void;
  className?: string;
}

export function CashCalculator({
  totalBudget,
  days,
  destination,
  currency = 'BRL',
  onCalculate,
  className = '',
}: CashCalculatorProps) {
  const [result, setResult] = useState<CashCalculation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (totalBudget > 0 && days > 0 && destination) {
      calculateCash();
    }
  }, [totalBudget, days, destination, currency]);

  async function calculateCash() {
    try {
      setLoading(true);
      console.log(`[CashCalculator] Calculating for ${destination}`);
      
      const data = await currencyService.calculateCash(
        totalBudget,
        days,
        destination,
        currency !== 'BRL' ? currency : undefined
      );
      
      setResult(data);
      onCalculate?.(data);
    } catch (error) {
      console.error('[CashCalculator] Error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-32 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="text-center text-gray-500">
          Não foi possível calcular a recomendação
        </div>
      </div>
    );
  }

  const isLocalCurrency = currency !== 'BRL';

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Quanto Levar em Espécie?
        </h3>
      </div>

      {/* Budget Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
        <div className="text-sm text-gray-600 mb-1">Orçamento Total</div>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold text-blue-900">
            {currencyService.formatCurrency(result.totalBudget, 'BRL')}
          </div>
          {isLocalCurrency && (
            <div className="text-sm text-gray-600">
              ≈ {currencyService.formatCurrency(result.inLocalCurrency.cash + result.inLocalCurrency.card, result.currency)}
            </div>
          )}
        </div>
        <div className="text-xs text-gray-600 mt-1">
          Para {result.days} {result.days === 1 ? 'dia' : 'dias'} em {result.destination}
        </div>
      </div>

      {/* Recommendations */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Cash */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Em Espécie</div>
              <div className="text-xs text-gray-600">{result.percentages.cash}% do total</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-2xl font-bold text-green-900">
              {currencyService.formatCurrency(result.inBRL.cash, 'BRL')}
            </div>
            {isLocalCurrency && (
              <div className="text-sm text-green-700">
                ≈ {currencyService.formatCurrency(result.inLocalCurrency.cash, result.currency)}
              </div>
            )}
          </div>
        </div>

        {/* Card */}
        <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-4 border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">No Cartão</div>
              <div className="text-xs text-gray-600">{result.percentages.card}% do total</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-2xl font-bold text-blue-900">
              {currencyService.formatCurrency(result.inBRL.card, 'BRL')}
            </div>
            {isLocalCurrency && (
              <div className="text-sm text-blue-700">
                ≈ {currencyService.formatCurrency(result.inLocalCurrency.card, result.currency)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visual Bar */}
      <div className="mb-6">
        <div className="flex h-3 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-400 to-green-500"
            style={{ width: `${result.percentages.cash}%` }}
          ></div>
          <div
            className="bg-gradient-to-r from-blue-400 to-blue-500"
            style={{ width: `${result.percentages.card}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>{result.percentages.cash}% Espécie</span>
          <span>{result.percentages.card}% Cartão</span>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-3">
        <div className="flex items-start gap-2 text-sm font-medium text-gray-700 mb-3">
          <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <span>Recomendações:</span>
        </div>

        {result.recommendations.map((rec, index) => (
          <div key={index} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
            {rec.includes('⚠️') ? (
              <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            ) : rec.includes('💳') ? (
              <CreditCard className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            ) : rec.includes('🔐') ? (
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            )}
            <p className="text-sm text-gray-700 leading-relaxed">
              {rec.replace(/[⚠️💳🔐💡]/g, '').trim()}
            </p>
          </div>
        ))}
      </div>

      {/* Exchange Rate Info */}
      {isLocalCurrency && result.exchangeRate !== 1 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-600 text-center">
            Taxa de câmbio: 1 BRL = {result.exchangeRate.toFixed(4)} {result.currency}
          </div>
        </div>
      )}
    </div>
  );
}
