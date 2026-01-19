/**
 * ========================================
 * 🧪 MODO DE TESTE - PAGAMENTOS
 * ========================================
 * 
 * Este arquivo controla os gatilhos de teste para simular
 * pagamentos aprovados SEM precisar pagar de verdade.
 * 
 * 
 * 📋 COMO USAR:
 * ============
 * 
 * 1. ATIVAR MODO DE TESTE:
 *    - Abra o Console do navegador (F12)
 *    - Execute: localStorage.setItem('TEST_MODE_ENABLED', 'true')
 *    - Recarregue a página
 * 
 * 2. DESATIVAR MODO DE TESTE:
 *    - Abra o Console do navegador (F12)
 *    - Execute: localStorage.removeItem('TEST_MODE_ENABLED')
 *    - Recarregue a página
 * 
 * 3. VERIFICAR SE ESTÁ ATIVO:
 *    - Abra o Console do navegador (F12)
 *    - Execute: localStorage.getItem('TEST_MODE_ENABLED')
 *    - Se retornar 'true', está ativado
 * 
 * 
 * ⚠️ IMPORTANTE:
 * ==============
 * - Use APENAS para testes e desenvolvimento
 * - NUNCA deixe ativado em produção
 * - Os pagamentos simulados NÃO geram transações reais
 * - Os dados são salvos normalmente no banco de dados
 * 
 * 
 * 🎯 O QUE ACONTECE NO MODO DE TESTE:
 * ===================================
 * - Compra de Planejamento: Aprova instantaneamente
 * - Upgrade Premium: Aprova instantaneamente
 * - Não abre checkout do Mercado Pago
 * - Não cobra valores reais
 * - Atualiza banco de dados normalmente
 * 
 */

export const isTestModeEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('TEST_MODE_ENABLED') === 'true';
};

export const enableTestMode = () => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('TEST_MODE_ENABLED', 'true');
  console.log('🧪 MODO DE TESTE ATIVADO');
  console.log('⚠️ Pagamentos serão simulados sem cobranças reais');
};

export const disableTestMode = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('TEST_MODE_ENABLED');
  console.log('✅ MODO DE TESTE DESATIVADO');
  console.log('💳 Pagamentos voltarão a usar Mercado Pago real');
};

export const getTestModeStatus = () => {
  const enabled = isTestModeEnabled();
  console.log('========================================');
  console.log('🧪 STATUS DO MODO DE TESTE');
  console.log('========================================');
  console.log(`Status: ${enabled ? '✅ ATIVADO' : '❌ DESATIVADO'}`);
  console.log('');
  console.log('Para ativar:');
  console.log('  localStorage.setItem("TEST_MODE_ENABLED", "true")');
  console.log('');
  console.log('Para desativar:');
  console.log('  localStorage.removeItem("TEST_MODE_ENABLED")');
  console.log('========================================');
  return enabled;
};

// Exportar funções para o console global (apenas em dev)
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).testMode = {
    enable: enableTestMode,
    disable: disableTestMode,
    status: getTestModeStatus,
    isEnabled: isTestModeEnabled,
  };
  
  console.log('');
  console.log('🧪 Modo de teste disponível!');
  console.log('Use: testMode.enable() ou testMode.disable()');
  console.log('Verifique: testMode.status()');
  console.log('');
}
