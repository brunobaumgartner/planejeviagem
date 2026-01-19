import { createClient } from '@supabase/supabase-js';
import { 
  idProjetoSupabase,
  chavePublicaAnonima
} from '../../utils/supabase/info';

export const clienteSupabase = createClient(
  `https://${idProjetoSupabase}.supabase.co`,
  chavePublicaAnonima
);

export const API_URL = `https://${idProjetoSupabase}.supabase.co/functions/v1/make-server-474b5592`;