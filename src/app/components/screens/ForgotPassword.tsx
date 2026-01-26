import { useState } from 'react';
import { ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigation } from '@/app/context/NavigationContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Logo } from '../Logo';

type ResetState = 'idle' | 'loading' | 'success' | 'error';

export function ForgotPassword() {
  const { setCurrentScreen } = useNavigation();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<ResetState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setErrorMessage('Por favor, informe seu email');
      setState('error');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Por favor, informe um email válido');
      setState('error');
      return;
    }

    setState('loading');
    setErrorMessage('');

    try {
      console.log('[ForgotPassword] Solicitando código de recuperação para:', email);
      
      // Chamar endpoint que gera código (mesmo endpoint do admin, mas sem auth)
      // Vamos criar um endpoint público para isso
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/auth/request-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[ForgotPassword] Erro:', data.error);
        setErrorMessage(data.error || 'Erro ao solicitar código');
        setState('error');
        return;
      }

      console.log('[ForgotPassword] ✅ Código enviado com sucesso!');
      
      // Armazenar email no sessionStorage para usar na próxima tela
      sessionStorage.setItem('resetEmail', email);
      
      setState('success');
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        setCurrentScreen('reset-password');
      }, 2000);
    } catch (error) {
      console.error('[ForgotPassword] Erro inesperado:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao solicitar código');
      setState('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo size={48} variant="full" className="text-sky-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Recuperar Senha</h1>
          <p className="text-gray-600 mt-2">
            Sem problemas! Vamos te ajudar a recuperar o acesso.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {state === 'success' ? (
            // Success State
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-2">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900">
                Código Enviado!
              </h2>
              
              <p className="text-gray-600">
                Enviamos um código de verificação para <strong>{email}</strong>.
                Verifique sua caixa de entrada e spam.
              </p>

              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-sm text-sky-900">
                <p className="font-medium mb-1">📧 Não recebeu o código?</p>
                <p>• Verifique a pasta de spam</p>
                <p>• O código expira em 15 minutos</p>
                <p>• Você será redirecionado automaticamente</p>
              </div>

              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          ) : (
            // Form State
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center text-sm text-gray-600 mb-6">
                Informe seu email cadastrado para receber um código de verificação.
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    disabled={state === 'loading'}
                  />
                </div>
              </div>

              {state === 'error' && errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium">Erro ao solicitar código</p>
                    <p className="mt-1">{errorMessage}</p>
                  </div>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
                <p className="font-medium mb-2">Como funciona:</p>
                <ul className="space-y-1">
                  <li>• Você receberá um código de 6 dígitos</li>
                  <li>• O código expira em 15 minutos</li>
                  <li>• Use o código na próxima tela para criar uma nova senha</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={state === 'loading' || !email}
                className="w-full px-6 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state === 'loading' ? 'Enviando...' : 'Enviar Código'}
              </button>

              <button
                type="button"
                onClick={() => setCurrentScreen('login')}
                disabled={state === 'loading'}
                className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
