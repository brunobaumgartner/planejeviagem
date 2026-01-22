import { useState, useEffect } from 'react';
import { X, Crown, Check, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import type { PricingConfig } from '@/types';

interface UpgradePremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradePremiumModal({ isOpen, onClose }: UpgradePremiumModalProps) {
  const { user, getAccessToken } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPricingConfig();
    }
  }, [isOpen]);

  const loadPricingConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/pricing-config`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar preços');
      }

      setConfig(data);
    } catch (err: any) {
      console.error('Erro ao carregar config:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!user) return;

    try {
      setProcessing(true);
      setError(null);

      const accessToken = await getAccessToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/premium/create-payment`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            plan: selectedPlan,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar upgrade');
      }

      if (data.test_mode) {
        // Modo teste: upgrade gratuito imediato
        alert('✅ Upgrade para Premium realizado com sucesso! (Modo Teste)');
        onClose();
        window.location.reload(); // Recarregar para atualizar o estado
      } else {
        // Modo produção: redirecionar para Mercado Pago
        if (data.init_point) {
          console.log('[UpgradePremiumModal] 🔗 Abrindo checkout em nova aba:', data.init_point);
          const newWindow = window.open(data.init_point, '_blank');
          
          if (!newWindow) {
            console.error('[UpgradePremiumModal] ❌ Popup bloqueado');
            setError('Por favor, permita popups para continuar com o pagamento.');
            setProcessing(false);
            return;
          }
          
          console.log('[UpgradePremiumModal] ✅ Nova aba aberta com sucesso!');
          setProcessing(false);
          onClose();
        } else {
          throw new Error('Link de pagamento não recebido');
        }
      }
    } catch (err: any) {
      console.error('Erro no upgrade:', err);
      setError(err.message);
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  const annualDiscount = config
    ? Math.round((1 - (config.premium_annual_price / (config.premium_monthly_price * 12))) * 100)
    : 0;

  const benefits = [
    'Roteiros detalhados ilimitados',
    'Editor manual de atividades',
    'Edição completa de viagens',
    'Sugestões personalizadas',
    'Suporte prioritário',
    'Sem anúncios',
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-amber-500 to-orange-500 text-white p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Upgrade para Premium</h2>
          </div>
          <p className="text-white/90">
            Desbloqueie todos os recursos e planeje viagens sem limites!
          </p>
        </div>

        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              {error}
            </div>
          </div>
        ) : config ? (
          <div className="p-6">
            {/* Test Mode Badge */}
            {config.test_mode && (
              <div className="mb-6 bg-amber-50 border border-amber-300 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-800">
                  <Sparkles className="w-5 h-5" />
                  <p className="font-medium">
                    🧪 Modo Teste Ativo: Upgrade gratuito para testes
                  </p>
                </div>
              </div>
            )}

            {/* Plans */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {/* Plano Mensal */}
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`relative border-2 rounded-xl p-6 text-left transition-all ${
                  selectedPlan === 'monthly'
                    ? 'border-sky-500 bg-sky-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {selectedPlan === 'monthly' && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
                
                <div className="mb-3">
                  <h3 className="font-bold text-lg mb-1">Plano Mensal</h3>
                  <p className="text-sm text-gray-600">Renova automaticamente</p>
                </div>
                
                <div className="mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    R$ {config.premium_monthly_price.toFixed(2)}
                  </span>
                  <span className="text-gray-600">/mês</span>
                </div>
                
                <p className="text-xs text-gray-500">
                  Válido por 30 dias
                </p>
              </button>

              {/* Plano Anual */}
              <button
                onClick={() => setSelectedPlan('annual')}
                className={`relative border-2 rounded-xl p-6 text-left transition-all ${
                  selectedPlan === 'annual'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {annualDiscount > 0 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-lg">
                      ECONOMIZE {annualDiscount}%
                    </div>
                  </div>
                )}
                
                {selectedPlan === 'annual' && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
                
                <div className="mb-3">
                  <h3 className="font-bold text-lg mb-1">Plano Anual</h3>
                  <p className="text-sm text-gray-600">Melhor custo-benefício</p>
                </div>
                
                <div className="mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    R$ {config.premium_annual_price.toFixed(2)}
                  </span>
                  <span className="text-gray-600">/ano</span>
                </div>
                
                <p className="text-xs text-green-600 font-medium">
                  💰 Apenas R$ {(config.premium_annual_price / 12).toFixed(2)}/mês
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Válido por 365 dias
                </p>
              </button>
            </div>

            {/* Benefits */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-4">
                ✨ O que você ganha:
              </h3>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleUpgrade}
              disabled={processing}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5" />
                  {config.test_mode ? 'Ativar Premium (Teste)' : 'Continuar para Pagamento'}
                </>
              )}
            </button>

            <p className="text-xs text-center text-gray-500 mt-4">
              {config.test_mode 
                ? '🧪 Modo teste: sem cobrança real' 
                : '🔒 Pagamento seguro via Mercado Pago'
              }
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}