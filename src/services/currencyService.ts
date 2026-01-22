/**
 * CURRENCY SERVICE - FEATURE 2
 * 
 * Serviço centralizado para todas as operações de câmbio e moeda
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/api/exchange`;

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: string;
}

export interface ExchangeHistory {
  from: string;
  to: string;
  currentRate: number;
  history: Array<{
    date: string;
    rate: number;
    high: number;
    low: number;
  }>;
  period: string;
}

export interface ExchangeTrend {
  from: string;
  to: string;
  currentRate: number;
  trend: 'up' | 'down' | 'stable';
  variation: number;
  recommendation: string;
  bestMoment: 'now' | 'wait' | 'monitor';
  lastUpdated: string;
}

export interface CashCalculation {
  totalBudget: number;
  days: number;
  destination: string;
  currency: string;
  exchangeRate: number;
  inBRL: {
    cash: number;
    card: number;
  };
  inLocalCurrency: {
    cash: number;
    card: number;
  };
  percentages: {
    cash: number;
    card: number;
  };
  recommendations: string[];
}

export const currencyService = {
  /**
   * Buscar lista de moedas disponíveis da API
   */
  async getAvailableCurrencies(): Promise<Array<{
    code: string;
    name: string;
    flag: string;
    region: string;
    symbol: string;
  }>> {
    console.log('[CurrencyService] Getting available currencies');
    
    try {
      const response = await fetch(`${API_BASE}/currencies`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`[CurrencyService] ✅ ${data.total} currencies loaded`);
      return data.currencies;
    } catch (error) {
      console.error('[CurrencyService] ❌ Error fetching currencies:', error);
      throw error;
    }
  },

  /**
   * Buscar taxa de câmbio atual entre duas moedas
   */
  async getRate(from: string, to: string): Promise<ExchangeRate> {
    console.log(`[CurrencyService] Getting rate ${from}→${to}`);
    
    try {
      const response = await fetch(`${API_BASE}/rate/${from}/${to}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`[CurrencyService] ✅ Rate fetched: ${data.rate}`);
      return data;
    } catch (error) {
      console.error('[CurrencyService] ❌ Error fetching rate:', error);
      throw error;
    }
  },

  /**
   * Buscar histórico de taxa de câmbio (últimos N dias)
   */
  async getHistory(
    from: string,
    to: string,
    days: number = 30
  ): Promise<ExchangeHistory> {
    console.log(`[CurrencyService] Getting history ${from}→${to} (${days} days)`);
    
    try {
      const response = await fetch(
        `${API_BASE}/history/${from}/${to}?days=${days}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`[CurrencyService] ✅ History fetched: ${data.history.length} days`);
      return data;
    } catch (error) {
      console.error('[CurrencyService] ❌ Error fetching history:', error);
      throw error;
    }
  },

  /**
   * Analisar tendência da moeda (subindo/descendo/estável)
   */
  async getTrend(from: string, to: string): Promise<ExchangeTrend> {
    console.log(`[CurrencyService] Getting trend ${from}→${to}`);
    
    try {
      const response = await fetch(`${API_BASE}/trend/${from}/${to}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(
        `[CurrencyService] ✅ Trend: ${data.trend} (${data.variation > 0 ? '+' : ''}${data.variation}%)`
      );
      return data;
    } catch (error) {
      console.error('[CurrencyService] ❌ Error fetching trend:', error);
      throw error;
    }
  },

  /**
   * Calcular quanto levar em espécie vs cartão
   */
  async calculateCash(
    totalBudget: number,
    days: number,
    destination: string,
    currency?: string
  ): Promise<CashCalculation> {
    console.log(
      `[CurrencyService] Calculating cash for ${destination} (${days} days, ${totalBudget} BRL)`
    );
    
    try {
      const response = await fetch(`${API_BASE}/calculate-cash`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalBudget,
          days,
          destination,
          currency,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(
        `[CurrencyService] ✅ Cash recommendation: ${data.percentages.cash}% espécie, ${data.percentages.card}% cartão`
      );
      return data;
    } catch (error) {
      console.error('[CurrencyService] ❌ Error calculating cash:', error);
      throw error;
    }
  },

  /**
   * Converter valor entre moedas
   */
  async convert(
    amount: number,
    from: string,
    to: string
  ): Promise<{ amount: number; rate: number; converted: number }> {
    const rateData = await this.getRate(from, to);
    const converted = amount * rateData.rate;
    
    return {
      amount,
      rate: rateData.rate,
      converted: parseFloat(converted.toFixed(2)),
    };
  },

  /**
   * Formatar valor em moeda específica
   */
  formatCurrency(amount: number, currency: string): string {
    const currencyMap: Record<string, string> = {
      'BRL': 'pt-BR',
      'USD': 'en-US',
      'EUR': 'de-DE',
      'GBP': 'en-GB',
      'JPY': 'ja-JP',
      'AUD': 'en-AU',
      'CAD': 'en-CA',
      'CHF': 'de-CH',
      'CNY': 'zh-CN',
      'INR': 'en-IN',
      'MXN': 'es-MX',
      'ARS': 'es-AR',
      'CLP': 'es-CL',
      'COP': 'es-CO',
      'PEN': 'es-PE',
      'UYU': 'es-UY',
      'KRW': 'ko-KR',
      'SGD': 'en-SG',
      'HKD': 'zh-HK',
      'THB': 'th-TH',
      'MYR': 'ms-MY',
      'IDR': 'id-ID',
      'PHP': 'en-PH',
      'VND': 'vi-VN',
      'PKR': 'en-PK',
      'BDT': 'bn-BD',
      'NZD': 'en-NZ',
      'ZAR': 'en-ZA',
      'SEK': 'sv-SE',
      'NOK': 'nb-NO',
      'DKK': 'da-DK',
      'PLN': 'pl-PL',
      'CZK': 'cs-CZ',
      'HUF': 'hu-HU',
      'RON': 'ro-RO',
      'RUB': 'ru-RU',
      'TRY': 'tr-TR',
      'AED': 'ar-AE',
      'SAR': 'ar-SA',
      'ILS': 'he-IL',
      'QAR': 'ar-QA',
      'KWD': 'ar-KW',
      'EGP': 'ar-EG',
      'NGN': 'en-NG',
      'KES': 'en-KE',
      'MAD': 'ar-MA',
    };
    
    const locale = currencyMap[currency] || 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  /**
   * Obter símbolo da moeda
   */
  getCurrencySymbol(currency: string): string {
    const symbols: Record<string, string> = {
      // Américas
      'BRL': 'R$',
      'USD': '$',
      'CAD': 'C$',
      'MXN': 'MX$',
      'ARS': 'AR$',
      'CLP': 'CL$',
      'COP': 'CO$',
      'PEN': 'S/',
      'UYU': 'UY$',
      
      // Europa
      'EUR': '€',
      'GBP': '£',
      'CHF': 'CHF',
      'SEK': 'kr',
      'NOK': 'kr',
      'DKK': 'kr',
      'PLN': 'zł',
      'CZK': 'Kč',
      'HUF': 'Ft',
      'RON': 'lei',
      'RUB': '₽',
      'TRY': '₺',
      
      // Ásia
      'JPY': '¥',
      'CNY': '¥',
      'KRW': '₩',
      'INR': '₹',
      'SGD': 'S$',
      'HKD': 'HK$',
      'THB': '฿',
      'MYR': 'RM',
      'IDR': 'Rp',
      'PHP': '₱',
      'VND': '₫',
      'PKR': '₨',
      'BDT': '৳',
      
      // Oceania
      'AUD': 'A$',
      'NZD': 'NZ$',
      
      // Oriente Médio
      'AED': 'د.إ',
      'SAR': '﷼',
      'ILS': '₪',
      'QAR': 'ر.ق',
      'KWD': 'د.ك',
      
      // África
      'ZAR': 'R',
      'EGP': 'E£',
      'NGN': '₦',
      'KES': 'KSh',
      'MAD': 'د.م.',
    };
    
    return symbols[currency] || currency;
  },

  /**
   * Obter nome completo da moeda
   */
  getCurrencyName(currency: string): string {
    const names: Record<string, string> = {
      // Américas
      'BRL': 'Real Brasileiro',
      'USD': 'Dólar Americano',
      'CAD': 'Dólar Canadense',
      'MXN': 'Peso Mexicano',
      'ARS': 'Peso Argentino',
      'CLP': 'Peso Chileno',
      'COP': 'Peso Colombiano',
      'PEN': 'Sol Peruano',
      'UYU': 'Peso Uruguaio',
      
      // Europa
      'EUR': 'Euro',
      'GBP': 'Libra Esterlina',
      'CHF': 'Franco Suíço',
      'SEK': 'Coroa Sueca',
      'NOK': 'Coroa Norueguesa',
      'DKK': 'Coroa Dinamarquesa',
      'PLN': 'Zloty Polonês',
      'CZK': 'Coroa Tcheca',
      'HUF': 'Forint Húngaro',
      'RON': 'Leu Romeno',
      'RUB': 'Rublo Russo',
      'TRY': 'Lira Turca',
      
      // Ásia
      'JPY': 'Iene Japonês',
      'CNY': 'Yuan Chinês',
      'KRW': 'Won Sul-Coreano',
      'INR': 'Rúpia Indiana',
      'SGD': 'Dólar de Singapura',
      'HKD': 'Dólar de Hong Kong',
      'THB': 'Baht Tailandês',
      'MYR': 'Ringgit Malaio',
      'IDR': 'Rupia Indonésia',
      'PHP': 'Peso Filipino',
      'VND': 'Dong Vietnamita',
      'PKR': 'Rúpia Paquistanesa',
      'BDT': 'Taka de Bangladesh',
      
      // Oceania
      'AUD': 'Dólar Australiano',
      'NZD': 'Dólar Neozelandês',
      
      // Oriente Médio
      'AED': 'Dirham dos Emirados',
      'SAR': 'Riyal Saudita',
      'ILS': 'Shekel Israelense',
      'QAR': 'Riyal do Catar',
      'KWD': 'Dinar Kuwaitiano',
      
      // África
      'ZAR': 'Rand Sul-Africano',
      'EGP': 'Libra Egípcia',
      'NGN': 'Naira Nigeriana',
      'KES': 'Xelim Queniano',
      'MAD': 'Dirham Marroquino',
    };
    
    return names[currency] || currency;
  },
};