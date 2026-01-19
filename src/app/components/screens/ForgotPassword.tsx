import { useState } from 'react';
import { ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigation } from '@/app/context/NavigationContext';
import { getSupabaseClient } from '@/utils/supabase/client';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Logo } from '../Logo';

const supabase = getSupabaseClient();

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

    setState('loading');
    setErrorMessage('');

    try {
      console.log('[ForgotPassword] Enviando link de recuperação para:', email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('[ForgotPassword] Erro:', error);
        setErrorMessage(error.message);
        setState('error');
        return;
      }

      console.log('[ForgotPassword] ✅ Email enviado com sucesso!');
      setState('success');
    } catch (error) {
      console.error('[ForgotPassword] Erro inesperado:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao enviar email');
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
                Email Enviado!
              </h2>
              
              <p className="text-gray-600">
                Enviamos um link de recuperação para <strong>{email}</strong>.
                Verifique sua caixa de entrada e spam.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
                <p className="font-medium mb-2">⚠️ Importante:</p>
                <ul className="space-y-1 text-left">
                  <li>• O link expira em 1 hora</li>
                  <li>• Verifique a pasta de spam</li>
                  <li>• Não compartilhe o link com ninguém</li>
                </ul>
              </div>

              <button
                onClick={() => setCurrentScreen('login')}
                className="w-full mt-6 px-6 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors"
              >
                Voltar para Login
              </button>
            </div>
          ) : (
            // Form State
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email cadastrado
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
                      <p className="font-medium">Erro ao enviar email</p>
                      <p className="mt-1">{errorMessage}</p>
                    </div>
                  </div>
                )}

                <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-sm text-sky-900">
                  <p className="font-medium mb-2">ℹ️ Como funciona:</p>
                  <ul className="space-y-1">
                    <li>1. Digite seu email cadastrado</li>
                    <li>2. Clique em "Enviar Link"</li>
                    <li>3. Acesse seu email e clique no link</li>
                    <li>4. Crie uma nova senha</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={state === 'loading'}
                  className="w-full px-6 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state === 'loading' ? 'Enviando...' : 'Enviar Link de Recuperação'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setCurrentScreen('login')}
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para Login
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Não recebeu o email?{' '}
            <button
              onClick={() => {
                setState('idle');
                setErrorMessage('');
              }}
              className="text-sky-600 hover:text-sky-700 font-medium"
            >
              Tentar novamente
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}