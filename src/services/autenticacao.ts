import { clienteSupabase } from '../lib/supabase';

/**
 * Login com email e senha
 */
export async function entrarComEmailSenha(
  email: string,
  senha: string
) {
  return clienteSupabase.auth.signInWithPassword({
    email,
    password: senha,
  });
}

/**
 * Cadastro com email e senha
 */
export async function cadastrarComEmailSenha(
  email: string,
  senha: string
) {
  return clienteSupabase.auth.signUp({
    email,
    password: senha,
  });
}

/**
 * Login com Google
 */
export async function entrarComGoogle() {
  return clienteSupabase.auth.signInWithOAuth({
    provider: 'google',
  });
}

/**
 * Logout
 */
export async function sair() {
  return clienteSupabase.auth.signOut();
}

/**
 * Buscar sessão atual
 */
export async function obterSessaoAtual() {
  return clienteSupabase.auth.getSession();
}

/**
 * Buscar usuário logado
 */
export async function obterUsuarioLogado() {
  return clienteSupabase.auth.getUser();
}
