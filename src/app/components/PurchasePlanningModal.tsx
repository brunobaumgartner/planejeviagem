import { useState } from "react";
import {
  X,
  Check,
  Clock,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { createCheckout } from "@/services/payment";
import { useAuth } from "@/app/context/AuthContext";
import { publicAnonKey } from "/utils/supabase/info";
import type { Trip } from "@/types";

interface PurchasePlanningModalProps {
  isOpen: boolean;
  trip: Trip | null;
  onClose: () => void;
}

const PLANNING_PRICE = 1.17; // Preço fixo do planejamento

export function PurchasePlanningModal({
  isOpen,
  trip,
  onClose,
}: PurchasePlanningModalProps) {
  const { user, getAccessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !trip) return null;

  const handlePurchase = async () => {
    if (!user || user.role === "guest") {
      setError("Você precisa estar logado para comprar");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(
        "[PurchasePlanningModal] ========== INICIANDO COMPRA ==========",
      );
      console.log("[PurchasePlanningModal] User:", {
        id: user.id,
        email: user.email,
        role: user.role,
      });
      console.log("[PurchasePlanningModal] Trip:", {
        id: trip.id,
        destination: trip.destination,
      });
      console.log(
        "[PurchasePlanningModal] Obtendo access token...",
      );

      // Obter access token
      const accessToken = await getAccessToken();

      console.log("[PurchasePlanningModal] ✅ Token obtido:", {
        hasToken: !!accessToken,
        tokenLength: accessToken?.length,
        tokenStart: accessToken?.substring(0, 30),
        tokenEnd: accessToken?.substring(
          accessToken.length - 10,
        ),
      });

      if (!accessToken) {
        console.error(
          "[PurchasePlanningModal] ❌ Token não obtido - ERRO CRÍTICO",
        );
        setError("Erro de autenticação. Faça login novamente.");
        setIsLoading(false);
        return;
      }

      // TESTE: Validar JWT primeiro
      console.log(
        "[PurchasePlanningModal] 🧪 TESTANDO validação JWT...",
      );
      const testResponse = await fetch(
        `https://nncryzbssbuhnlvqnjfc.supabase.co/functions/v1/make-server-5f5857fb/test-jwt`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`, // ANON KEY para passar pelo middleware do Supabase
            "X-User-Token": accessToken, // User token para nosso código validar
          },
        },
      );

      const testResult = await testResponse.json();
      console.log(
        "[PurchasePlanningModal] 🧪 Resultado do teste JWT:",
        testResult,
      );

      if (!testResponse.ok) {
        console.error(
          "[PurchasePlanningModal] ❌ TESTE JWT FALHOU:",
          testResult,
        );
        setError(`Erro de autenticação: ${testResult.error}`);
        setIsLoading(false);
        return;
      }

      console.log(
        "[PurchasePlanningModal] ✅ TESTE JWT PASSOU! Continuando com compra...",
      );

      console.log(
        "[PurchasePlanningModal] 🚀 Chamando createCheckout...",
      );

      const { checkoutUrl } = await createCheckout(
        {
          tripId: trip.id,
          amount: PLANNING_PRICE,
          title: `Planejamento - ${trip.destination}`,
          description: `Planejamento completo para sua viagem a ${trip.destination}`,
        },
        accessToken,
      );

      console.log(
        "[PurchasePlanningModal] ✅ Checkout criado com sucesso!",
      );
      console.log(
        "[PurchasePlanningModal] 🔗 Redirecionando para:",
        checkoutUrl,
      );

      // Abrir checkout em nova aba (necessário pois estamos em iframe)
      const newWindow = window.open(checkoutUrl, "_blank");

      if (!newWindow) {
        console.error(
          "[PurchasePlanningModal] ❌ Popup bloqueado pelo navegador",
        );
        setError(
          "Por favor, permita popups para continuar com o pagamento.",
        );
        setIsLoading(false);
        return;
      }

      console.log(
        "[PurchasePlanningModal] ✅ Nova aba aberta com sucesso!",
      );

      // Fechar modal e mostrar mensagem de sucesso
      setIsLoading(false);
      onClose();
    } catch (err) {
      console.error(
        "[PurchasePlanningModal] ❌ Erro ao criar checkout:",
        err,
      );
      console.error(
        "[PurchasePlanningModal] ❌ Erro detalhado:",
        JSON.stringify(err, null, 2),
      );

      // Extrair mensagem de erro amigável
      let errorMessage =
        "Erro ao processar pagamento. Tente novamente.";

      if (err instanceof Error) {
        if (
          err.message.includes("PolicyAgent") ||
          err.message.includes(
            "UNAUTHORIZED_RESULT_FROM_POLICIES",
          )
        ) {
          errorMessage =
            "Erro na configuração do pagamento. Entre em contato com o suporte.";
        } else if (err.message.includes("Access Token")) {
          errorMessage =
            "Erro de configuração do Mercado Pago. Contate o administrador.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-slideUp">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                Planejamento Personalizado
              </h2>
              <p className="text-sm text-gray-600">
                {trip.destination}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* O que você recebe */}
          <div>
            <h3 className="font-semibold mb-3">
              O que você recebe:
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    Roteiro Completo
                  </p>
                  <p className="text-xs text-gray-600">
                    Itinerário dia a dia com horários e locais
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    Checklist Personalizado
                  </p>
                  <p className="text-xs text-gray-600">
                    Tarefas específicas para sua viagem
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    Recomendações Locais
                  </p>
                  <p className="text-xs text-gray-600">
                    Restaurantes, atrações e dicas exclusivas
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Clock className="w-5 h-5 text-sky-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    Entrega em até 48h úteis
                  </p>
                  <p className="text-xs text-gray-600">
                    Feito por especialistas em viagens
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detalhes da viagem */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Destino</span>
              <span className="font-medium">
                {trip.destination}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Período</span>
              <span className="font-medium">
                {trip.startDate} - {trip.endDate}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Orçamento</span>
              <span className="font-medium">{trip.budget}</span>
            </div>
          </div>

          {/* Preço */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">
                Planejamento Completo
              </span>
              <div className="text-right">
                <p className="text-2xl font-bold text-sky-600">
                  R$ {PLANNING_PRICE.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  pagamento único
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={handlePurchase}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg font-medium hover:from-sky-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Comprar Agora</span>
                </>
              )}
            </button>

            <p className="text-xs text-center text-gray-500 mt-3">
              Pagamento seguro via Mercado Pago
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}