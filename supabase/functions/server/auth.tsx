/**
 * Módulo centralizado de autenticação para o backend
 * 
 * Este módulo fornece uma classe AuthService que encapsula toda a lógica
 * de autenticação, incluindo:
 * - Extração de tokens JWT dos headers
 * - Validação de tokens com Supabase Auth
 * - Verificação de roles de usuário
 * - Logs consistentes
 * 
 * Uso:
 *   const authService = new AuthService(supabaseAnon);
 *   const user = await authService.verifyRequest(c);
 *   if (!user) return c.json({ error: 'Unauthorized' }, 401);
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

export interface AuthUser {
  id: string;
  email?: string;
  role?: string;
  aud?: string;
}

export class AuthService {
  private supabase: any;

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  /**
   * Extrai o access token do header da requisição
   * Suporta:
   * - Header customizado: X-User-Token
   * - Header padrão: Authorization (Bearer token)
   */
  private extractToken(c: any): string | null {
    console.log('[AuthService] 🔍 Extraindo token...');
    
    // Tentar primeiro o header customizado X-User-Token
    const customHeader = c.req.header('X-User-Token');
    if (customHeader) {
      console.log('[AuthService] ✅ Token extraído do X-User-Token (length:', customHeader.length, ')');
      return customHeader;
    }
    
    // Fallback para Authorization header (padrão)
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      console.log('[AuthService] ❌ Nenhum header de autenticação encontrado');
      console.log('[AuthService] Headers disponíveis:', Object.keys(c.req.raw.headers));
      return null;
    }

    if (!authHeader.startsWith('Bearer ')) {
      console.log('[AuthService] ❌ Authorization header inválido (não começa com "Bearer ")');
      console.log('[AuthService] Valor recebido:', authHeader.substring(0, 20) + '...');
      return null;
    }

    const token = authHeader.substring(7); // Remove "Bearer "
    console.log('[AuthService] ✅ Token extraído do Authorization header (length:', token.length, ')');
    console.log('[AuthService] Token preview:', token.substring(0, 20) + '...' + token.substring(token.length - 20));
    return token;
  }

  /**
   * Verifica e valida o token JWT usando Supabase Auth
   * Retorna o usuário se o token for válido, null caso contrário
   */
  async verifyToken(token: string): Promise<AuthUser | null> {
    if (!token) {
      console.error('[AuthService] ❌ Token vazio fornecido');
      return null;
    }

    try {
      console.log('[AuthService] Validando token com Supabase Auth...');
      
      // Usar supabaseAnon para validar tokens de usuários (JWT)
      const { data: { user }, error } = await this.supabase.auth.getUser(token);
      
      if (error) {
        // Erro de "missing sub claim" geralmente significa que não é um JWT de usuário
        // mas sim uma chave pública (publicAnonKey). Isso é normal para rotas públicas.
        if (error.message.includes('missing sub claim')) {
          console.log('[AuthService] ℹ️ Token não é um JWT de usuário (provavelmente publicAnonKey)');
          return null;
        }
        
        // Erro de sessão é comum quando servidor está reiniciando
        if (error.message.includes('session missing')) {
          console.warn('[AuthService] ⚠️ Sessão não encontrada (servidor pode estar reiniciando)');
          return null;
        }
        
        console.error('[AuthService] ❌ Token inválido:', error.message);
        return null;
      }

      if (!user) {
        console.error('[AuthService] ❌ Token válido mas nenhum usuário encontrado');
        return null;
      }

      console.log('[AuthService] ✅ Token válido para usuário:', user.email || user.id);
      
      return {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role,
        aud: user.aud
      };
    } catch (error) {
      console.error('[AuthService] ❌ Exceção ao validar token:', error);
      return null;
    }
  }

  /**
   * Método principal: verifica a requisição e retorna o usuário autenticado
   * Uso simplificado nas rotas:
   * 
   *   const user = await authService.verifyRequest(c);
   *   if (!user) return c.json({ error: 'Unauthorized' }, 401);
   */
  async verifyRequest(c: any): Promise<AuthUser | null> {
    const token = this.extractToken(c);
    if (!token) {
      return null;
    }

    return await this.verifyToken(token);
  }

  /**
   * Verifica se o usuário tem uma role específica
   * Útil para proteger rotas administrativas
   */
  async verifyRequestWithRole(c: any, requiredRole: string): Promise<AuthUser | null> {
    const user = await this.verifyRequest(c);
    
    if (!user) {
      console.error('[AuthService] ❌ Usuário não autenticado');
      return null;
    }

    if (user.role !== requiredRole) {
      console.error(`[AuthService] ❌ Usuário ${user.email} não tem role "${requiredRole}" (tem: "${user.role}")`);
      return null;
    }

    console.log(`[AuthService] ✅ Usuário ${user.email} autorizado com role "${requiredRole}"`);
    return user;
  }

  /**
   * Middleware helper para retornar erro 401 automaticamente
   * Uso:
   * 
   *   app.get('/rota-protegida', async (c) => {
   *     const user = await authService.requireAuth(c);
   *     if (!user) return; // Já retornou 401
   *     
   *     // Continuar com lógica da rota...
   *   });
   */
  async requireAuth(c: any): Promise<AuthUser | null> {
    const user = await this.verifyRequest(c);
    
    if (!user) {
      console.error('[AuthService] ❌ Requisição bloqueada: não autenticado');
      c.status(401);
      c.json({ error: 'Unauthorized', message: 'Token inválido ou ausente' });
      return null;
    }

    return user;
  }
}