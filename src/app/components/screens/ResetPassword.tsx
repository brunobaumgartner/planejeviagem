import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Hash, ArrowLeft } from 'lucide-react';
import { useNavigation } from '@/app/context/NavigationContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Logo } from '../Logo';

type ResetState = 'idle' | 'loading' | 'validating' | 'success' | 'error';

export function ResetPassword() {
  const { setCurrentScreen } = useNavigation();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [state, setState] = useState<ResetState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isCodeValid, setIsCodeValid] = useState(false);

  // Recuperar email do sessionStorage se vier da tela anterior
  useEffect(() => {
    const savedEmail = sessionStorage.getItem('resetEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      console.log('[ResetPassword] Email recuperado do sessionStorage:', savedEmail);
    }
  }, []);

  // Validar código quando o usuário digitar 6 dígitos
  useEffect(() => {
    if (code.length === 6 && email) {
      validateCode();
    } else {
      setIsCodeValid(false);
    }
  }, [code, email]);

  const validateCode = async () => {
    setState('validating');
    setErrorMessage('');

    try {
      console.log('[ResetPassword] Validando código...');
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/auth/verify-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        console.error('[ResetPassword] Código inválido:', data.error);
        setErrorMessage(data.error || 'Código inválido');
        setState('error');
        setIsCodeValid(false);
        return;
      }

      console.log('[ResetPassword] ✅ Código válido!');
      setIsCodeValid(true);
      setState('idle');
    } catch (error) {
      console.error('[ResetPassword] Erro ao validar código:', error);
      setErrorMessage('Erro ao validar código');
      setState('error');
      setIsCodeValid(false);
    }
  };

  const validatePassword = () => {
    if (password.length < 6) {
      setErrorMessage('A senha deve ter no mínimo 6 caracteres');
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      setState('error');
      return;
    }

    if (!isCodeValid) {
      setErrorMessage('Código inválido ou não verificado');
      setState('error');
      return;
    }

    setState('loading');
    setErrorMessage('');

    try {
      console.log('[ResetPassword] Resetando senha...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/auth/reset-password-with-code`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, code, newPassword: password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[ResetPassword] Erro:', data.error);
        setErrorMessage(data.error || 'Erro ao resetar senha');
        setState('error');
        return;
      }

      console.log('[ResetPassword] ✅ Senha resetada com sucesso!');
      setState('success');
      
      // Limpar sessionStorage
      sessionStorage.removeItem('resetEmail');
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        setCurrentScreen('login');
      }, 2000);
    } catch (error) {
      console.error('[ResetPassword] Erro inesperado:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao resetar senha');
      setState('error');
    }
  };

  const passwordStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 6) return { label: 'Fraca', color: 'red' };
    if (password.length < 10) return { label: 'Média', color: 'amber' };
    return { label: 'Forte', color: 'green' };
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo size={48} variant="full" className="text-sky-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Criar Nova Senha</h1>
          <p className="text-gray-600 mt-2">
            Digite o código que você recebeu por email e escolha uma nova senha.
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
                Senha Atualizada!
              </h2>
              
              <p className="text-gray-600">
                Sua senha foi atualizada com sucesso.
                Redirecionando para o login...
              </p>

              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          ) : (
            // Form State
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  disabled={state === 'loading'}
                  required
                />
              </div>

              {/* Código */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Verificação
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setCode(value);
                    }}
                    placeholder="123456"
                    maxLength={6}
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent tracking-widest text-center text-xl font-mono ${
                      isCodeValid ? 'border-green-500 bg-green-50' : 'border-gray-300'
                    }`}
                    disabled={state === 'loading'}
                    required
                  />
                  {state === 'validating' && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {isCodeValid && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                  )}
                </div>
                {isCodeValid && (
                  <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Código válido
                  </p>
                )}
              </div>

              {/* Nova Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nova Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    disabled={state === 'loading' || !isCodeValid}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {strength && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          strength.label === 'Fraca' ? 'bg-red-500 w-1/3' :
                          strength.label === 'Média' ? 'bg-amber-500 w-2/3' :
                          'bg-green-500 w-full'
                        }`}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      strength.label === 'Fraca' ? 'text-red-600' :
                      strength.label === 'Média' ? 'text-amber-600' :
                      'text-green-600'
                    }`}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirmar Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    disabled={state === 'loading' || !isCodeValid}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                
                {/* Match Indicator */}
                {confirmPassword && (
                  <div className="mt-2 text-xs">
                    {password === confirmPassword ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        As senhas coincidem
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        As senhas não coincidem
                      </span>
                    )}
                  </div>
                )}
              </div>

              {state === 'error' && errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium">Erro</p>
                    <p className="mt-1">{errorMessage}</p>
                  </div>
                </div>
              )}

              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-sm text-sky-900">
                <p className="font-medium mb-2">✓ Lembre-se:</p>
                <ul className="space-y-1">
                  <li>• O código expira em 15 minutos</li>
                  <li>• Você tem no máximo 3 tentativas</li>
                  <li>• A senha deve ter no mínimo 6 caracteres</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={state === 'loading' || !isCodeValid || !password || !confirmPassword}
                className="w-full px-6 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state === 'loading' ? 'Atualizando...' : 'Atualizar Senha'}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setCurrentScreen('forgot-password')}
                  disabled={state === 'loading'}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Solicitar novo código
                </button>
                
                <button
                  type="button"
                  onClick={() => setCurrentScreen('login')}
                  disabled={state === 'loading'}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Voltar ao login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
