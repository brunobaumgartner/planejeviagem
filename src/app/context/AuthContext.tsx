import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSupabaseClient } from '@/utils/supabase/client';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import type { User, UserRole } from '@/types';

// AuthContext with user profile management
interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  isLogged: boolean;
  isPremium: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string, homeCity?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  upgradeToPremium: () => Promise<{ error: string | null }>;
  getAccessToken: () => Promise<string | null>;
  updateProfile: (name: string) => Promise<{ error: string | null }>;
  updateEmail: (newEmail: string) => Promise<{ error: string | null }>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ error: string | null }>;
  updateHomeCity: (homeCity: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const supabase = getSupabaseClient();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      console.log('[AuthContext] Verificando sessão existente...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('[AuthContext] Sessão encontrada, buscando perfil do usuário...');
        // Fetch user profile from database
        let { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('[AuthContext] Erro ao buscar perfil:', error);
          
          // If profile doesn't exist (PGRST116), try to create it
          if (error.code === 'PGRST116') {
            console.log('[AuthContext] Perfil não encontrado. Tentando criar automaticamente...');
            
            // Extract name from email or metadata
            const name = session.user.user_metadata?.name || 
                        session.user.user_metadata?.full_name ||
                        session.user.email?.split('@')[0] || 
                        'Usuário';
            
            // Try to create the profile
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                email: session.user.email,
                name: name,
                role: 'logged',
              })
              .select()
              .single();

            if (createError) {
              console.error('[AuthContext] Erro ao criar perfil:', createError);
              
              // Check if table doesn't exist
              if (createError.code === 'PGRST205' || createError.code === '42P01') {
                return { 
                  error: 'Banco de dados não configurado. Execute o schema.sql no Supabase (veja SETUP-SUPABASE.md)' 
                };
              }
              
              // For other errors, just log and continue without profile
              console.error('[AuthContext] ⚠️ Não foi possível criar perfil automaticamente.');
            } else {
              console.log('[AuthContext] ✅ Perfil criado com sucesso!');
              profile = newProfile;
            }
          }
        }

        if (profile) {
          console.log('[AuthContext] Perfil carregado com sucesso:', profile.name);
          setUser({
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role as UserRole,
            createdAt: profile.created_at,
            homeCity: profile.home_city,
          });
        }
      } else {
        console.log('[AuthContext] Nenhuma sessão ativa encontrada');
      }
    } catch (error) {
      console.error('[AuthContext] Erro ao verificar usuário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, homeCity?: string) => {
    try {
      console.log('[AuthContext] Iniciando cadastro para:', email);
      // Call server endpoint to create user
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, password, name, homeCity }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('[AuthContext] Erro no cadastro:', data);
        return { error: data.error || 'Erro ao criar conta' };
      }

      console.log('[AuthContext] Cadastro realizado com sucesso, fazendo login...');
      // Sign in after successful signup
      return await signIn(email, password);
    } catch (error) {
      console.error('[AuthContext] Erro no cadastro:', error);
      return { error: 'Erro ao criar conta. Tente novamente.' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] Tentando login para:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[AuthContext] Erro no login:', error);
        return { error: 'Email ou senha incorretos' };
      }

      console.log('[AuthContext] Login bem-sucedido, buscando perfil...');
      if (data.session?.user) {
        // Fetch user profile
        let { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();

        if (profileError) {
          console.error('[AuthContext] Erro ao buscar perfil:', profileError);
          
          // Check if it's a "profile not found" error - try to create it
          if (profileError.code === 'PGRST116') {
            console.log('[AuthContext] Perfil não encontrado. Criando automaticamente...');
            
            // Extract name from email or metadata
            const name = data.session.user.user_metadata?.name || 
                        data.session.user.user_metadata?.full_name ||
                        data.session.user.email?.split('@')[0] || 
                        'Usuário';
            
            // Try to create the profile
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: data.session.user.id,
                email: data.session.user.email,
                name: name,
                role: 'logged',
              })
              .select()
              .single();

            if (createError) {
              console.error('[AuthContext] Erro ao criar perfil:', createError);
              
              // Check if table doesn't exist
              if (createError.code === 'PGRST205' || createError.code === '42P01') {
                return { 
                  error: 'Banco de dados não configurado. Execute o schema.sql no Supabase (veja SETUP-SUPABASE.md)' 
                };
              }
              
              // For other errors, just log and continue without profile
              console.error('[AuthContext] ⚠️ Não foi possível criar perfil automaticamente.');
            } else {
              console.log('[AuthContext] ✅ Perfil criado com sucesso!');
              profile = newProfile;
            }
          } else {
            // Other profile errors
            return { error: 'Erro ao carregar perfil do usuário' };
          }
        }

        if (profile) {
          console.log('[AuthContext] Perfil carregado com sucesso:', profile.name);
          setUser({
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role as UserRole,
            createdAt: profile.created_at,
            homeCity: profile.home_city,
          });
        } else {
          console.error('[AuthContext] Perfil não pôde ser criado');
          return { error: 'Erro ao configurar perfil. Tente novamente.' };
        }
      }

      return { error: null };
    } catch (error) {
      console.error('[AuthContext] Erro no login:', error);
      return { error: 'Erro ao fazer login. Tente novamente.' };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://planejeviagem.com.br/',
        },
      });

      if (error) {
        console.error('Google sign in error:', error);
        
        // Erro específico quando o provedor não está habilitado
        if (error.message?.includes('provider is not enabled') || error.message?.includes('Unsupported provider')) {
          return { 
            error: 'Login com Google não configurado. Acesse o painel do Supabase em Authentication > Providers > Google e configure as credenciais OAuth.' 
          };
        }
        
        return { error: 'Erro ao fazer login com Google' };
      }

      // Note: The user will be redirected to Google for authentication
      // When they return, the session will be automatically established
      return { error: null };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { error: 'Erro ao fazer login com Google. Tente novamente.' };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const upgradeToPremium = async () => {
    if (!user) {
      return { error: 'Você precisa estar logado' };
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/auth/upgrade-premium`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ userId: user.id }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Erro ao fazer upgrade' };
      }

      // Update local user
      setUser({ ...user, role: 'premium' });

      return { error: null };
    } catch (error) {
      console.error('Upgrade error:', error);
      return { error: 'Erro ao fazer upgrade. Tente novamente.' };
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    try {
      console.log('[AuthContext] Obtendo access token...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.error('[AuthContext] Sessão inválida:', error);
        return null;
      }
      
      // Verificar se o token vai expirar em menos de 5 minutos
      const expiresAt = session.expires_at || 0;
      const now = Math.floor(Date.now() / 1000);
      const fiveMinutes = 5 * 60;
      
      console.log('[AuthContext] Token expira em:', new Date(expiresAt * 1000));
      console.log('[AuthContext] Agora:', new Date(now * 1000));
      console.log('[AuthContext] Tempo restante (segundos):', expiresAt - now);
      
      if (expiresAt - now < fiveMinutes) {
        console.log('[AuthContext] ⚠️ Token próximo de expirar, renovando...');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData.session) {
          console.error('[AuthContext] ❌ Erro ao renovar token:', refreshError);
          console.log('[AuthContext] Fazendo logout automático...');
          await signOut();
          return null;
        }
        
        console.log('[AuthContext] ✅ Token renovado com sucesso!');
        return refreshData.session.access_token;
      }
      
      console.log('[AuthContext] ✅ Token ainda válido');
      return session.access_token;
    } catch (error) {
      console.error('[AuthContext] Erro ao obter access token:', error);
      return null;
    }
  };

  const updateProfile = async (name: string) => {
    if (!user) {
      return { error: 'Você precisa estar logado' };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('[AuthContext] Erro ao atualizar perfil:', error);
        return { error: 'Erro ao atualizar perfil. Tente novamente.' };
      }

      // Update local user
      setUser({ ...user, name: data.name });

      return { error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error: 'Erro ao atualizar perfil. Tente novamente.' };
    }
  };

  const updateEmail = async (newEmail: string) => {
    if (!user) {
      return { error: 'Você precisa estar logado' };
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) {
        console.error('[AuthContext] Erro ao atualizar email:', error);
        return { error: 'Erro ao atualizar email. Tente novamente.' };
      }

      // Update local user
      setUser({ ...user, email: newEmail });

      return { error: null };
    } catch (error) {
      console.error('Update email error:', error);
      return { error: 'Erro ao atualizar email. Tente novamente.' };
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) {
      return { error: 'Você precisa estar logado' };
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('[AuthContext] Erro ao atualizar senha:', error);
        return { error: 'Erro ao atualizar senha. Tente novamente.' };
      }

      return { error: null };
    } catch (error) {
      console.error('Update password error:', error);
      return { error: 'Erro ao atualizar senha. Tente novamente.' };
    }
  };

  const updateHomeCity = async (homeCity: string) => {
    if (!user) {
      return { error: 'Você precisa estar logado' };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ home_city: homeCity })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('[AuthContext] Erro ao atualizar cidade de origem:', error);
        return { error: 'Erro ao atualizar cidade de origem. Tente novamente.' };
      }

      // Update local user
      setUser({ ...user, homeCity: data.home_city });

      return { error: null };
    } catch (error) {
      console.error('Update home city error:', error);
      return { error: 'Erro ao atualizar cidade de origem. Tente novamente.' };
    }
  };

  const isGuest = !user;
  const isLogged = !!user && user.role === 'logged';
  const isPremium = !!user && user.role === 'premium';

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest,
        isLogged,
        isPremium,
        isLoading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        upgradeToPremium,
        getAccessToken,
        updateProfile,
        updateEmail,
        updatePassword,
        updateHomeCity,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}