import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Home } from 'lucide-react';
import { useNavigation } from '@/app/context/NavigationContext';
import { checkPaymentStatus } from '@/services/payment';
import { useAuth } from '@/app/context/AuthContext';

type PaymentResult = 'success' | 'failure' | 'pending';

interface PaymentCallbackProps {
  result: PaymentResult;
}

export function PaymentCallback({ result }: PaymentCallbackProps) {
  const { setCurrentScreen } = useNavigation();
  const { session } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verifiedStatus, setVerifiedStatus] = useState<string | null>(null);

  useEffect(() => {
    // Pegar purchase_id da URL
    const params = new URLSearchParams(window.location.search);
    const purchaseId = params.get('purchase_id');

    if (purchaseId && session?.access_token) {
      checkPaymentStatus(purchaseId, session.access_token)
        .then((status) => {
          setVerifiedStatus(status);
          setIsVerifying(false);
        })
        .catch((error) => {
          console.error('[PaymentCallback] Erro ao verificar status:', error);
          setIsVerifying(false);
        });
    } else {
      setIsVerifying(false);
    }
  }, [session]);

  const config = {
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50',
      title: 'Pagamento Confirmado!',
      message: 'Seu planejamento está sendo criado por nossos especialistas.',
      details: 'Você receberá uma notificação quando estiver pronto (até 48h úteis).',
      buttonText: 'Ver Minhas Viagens',
    },
    pending: {
      icon: Clock,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50',
      title: 'Pagamento Pendente',
      message: 'Estamos aguardando a confirmação do seu pagamento.',
      details: 'Assim que confirmarmos, iniciaremos a criação do seu planejamento.',
      buttonText: 'Ver Minhas Viagens',
    },
    failure: {
      icon: XCircle,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50',
      title: 'Pagamento Não Concluído',
      message: 'Houve um problema com o pagamento.',
      details: 'Você pode tentar novamente a qualquer momento.',
      buttonText: 'Tentar Novamente',
    },
  };

  const currentConfig = config[result];
  const Icon = currentConfig.icon;

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-lg text-center">
          <div className="w-16 h-16 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Verificando pagamento...</h2>
          <p className="text-gray-600">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-lg">
        {/* Icon */}
        <div className={`w-20 h-20 ${currentConfig.bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
          <Icon className={`w-10 h-10 ${currentConfig.iconColor}`} />
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-center mb-3">
          {currentConfig.title}
        </h1>

        {/* Mensagem */}
        <p className="text-gray-700 text-center mb-2">
          {currentConfig.message}
        </p>

        {/* Detalhes */}
        <p className="text-sm text-gray-600 text-center mb-8">
          {currentConfig.details}
        </p>

        {/* Status verificado */}
        {verifiedStatus && (
          <div className="mb-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              Status: <span className="font-medium">{verifiedStatus}</span>
            </p>
          </div>
        )}

        {/* Botões */}
        <div className="space-y-3">
          <button
            onClick={() => setCurrentScreen('trips')}
            className="w-full py-3 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 transition-colors"
          >
            {currentConfig.buttonText}
          </button>

          <button
            onClick={() => setCurrentScreen('home')}
            className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            <span>Voltar ao Início</span>
          </button>
        </div>

        {/* Informação adicional para sucesso */}
        {result === 'success' && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Próximos Passos:
            </h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Nossos especialistas começarão a criar seu roteiro</li>
              <li>• Você receberá uma notificação quando ficar pronto</li>
              <li>• O roteiro completo estará na aba "Roteiro"</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
