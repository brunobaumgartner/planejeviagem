import { useState, useEffect } from 'react';
import { DollarSign, Save, AlertCircle, CheckCircle, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import type { PricingConfig as PricingConfigType } from '@/types';

export function PricingConfig() {
  const { getAccessToken } = useAuth();
  const [config, setConfig] = useState<PricingConfigType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [premiumMonthly, setPremiumMonthly] = useState('');
  const [premiumAnnual, setPremiumAnnual] = useState('');
  const [planningPackage, setPlanningPackage] = useState('');
  const [testMode, setTestMode] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[PricingConfig] Carregando configurações...', { 
        projectId,
        url: `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/pricing-config`
      });

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/pricing-config`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      console.log('[PricingConfig] Response status:', response.status);
      console.log('[PricingConfig] Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('[PricingConfig] Response data:', data);

      if (!response.ok) {
        const errorMsg = data.details 
          ? `${data.error} - ${data.details}` 
          : data.error || `Erro ao carregar configurações (${response.status})`;
        throw new Error(errorMsg);
      }

      setConfig(data);
      setPremiumMonthly(data.premium_monthly_price.toString());
      setPremiumAnnual(data.premium_annual_price.toString());
      setPlanningPackage(data.planning_package_price.toString());
      setTestMode(data.test_mode);
      
      console.log('[PricingConfig] ✅ Configurações carregadas com sucesso');
    } catch (err: any) {
      console.error('[PricingConfig] ❌ Erro ao carregar config:', err);
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      console.log('[PricingConfig] 🔐 Obtendo access token...');
      const accessToken = await getAccessToken();
      
      if (!accessToken) {
        console.error('[PricingConfig] ❌ Nenhum access token retornado');
        throw new Error('Você precisa estar logado como admin');
      }

      console.log('[PricingConfig] ✅ Access token obtido:', accessToken.substring(0, 20) + '...');

      const updates = {
        premium_monthly_price: parseFloat(premiumMonthly),
        premium_annual_price: parseFloat(premiumAnnual),
        planning_package_price: parseFloat(planningPackage),
        test_mode: testMode,
      };

      console.log('[PricingConfig] 📤 Enviando updates:', updates);

      // Validações
      if (updates.premium_monthly_price <= 0) {
        throw new Error('Preço mensal deve ser maior que zero');
      }
      if (updates.premium_annual_price <= 0) {
        throw new Error('Preço anual deve ser maior que zero');
      }
      if (updates.planning_package_price <= 0) {
        throw new Error('Preço do pacote deve ser maior que zero');
      }

      console.log('[PricingConfig] 🌐 Fazendo requisição PUT...');
      console.log('[PricingConfig] 📤 Request headers:', {
        'Authorization': `Bearer ${publicAnonKey.substring(0, 30)}...`,
        'X-User-Token': `${accessToken.substring(0, 30)}...`,
        'Content-Type': 'application/json'
      });
      console.log('[PricingConfig] 📤 Request body:', JSON.stringify(updates));
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/pricing-config`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-User-Token': accessToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        }
      );

      console.log('[PricingConfig] 📥 Response status:', response.status);
      const data = await response.json();
      console.log('[PricingConfig] 📥 Response data:', data);

      if (!response.ok) {
        const errorMsg = data.details 
          ? `${data.error} - ${data.details}` 
          : data.error || 'Erro ao salvar configurações';
        console.error('[PricingConfig] ❌ Erro na resposta:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('[PricingConfig] ✅ Configurações salvas com sucesso!');
      setConfig(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  const annualDiscount = config ? 
    Math.round((1 - (config.premium_annual_price / (config.premium_monthly_price * 12))) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="w-6 h-6 text-sky-500" />
          <h2 className="text-xl font-bold text-gray-900">Configurações de Preços</h2>
        </div>
        <p className="text-sm text-gray-600">
          Configure os valores dos planos e pacotes do sistema
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Erro</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-800">Sucesso!</p>
            <p className="text-sm text-green-600">Configurações salvas com sucesso</p>
          </div>
        </div>
      )}

      {/* Test Mode Toggle */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {testMode ? (
                <ToggleRight className="w-6 h-6 text-amber-600" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-gray-400" />
              )}
              <h3 className="font-bold text-amber-900">
                Modo de Teste {testMode ? 'ATIVO' : 'DESATIVADO'}
              </h3>
            </div>
            <p className="text-sm text-amber-800 mb-3">
              {testMode 
                ? '⚠️ ATENÇÃO: Upgrades e compras estão GRATUITOS para testes'
                : '💰 Sistema em modo produção: pagamentos reais via Mercado Pago'
              }
            </p>
            <button
              onClick={() => setTestMode(!testMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                testMode
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {testMode ? 'Desativar Modo de Teste' : 'Ativar Modo de Teste'}
            </button>
          </div>
        </div>
      </div>

      {/* Premium Plans */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4">Planos Premium</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Plano Mensal */}
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plano Mensal
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={premiumMonthly}
                onChange={(e) => setPremiumMonthly(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="29.90"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Acesso premium por 30 dias
            </p>
          </div>

          {/* Plano Anual */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-sky-50 to-white">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Plano Anual
              </label>
              {annualDiscount > 0 && (
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                  {annualDiscount}% OFF
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={premiumAnnual}
                onChange={(e) => setPremiumAnnual(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="299.90"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Acesso premium por 365 dias
            </p>
            {parseFloat(premiumMonthly) > 0 && parseFloat(premiumAnnual) > 0 && (
              <p className="text-xs text-green-600 mt-1">
                💰 Economia de R$ {(parseFloat(premiumMonthly) * 12 - parseFloat(premiumAnnual)).toFixed(2)} no plano anual
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Planning Package */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4">Pacote de Planejamento</h3>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preço por Viagem
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              R$
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={planningPackage}
              onChange={(e) => setPlanningPackage(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="49.90"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Valor cobrado para comprar planejamento completo de uma viagem específica
          </p>
        </div>
      </div>

      {/* Preview Card */}
      {config && (
        <div className="bg-gradient-to-br from-sky-50 to-purple-50 rounded-xl border border-sky-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">📊 Resumo Atual</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Premium Mensal</div>
              <div className="text-2xl font-bold text-sky-600">
                R$ {parseFloat(premiumMonthly).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">por mês</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Premium Anual</div>
              <div className="text-2xl font-bold text-purple-600">
                R$ {parseFloat(premiumAnnual).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">por ano</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Planejamento</div>
              <div className="text-2xl font-bold text-green-600">
                R$ {parseFloat(planningPackage).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">por viagem</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white/50 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Última atualização:</strong> {new Date(config.updated_at).toLocaleString('pt-BR')}
              {config.updated_by && ` • por ${config.updated_by}`}
            </p>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Salvar Configurações
            </>
          )}
        </button>
      </div>
    </div>
  );
}