import { projectId, publicAnonKey } from '/utils/supabase/info';

export interface CheckoutData {
  tripId: string;
  amount: number;
  title: string;
  description: string;
}

export interface CreateCheckoutResponse {
  checkoutUrl: string;
  purchaseId: string;
}

/**
 * Cria um checkout no Mercado Pago para compra de planejamento
 */
export async function createCheckout(
  data: CheckoutData,
  accessToken: string
): Promise<CreateCheckoutResponse> {
  try {
    console.log('[Payment Service] 🚀 Iniciando createCheckout...');
    console.log('[Payment Service] 📦 Data:', data);
    console.log('[Payment Service] 🔑 Access Token:', {
      length: accessToken.length,
      start: accessToken.substring(0, 30) + '...',
      end: '...' + accessToken.substring(accessToken.length - 10)
    });

    const url = `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/payments/create-checkout`;
    console.log('[Payment Service] 📡 URL:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`, // ANON KEY para passar pelo middleware do Supabase
        'X-User-Token': accessToken, // User token para nosso código validar
      },
      body: JSON.stringify(data),
    });

    console.log('[Payment Service] 📨 Response status:', response.status);
    console.log('[Payment Service] 📨 Response ok:', response.ok);

    if (!response.ok) {
      const error = await response.json();
      console.error('[Payment Service] ❌ Erro ao criar checkout:', error);
      
      // Se é erro de PolicyAgent do Mercado Pago, mostrar mensagem detalhada
      if (error.code === 'PA_UNAUTHORIZED_RESULT_FROM_POLICIES') {
        console.error('[Payment Service] 🔒 ERRO MERCADO PAGO - PolicyAgent bloqueou a requisição');
        console.error('[Payment Service] 📋 Instruções:', error.error);
      }
      
      throw new Error(error.error || error.message || 'Erro ao criar checkout');
    }

    const result = await response.json();
    console.log('[Payment Service] ✅ Checkout criado com sucesso:', result.purchaseId);
    
    return result;
  } catch (error) {
    console.error('[Payment Service] 💥 Erro crítico ao criar checkout:', error);
    throw error;
  }
}

/**
 * Verifica o status de um pagamento
 */
export async function checkPaymentStatus(
  purchaseId: string,
  accessToken: string
): Promise<string> {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/payments/status/${purchaseId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('[Payment Service] Erro ao verificar status:', error);
      throw new Error(error.message || 'Erro ao verificar pagamento');
    }

    const result = await response.json();
    return result.status;
  } catch (error) {
    console.error('[Payment Service] Erro ao verificar status de pagamento:', error);
    throw error;
  }
}