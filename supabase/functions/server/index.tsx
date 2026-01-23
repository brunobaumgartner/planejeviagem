import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';
import * as dataFetcher from './data-fetcher.tsx';
import { AuthService } from './auth.tsx';
import travelpayoutsRoutes from './travelpayouts.tsx';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-User-Token'],
  exposeHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 600,
  credentials: true,
}));
app.use('*', logger(console.log));

// Create Supabase admin client (for admin operations only)
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Create Supabase client with anon key (for JWT validation)
const supabaseAnon = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

// Initialize AuthService (centralizado)
const authService = new AuthService(supabaseAnon);

// Helper function to create authenticated Supabase client from access token
function getAuthenticatedClient(accessToken: string) {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    }
  );
}

// ============================================
// FUNÇÕES ANTIGAS DE AUTENTICAÇÃO - DEPRECATED
// ============================================
// ⚠️ NÃO USE ESTAS FUNÇÕES! Use AuthService em vez disso.
// Mantidas apenas para compatibilidade temporária.
// ============================================

/**
 * @deprecated Use authService.extractToken() ou authService.verifyRequest()
 */
function getAccessToken(c: any): string | null {
  const customHeader = c.req.header('X-User-Token');
  if (customHeader) return customHeader;
  
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  
  return authHeader.substring(7);
}

/**
 * @deprecated Use authService.verifyRequest() e pegue user.id
 */
async function verifyAndGetUserId(c: any): Promise<string | null> {
  console.warn('⚠️ verifyAndGetUserId() is deprecated. Use authService.verifyRequest()');
  const user = await authService.verifyRequest(c);
  return user?.id || null;
}

/**
 * @deprecated Use authService.verifyRequest()
 */
async function verifyAndGetUser(c: any): Promise<any | null> {
  console.warn('⚠️ verifyAndGetUser() is deprecated. Use authService.verifyRequest()');
  return await authService.verifyRequest(c);
}

// Helper function to convert camelCase to snake_case for database
function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => toSnakeCase(item));
  }
  
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {} as any);
  }
  
  return obj;
}

// Helper function to convert snake_case to camelCase for frontend
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item));
  }
  
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {} as any);
  }
  
  return obj;
}

// Health check
app.get('/make-server-5f5857fb/health', async (c) => {
  const startTime = Date.now();
  const healthCheck: any = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {},
    stats: {},
  };

  try {
    // 1. Check Database Connection
    try {
      const { data: dbCheck, error: dbError } = await supabaseAdmin
        .from('kv_store_5f5857fb')
        .select('key')
        .limit(1);
      
      if (dbError) throw dbError;
      
      healthCheck.services.database = {
        name: 'Database (PostgreSQL)',
        status: 'healthy',
        message: 'Conexão com banco de dados OK',
        lastChecked: new Date().toISOString(),
        details: {
          connected: true,
          table: 'kv_store_5f5857fb',
        }
      };
    } catch (error) {
      healthCheck.status = 'degraded';
      healthCheck.services.database = {
        name: 'Database (PostgreSQL)',
        status: 'error',
        message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        lastChecked: new Date().toISOString(),
      };
    }

    // 2. Check Auth Service
    try {
      const { data: authCheck, error: authError } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1,
      });
      
      if (authError) throw authError;
      
      healthCheck.services.auth = {
        name: 'Authentication (Supabase Auth)',
        status: 'healthy',
        message: 'Serviço de autenticação OK',
        lastChecked: new Date().toISOString(),
        details: {
          available: true,
          provider: 'Supabase Auth',
        }
      };
    } catch (error) {
      healthCheck.status = 'degraded';
      healthCheck.services.auth = {
        name: 'Authentication (Supabase Auth)',
        status: 'error',
        message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        lastChecked: new Date().toISOString(),
      };
    }

    // 3. Check Storage Service
    try {
      const { data: buckets, error: storageError } = await supabaseAdmin.storage.listBuckets();
      
      if (storageError) throw storageError;
      
      const tripsBucket = buckets?.find(b => b.name === 'make-5f5857fb-trips');
      
      healthCheck.services.storage = {
        name: 'Storage (Supabase Storage)',
        status: tripsBucket ? 'healthy' : 'warning',
        message: tripsBucket 
          ? 'Storage configurado corretamente' 
          : 'Storage disponível mas bucket de viagens não encontrado',
        lastChecked: new Date().toISOString(),
        details: {
          available: true,
          bucketsCount: buckets?.length || 0,
          tripsBucketExists: !!tripsBucket,
        }
      };
      
      if (!tripsBucket && healthCheck.status === 'healthy') {
        healthCheck.status = 'degraded';
      }
    } catch (error) {
      healthCheck.status = 'degraded';
      healthCheck.services.storage = {
        name: 'Storage (Supabase Storage)',
        status: 'error',
        message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        lastChecked: new Date().toISOString(),
      };
    }

    // 4. Check Server Status (Self)
    const responseTime = Date.now() - startTime;
    healthCheck.services.server = {
      name: 'Server (Hono/Deno)',
      status: 'healthy',
      message: 'Servidor respondendo normalmente',
      responseTime: responseTime,
      lastChecked: new Date().toISOString(),
      details: {
        runtime: 'Deno',
        framework: 'Hono',
        healthy: true,
      }
    };

    // 5. Check Mercado Pago Configuration (without API call)
    const mpToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    healthCheck.services.mercadopago = {
      name: 'Mercado Pago',
      status: mpToken ? 'healthy' : 'warning',
      message: mpToken 
        ? 'Token de acesso configurado' 
        : 'Token de acesso não configurado',
      lastChecked: new Date().toISOString(),
      details: {
        configured: !!mpToken,
        tokenLength: mpToken ? mpToken.length : 0,
      }
    };

    if (!mpToken && healthCheck.status === 'healthy') {
      healthCheck.status = 'degraded';
    }

    // 6. Get Basic Stats (optional - pode desabilitar se consumir muito)
    try {
      const [usersCount, tripsCount, purchasesCount] = await Promise.all([
        supabaseAdmin.from('users').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('trips').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('purchases').select('id', { count: 'exact', head: true }),
      ]);

      healthCheck.stats = {
        totalUsers: usersCount.count || 0,
        totalTrips: tripsCount.count || 0,
        totalPurchases: purchasesCount.count || 0,
      };
    } catch (error) {
      console.log('[Health] Erro ao buscar stats, continuando...', error);
      // Não falhar health check se stats falharem
    }

    return c.json(healthCheck);
  } catch (error) {
    console.error('[Health Check] Erro geral:', error);
    return c.json({
      status: 'down',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }, 500);
  }
});

// Test JWT validation
app.post('/make-server-5f5857fb/test-jwt', async (c) => {
  console.log('==========================================');
  console.log('[Test JWT] INÍCIO DO HANDLER - Requisição recebida!');
  console.log('[Test JWT] Method:', c.req.method);
  console.log('[Test JWT] URL:', c.req.url);
  console.log('[Test JWT] Headers:', Object.fromEntries(c.req.raw.headers));
  console.log('==========================================');
  
  const accessToken = getAccessToken(c);
  console.log('[Test JWT] Token extraído:', accessToken ? 'SIM' : 'NÃO');
  
  if (!accessToken) {
    console.error('[Test JWT] ❌ Nenhum token fornecido');
    return c.json({ code: 401, error: 'No token provided' }, 401);
  }

  console.log('[Test JWT] Token details:', {
    length: accessToken.length,
    start: accessToken.substring(0, 50),
  });

  // Tentar validar com supabaseAdmin
  console.log('[Test JWT] Tentando validar com supabaseAdmin.auth.getUser()...');
  
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
    
    console.log('[Test JWT] Resultado da validação:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      hasError: !!error,
      errorMessage: error?.message,
      errorName: error?.name,
      errorStatus: error?.status
    });

    if (error) {
      console.error('[Test JWT] ❌ Erro ao validar:', JSON.stringify(error, null, 2));
      return c.json({ 
        code: 401,
        success: false, 
        error: error.message,
        errorDetails: error 
      }, 401);
    }

    console.log('[Test JWT] ✅ Validação bem-sucedida!');
    return c.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('[Test JWT] ❌ Exception ao validar:', err);
    return c.json({
      code: 500,
      success: false,
      error: 'Internal server error',
      details: String(err)
    }, 500);
  }
});

// ============================================
// AUTH ROUTES
// ============================================

// Sign up
app.post('/make-server-5f5857fb/auth/signup', async (c) => {
  try {
    const { email, password, name, homeCity } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Email, senha e nome são obrigatórios' }, 400);
    }

    // Create user with Supabase Auth
    // Note: The trigger "on_auth_user_created" will automatically create the profile
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since we don't have email server configured
      user_metadata: { name, homeCity },
    });

    if (authError) {
      console.error('Auth error:', authError);
      return c.json({ error: authError.message }, 400);
    }

    // If homeCity was provided, update the profile (created by trigger)
    if (homeCity) {
      await supabaseAdmin
        .from('profiles')
        .update({ home_city: homeCity })
        .eq('id', authData.user.id);
    }

    return c.json({ 
      success: true,
      message: 'Conta criada com sucesso',
      userId: authData.user.id,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Upgrade to premium
// Create premium subscription payment (Mercado Pago)
app.post('/make-server-5f5857fb/premium/create-payment', async (c) => {
  try {
    console.log('[Premium Payment] 📥 Request recebido');
    console.log('='.repeat(60));
    
    // 🔍 DIAGNÓSTICO COMPLETO DO TOKEN
    const authHeader = c.req.header('Authorization');
    console.log('[Premium Payment] 🔑 AUTH HEADER:', authHeader);
    console.log('[Premium Payment] 🔑 Header length:', authHeader?.length || 0);
    console.log('[Premium Payment] 🔑 Starts with Bearer?:', authHeader?.startsWith('Bearer '));
    
    const { userId, plan } = await c.req.json(); // plan: 'monthly' | 'annual'

    console.log('[Premium Payment] Dados recebidos:', { userId, plan });

    if (!userId || !plan) {
      console.error('[Premium Payment] ❌ Dados faltando:', { userId, plan });
      return c.json({ error: 'userId e plan são obrigatórios' }, 400);
    }

    // Verificar configurações de preço
    console.log('[Premium Payment] 🔍 Buscando config de preços...');
    const config = await kv.get('pricing_config');
    console.log('[Premium Payment] Config encontrada:', config);
    
    if (!config) {
      console.error('[Premium Payment] ❌ Config não encontrada no KV store');
      // Criar config padrão se não existir
      const defaultConfig = {
        test_mode: true,
        premium_monthly_price: 19.90,
        premium_annual_price: 199.00,
        planning_package_price: 299.90
      };
      await kv.set('pricing_config', defaultConfig);
      console.log('[Premium Payment] ✅ Config padrão criada');
      return c.json({ error: 'Configurações criadas. Tente novamente.' }, 500);
    }

    // Verificar se está em modo teste
    if (config.test_mode) {
      console.log('[Premium Payment] 🧪 MODO TESTE: Upgrade gratuito');

      // Atualizar usuário - apenas role (simplificado)
      console.log('[Premium Payment] 💾 Atualizando perfil do usuário para premium...');
      const { error, data: updateData } = await supabaseAdmin
        .from('profiles')
        .update({ role: 'premium' })
        .eq('id', userId)
        .select();

      if (error) {
        console.error('[Premium Payment] ❌ Erro ao fazer upgrade:', error);
        return c.json({ 
          error: 'Erro ao fazer upgrade',
          details: error.message,
          hint: 'Verifique se a tabela profiles existe com a coluna role'
        }, 500);
      }

      console.log('[Premium Payment] ✅ Upgrade realizado com sucesso:', updateData);

      return c.json({ 
        success: true, 
        test_mode: true,
        message: 'Upgrade realizado com sucesso! Você agora é Premium 🎉',
        role: 'premium',
      });
    }

    // MODO PRODUÇÃO: Criar preferência no Mercado Pago
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!accessToken) {
      return c.json({ error: 'Mercado Pago não configurado' }, 500);
    }

    const amount = plan === 'monthly' 
      ? config.premium_monthly_price 
      : config.premium_annual_price;

    const planLabel = plan === 'monthly' ? 'Mensal' : 'Anual';

    // Criar preferência de pagamento
    const preference = {
      items: [{
        title: `Planeje Fácil - Premium ${planLabel}`,
        description: `Plano premium ${plan === 'monthly' ? 'mensal (30 dias)' : 'anual (365 dias)'}`,
        quantity: 1,
        unit_price: amount,
        currency_id: 'BRL',
      }],
      payer: {
        email: userId, // Será substituído pelo email real
      },
      back_urls: {
        success: `${Deno.env.get('SUPABASE_URL')}/functions/v1/make-server-5f5857fb/premium/callback`,
        failure: `${Deno.env.get('SUPABASE_URL')}/functions/v1/make-server-5f5857fb/premium/callback`,
        pending: `${Deno.env.get('SUPABASE_URL')}/functions/v1/make-server-5f5857fb/premium/callback`,
      },
      auto_return: 'approved',
      external_reference: `premium_${userId}_${plan}_${Date.now()}`,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/make-server-5f5857fb/premium/webhook`,
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Premium Payment] Erro do Mercado Pago:', data);
      return c.json({ error: 'Erro ao criar pagamento' }, 500);
    }

    console.log('[Premium Payment] ✅ Preferência criada:', data.id);

    return c.json({
      success: true,
      test_mode: false,
      init_point: data.init_point,
      preference_id: data.id,
    });
  } catch (error) {
    console.error('[Premium Payment] Erro:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Legacy route for test mode upgrade (mantido para compatibilidade)
app.post('/make-server-5f5857fb/auth/upgrade-premium', async (c) => {
  try {
    const { userId } = await c.req.json();

    if (!userId) {
      return c.json({ error: 'userId é obrigatório' }, 400);
    }

    // Verificar se está em modo teste
    const config = await kv.get('pricing_config');
    if (!config || !config.test_mode) {
      return c.json({ 
        error: 'Modo teste desativado. Use a rota /premium/create-payment' 
      }, 400);
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'premium' })
      .eq('id', userId);

    if (error) {
      console.error('Upgrade error:', error);
      return c.json({ error: 'Erro ao fazer upgrade' }, 500);
    }

    return c.json({ success: true, message: 'Upgrade realizado com sucesso' });
  } catch (error) {
    console.error('Upgrade error:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// ============================================
// TEST MODE TOGGLE (desenvolvimento)
// ============================================
app.post('/make-server-5f5857fb/test-mode/enable', async (c) => {
  try {
    console.log('[Test Mode] Ativando modo teste...');
    
    const currentConfig = await kv.get('pricing_config') || {};
    
    const newConfig = {
      ...currentConfig,
      test_mode: true,
      premium_monthly_price: currentConfig.premium_monthly_price || 19.90,
      premium_annual_price: currentConfig.premium_annual_price || 199.00,
      planning_package_price: currentConfig.planning_package_price || 49.90,
      updated_at: new Date().toISOString(),
      updated_by: 'dev-toggle',
    };
    
    await kv.set('pricing_config', newConfig);
    
    console.log('[Test Mode] ✅ Modo teste ATIVADO:', newConfig);
    return c.json({ success: true, message: 'Modo teste ativado!', config: newConfig });
  } catch (error: any) {
    console.error('[Test Mode] Erro:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// TRIPS ROUTES
// ============================================

// Get user trips
app.get('/make-server-5f5857fb/trips/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    console.log('[GET /trips] Buscando viagens para userId:', userId);

    // Use KV store instead of Supabase table
    const allTrips = await kv.getByPrefix('trip:');
    const userTrips = allTrips
      .filter((trip: any) => trip.user_id === userId)
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    console.log('[GET /trips] Sucesso! Encontradas', userTrips.length, 'viagens');
    
    // Convert snake_case to camelCase for frontend
    const camelCaseTrips = toCamelCase(userTrips);
    return c.json({ trips: camelCaseTrips });
  } catch (error) {
    console.error('[GET /trips] Exceção:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Create trip
app.post('/make-server-5f5857fb/trips', async (c) => {
  try {
    const tripData = await c.req.json();
    console.log('[POST /trips] Recebido tripData:', JSON.stringify(tripData, null, 2));
    
    // Generate ID if not provided
    const tripId = tripData.id || crypto.randomUUID();
    
    // Prepare trip object (using snake_case for consistency)
    const trip = {
      id: tripId,
      user_id: tripData.userId,
      destination: tripData.destination,
      start_date: tripData.startDate,
      end_date: tripData.endDate,
      budget: tripData.budget,
      budget_amount: tripData.budgetAmount,
      progress: tripData.progress || 0,
      tasks: tripData.tasks || [],
      itinerary: tripData.itinerary || [],
      status: tripData.status || 'planning',
      purchase_id: tripData.purchaseId || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('[POST /trips] Salvando no KV store:', tripId);
    await kv.set(`trip:${tripId}`, trip);

    console.log('[POST /trips] ✅ Viagem criada com sucesso:', tripId);
    
    // Convert to camelCase for frontend
    const camelCaseTrip = toCamelCase(trip);
    return c.json({ trip: camelCaseTrip });
  } catch (error) {
    console.error('[POST /trips] Exceção:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Update trip
app.put('/make-server-5f5857fb/trips/:tripId', async (c) => {
  try {
    const tripId = c.req.param('tripId');
    const updateData = await c.req.json();

    console.log('[UPDATE TRIP] Trip ID:', tripId);
    console.log('[UPDATE TRIP] Update Data:', JSON.stringify(updateData, null, 2));

    // Get existing trip
    const existingTrip = await kv.get(`trip:${tripId}`);
    if (!existingTrip) {
      return c.json({ error: 'Viagem não encontrada' }, 404);
    }

    // Convert update data to snake_case
    const snakeCaseUpdate = toSnakeCase(updateData);

    // Merge update with existing trip
    const updatedTrip = {
      ...existingTrip,
      ...snakeCaseUpdate,
      updated_at: new Date().toISOString(),
    };

    // Save updated trip
    await kv.set(`trip:${tripId}`, updatedTrip);

    console.log('[UPDATE TRIP] ✅ Success! Updated trip:', tripId);
    
    // Convert to camelCase for frontend
    const camelCaseTrip = toCamelCase(updatedTrip);
    return c.json({ trip: camelCaseTrip });
  } catch (error) {
    console.error('[UPDATE TRIP] Unexpected error:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Delete trip
app.delete('/make-server-5f5857fb/trips/:tripId', async (c) => {
  try {
    const tripId = c.req.param('tripId');
    console.log('[DELETE TRIP] Deletando viagem:', tripId);

    // Delete from KV store
    await kv.del(`trip:${tripId}`);

    console.log('[DELETE TRIP] ✅ Viagem deletada com sucesso');
    return c.json({ success: true });
  } catch (error) {
    console.error('[DELETE TRIP] Erro:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// ============================================
// SHARED TRIPS ROUTES
// ============================================

// Save shared trip
app.post('/make-server-5f5857fb/shared-trips', async (c) => {
  try {
    const { tripId, tripData, shareToken } = await c.req.json();
    
    if (!tripId || !tripData || !shareToken) {
      return c.json({ error: 'tripId, tripData e shareToken são obrigatórios' }, 400);
    }

    console.log('[SHARED TRIP] Salvando viagem compartilhada:', tripId);

    // Save to KV store
    await kv.set(`shared_trip:${tripId}`, {
      ...tripData,
      shareToken,
      sharedAt: new Date().toISOString()
    });

    console.log('[SHARED TRIP] ✅ Viagem compartilhada salva com sucesso');
    return c.json({ success: true });
  } catch (error) {
    console.error('[SHARED TRIP] Erro:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Get shared trip
app.get('/make-server-5f5857fb/shared-trips/:tripId', async (c) => {
  try {
    const tripId = c.req.param('tripId');
    console.log('[GET SHARED TRIP] Buscando viagem compartilhada:', tripId);

    const sharedTrip = await kv.get(`shared_trip:${tripId}`);
    
    if (!sharedTrip) {
      return c.json({ error: 'Viagem compartilhada não encontrada' }, 404);
    }

    console.log('[GET SHARED TRIP] ✅ Viagem encontrada');
    return c.json({ trip: sharedTrip });
  } catch (error) {
    console.error('[GET SHARED TRIP] Erro:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// ============================================
// PURCHASES ROUTES
// ============================================

// Create purchase (start planning purchase flow)
app.post('/make-server-5f5857fb/purchases', async (c) => {
  try {
    const { userId, tripId, amount } = await c.req.json();

    if (!userId || !tripId || !amount) {
      return c.json({ error: 'userId, tripId e amount são obrigatórios' }, 400);
    }

    // Create purchase record
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from('purchases')
      .insert({
        user_id: userId,
        trip_id: tripId,
        amount,
        currency: 'BRL',
        status: 'pending',
        payment_method: 'mercadopago',
      })
      .select()
      .single();

    if (purchaseError) {
      console.error('Create purchase error:', purchaseError);
      return c.json({ error: 'Erro ao criar compra' }, 500);
    }

    // Update trip status
    await supabaseAdmin
      .from('trips')
      .update({ 
        status: 'purchased',
        purchase_id: purchase.id,
      })
      .eq('id', tripId);

    return c.json({ purchase });
  } catch (error) {
    console.error('Create purchase error:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Get user purchases
app.get('/make-server-5f5857fb/purchases/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

    const { data, error } = await supabaseAdmin
      .from('purchases')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get purchases error:', error);
      return c.json({ error: 'Erro ao buscar compras' }, 500);
    }

    return c.json({ purchases: data || [] });
  } catch (error) {
    console.error('Get purchases error:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// ============================================
// PAYMENTS ROUTES (MERCADO PAGO)
// ============================================

// Create Premium upgrade checkout
app.post('/make-server-5f5857fb/payments/create-premium-checkout', async (c) => {
  try {
    console.log('[Premium] ========== INÍCIO DA REQUISIÇÃO PREMIUM ==========');
    
    const accessToken = getAccessToken(c);
    if (!accessToken) {
      return c.json({ code: 401, message: 'Não autorizado - Token ausente' }, 401);
    }

    // Validar token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ code: 401, message: 'Invalid JWT' }, 401);
    }

    console.log('[Premium] ✅ Usuário autenticado:', user.id);

    const { amount, title, description } = await c.req.json();

    // Create purchase record for Premium upgrade
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from('purchases')
      .insert({
        user_id: user.id,
        trip_id: null, // Premium upgrade não está vinculado a uma viagem específica
        amount: amount || 49.90,
        currency: 'BRL',
        status: 'pending',
        payment_method: 'mercadopago',
      })
      .select()
      .single();

    if (purchaseError) {
      console.error('[Premium] Erro ao criar purchase:', purchaseError);
      return c.json({ error: 'Erro ao criar compra' }, 500);
    }

    // Get Mercado Pago token
    const mpAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!mpAccessToken) {
      console.error('[Premium] MERCADOPAGO_ACCESS_TOKEN não configurado');
      return c.json({ error: 'Pagamento não configurado' }, 500);
    }

    // Create Mercado Pago preference
    const baseUrl = Deno.env.get('SUPABASE_URL') || '';
    const preference = {
      items: [{
        title: title || 'Upgrade Premium - Planeje Fácil',
        description: description || 'Acesso Premium com planejamentos ilimitados',
        quantity: 1,
        unit_price: amount || 49.90,
        currency_id: 'BRL',
      }],
      back_urls: {
        success: `${baseUrl}/payment-success?purchase_id=${purchase.id}&type=premium`,
        failure: `${baseUrl}/payment-failure?purchase_id=${purchase.id}&type=premium`,
        pending: `${baseUrl}/payment-pending?purchase_id=${purchase.id}&type=premium`,
      },
      auto_return: 'approved',
      external_reference: purchase.id,
      notification_url: `${baseUrl}/functions/v1/make-server-5f5857fb/payments/webhook-premium`,
      metadata: {
        purchase_id: purchase.id,
        user_id: user.id,
        type: 'premium_upgrade',
      },
    };

    console.log('[Premium] Criando preferência no Mercado Pago...');
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mpAccessToken}`,
      },
      body: JSON.stringify(preference),
    });

    if (!mpResponse.ok) {
      const mpError = await mpResponse.json();
      console.error('[Premium] Erro do Mercado Pago:', mpError);
      return c.json({ error: 'Erro ao criar checkout Premium', details: mpError }, 500);
    }

    const mpData = await mpResponse.json();
    console.log('[Premium] Checkout criado com sucesso:', mpData.id);

    // Update purchase with payment ID
    await supabaseAdmin
      .from('purchases')
      .update({ 
        payment_id: mpData.id,
        status: 'processing' 
      })
      .eq('id', purchase.id);

    return c.json({
      checkoutUrl: mpData.init_point,
      purchaseId: purchase.id,
    });
  } catch (error) {
    console.error('[Premium] Erro crítico:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Webhook for Premium upgrades
app.post('/make-server-5f5857fb/payments/webhook-premium', async (c) => {
  try {
    console.log('[Premium Webhook] Recebido webhook');
    const body = await c.req.json();
    console.log('[Premium Webhook] Dados:', JSON.stringify(body, null, 2));

    if (body.type === 'payment' && body.data?.id) {
      // TODO: Processar pagamento aprovado e fazer upgrade para Premium
      // Atualizar profile.role = 'premium'
    }

    return c.json({ received: true });
  } catch (error) {
    console.error('[Premium Webhook] Erro:', error);
    return c.json({ error: 'Erro interno' }, 500);
  }
});

// Approve Premium upgrade (test mode)
app.post('/make-server-5f5857fb/payments/approve-premium-test', async (c) => {
  try {
    const accessToken = getAccessToken(c);
    if (!accessToken) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Invalid JWT' }, 401);
    }

    console.log('[Premium Test] Aprovando upgrade para:', user.id);

    // Update user role to premium
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'premium' })
      .eq('id', user.id);

    if (updateError) {
      console.error('[Premium Test] Erro ao atualizar:', updateError);
      return c.json({ error: 'Erro ao fazer upgrade' }, 500);
    }

    console.log('[Premium Test] ✅ Upgrade realizado com sucesso!');
    return c.json({ success: true, message: 'Upgrade realizado!' });
  } catch (error) {
    console.error('[Premium Test] Erro:', error);
    return c.json({ error: 'Erro interno' }, 500);
  }
});

// Create checkout session
app.post('/make-server-5f5857fb/payments/create-checkout', async (c) => {
  try {
    console.log('[Payments] ========== INÍCIO DA REQUISIÇÃO ==========');
    console.log('[Payments] Headers recebidos:', Object.fromEntries(c.req.raw.headers));
    
    const accessToken = getAccessToken(c);
    if (!accessToken) {
      console.error('[Payments] ❌ Nenhum access token fornecido');
      console.error('[Payments] Authorization header:', c.req.header('Authorization'));
      return c.json({ code: 401, message: 'Não autorizado - Token ausente' }, 401);
    }

    console.log('[Payments] 🔑 Token extraído com sucesso:', {
      length: accessToken.length,
      start: accessToken.substring(0, 30) + '...',
      end: '...' + accessToken.substring(accessToken.length - 10)
    });

    // Validar token com supabaseAdmin
    console.log('[Payments] 🔍 Validando token com supabaseAdmin.auth.getUser()...');
    console.log('[Payments] SUPABASE_URL:', Deno.env.get('SUPABASE_URL'));
    console.log('[Payments] SERVICE_ROLE_KEY exists:', !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    
    console.log('[Payments] 📊 Resultado da validação:', {
      success: !!user,
      userId: user?.id,
      userEmail: user?.email,
      hasError: !!authError,
      errorName: authError?.name,
      errorMessage: authError?.message,
      errorStatus: authError?.status,
      errorDetails: authError
    });
    
    if (authError) {
      console.error('[Payments] ❌ Erro de autenticação:', JSON.stringify(authError, null, 2));
      return c.json({ code: 401, message: `Invalid JWT: ${authError.message}` }, 401);
    }
    
    if (!user) {
      console.error('[Payments] ❌ Usuário não encontrado após validação');
      return c.json({ code: 401, message: 'Invalid JWT: User not found' }, 401);
    }

    console.log('[Payments] ✅ Usuário autenticado com sucesso:', {
      id: user.id,
      email: user.email,
      role: user.role
    });

    const { tripId, amount, title, description } = await c.req.json();

    if (!tripId) {
      return c.json({ error: 'tripId é obrigatório' }, 400);
    }

    // 🔒 SEGURANÇA: SEMPRE buscar o preço do banco, NUNCA confiar no frontend
    console.log('[Payments] 🔒 Buscando preço real do banco...');
    let realPrice = 49.90; // Fallback padrão
    
    try {
      const pricingConfig = await kv.get('pricing_config');
      if (pricingConfig && pricingConfig.planning_package_price) {
        realPrice = pricingConfig.planning_package_price;
        console.log('[Payments] ✅ Preço do banco:', realPrice);
      } else {
        console.warn('[Payments] ⚠️ Config não encontrada, usando fallback:', realPrice);
      }
    } catch (priceError) {
      console.error('[Payments] ❌ Erro ao buscar preço, usando fallback:', priceError);
    }

    console.log('[Payments] 💰 Preço final a ser cobrado:', realPrice);
    console.log('[Payments] ℹ️ Valor enviado pelo frontend (IGNORADO):', amount);

    // Generate purchase ID
    const purchaseId = `purchase_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create purchase record in KV store
    const purchase = {
      id: purchaseId,
      user_id: user.id,
      trip_id: tripId,
      amount: realPrice, // ✅ Usar preço do banco
      currency: 'BRL',
      status: 'pending',
      payment_method: 'mercadopago',
      created_at: new Date().toISOString(),
    };

    console.log('[Payments] 💾 Salvando purchase no KV store:', purchaseId);
    await kv.set(`purchase:${purchaseId}`, purchase);

    // Get Mercado Pago token
    const mpAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!mpAccessToken) {
      console.error('[Payments] MERCADOPAGO_ACCESS_TOKEN não configurado');
      return c.json({ error: 'Pagamento não configurado. Configure MERCADOPAGO_ACCESS_TOKEN.' }, 500);
    }

    // Create Mercado Pago preference
    const baseUrl = Deno.env.get('SUPABASE_URL') || '';
    const preference = {
      items: [{
        title: title || `Planejamento de Viagem - ${tripId.substring(0, 8)}`,
        description: description || 'Planejamento personalizado com roteiro detalhado',
        quantity: 1,
        unit_price: realPrice, // ✅ Usar preço do banco
        currency_id: 'BRL',
      }],
      back_urls: {
        success: `${baseUrl}/payment-success?purchase_id=${purchaseId}`,
        failure: `${baseUrl}/payment-failure?purchase_id=${purchaseId}`,
        pending: `${baseUrl}/payment-pending?purchase_id=${purchaseId}`,
      },
      auto_return: 'approved',
      external_reference: purchaseId,
      notification_url: `${baseUrl}/functions/v1/make-server-5f5857fb/payments/webhook`,
      metadata: {
        purchase_id: purchaseId,
        trip_id: tripId,
        user_id: user.id,
      },
    };

    console.log('[Payments] Criando preferência no Mercado Pago...');
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mpAccessToken}`,
      },
      body: JSON.stringify(preference),
    });

    if (!mpResponse.ok) {
      const mpError = await mpResponse.json();
      console.error('[Payments] Erro do Mercado Pago:', mpError);
      
      // Mensagem amigável baseada no erro
      let errorMessage = 'Erro ao criar checkout no Mercado Pago';
      
      if (mpError.code === 'PA_UNAUTHORIZED_RESULT_FROM_POLICIES') {
        errorMessage = `
🔒 Acesso bloqueado pelo Mercado Pago (PolicyAgent)

Possíveis causas:
1. Access Token inválido ou expirado
2. Token sem permissões adequadas (precisa ter permissão de "write")
3. Conta Mercado Pago não ativada/verificada
4. Restrições de domínio configuradas na conta

Como resolver:
1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Crie um novo Access Token com permissão de WRITE
3. Configure a variável MERCADOPAGO_ACCESS_TOKEN com o novo token
4. Se estiver usando conta de teste, certifique-se de usar o token correto

Token atual: ${mpAccessToken?.substring(0, 20)}...
        `.trim();
      }
      
      return c.json({ 
        error: errorMessage,
        details: mpError,
        code: mpError.code
      }, 500);
    }

    const mpData = await mpResponse.json();
    console.log('[Payments] Checkout criado com sucesso:', mpData.id);

    // Update purchase with payment ID in KV store
    purchase.payment_id = mpData.id;
    purchase.status = 'processing';
    await kv.set(`purchase:${purchaseId}`, purchase);

    // Update trip status in KV store
    const tripKey = `trip:${user.id}:${tripId}`;
    const trip = await kv.get(tripKey);
    if (trip) {
      trip.status = 'purchased';
      trip.purchase_id = purchaseId;
      trip.updated_at = new Date().toISOString();
      await kv.set(tripKey, trip);
    }

    return c.json({
      checkoutUrl: mpData.init_point,
      purchaseId: purchaseId,
    });
  } catch (error) {
    console.error('[Payments] Erro crítico ao criar checkout:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Webhook do Mercado Pago
app.post('/make-server-5f5857fb/payments/webhook', async (c) => {
  try {
    console.log('[Webhook] Recebido webhook do Mercado Pago');
    
    const body = await c.req.json();
    console.log('[Webhook] Dados:', JSON.stringify(body, null, 2));

    // Mercado Pago envia notificações de diferentes tipos
    if (body.type === 'payment') {
      const paymentId = body.data?.id;
      
      if (!paymentId) {
        console.error('[Webhook] Payment ID não encontrado');
        return c.json({ received: true });
      }
    }

    return c.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Erro ao processar webhook:', error);
    return c.json({ error: 'Erro interno' }, 500);
  }
});

// Check payment status
app.get('/make-server-5f5857fb/payments/status/:purchaseId', async (c) => {
  try {
    const accessToken = getAccessToken(c);
    if (!accessToken) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const purchaseId = c.req.param('purchaseId');

    // Get purchase from KV store
    const purchase = await kv.get(`purchase:${purchaseId}`);

    if (!purchase) {
      return c.json({ error: 'Compra não encontrada' }, 404);
    }

    return c.json({ status: purchase.status });
  } catch (error) {
    console.error('[Payments] Erro ao verificar status:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

// Get all users (admin only)
app.get('/make-server-5f5857fb/admin/users', async (c) => {
  try {
    console.log('[Admin Users] ========== ENDPOINT CHAMADO ==========');
    
    // Verificar autenticação
    const accessToken = getAccessToken(c);
    if (!accessToken) {
      console.error('[Admin Users] ❌ Token não fornecido');
      return c.json({ error: 'Não autorizado - token não fornecido' }, 401);
    }
    
    // Validar token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) {
      console.error('[Admin Users] ❌ Erro de autenticação:', authError);
      return c.json({ error: `Não autorizado: ${authError?.message || 'Usuário não encontrado'}` }, 401);
    }
    
    console.log('[Admin Users] ✅ Usuário autenticado:', user.email);
    
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Admin Users] Erro:', error);
      return c.json({ error: 'Erro ao buscar usuários' }, 500);
    }

    console.log('[Admin Users] ✅ Retornando', data?.length || 0, 'usuários');
    return c.json({ users: data || [] });
  } catch (error) {
    console.error('[Admin Users] Exceção:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Get all trips (admin only)
app.get('/make-server-5f5857fb/admin/trips', async (c) => {
  try {
    console.log('[Admin Trips] ========== INÍCIO ==========');
    console.log('[Admin Trips] Headers recebidos:', Object.fromEntries(c.req.raw.headers));
    
    // Verificar autenticação
    const accessToken = getAccessToken(c);
    console.log('[Admin Trips] Access token presente?', !!accessToken);
    if (accessToken) {
      console.log('[Admin Trips] Token (primeiros 50 chars):', accessToken.substring(0, 50));
      console.log('[Admin Trips] Token length:', accessToken.length);
    }
    
    if (!accessToken) {
      console.error('[Admin Trips] ❌ Token não fornecido');
      return c.json({ code: 401, message: 'Não autorizado - token não fornecido' }, 401);
    }
    
    // Validar token
    console.log('[Admin Trips] Validando token com supabaseAdmin.auth.getUser()...');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    console.log('[Admin Trips] Resultado da validação:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      hasError: !!authError,
      errorMessage: authError?.message,
      errorName: authError?.name,
      errorStatus: authError?.status
    });
    
    if (authError || !user) {
      console.error('[Admin Trips] ❌ Erro de autenticação:', JSON.stringify(authError, null, 2));
      return c.json({ code: 401, message: `Invalid JWT: ${authError?.message || 'User not found'}` }, 401);
    }
    
    console.log('[Admin Trips] ✅ Usuário autenticado:', user.email);
    console.log('[Admin Trips] Buscando todas as viagens...');
    
    // Primeiro buscar as trips
    const { data: trips, error: tripsError } = await supabaseAdmin
      .from('trips')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('[Admin Trips] Resultado da query trips:', {
      hasData: !!trips,
      count: trips?.length || 0,
      hasError: !!tripsError,
      error: tripsError
    });

    if (tripsError) {
      console.error('[Admin Trips] ❌ Erro ao buscar viagens:', JSON.stringify(tripsError, null, 2));
      return c.json({ error: `Erro ao buscar viagens: ${tripsError.message}` }, 500);
    }

    console.log('[Admin Trips] ✅ Viagens carregadas:', trips?.length || 0);

    // Se não há trips, retornar array vazio
    if (!trips || trips.length === 0) {
      console.log('[Admin Trips] Nenhuma viagem encontrada, retornando array vazio');
      return c.json({ trips: [] });
    }

    // Buscar perfis dos usuários
    const userIds = [...new Set(trips.map(trip => trip.user_id))];
    console.log('[Admin Trips] Buscando perfis para userIds:', userIds);

    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email')
      .in('id', userIds);

    if (profilesError) {
      console.error('[Admin Trips] ⚠️ Erro ao buscar perfis:', profilesError);
      // Continuar mesmo sem os perfis
    } else {
      console.log('[Admin Trips] ✅ Perfis carregados:', profiles?.length || 0);
    }

    // Mapear profiles para objeto
    const profilesMap = (profiles || []).reduce((acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {} as Record<string, any>);

    // Combinar dados
    const tripsWithUsers = trips.map(trip => ({
      ...trip,
      user_name: profilesMap[trip.user_id]?.name,
      user_email: profilesMap[trip.user_id]?.email,
    }));

    console.log('[Admin Trips] ✅ Retornando', tripsWithUsers.length, 'viagens com dados de usuário');
    return c.json({ trips: tripsWithUsers });
  } catch (error) {
    console.error('[Admin Trips] ❌ Exceção crítica:', error);
    console.error('[Admin Trips] Stack trace:', error instanceof Error ? error.stack : 'N/A');
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Mark trip as delivered (admin only)
app.post('/make-server-5f5857fb/admin/trips/:tripId/deliver', async (c) => {
  try {
    const tripId = c.req.param('tripId');
    const { tasks, itinerary } = await c.req.json();

    // Update trip with delivered content
    const { error: tripError } = await supabaseAdmin
      .from('trips')
      .update({
        status: 'delivered',
        tasks: tasks || [],
        itinerary: itinerary || [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', tripId);

    if (tripError) {
      console.error('Deliver trip error:', tripError);
      return c.json({ error: 'Erro ao entregar planejamento' }, 500);
    }

    // Update purchase as delivered
    const { error: purchaseError } = await supabaseAdmin
      .from('purchases')
      .update({
        status: 'completed',
        delivered_at: new Date().toISOString(),
      })
      .eq('trip_id', tripId);

    if (purchaseError) {
      console.error('Update purchase error:', purchaseError);
    }

    return c.json({ success: true, message: 'Planejamento entregue com sucesso' });
  } catch (error) {
    console.error('Deliver trip error:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Delete city budget (admin only)
app.delete('/make-server-5f5857fb/admin/city-budgets/:budgetId', async (c) => {
  try {
    const budgetId = c.req.param('budgetId');

    const { error } = await supabaseAdmin
      .from('city_budgets')
      .delete()
      .eq('id', budgetId);

    if (error) {
      console.error('[Admin] Delete city budget error:', error);
      return c.json({ error: 'Erro ao excluir orçamento' }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('[Admin] Delete city budget error:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Reset user password (admin only)
app.post('/make-server-5f5857fb/admin/reset-password', async (c) => {
  try {
    console.log('[Admin Reset Password] ========== INÍCIO ==========');
    
    // Verificar autenticação
    const accessToken = getAccessToken(c);
    if (!accessToken) {
      console.error('[Admin Reset Password] ❌ Token não fornecido');
      return c.json({ error: 'Token de acesso não fornecido' }, 401);
    }

    console.log('[Admin Reset Password] Token recebido:', accessToken.substring(0, 20) + '...');

    // Verificar se o usuário é admin
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.error('[Admin Reset Password] ❌ Erro de autenticação:', authError);
      return c.json({ error: 'Não autenticado' }, 401);
    }

    console.log('[Admin Reset Password] Usuário autenticado:', user.email);

    // Verificar se o usuário é admin (você pode adicionar verificação de role aqui)
    const ADMIN_EMAILS = [
      'admin@planejefacil.com',
      'suporte@planejefacil.com',
      'teste@planejefacil.com',
    ];

    if (!ADMIN_EMAILS.includes(user.email || '')) {
      console.error('[Admin Reset Password] ❌ Usuário não é admin:', user.email);
      return c.json({ error: 'Acesso negado. Apenas admins podem resetar senhas.' }, 403);
    }

    // Pegar email do body
    const { email } = await c.req.json();
    
    if (!email) {
      return c.json({ error: 'Email não fornecido' }, 400);
    }

    console.log('[Admin Reset Password] Enviando link de reset para:', email);

    // Enviar email de recuperação usando Supabase Auth Admin
    const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${c.req.header('origin') || 'http://localhost:5173'}/reset-password`,
    });

    if (resetError) {
      console.error('[Admin Reset Password] ❌ Erro ao enviar email:', resetError);
      return c.json({ error: resetError.message }, 500);
    }

    console.log('[Admin Reset Password] ✅ Email de reset enviado com sucesso');
    return c.json({ 
      success: true, 
      message: `Link de redefinição enviado para ${email}` 
    });
  } catch (error) {
    console.error('[Admin Reset Password] ❌ Erro inesperado:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// ============================================
// BUDGET ROUTES
// ============================================

// Helper function to fetch or generate budget
async function fetchOrGenerateBudget(cityName: string) {
  try {
    console.log(`[Budget Helper] Buscando orçamento para: ${cityName}`);
    
    // Primeiro tenta buscar no banco de dados
    const { data, error } = await supabaseAdmin
      .from('city_budgets')
      .select('*')
      .ilike('city_name', cityName)
      .single();

    if (data && !error) {
      console.log(`[Budget Helper] ✅ Encontrado no banco: ${cityName}`);
      return data;
    }

    // Se não encontrou no banco, tenta gerar dinamicamente para cidades internacionais
    console.log(`[Budget Helper] Não encontrado no banco, gerando via API: ${cityName}`);
    
    // Buscar informações do país usando REST Countries API
    const countrySearchResponse = await fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(cityName.split(',')[1]?.trim() || cityName)}?fields=name,currencies,cca2`
    );
    
    if (countrySearchResponse.ok) {
      const countryData = await countrySearchResponse.json();
      const country = Array.isArray(countryData) ? countryData[0] : countryData;
      const currencyCode = Object.keys(country.currencies || {})[0];
      
      // Buscar taxa de câmbio usando ExchangeRate API
      const exchangeResponse = await fetch(
        `https://v6.exchangerate-api.com/v6/latest/BRL`
      );
      
      if (exchangeResponse.ok) {
        const exchangeData = await exchangeResponse.json();
        const rate = exchangeData.conversion_rates?.[currencyCode] || 1;
        
        // Calcular orçamentos baseados no custo de vida relativo
        const baseCosts = {
          expensive: {
            economy: 400,
            medium: 700,
            comfort: 1200,
          },
          moderate: {
            economy: 200,
            medium: 400,
            comfort: 700,
          }
        };
        
        // Determinar categoria baseado no país
        const expensiveCountries = ['FR', 'GB', 'US', 'JP', 'AE', 'CH', 'NO', 'SE', 'DK'];
        const isExpensive = expensiveCountries.includes(country.cca2);
        const costs = isExpensive ? baseCosts.expensive : baseCosts.moderate;
        
        console.log(`[Budget] Orçamento dinâmico gerado para ${cityName}: ${currencyCode}, taxa: ${rate}`);
        
        // SALVAR NO BANCO PARA CACHE
        const budgetToSave = {
          city_name: cityName,
          country: country.name.common,
          currency: currencyCode,
          daily_budgets: {
            economy: costs.economy,
            medium: costs.medium,
            comfort: costs.comfort,
          },
          notes: 'Orçamento calculado automaticamente via API. Valores podem variar.',
          last_updated: new Date().toISOString(),
        };
        
        try {
          const { error: insertError } = await supabaseAdmin
            .from('city_budgets')
            .insert(budgetToSave);
          
          if (insertError) {
            console.error(`[Budget] Erro ao salvar no banco:`, insertError);
          } else {
            console.log(`[Budget] ✅ Orçamento salvo no banco para cache futuro: ${cityName}`);
          }
        } catch (saveError) {
          console.error(`[Budget] Erro ao salvar:`, saveError);
        }
        
        return budgetToSave;
      }
    }

    // Fallback: retornar valores padrão se as APIs não funcionaram
    console.log(`[Budget Helper] ⚠️ Usando valores padrão para: ${cityName}`);
    return {
      city_name: cityName,
      country: 'Unknown',
      daily_budgets: {
        economy: 150,
        medium: 300,
        comfort: 500,
      },
      notes: '⚠️ Orçamento estimado. Valores podem variar.',
      last_updated: new Date().toISOString(),
    };
  } catch (helperError) {
    console.error(`[Budget Helper] Erro crítico ao buscar ${cityName}:`, helperError);
    // Garantir que sempre retorna algo válido
    return {
      city_name: cityName,
      country: 'Unknown',
      daily_budgets: {
        economy: 150,
        medium: 300,
        comfort: 500,
      },
      notes: '⚠️ Orçamento estimado. Valores podem variar.',
      last_updated: new Date().toISOString(),
    };
  }
}

// Get city budget data
app.get('/make-server-5f5857fb/budgets/:cityName', async (c) => {
  try {
    const cityName = c.req.param('cityName');
    const cityBudget = await fetchOrGenerateBudget(cityName);
    return c.json({ cityBudget });
  } catch (error) {
    console.error('Get city budget error:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// ============================================
// DESTINOS POPULARES (com cache via KV)
// ============================================

// Get popular travel suggestions
app.get('/make-server-5f5857fb/popular-destinations', async (c) => {
  console.log('='.repeat(60));
  console.log('[PopularDestinations] 🚀 ROTA ACESSADA - Início do handler');
  console.log('[PopularDestinations] Method:', c.req.method);
  console.log('[PopularDestinations] URL:', c.req.url);
  console.log('[PopularDestinations] Headers:', Object.fromEntries(c.req.raw.headers));
  console.log('='.repeat(60));
  
  try {
    // Primeiro tenta buscar do cache KV
    console.log('[PopularDestinations] Verificando cache KV...');
    const cached = await kv.get('popular_destinations');
    console.log('[PopularDestinations] Cache KV resultado:', cached ? 'encontrado' : 'não encontrado');
    
    if (cached) {
      const cacheAge = Date.now() - new Date(cached.last_updated || 0).getTime();
      const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
      
      // Se cache tem menos de 1 semana, retorna
      if (cacheAge < ONE_WEEK) {
        console.log('[PopularDestinations] Retornando do cache');
        return c.json({ destinations: cached.destinations });
      }
    }
    
    console.log('[PopularDestinations] Cache expirado ou não existe, buscando dados frescos...');
    
    // Lista curada de destinos populares (REDUZIDA para evitar timeout)
    // Apenas os destinos mais populares para garantir resposta rápida
    const popularCities = [
      // Brasil - Top 8
      { city: 'Rio de Janeiro', country: 'Brasil', emoji: '🏖️' },
      { city: 'São Paulo', country: 'Brasil', emoji: '🏙️' },
      { city: 'Salvador', country: 'Brasil', emoji: '🎭' },
      { city: 'Florianópolis', country: 'Brasil', emoji: '🌊' },
      { city: 'Gramado', country: 'Brasil', emoji: '🍫' },
      { city: 'Foz do Iguaçu', country: 'Brasil', emoji: '💦' },
      { city: 'Recife', country: 'Brasil', emoji: '🏝️' },
      { city: 'Fortaleza', country: 'Brasil', emoji: '🏄' },
      
      // Internacional - Top 7
      { city: 'Paris', country: 'França', emoji: '🗼' },
      { city: 'Lisboa', country: 'Portugal', emoji: '🇵🇹' },
      { city: 'Buenos Aires', country: 'Argentina', emoji: '💃' },
      { city: 'Roma', country: 'Itália', emoji: '🏛️' },
      { city: 'Nova York', country: 'Estados Unidos', emoji: '🗽' },
      { city: 'Barcelona', country: 'Espanha', emoji: '🏰' },
      { city: 'Cancún', country: 'México', emoji: '🏖️' },
    ];
    
    // Buscar dados reais para cada destino (com timeout individual)
    const destinations = await Promise.all(
      popularCities.map(async ({ city, country, emoji }) => {
        try {
          const cityFullName = `${city}, ${country}`;
          console.log(`[PopularDestinations] Processando: ${cityFullName}`);
          
          // Timeout individual de 5 segundos por cidade
          const timeout = new Promise<null>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          );
          
          const fetchData = async () => {
            // Buscar orçamento (da API ou banco) usando função helper
            const cityBudget = await fetchOrGenerateBudget(cityFullName);
            console.log(`[PopularDestinations] Orçamento obtido para ${cityFullName}:`, cityBudget?.daily_budgets);
            
            let budget = { min: 0, max: 0 };
            let duration = '5 dias';
            
            if (cityBudget?.daily_budgets) {
              // Estimar orçamento total para 5 dias
              const days = 5;
              budget = {
                min: Math.round(cityBudget.daily_budgets.economy * days),
                max: Math.round(cityBudget.daily_budgets.comfort * days)
              };
            }
            
            // Highlights simplificados baseados no destino
            const highlightsMap: Record<string, string[]> = {
              'Rio de Janeiro': ['Cristo Redentor', 'Praias de Copacabana e Ipanema', 'Pão de Açúcar'],
              'São Paulo': ['MASP e Avenida Paulista', 'Gastronomia diversificada', 'Vida cultural intensa'],
              'Salvador': ['Pelourinho histórico', 'Praias tropicais', 'Cultura afro-brasileira'],
              'Florianópolis': ['42 praias paradisíacas', 'Lagoa da Conceição', 'Gastronomia de frutos do mar'],
              'Gramado': ['Arquitetura europeia', 'Natal Luz', 'Chocolates artesanais'],
              'Foz do Iguaçu': ['Cataratas do Iguaçu', 'Usina de Itaipu', 'Marco das Três Fronteiras'],
              'Recife': ['Praias urbanas', 'Centro histórico de Olinda', 'Cultura nordestina'],
              'Fortaleza': ['Praias de águas mornas', 'Beach Park', 'Cultura cearense'],
              'Paris': ['Torre Eiffel', 'Museu do Louvre', 'Gastronomia francesa'],
              'Lisboa': ['Centro histórico', 'Pastéis de Belém', 'Bonde 28'],
              'Buenos Aires': ['Tango e cultura portenha', 'La Boca', 'Gastronomia argentina'],
              'Roma': ['Coliseu', 'Cidade do Vaticano', 'História milenar'],
              'Nova York': ['Estátua da Liberdade', 'Times Square', 'Central Park'],
              'Barcelona': ['Sagrada Família', 'Park Güell', 'Arquitetura de Gaudí'],
              'Cancún': ['Praias caribenhas', 'Sítios arqueológicos maias', 'Vida noturna'],
            };
            
            const highlights = highlightsMap[city] || 
              (country === 'Brasil' 
                ? ['Cultura rica', 'Gastronomia local', 'Pontos turísticos']
                : ['Atrações históricas', 'Cultura internacional', 'Experiência única']);
            
            return {
              destination: cityFullName,
              duration,
              budget: budget.min > 0 ? `R$ ${budget.min.toLocaleString('pt-BR')} - R$ ${budget.max.toLocaleString('pt-BR')}` : 'Consultar',
              highlights: highlights.slice(0, 3),
              emoji
            };
          };
          
          // Race entre fetch e timeout
          return await Promise.race([fetchData(), timeout]);
        } catch (error) {
          console.error(`[PopularDestinations] Erro ao processar ${city}:`, error);
          // Retornar dados básicos em caso de erro
          return {
            destination: `${city}, ${country}`,
            duration: '5 dias',
            budget: 'Consultar',
            highlights: country === 'Brasil' 
              ? ['Cultura rica', 'Gastronomia local', 'Pontos turísticos']
              : ['Atrações históricas', 'Cultura internacional', 'Experiência única'],
            emoji
          };
        }
      })
    );
    
    // Filtrar destinos que deram erro
    const validDestinations = destinations.filter(d => d !== null);
    
    // Salvar no cache KV
    const cacheData = {
      destinations: validDestinations,
      last_updated: new Date().toISOString()
    };
    
    await kv.set('popular_destinations', cacheData);
    console.log(`[PopularDestinations] ✅ ${validDestinations.length} destinos salvos no cache`);
    
    return c.json({ destinations: validDestinations });
    
  } catch (error) {
    console.error('[PopularDestinations] Erro crítico:', error);
    console.error('[PopularDestinations] Stack:', error instanceof Error ? error.stack : 'N/A');
    
    // Retornar dados de fallback em caso de erro
    console.log('[PopularDestinations] Retornando dados de fallback');
    const fallbackDestinations = [
      {
        destination: "Rio de Janeiro, Brasil",
        duration: "5 dias",
        budget: "R$ 1.000 - R$ 2.500",
        highlights: ["Cristo Redentor", "Praias de Copacabana e Ipanema", "Pão de Açúcar"],
        emoji: "🏖️"
      },
      {
        destination: "São Paulo, Brasil",
        duration: "4 dias",
        budget: "R$ 1.200 - R$ 2.800",
        highlights: ["MASP e Avenida Paulista", "Gastronomia diversificada", "Vida cultural intensa"],
        emoji: "🏙️"
      },
      {
        destination: "Salvador, Brasil",
        duration: "5 dias",
        budget: "R$ 900 - R$ 2.200",
        highlights: ["Pelourinho histórico", "Praias tropicais", "Cultura afro-brasileira"],
        emoji: "🎭"
      },
      {
        destination: "Florianópolis, Brasil",
        duration: "5 dias",
        budget: "R$ 1.100 - R$ 2.600",
        highlights: ["42 praias paradisíacas", "Lagoa da Conceição", "Gastronomia de frutos do mar"],
        emoji: "🌊"
      },
      {
        destination: "Gramado, Brasil",
        duration: "4 dias",
        budget: "R$ 1.300 - R$ 3.000",
        highlights: ["Arquitetura europeia", "Natal Luz", "Chocolates artesanais"],
        emoji: "🍫"
      }
    ];
    
    return c.json({ destinations: fallbackDestinations });
  }
});

// ============================================
// ADMIN ENDPOINTS (continuação)
// ============================================

// Get all purchases (admin only)
app.get('/make-server-5f5857fb/admin/purchases', async (c) => {
  try {
    // Verificar autenticação
    const accessToken = getAccessToken(c);
    if (!accessToken) {
      console.error('[Admin Purchases] ❌ Token não fornecido');
      return c.json({ error: 'Não autorizado - token não fornecido' }, 401);
    }
    
    // Validar token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) {
      console.error('[Admin Purchases] ❌ Erro de autenticação:', authError);
      return c.json({ error: `Não autorizado: ${authError?.message || 'Usuário não encontrado'}` }, 401);
    }
    
    console.log('[Admin Purchases] ✅ Usuário autenticado:', user.email);
    
    // Primeiro buscar as purchases
    const { data: purchases, error: purchasesError } = await supabaseAdmin
      .from('purchases')
      .select('*')
      .order('created_at', { ascending: false });

    if (purchasesError) {
      console.error('[Admin Purchases] Erro ao buscar compras:', purchasesError);
      return c.json({ error: 'Erro ao buscar compras' }, 500);
    }

    // Buscar perfis dos usuários
    const userIds = [...new Set(purchases?.map(p => p.user_id) || [])];
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email')
      .in('id', userIds);

    // Buscar trips
    const tripIds = [...new Set(purchases?.filter(p => p.trip_id).map(p => p.trip_id) || [])];
    const { data: trips } = await supabaseAdmin
      .from('trips')
      .select('id, destination')
      .in('id', tripIds);

    // Mapear para objetos
    const profilesMap = (profiles || []).reduce((acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {} as Record<string, any>);

    const tripsMap = (trips || []).reduce((acc, trip) => {
      acc[trip.id] = trip;
      return acc;
    }, {} as Record<string, any>);

    // Combinar dados
    const purchasesWithData = (purchases || []).map(purchase => ({
      ...purchase,
      user_name: profilesMap[purchase.user_id]?.name,
      user_email: profilesMap[purchase.user_id]?.email,
      trip_destination: purchase.trip_id ? tripsMap[purchase.trip_id]?.destination : null,
    }));

    return c.json({ purchases: purchasesWithData });
  } catch (error) {
    console.error('[Admin Purchases] Exceção:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Get all city budgets (admin only)
app.get('/make-server-5f5857fb/admin/city-budgets', async (c) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('city_budgets')
      .select('*')
      .order('city_name', { ascending: true });

    if (error) {
      console.error('[Admin] Get city budgets error:', error);
      return c.json({ error: 'Erro ao buscar orçamentos' }, 500);
    }

    // Log para debug
    console.log('[Admin] Orçamentos retornados do banco:', {
      count: data?.length || 0,
      firstId: data?.[0]?.id,
      firstCity: data?.[0]?.city_name,
      allHaveIds: data?.every(b => !!b.id)
    });

    return c.json({ budgets: data || [] });
  } catch (error) {
    console.error('[Admin] Get city budgets error:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Create city budget (admin only)
app.post('/make-server-5f5857fb/admin/city-budgets', async (c) => {
  try {
    const budgetData = await c.req.json();

    const { data, error } = await supabaseAdmin
      .from('city_budgets')
      .insert({
        city_name: budgetData.city_name,
        country: budgetData.country,
        daily_budgets: budgetData.daily_budgets,
        last_updated: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[Admin] Create city budget error:', error);
      return c.json({ error: 'Erro ao criar orçamento' }, 500);
    }

    return c.json({ budget: data });
  } catch (error) {
    console.error('[Admin] Create city budget error:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Update city budget (admin only)
app.put('/make-server-5f5857fb/admin/city-budgets/:budgetId', async (c) => {
  try {
    const budgetId = c.req.param('budgetId');
    const budgetData = await c.req.json();

    console.log('[Admin] Atualizando orçamento:', {
      budgetId,
      city_name: budgetData.city_name,
      country: budgetData.country,
      hasDailyBudgets: !!budgetData.daily_budgets
    });

    const { data, error } = await supabaseAdmin
      .from('city_budgets')
      .update({
        city_name: budgetData.city_name,
        country: budgetData.country,
        daily_budgets: budgetData.daily_budgets,
        last_updated: new Date().toISOString(),
      })
      .eq('id', budgetId)
      .select()
      .single();

    if (error) {
      console.error('[Admin] Update city budget error:', {
        error,
        budgetId,
        city_name: budgetData.city_name,
        errorCode: error.code,
        errorDetails: error.details,
        errorMessage: error.message
      });
      return c.json({ error: 'Erro ao atualizar orçamento', details: error.message }, 500);
    }

    console.log('[Admin] Orçamento atualizado com sucesso:', data);
    return c.json({ budget: data });
  } catch (error) {
    console.error('[Admin] Update city budget exception:', error);
    return c.json({ error: 'Erro interno do servidor', details: error.message }, 500);
  }
});

// Update user role (admin only)
app.put('/make-server-5f5857fb/admin/users/:userId/role', async (c) => {
  try {
    const userId = c.req.param('userId');
    const { role } = await c.req.json();

    if (!['logged', 'premium'].includes(role)) {
      return c.json({ error: 'Role inválido' }, 400);
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('[Admin] Update user role error:', error);
      return c.json({ error: 'Erro ao atualizar usuário' }, 500);
    }

    return c.json({ user: data });
  } catch (error) {
    console.error('[Admin] Update user role error:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// ============================================
// SISTEMA DE NOTIFICAÇÕES
// ============================================

// Listar notificações do usuário
app.get('/make-server-5f5857fb/notifications', async (c) => {
  try {
    console.log('========================================');
    console.log('[Notifications] 📩 GET /notifications');
    console.log('[Notifications] Listando notificações...');
    
    // Usar AuthService centralizado
    const user = await authService.verifyRequest(c);
    if (!user) {
      console.log('[Notifications] ❌ Não autenticado ou token inválido');
      return c.json({ error: 'Não autenticado' }, 401);
    }

    console.log('[Notifications] ✅ Token válido para usuário:', user.id);

    const allNotifications = await kv.getByPrefix('notification:');
    const userNotifications = allNotifications
      .filter(n => n.user_id === user.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const unreadCount = userNotifications.filter(n => !n.read).length;

    console.log('[Notifications] Encontradas:', userNotifications.length, 'Não lidas:', unreadCount);
    console.log('========================================');

    return c.json({ 
      notifications: userNotifications,
      unread_count: unreadCount 
    });
  } catch (error) {
    console.error('[Notifications] Erro ao listar:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Marcar notificação como lida
app.put('/make-server-5f5857fb/notifications/:id/read', async (c) => {
  try {
    const notificationId = c.req.param('id');
    console.log('[Notifications] Marcando como lida:', notificationId);
    
    // Usar AuthService centralizado
    const user = await authService.verifyRequest(c);
    if (!user) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const notification = await kv.get(`notification:${notificationId}`);
    if (!notification) {
      return c.json({ error: 'Notificação não encontrada' }, 404);
    }

    if (notification.user_id !== user.id) {
      return c.json({ error: 'Não autorizado' }, 403);
    }

    notification.read = true;
    await kv.set(`notification:${notificationId}`, notification);

    console.log('[Notifications] Marcada como lida');
    return c.json({ notification });
  } catch (error) {
    console.error('[Notifications] Erro ao marcar como lida:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Marcar todas como lidas
app.put('/make-server-5f5857fb/notifications/read-all', async (c) => {
  try {
    console.log('[Notifications] Marcando todas como lidas...');
    
    // Usar AuthService centralizado
    const user = await authService.verifyRequest(c);
    if (!user) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const allNotifications = await kv.getByPrefix('notification:');
    const userNotifications = allNotifications.filter(n => n.user_id === user.id && !n.read);

    for (const notification of userNotifications) {
      notification.read = true;
      await kv.set(`notification:${notification.id}`, notification);
    }

    console.log('[Notifications] Total marcadas:', userNotifications.length);
    return c.json({ success: true, count: userNotifications.length });
  } catch (error) {
    console.error('[Notifications] Erro ao marcar todas:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Deletar notificação
app.delete('/make-server-5f5857fb/notifications/:id', async (c) => {
  try {
    const notificationId = c.req.param('id');
    console.log('[Notifications] Deletando:', notificationId);
    
    // Usar AuthService centralizado
    const user = await authService.verifyRequest(c);
    if (!user) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const notification = await kv.get(`notification:${notificationId}`);
    if (!notification) {
      return c.json({ error: 'Notificação não encontrada' }, 404);
    }

    if (notification.user_id !== user.id) {
      return c.json({ error: 'Não autorizado' }, 403);
    }

    await kv.del(`notification:${notificationId}`);

    console.log('[Notifications] Deletada');
    return c.json({ success: true });
  } catch (error) {
    console.error('[Notifications] Erro ao deletar:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Helper para criar notificação (uso interno)
async function createNotification(userId: string, type: string, title: string, message: string, link?: string) {
  const notificationId = crypto.randomUUID();
  const notification = {
    id: notificationId,
    user_id: userId,
    type,
    title,
    message,
    link,
    read: false,
    created_at: new Date().toISOString(),
  };
  await kv.set(`notification:${notificationId}`, notification);
  return notification;
}

// ============================================
// SISTEMA DE COMPARTILHAMENTO DE VIAGENS
// ============================================

// Compartilhar viagem
app.post('/make-server-5f5857fb/trips/:tripId/share', async (c) => {
  try {
    const tripId = c.req.param('tripId');
    console.log('[Share] Compartilhando viagem:', tripId);
    
    const accessToken = getAccessToken(c);
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Token inválido' }, 401);
    }

    const trip = await kv.get(`trip:${tripId}`);
    if (!trip) {
      return c.json({ error: 'Viagem não encontrada' }, 404);
    }

    if (trip.user_id !== user.id) {
      return c.json({ error: 'Não autorizado' }, 403);
    }

    const { shared_with_email, access_level = 'view', expires_in_days = 7 } = await c.req.json();

    const shareToken = crypto.randomUUID();
    const shareId = crypto.randomUUID();
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expires_in_days);

    const sharedTrip = {
      id: shareId,
      trip_id: tripId,
      shared_by: user.id,
      shared_with_email,
      share_token: shareToken,
      access_level,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
    };

    await kv.set(`shared_trip:${shareId}`, sharedTrip);

    const shareUrl = `${Deno.env.get('FRONTEND_URL') || 'http://localhost:5173'}/shared/${shareToken}`;

    // Criar notificação
    await createNotification(
      user.id,
      'success',
      'Viagem compartilhada',
      `Sua viagem para ${trip.destination} foi compartilhada com sucesso!`,
      shareUrl
    );

    console.log('[Share] Viagem compartilhada:', shareId);

    return c.json({ 
      share: sharedTrip,
      share_url: shareUrl
    });
  } catch (error) {
    console.error('[Share] Erro ao compartilhar:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Ver viagem compartilhada (público)
app.get('/make-server-5f5857fb/shared/:token', async (c) => {
  try {
    const token = c.req.param('token');
    console.log('[Share] Acessando viagem compartilhada:', token);
    
    const allShares = await kv.getByPrefix('shared_trip:');
    const share = allShares.find(s => s.share_token === token);

    if (!share) {
      return c.json({ error: 'Link inválido ou expirado' }, 404);
    }

    // Verificar expiração
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return c.json({ error: 'Link expirado' }, 410);
    }

    const trip = await kv.get(`trip:${share.trip_id}`);
    if (!trip) {
      return c.json({ error: 'Viagem não encontrada' }, 404);
    }

    // Buscar dados do dono da viagem
    const ownerData = await kv.get(`user:${share.shared_by}`);

    console.log('[Share] Viagem compartilhada acessada');

    return c.json({ 
      trip,
      share_info: {
        shared_by: ownerData?.name || 'Usuário',
        access_level: share.access_level,
        expires_at: share.expires_at,
      }
    });
  } catch (error) {
    console.error('[Share] Erro ao acessar:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Listar compartilhamentos de uma viagem
app.get('/make-server-5f5857fb/trips/:tripId/shares', async (c) => {
  try {
    const tripId = c.req.param('tripId');
    console.log('[Share] Listando compartilhamentos:', tripId);
    
    const accessToken = getAccessToken(c);
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Token inválido' }, 401);
    }

    const trip = await kv.get(`trip:${tripId}`);
    if (!trip || trip.user_id !== user.id) {
      return c.json({ error: 'Não autorizado' }, 403);
    }

    const allShares = await kv.getByPrefix('shared_trip:');
    const tripShares = allShares.filter(s => s.trip_id === tripId);

    return c.json({ shares: tripShares });
  } catch (error) {
    console.error('[Share] Erro ao listar:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Revogar compartilhamento
app.delete('/make-server-5f5857fb/shares/:shareId', async (c) => {
  try {
    const shareId = c.req.param('shareId');
    console.log('[Share] Revogando compartilhamento:', shareId);
    
    const accessToken = getAccessToken(c);
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Token inválido' }, 401);
    }

    const share = await kv.get(`shared_trip:${shareId}`);
    if (!share) {
      return c.json({ error: 'Compartilhamento não encontrado' }, 404);
    }

    if (share.shared_by !== user.id) {
      return c.json({ error: 'Não autorizado' }, 403);
    }

    await kv.del(`shared_trip:${shareId}`);

    console.log('[Share] Compartilhamento revogado');
    return c.json({ success: true });
  } catch (error) {
    console.error('[Share] Erro ao revogar:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// ============================================
// SISTEMA DE CHECKLIST DE BAGAGEM
// ============================================

// Listar itens de uma viagem
app.get('/make-server-5f5857fb/trips/:tripId/packing', async (c) => {
  try {
    const tripId = c.req.param('tripId');
    console.log('[Packing] Listando itens:', tripId);
    
    const accessToken = getAccessToken(c);
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Token inválido' }, 401);
    }

    const allItems = await kv.getByPrefix('packing_item:');
    const tripItems = allItems
      .filter(item => item.trip_id === tripId)
      .sort((a, b) => a.category.localeCompare(b.category));

    const stats = {
      total: tripItems.length,
      packed: tripItems.filter(item => item.packed).length,
      by_category: tripItems.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    console.log('[Packing] Total de itens:', tripItems.length);

    return c.json({ items: tripItems, stats });
  } catch (error) {
    console.error('[Packing] Erro ao listar:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Adicionar item à checklist
app.post('/make-server-5f5857fb/trips/:tripId/packing', async (c) => {
  try {
    const tripId = c.req.param('tripId');
    console.log('[Packing] Adicionando item:', tripId);
    
    const accessToken = getAccessToken(c);
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Token inválido' }, 401);
    }

    const trip = await kv.get(`trip:${tripId}`);
    if (!trip || trip.user_id !== user.id) {
      return c.json({ error: 'Não autorizado' }, 403);
    }

    const { category, name, quantity = 1, notes } = await c.req.json();

    if (!category || !name) {
      return c.json({ error: 'Categoria e nome são obrigatórios' }, 400);
    }

    const itemId = crypto.randomUUID();
    const item = {
      id: itemId,
      trip_id: tripId,
      category,
      name,
      quantity,
      packed: false,
      notes,
      created_at: new Date().toISOString(),
    };

    await kv.set(`packing_item:${itemId}`, item);

    console.log('[Packing] Item adicionado:', itemId);
    return c.json({ item });
  } catch (error) {
    console.error('[Packing] Erro ao adicionar:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Atualizar item (marcar como embalado)
app.put('/make-server-5f5857fb/packing/:itemId', async (c) => {
  try {
    const itemId = c.req.param('itemId');
    console.log('[Packing] Atualizando item:', itemId);
    
    const accessToken = getAccessToken(c);
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Token inválido' }, 401);
    }

    const item = await kv.get(`packing_item:${itemId}`);
    if (!item) {
      return c.json({ error: 'Item não encontrado' }, 404);
    }

    const trip = await kv.get(`trip:${item.trip_id}`);
    if (!trip || trip.user_id !== user.id) {
      return c.json({ error: 'Não autorizado' }, 403);
    }

    const updates = await c.req.json();
    const updatedItem = { ...item, ...updates };

    await kv.set(`packing_item:${itemId}`, updatedItem);

    console.log('[Packing] Item atualizado');
    return c.json({ item: updatedItem });
  } catch (error) {
    console.error('[Packing] Erro ao atualizar:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Deletar item
app.delete('/make-server-5f5857fb/packing/:itemId', async (c) => {
  try {
    const itemId = c.req.param('itemId');
    console.log('[Packing] Deletando item:', itemId);
    
    const accessToken = getAccessToken(c);
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Token inválido' }, 401);
    }

    const item = await kv.get(`packing_item:${itemId}`);
    if (!item) {
      return c.json({ error: 'Item não encontrado' }, 404);
    }

    const trip = await kv.get(`trip:${item.trip_id}`);
    if (!trip || trip.user_id !== user.id) {
      return c.json({ error: 'Não autorizado' }, 403);
    }

    await kv.del(`packing_item:${itemId}`);

    console.log('[Packing] Item deletado');
    return c.json({ success: true });
  } catch (error) {
    console.error('[Packing] Erro ao deletar:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Gerar checklist automática baseada na viagem
app.post('/make-server-5f5857fb/trips/:tripId/packing/auto-generate', async (c) => {
  try {
    const tripId = c.req.param('tripId');
    console.log('[Packing] Gerando checklist automática:', tripId);
    
    const accessToken = getAccessToken(c);
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Token inválido' }, 401);
    }

    const trip = await kv.get(`trip:${tripId}`);
    if (!trip || trip.user_id !== user.id) {
      return c.json({ error: 'Não autorizado' }, 403);
    }

    // Calcular duração da viagem
    const duration = Math.ceil(
      (new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Template básico de itens
    const basicItems = [
      // Documentos
      { category: 'documentos', name: 'Passaporte ou RG', quantity: 1 },
      { category: 'documentos', name: 'Vouchers de hospedagem', quantity: 1 },
      { category: 'documentos', name: 'Comprovante de vacinas', quantity: 1 },
      
      // Roupas (baseado na duração)
      { category: 'roupas', name: 'Camisetas', quantity: Math.min(duration + 2, 10) },
      { category: 'roupas', name: 'Calças/shorts', quantity: Math.min(Math.ceil(duration / 2), 5) },
      { category: 'roupas', name: 'Roupa íntima', quantity: duration + 2 },
      { category: 'roupas', name: 'Meias', quantity: Math.min(duration + 2, 10) },
      { category: 'roupas', name: 'Pijama', quantity: 2 },
      { category: 'roupas', name: 'Calçados confortáveis', quantity: 2 },
      
      // Higiene
      { category: 'higiene', name: 'Escova de dentes', quantity: 1 },
      { category: 'higiene', name: 'Pasta de dentes', quantity: 1 },
      { category: 'higiene', name: 'Shampoo', quantity: 1 },
      { category: 'higiene', name: 'Sabonete', quantity: 1 },
      { category: 'higiene', name: 'Protetor solar', quantity: 1 },
      { category: 'higiene', name: 'Desodorante', quantity: 1 },
      
      // Eletrônicos
      { category: 'eletronicos', name: 'Carregador de celular', quantity: 1 },
      { category: 'eletronicos', name: 'Power bank', quantity: 1 },
      { category: 'eletronicos', name: 'Fones de ouvido', quantity: 1 },
      
      // Medicamentos
      { category: 'medicamentos', name: 'Kit primeiros socorros', quantity: 1 },
      { category: 'medicamentos', name: 'Medicamentos de uso contínuo', quantity: 1 },
      { category: 'medicamentos', name: 'Analgésicos', quantity: 1 },
      
      // Outros
      { category: 'outros', name: 'Mochila pequena', quantity: 1 },
      { category: 'outros', name: 'Garrafa de água', quantity: 1 },
      { category: 'outros', name: 'Óculos de sol', quantity: 1 },
    ];

    const itemsToCreate = [];
    for (const itemData of basicItems) {
      const itemId = crypto.randomUUID();
      const item = {
        id: itemId,
        trip_id: tripId,
        ...itemData,
        packed: false,
        created_at: new Date().toISOString(),
      };
      await kv.set(`packing_item:${itemId}`, item);
      itemsToCreate.push(item);
    }

    // Criar notificação
    await createNotification(
      user.id,
      'success',
      'Checklist criada',
      `Checklist de ${itemsToCreate.length} itens gerada para sua viagem!`
    );

    console.log('[Packing] Checklist automática criada:', itemsToCreate.length, 'itens');
    return c.json({ items: itemsToCreate, count: itemsToCreate.length });
  } catch (error) {
    console.error('[Packing] Erro ao gerar:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// ============================================
// SISTEMA DE DOCUMENTOS
// ============================================

// Listar documentos de uma viagem
app.get('/make-server-5f5857fb/trips/:tripId/documents', async (c) => {
  try {
    const tripId = c.req.param('tripId');
    console.log('[Documents] Listando documentos:', tripId);
    
    const accessToken = getAccessToken(c);
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Token inválido' }, 401);
    }

    const allDocuments = await kv.getByPrefix('document:');
    const tripDocuments = allDocuments
      .filter(doc => doc.trip_id === tripId && doc.user_id === user.id)
      .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());

    const totalSize = tripDocuments.reduce((sum, doc) => sum + doc.file_size, 0);

    console.log('[Documents] Documentos encontrados:', tripDocuments.length);

    return c.json({ 
      documents: tripDocuments,
      total_size: totalSize
    });
  } catch (error) {
    console.error('[Documents] Erro ao listar:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Registrar documento
app.post('/make-server-5f5857fb/trips/:tripId/documents', async (c) => {
  try {
    const tripId = c.req.param('tripId');
    console.log('[Documents] Registrando documento:', tripId);
    
    const accessToken = getAccessToken(c);
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Token inválido' }, 401);
    }

    const trip = await kv.get(`trip:${tripId}`);
    if (!trip || trip.user_id !== user.id) {
      return c.json({ error: 'Não autorizado' }, 403);
    }

    const { name, type, file_url, file_size } = await c.req.json();

    if (!name || !type || !file_url) {
      return c.json({ error: 'Dados incompletos' }, 400);
    }

    const documentId = crypto.randomUUID();
    const document = {
      id: documentId,
      trip_id: tripId,
      user_id: user.id,
      name,
      type,
      file_url,
      file_size: file_size || 0,
      uploaded_at: new Date().toISOString(),
    };

    await kv.set(`document:${documentId}`, document);

    // Criar notificação
    await createNotification(
      user.id,
      'success',
      'Documento adicionado',
      `${name} foi adicionado à viagem ${trip.destination}`
    );

    console.log('[Documents] Documento registrado:', documentId);
    return c.json({ document });
  } catch (error) {
    console.error('[Documents] Erro ao registrar:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Deletar documento
app.delete('/make-server-5f5857fb/documents/:documentId', async (c) => {
  try {
    const documentId = c.req.param('documentId');
    console.log('[Documents] Deletando documento:', documentId);
    
    const accessToken = getAccessToken(c);
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Token inválido' }, 401);
    }

    const document = await kv.get(`document:${documentId}`);
    if (!document) {
      return c.json({ error: 'Documento não encontrado' }, 404);
    }

    if (document.user_id !== user.id) {
      return c.json({ error: 'Não autorizado' }, 403);
    }

    await kv.del(`document:${documentId}`);

    console.log('[Documents] Documento deletado');
    return c.json({ success: true });
  } catch (error) {
    console.error('[Documents] Erro ao deletar:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// ============================================
// SISTEMA DE ATUALIZAÇÃO AUTOMÁTICA DE DADOS
// ============================================

// Buscar preços atualizados para uma cidade
app.get('/make-server-5f5857fb/data/city/:cityName', async (c) => {
  try {
    const cityName = c.req.param('cityName');
    const days = parseInt(c.req.query('days') || '5');
    
    console.log(`[Data] Buscando dados atualizados para: ${cityName}, ${days} dias`);
    
    // Verificar se já temos dados em cache (válido por 24h)
    const cacheKey = `city_data:${cityName}:${days}`;
    const cached = await kv.get(cacheKey);
    
    if (cached && cached.lastUpdated) {
      const age = Date.now() - new Date(cached.lastUpdated).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 horas
      
      if (age < maxAge) {
        console.log(`[Data] Usando cache (${Math.floor(age / 1000 / 60)} minutos)`);
        return c.json({ 
          budgets: cached.budgets,
          source: 'cache',
          age: Math.floor(age / 1000 / 60)
        });
      }
    }
    
    // Buscar dados atualizados
    const budgets = await dataFetcher.fetchCityData(cityName, days);
    
    if (!budgets) {
      return c.json({ error: 'Cidade não encontrada' }, 404);
    }
    
    // Salvar em cache
    await kv.set(cacheKey, { 
      budgets, 
      lastUpdated: new Date().toISOString() 
    });
    
    console.log(`[Data] ✅ Dados atualizados para ${cityName}`);
    
    return c.json({ 
      budgets,
      source: 'fresh',
      age: 0
    });
  } catch (error) {
    console.error('[Data] Erro ao buscar dados:', error);
    return c.json({ error: 'Erro ao buscar dados' }, 500);
  }
});

// Buscar dados de custo de vida para cidade (para admin)
app.get('/make-server-5f5857fb/api/city-data', async (c) => {
  try {
    const city = c.req.query('city');
    const country = c.req.query('country');
    
    console.log(`[CityData] Buscando dados para: ${city}, ${country}`);
    
    if (!city || !country) {
      return c.json({ error: 'Cidade e país são obrigatórios' }, 400);
    }
    
    // Buscar dados atualizados usando o data-fetcher
    const cityDataArray = await dataFetcher.fetchCityData(city, 5);
    
    if (!cityDataArray || cityDataArray.length === 0) {
      console.log(`[CityData] Cidade não encontrada: ${city}`);
      return c.json({ 
        error: 'Cidade não encontrada',
        dailyBudgets: null,
        costIndex: 0,
        lastUpdated: new Date().toISOString()
      }, 200);
    }
    
    console.log(`[CityData] ✅ Dados encontrados para ${city}:`, cityDataArray.map(d => `${d.budgetLevel}: R$${d.dailyAverage}`));
    
    // Transformar array de PriceData em formato esperado pelo frontend
    const dailyBudgets = {
      economy: 0,
      medium: 0,
      comfort: 0
    };
    
    cityDataArray.forEach(budget => {
      if (budget.budgetLevel === 'economico') {
        dailyBudgets.economy = budget.dailyAverage;
      } else if (budget.budgetLevel === 'moderado') {
        dailyBudgets.medium = budget.dailyAverage;
      } else if (budget.budgetLevel === 'conforto') {
        dailyBudgets.comfort = budget.dailyAverage;
      }
    });
    
    // Calcular índice de custo baseado no orçamento médio
    const avgDaily = dailyBudgets.medium || 300;
    const costIndex = Math.round((avgDaily / 300) * 100); // 300 = referência
    
    return c.json({ 
      dailyBudgets,
      costIndex,
      lastUpdated: new Date().toISOString(),
      source: 'api'
    });
  } catch (error) {
    console.error('[CityData] Erro ao buscar dados:', error);
    return c.json({ error: 'Erro ao buscar dados da cidade' }, 500);
  }
});

// Rota para buscar endereços (autocomplete - evita CORS)
app.get('/make-server-5f5857fb/api/geocode', async (c) => {
  try {
    const query = c.req.query('q');
    
    if (!query || query.length < 3) {
      return c.json([]);
    }

    console.log('[Geocode] Buscando endereços para:', query);

    // Fazer requisição ao Nominatim do servidor (evita CORS)
    // Parâmetros otimizados para autocomplete:
    // - addressdetails=1: retorna componentes do endereço
    // - namedetails=1: retorna variações do nome
    // - accept-language=pt-BR,pt,en: prioriza resultados em português
    // - limit=25: mais resultados para melhor filtragem
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query)}` +
      `&format=json` +
      `&addressdetails=1` +
      `&namedetails=1` +
      `&accept-language=pt-BR,pt,en` +
      `&limit=25` +
      `&featuretype=settlement`;

    console.log('[Geocode] URL da requisição:', nominatimUrl);

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'PlanejeFacil/1.0 (contact@planejefacil.com)'
      }
    });

    console.log('[Geocode Service] Status da resposta:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Geocode Service] Erro na resposta:', response.status, errorText);
      
      // Retornar array vazio ao invés de erro para não quebrar o frontend
      return c.json([]);
    }

    const data = await response.json();
    
    console.log(`[Geocode] 📥 Nominatim retornou ${data.length} resultados brutos`);
    
    // Filtro rigoroso - apenas cidades reais
    const cities = data
      .filter((place: any) => {
        const type = place.type?.toLowerCase();
        const placeClass = place.class?.toLowerCase();
        const addressType = place.addresstype?.toLowerCase();
        
        // Log primeiro resultado para debug
        if (data.indexOf(place) === 0) {
          console.log('[Geocode] 🔍 Exemplo de resultado do Nominatim:', {
            name: place.name,
            type,
            class: placeClass,
            addressType,
            address: place.address
          });
        }
        
        // Rejeitar explicitamente regiões, estados, países
        const rejectTypes = ['state', 'region', 'country', 'county', 'province'];
        if (rejectTypes.includes(type) || rejectTypes.includes(addressType)) {
          console.log(`[Geocode] ❌ Rejeitado "${place.name}" - tipo: ${type || addressType}`);
          return false;
        }
        
        // Aceitar APENAS cidades, vilas e municípios
        const validTypes = ['city', 'town', 'village', 'municipality', 'hamlet'];
        const isValidType = validTypes.includes(type) || validTypes.includes(addressType);
        
        // Aceitar se for classe "place" (localidades)
        const isPlace = placeClass === 'place';
        
        const accepted = isPlace || isValidType;
        if (!accepted && data.indexOf(place) < 5) {
          console.log(`[Geocode] ⚠️ Filtrado "${place.name}" - class: ${placeClass}, type: ${type}, addressType: ${addressType}`);
        }
        
        return accepted;
      })
      // Ordenar por importância (cidades maiores primeiro)
      .sort((a: any, b: any) => {
        // Priorizar por tipo
        const typeOrder: any = { city: 1, town: 2, village: 3, municipality: 4 };
        const aType = a.type?.toLowerCase();
        const bType = b.type?.toLowerCase();
        const aOrder = typeOrder[aType] || 999;
        const bOrder = typeOrder[bType] || 999;
        
        if (aOrder !== bOrder) return aOrder - bOrder;
        
        // Priorizar por importance (OpenStreetMap)
        return (b.importance || 0) - (a.importance || 0);
      })
      // Limitar a 8 resultados
      .slice(0, 8)
      // Formatar resposta com display_name limpo
      .map((place: any) => {
        // Criar display_name limpo: Cidade, Estado, País
        const cityName = place.name;
        const state = place.address?.state;
        const country = place.address?.country;
        
        const parts = [cityName];
        if (state && state !== cityName) {
          parts.push(state);
        }
        if (country) {
          parts.push(country);
        }
        const cleanDisplayName = parts.join(', ');
        
        return {
          display_name: cleanDisplayName, // Display name limpo
          name: place.name,
          type: place.type,
          address: place.address,
          lat: place.lat,
          lon: place.lon,
          importance: place.importance
        };
      });

    console.log(`[Geocode] ✅ Encontradas ${cities.length} cidades válidas para: ${query}`);
    return c.json(cities);
  } catch (error: any) {
    console.error('[Geocode] Erro ao buscar endereços:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Atualizar dados de todas as cidades (admin only)
app.post('/make-server-5f5857fb/data/update-all', async (c) => {
  try {
    console.log('==========================================');
    console.log('[Data] INÍCIO DA REQUISIÇÃO /data/update-all');
    console.log('[Data] Method:', c.req.method);
    console.log('[Data] URL:', c.req.url);
    console.log('[Data] Headers recebidos:', Object.fromEntries(c.req.raw.headers));
    console.log('==========================================');
    
    // Verificar autenticação admin
    const accessToken = getAccessToken(c);
    console.log('[Data] Access token extraído:', accessToken ? 'Sim (length: ' + accessToken.length + ')' : 'Não');
    
    if (!accessToken) {
      console.error('[Data] ❌ Nenhum token fornecido');
      return c.json({ error: 'Não autorizado - token não fornecido' }, 401);
    }
    
    console.log('[Data] 🔍 Validando token com supabaseAdmin.auth.getUser()...');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    
    console.log('[Data] Resultado da validação:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      hasError: !!authError,
      errorMessage: authError?.message,
      errorName: authError?.name,
      errorStatus: authError?.status
    });
    
    if (authError || !user) {
      console.error('[Data] ❌ Erro ao verificar usuário:', authError?.message);
      return c.json({ error: `Não autorizado - ${authError?.message || 'usuário não encontrado'}` }, 401);
    }
    
    // Por enquanto, permitir qualquer usuário autenticado atualizar os dados
    // Verificação de admin será implementada futuramente quando a tabela profiles estiver configurada
    console.log('[Data] ✅ Usuário autenticado - permitindo atualização');
    console.log('[Data] User ID:', user.id);
    console.log('[Data] User email:', user.email);
    
    // Lista de cidades para atualizar
    const cities = [
      { id: 'rio-de-janeiro', name: 'Rio de Janeiro', state: 'RJ', country: 'Brazil', coordinates: { lat: -22.9068, lng: -43.1729 } },
      { id: 'salvador', name: 'Salvador', state: 'BA', country: 'Brazil', coordinates: { lat: -12.9714, lng: -38.5014 } },
      { id: 'florianopolis', name: 'Florianópolis', state: 'SC', country: 'Brazil', coordinates: { lat: -27.5954, lng: -48.5480 } },
      { id: 'porto-alegre', name: 'Porto Alegre', state: 'RS', country: 'Brazil', coordinates: { lat: -30.0346, lng: -51.2177 } },
      { id: 'foz-do-iguacu', name: 'Foz do Iguaçu', state: 'PR', country: 'Brazil', coordinates: { lat: -25.5469, lng: -54.5882 } },
      { id: 'gramado', name: 'Gramado', state: 'RS', country: 'Brazil', coordinates: { lat: -29.3789, lng: -50.8744 } },
      { id: 'fortaleza', name: 'Fortaleza', state: 'CE', country: 'Brazil', coordinates: { lat: -3.7172, lng: -38.5433 } },
      { id: 'recife', name: 'Recife', state: 'PE', country: 'Brazil', coordinates: { lat: -8.0476, lng: -34.8770 } },
      { id: 'natal', name: 'Natal', state: 'RN', country: 'Brazil', coordinates: { lat: -5.7945, lng: -35.2110 } },
      { id: 'maceio', name: 'Maceió', state: 'AL', country: 'Brazil', coordinates: { lat: -9.6658, lng: -35.7350 } },
      { id: 'joao-pessoa', name: 'João Pessoa', state: 'PB', country: 'Brazil', coordinates: { lat: -7.1195, lng: -34.8450 } },
      { id: 'belo-horizonte', name: 'Belo Horizonte', state: 'MG', country: 'Brazil', coordinates: { lat: -19.9167, lng: -43.9345 } },
      { id: 'brasilia', name: 'Brasília', state: 'DF', country: 'Brazil', coordinates: { lat: -15.8267, lng: -47.9218 } },
      { id: 'curitiba', name: 'Curitiba', state: 'PR', country: 'Brazil', coordinates: { lat: -25.4284, lng: -49.2733 } },
      { id: 'manaus', name: 'Manaus', state: 'AM', country: 'Brazil', coordinates: { lat: -3.1190, lng: -60.0217 } },
      { id: 'belem', name: 'Belém', state: 'PA', country: 'Brazil', coordinates: { lat: -1.4558, lng: -48.5039 } },
      { id: 'sao-luis', name: 'São Luís', state: 'MA', country: 'Brazil', coordinates: { lat: -2.5387, lng: -44.2825 } },
      { id: 'sao-paulo', name: 'São Paulo', state: 'SP', country: 'Brazil', coordinates: { lat: -23.5505, lng: -46.6333 } },
    ];
    
    // Atualizar todas as cidades
    const results = await dataFetcher.updateAllCitiesData(cities as any);
    
    // Salvar no cache
    for (const [cityId, budgets] of Object.entries(results)) {
      const city = cities.find(c => c.id === cityId);
      if (city) {
        await kv.set(`city_data:${city.name}:5`, {
          budgets,
          lastUpdated: new Date().toISOString()
        });
      }
    }
    
    console.log(`[Data] ✅ Atualização concluída: ${Object.keys(results).length} cidades`);
    
    return c.json({ 
      success: true,
      citiesUpdated: Object.keys(results).length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Data] ❌ Erro ao atualizar:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return c.json({ error: `Erro ao atualizar dados: ${errorMessage}` }, 500);
  }
});

// TESTE: Rota POST simples para debug
app.post('/make-server-5f5857fb/data/test-post', async (c) => {
  console.log('========== TESTE POST ==========');
  console.log('[TEST] Requisição POST recebida!');
  console.log('[TEST] Headers:', Object.fromEntries(c.req.raw.headers));
  
  const accessToken = getAccessToken(c);
  console.log('[TEST] Token extraído:', accessToken ? 'Sim' : 'Não');
  
  if (!accessToken) {
    console.log('[TEST] ❌ Sem token');
    return c.json({ error: 'No token', received: true }, 401);
  }
  
  console.log('[TEST] ✅ Token presente, validando...');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
  
  if (error || !user) {
    console.log('[TEST] ❌ Token inválido:', error?.message);
    return c.json({ error: 'Invalid token', details: error?.message }, 401);
  }
  
  console.log('[TEST] ✅ Usuário autenticado:', user.id);
  return c.json({ success: true, userId: user.id, message: 'POST funcionando!' });
});

// Obter informações de cache
app.get('/make-server-5f5857fb/data/cache-info', async (c) => {
  try {
    const allCacheKeys = await kv.getByPrefix('city_data:');
    
    const cacheInfo = allCacheKeys.map((cache: any) => {
      const age = Date.now() - new Date(cache.lastUpdated).getTime();
      const ageMinutes = Math.floor(age / 1000 / 60);
      
      return {
        key: cache.key,
        lastUpdated: cache.lastUpdated,
        ageMinutes,
        isValid: ageMinutes < 24 * 60
      };
    });
    
    return c.json({ 
      cacheEntries: cacheInfo.length,
      entries: cacheInfo
    });
  } catch (error) {
    console.error('[Data] Erro ao obter info do cache:', error);
    return c.json({ error: 'Erro ao obter informações' }, 500);
  }
});

// ============================================
// UPLOAD DE ANEXOS PARA TAREFAS
// ============================================

app.post('/make-server-5f5857fb/upload-attachment', async (c) => {
  try {
    console.log('[Upload] Recebendo upload de anexo...');

    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const taskId = formData.get('taskId') as string;

    if (!file) {
      return c.json({ error: 'Arquivo não fornecido' }, 400);
    }

    if (!taskId) {
      return c.json({ error: 'Task ID não fornecido' }, 400);
    }

    // Validar tamanho (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return c.json({ error: 'Arquivo muito grande (máximo 10MB)' }, 400);
    }

    // Validar tipo de arquivo
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Tipo de arquivo não permitido' }, 400);
    }

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${taskId}_${Date.now()}.${fileExt}`;
    const bucketName = 'make-5f5857fb-attachments';

    console.log('[Upload] Arquivo:', {
      name: file.name,
      type: file.type,
      size: file.size,
      newName: fileName
    });

    // Criar bucket se não existir
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log('[Upload] Criando bucket:', bucketName);
      const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: maxSize,
      });
      
      if (createError) {
        console.error('[Upload] Erro ao criar bucket:', createError);
        return c.json({ error: 'Erro ao criar bucket de armazenamento' }, 500);
      }
    }

    // Upload do arquivo
    const fileBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[Upload] Erro ao fazer upload:', uploadError);
      return c.json({ error: 'Erro ao fazer upload do arquivo' }, 500);
    }

    console.log('[Upload] Upload concluído:', uploadData.path);

    // Gerar URL assinada (válida por 1 ano)
    const { data: urlData, error: urlError } = await supabaseAdmin.storage
      .from(bucketName)
      .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 ano

    if (urlError) {
      console.error('[Upload] Erro ao gerar URL:', urlError);
      return c.json({ error: 'Erro ao gerar URL do arquivo' }, 500);
    }

    console.log('[Upload] ✅ Anexo enviado com sucesso');

    return c.json({
      url: urlData.signedUrl,
      path: uploadData.path,
      fileName: fileName,
    });

  } catch (error) {
    console.error('[Upload] Erro ao processar upload:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// ============================================
// INICIALIZAÇÃO DE ORÇAMENTOS INTERNACIONAIS
// ============================================

// Rota para inicializar orçamentos de cidades internacionais (admin only)
app.post('/make-server-5f5857fb/admin/init-international-budgets', async (c) => {
  try {
    console.log('[Init] Inicializando orçamentos internacionais...');
    
    // Orçamentos base por continente (valores diários em R$)
    const internationalBudgets = [
      // Europa - Custo Alto
      { city_name: 'Lisboa', country: 'Portugal', economy: 250, medium: 450, comfort: 750 },
      { city_name: 'Porto', country: 'Portugal', economy: 220, medium: 400, comfort: 700 },
      { city_name: 'Madrid', country: 'Espanha', economy: 240, medium: 440, comfort: 750 },
      { city_name: 'Barcelona', country: 'Espanha', economy: 260, medium: 470, comfort: 800 },
      { city_name: 'Paris', country: 'França', economy: 300, medium: 550, comfort: 950 },
      { city_name: 'Londres', country: 'Reino Unido', economy: 350, medium: 650, comfort: 1100 },
      { city_name: 'Roma', country: 'Itália', economy: 270, medium: 490, comfort: 820 },
      { city_name: 'Milão', country: 'Itália', economy: 280, medium: 510, comfort: 850 },
      { city_name: 'Berlim', country: 'Alemanha', economy: 260, medium: 480, comfort: 800 },
      { city_name: 'Munique', country: 'Alemanha', economy: 280, medium: 510, comfort: 850 },
      { city_name: 'Amsterdã', country: 'Holanda', economy: 290, medium: 530, comfort: 880 },
      { city_name: 'Bruxelas', country: 'Bélgica', economy: 270, medium: 490, comfort: 820 },
      { city_name: 'Viena', country: 'Áustria', economy: 260, medium: 480, comfort: 800 },
      { city_name: 'Praga', country: 'República Tcheca', economy: 200, medium: 370, comfort: 620 },
      { city_name: 'Budapeste', country: 'Hungria', economy: 180, medium: 340, comfort: 570 },
      { city_name: 'Atenas', country: 'Grécia', economy: 220, medium: 400, comfort: 670 },
      { city_name: 'Dublin', country: 'Irlanda', economy: 300, medium: 550, comfort: 920 },
      { city_name: 'Copenhague', country: 'Dinamarca', economy: 350, medium: 640, comfort: 1050 },
      { city_name: 'Estocolmo', country: 'Suécia', economy: 330, medium: 600, comfort: 1000 },
      { city_name: 'Oslo', country: 'Noruega', economy: 380, medium: 690, comfort: 1150 },
      { city_name: 'Helsinque', country: 'Finlândia', economy: 300, medium: 550, comfort: 920 },
      { city_name: 'Varsóvia', country: 'Polônia', economy: 180, medium: 340, comfort: 570 },
      { city_name: 'Zurique', country: 'Suíça', economy: 400, medium: 730, comfort: 1200 },
      { city_name: 'Genebra', country: 'Suíça', economy: 390, medium: 710, comfort: 1180 },
      
      // América do Norte - Custo Alto
      { city_name: 'Nova York', country: 'Estados Unidos', economy: 350, medium: 650, comfort: 1100 },
      { city_name: 'Los Angeles', country: 'Estados Unidos', economy: 320, medium: 590, comfort: 980 },
      { city_name: 'Chicago', country: 'Estados Unidos', economy: 290, medium: 530, comfort: 880 },
      { city_name: 'Miami', country: 'Estados Unidos', economy: 310, medium: 570, comfort: 950 },
      { city_name: 'São Francisco', country: 'Estados Unidos', economy: 380, medium: 690, comfort: 1150 },
      { city_name: 'Las Vegas', country: 'Estados Unidos', economy: 280, medium: 510, comfort: 850 },
      { city_name: 'Washington', country: 'Estados Unidos', economy: 300, medium: 550, comfort: 920 },
      { city_name: 'Boston', country: 'Estados Unidos', economy: 310, medium: 570, comfort: 950 },
      { city_name: 'Seattle', country: 'Estados Unidos', economy: 300, medium: 550, comfort: 920 },
      { city_name: 'Orlando', country: 'Estados Unidos', economy: 270, medium: 490, comfort: 820 },
      { city_name: 'Toronto', country: 'Canadá', economy: 280, medium: 510, comfort: 850 },
      { city_name: 'Vancouver', country: 'Canadá', economy: 290, medium: 530, comfort: 880 },
      { city_name: 'Montreal', country: 'Canadá', economy: 260, medium: 480, comfort: 800 },
      { city_name: 'Cidade do México', country: 'México', economy: 150, medium: 280, comfort: 470 },
      { city_name: 'Cancún', country: 'México', economy: 200, medium: 370, comfort: 620 },
      { city_name: 'Guadalajara', country: 'México', economy: 140, medium: 260, comfort: 440 },
      
      // América do Sul - Custo Médio
      { city_name: 'Buenos Aires', country: 'Argentina', economy: 180, medium: 340, comfort: 570 },
      { city_name: 'Córdoba', country: 'Argentina', economy: 150, medium: 280, comfort: 470 },
      { city_name: 'Mendoza', country: 'Argentina', economy: 160, medium: 300, comfort: 500 },
      { city_name: 'Santiago', country: 'Chile', economy: 200, medium: 370, comfort: 620 },
      { city_name: 'Lima', country: 'Peru', economy: 160, medium: 300, comfort: 500 },
      { city_name: 'Cusco', country: 'Peru', economy: 140, medium: 260, comfort: 440 },
      { city_name: 'Bogotá', country: 'Colômbia', economy: 150, medium: 280, comfort: 470 },
      { city_name: 'Cartagena', country: 'Colômbia', economy: 170, medium: 320, comfort: 540 },
      { city_name: 'Medellín', country: 'Colômbia', economy: 140, medium: 260, comfort: 440 },
      { city_name: 'Quito', country: 'Equador', economy: 130, medium: 240, comfort: 410 },
      { city_name: 'Montevidéu', country: 'Uruguai', economy: 190, medium: 350, comfort: 590 },
      { city_name: 'Caracas', country: 'Venezuela', economy: 120, medium: 230, comfort: 390 },
      { city_name: 'La Paz', country: 'Bolívia', economy: 110, medium: 210, comfort: 360 },
      
      // Ásia - Custo Variado
      { city_name: 'Tóquio', country: 'Japão', economy: 320, medium: 590, comfort: 980 },
      { city_name: 'Osaka', country: 'Japão', economy: 280, medium: 510, comfort: 850 },
      { city_name: 'Kyoto', country: 'Japão', economy: 270, medium: 490, comfort: 820 },
      { city_name: 'Pequim', country: 'China', economy: 200, medium: 370, comfort: 620 },
      { city_name: 'Xangai', country: 'China', economy: 220, medium: 400, comfort: 670 },
      { city_name: 'Hong Kong', country: 'China', economy: 280, medium: 510, comfort: 850 },
      { city_name: 'Seul', country: 'Coreia do Sul', economy: 240, medium: 440, comfort: 740 },
      { city_name: 'Bangkok', country: 'Tailândia', economy: 130, medium: 250, comfort: 420 },
      { city_name: 'Singapura', country: 'Singapura', economy: 280, medium: 510, comfort: 850 },
      { city_name: 'Dubai', country: 'Emirados Árabes', economy: 300, medium: 550, comfort: 920 },
      { city_name: 'Abu Dhabi', country: 'Emirados Árabes', economy: 280, medium: 510, comfort: 850 },
      { city_name: 'Délhi', country: 'Índia', economy: 100, medium: 190, comfort: 330 },
      { city_name: 'Mumbai', country: 'Índia', economy: 120, medium: 230, comfort: 390 },
      { city_name: 'Istambul', country: 'Turquia', economy: 170, medium: 320, comfort: 540 },
      { city_name: 'Tel Aviv', country: 'Israel', economy: 280, medium: 510, comfort: 850 },
      { city_name: 'Jerusalém', country: 'Israel', economy: 260, medium: 480, comfort: 800 },
      
      // Oceania - Custo Alto
      { city_name: 'Sydney', country: 'Austrália', economy: 320, medium: 590, comfort: 980 },
      { city_name: 'Melbourne', country: 'Austrália', economy: 300, medium: 550, comfort: 920 },
      { city_name: 'Brisbane', country: 'Austrália', economy: 280, medium: 510, comfort: 850 },
      { city_name: 'Auckland', country: 'Nova Zelândia', economy: 270, medium: 490, comfort: 820 },
      { city_name: 'Wellington', country: 'Nova Zelândia', economy: 260, medium: 480, comfort: 800 },
      
      // África - Custo Variado
      { city_name: 'Cairo', country: 'Egito', economy: 130, medium: 250, comfort: 420 },
      { city_name: 'Cidade do Cabo', country: 'África do Sul', economy: 200, medium: 370, comfort: 620 },
      { city_name: 'Joanesburgo', country: 'África do Sul', economy: 180, medium: 340, comfort: 570 },
      { city_name: 'Marrakech', country: 'Marrocos', economy: 140, medium: 260, comfort: 440 },
      { city_name: 'Casablanca', country: 'Marrocos', economy: 150, medium: 280, comfort: 470 },
      { city_name: 'Nairobi', country: 'Quênia', economy: 160, medium: 300, comfort: 500 },
    ];
    
    let created = 0;
    let updated = 0;
    let errors = 0;
    
    for (const budget of internationalBudgets) {
      try {
        // Verificar se já existe
        const { data: existing } = await supabaseAdmin
          .from('city_budgets')
          .select('id')
          .ilike('city_name', budget.city_name)
          .single();
        
        if (existing) {
          // Atualizar
          const { error } = await supabaseAdmin
            .from('city_budgets')
            .update({
              country: budget.country,
              daily_budgets: {
                economy: budget.economy,
                medium: budget.medium,
                comfort: budget.comfort
              },
              last_updated: new Date().toISOString()
            })
            .eq('id', existing.id);
          
          if (error) {
            console.error(`Erro ao atualizar ${budget.city_name}:`, error);
            errors++;
          } else {
            updated++;
          }
        } else {
          // Criar
          const { error } = await supabaseAdmin
            .from('city_budgets')
            .insert({
              city_name: budget.city_name,
              country: budget.country,
              daily_budgets: {
                economy: budget.economy,
                medium: budget.medium,
                comfort: budget.comfort
              },
              last_updated: new Date().toISOString()
            });
          
          if (error) {
            console.error(`Erro ao criar ${budget.city_name}:`, error);
            errors++;
          } else {
            created++;
          }
        }
      } catch (error) {
        console.error(`Erro processando ${budget.city_name}:`, error);
        errors++;
      }
    }
    
    console.log('[Init] Inicialização completa:', { created, updated, errors, total: internationalBudgets.length });
    
    return c.json({ 
      success: true, 
      message: `Orçamentos inicializados: ${created} criados, ${updated} atualizados, ${errors} erros`,
      stats: { created, updated, errors, total: internationalBudgets.length }
    });
  } catch (error) {
    console.error('[Init] Erro ao inicializar orçamentos:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// ============================================
// PRICING CONFIG ROUTES
// ============================================

// Get pricing configuration
app.get('/make-server-5f5857fb/pricing-config', async (c) => {
  console.log('[Pricing Config] ========== INÍCIO ==========');
  
  // Configuração padrão (fallback)
  const defaultConfig = {
    premium_monthly_price: 29.90,
    premium_annual_price: 299.90,
    planning_package_price: 49.90,
    test_mode: true,
    updated_at: new Date().toISOString(),
  };
  
  try {
    console.log('[Pricing Config] Tentando buscar do KV...');
    
    // Buscar configuração atual ou usar padrões
    let config = null;
    
    try {
      config = await kv.get('pricing_config');
      console.log('[Pricing Config] Config do KV:', config);
    } catch (kvError) {
      console.error('[Pricing Config] ⚠️ Erro ao acessar KV (continuando com padrão):', kvError);
      config = null;
    }
    
    if (!config) {
      console.log('[Pricing Config] Configuração não existe, usando padrão...');
      config = defaultConfig;
      
      // Tentar salvar configuração padrão (não crítico se falhar)
      try {
        await kv.set('pricing_config', config);
        console.log('[Pricing Config] ✅ Configuração padrão salva no KV');
      } catch (setError) {
        console.error('[Pricing Config] ⚠️ Não foi possível salvar no KV (não crítico):', setError);
      }
    }
    
    console.log('[Pricing Config] ✅ Retornando config:', config);
    return c.json(config);
  } catch (error) {
    console.error('[Pricing Config] ❌ ERRO CRÍTICO:', error);
    console.error('[Pricing Config] Stack:', error?.stack);
    
    // Mesmo em caso de erro, retornar config padrão
    console.log('[Pricing Config] 🔄 Retornando config padrão devido a erro');
    return c.json(defaultConfig);
  }
});

// Update pricing configuration (admin only)
app.put('/make-server-5f5857fb/pricing-config', async (c) => {
  try {
    console.log('[Pricing Config PUT] 🔄 Iniciando atualização de configurações...');
    console.log('[Pricing Config PUT] Headers:', Object.fromEntries(c.req.raw.headers.entries()));
    
    // Verificar autenticação
    const accessToken = getAccessToken(c);
    console.log('[Pricing Config PUT] Token extraído:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NULO');
    
    if (!accessToken) {
      console.error('[Pricing Config PUT] ❌ Token ausente');
      return c.json({ error: 'Não autenticado - token ausente' }, 401);
    }

    console.log('[Pricing Config PUT] 🔐 Validando token...');
    // IMPORTANTE: Usar supabaseAnon para validar tokens de usuários
    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.error('[Pricing Config PUT] ❌ Erro validação:', authError?.message);
      console.error('[Pricing Config PUT] ❌ Detalhes:', authError);
      return c.json({ 
        error: 'Token inválido', 
        details: authError?.message 
      }, 401);
    }

    console.log('[Pricing Config PUT] ✅ Usuário autenticado:', user.email);
    console.log('[Pricing Config PUT] ✅ User ID:', user.id);

    // Verificar se é admin usando supabaseAdmin para acessar a tabela profiles
    console.log('[Pricing Config PUT] 🔍 Verificando permissão admin...');
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('[Pricing Config PUT] ❌ Erro ao buscar profile:', profileError);
      return c.json({ error: 'Erro ao verificar permissões' }, 500);
    }

    console.log('[Pricing Config PUT] Profile encontrado:', profile);

    const adminEmails = ['admin@planejefacil.com', 'suporte@planejefacil.com', 'teste@planejefacil.com'];
    if (!adminEmails.includes(profile?.email || '')) {
      console.error('[Pricing Config PUT] ❌ Acesso negado para:', profile?.email);
      return c.json({ error: 'Acesso negado - não é admin' }, 403);
    }

    console.log('[Pricing Config PUT] ✅ Admin verificado:', profile.email);

    const updates = await c.req.json();
    
    // Validar dados
    if (updates.premium_monthly_price !== undefined && updates.premium_monthly_price <= 0) {
      return c.json({ error: 'Preço mensal deve ser maior que zero' }, 400);
    }
    if (updates.premium_annual_price !== undefined && updates.premium_annual_price <= 0) {
      return c.json({ error: 'Preço anual deve ser maior que zero' }, 400);
    }
    if (updates.planning_package_price !== undefined && updates.planning_package_price <= 0) {
      return c.json({ error: 'Preço do pacote deve ser maior que zero' }, 400);
    }

    // Buscar config atual
    const currentConfig = await kv.get('pricing_config') || {};
    
    // Atualizar
    const newConfig = {
      ...currentConfig,
      ...updates,
      updated_at: new Date().toISOString(),
      updated_by: profile.email,
    };
    
    await kv.set('pricing_config', newConfig);
    
    console.log('[Pricing Config] ✅ Configurações atualizadas:', newConfig);
    return c.json(newConfig);
  } catch (error) {
    console.error('[Pricing Config] Erro ao atualizar:', error);
    return c.json({ error: 'Erro ao atualizar configurações' }, 500);
  }
});

// ============================================
// PREMIUM PAYMENT WEBHOOKS
// ============================================

// Webhook do Mercado Pago para pagamentos premium
app.post('/make-server-5f5857fb/premium/webhook', async (c) => {
  try {
    const body = await c.req.json();
    console.log('[Premium Webhook] Recebido:', JSON.stringify(body, null, 2));

    // Mercado Pago envia notificações de diferentes tipos
    if (body.type === 'payment') {
      const paymentId = body.data?.id;
      
      if (!paymentId) {
        console.error('[Premium Webhook] Payment ID não encontrado');
        return c.json({ received: true });
      }

      // Buscar detalhes do pagamento
      const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const payment = await paymentResponse.json();
      console.log('[Premium Webhook] Payment details:', payment.status, payment.external_reference);

      // Processar apenas pagamentos aprovados
      if (payment.status === 'approved') {
        // External reference format: premium_userId_plan_timestamp
        const parts = payment.external_reference?.split('_');
        if (parts && parts[0] === 'premium') {
          const userId = parts[1];
          const plan = parts[2]; // 'monthly' ou 'annual'

          // Calcular data de expiração
          const now = new Date();
          const premiumUntil = plan === 'monthly'
            ? new Date(now.setMonth(now.getMonth() + 1))
            : new Date(now.setFullYear(now.getFullYear() + 1));

          // Atualizar perfil do usuário
          const { error } = await supabaseAdmin
            .from('profiles')
            .update({
              role: 'premium',
              premium_until: premiumUntil.toISOString(),
              premium_plan: plan,
            })
            .eq('id', userId);

          if (error) {
            console.error('[Premium Webhook] Erro ao atualizar usuário:', error);
          } else {
            console.log('[Premium Webhook] ✅ Usuário atualizado para premium:', userId, 'até', premiumUntil);
            
            // Criar notificação
            await kv.set(`notification:premium_${userId}_${Date.now()}`, {
              id: `premium_${userId}_${Date.now()}`,
              user_id: userId,
              type: 'success',
              title: 'Premium Ativado!',
              message: `Seu plano premium ${plan === 'monthly' ? 'mensal' : 'anual'} foi ativado com sucesso!`,
              read: false,
              created_at: new Date().toISOString(),
            });
          }
        }
      }
    }

    return c.json({ received: true });
  } catch (error) {
    console.error('[Premium Webhook] Erro:', error);
    return c.json({ received: true }); // Sempre retornar sucesso para não bloquear o Mercado Pago
  }
});

// Callback de retorno do Mercado Pago
app.get('/make-server-5f5857fb/premium/callback', async (c) => {
  try {
    const status = c.req.query('status') || c.req.query('collection_status');
    const preferenceId = c.req.query('preference_id');
    
    console.log('[Premium Callback] Status:', status, 'Preference:', preferenceId);

    // Redirecionar para a aplicação com o status
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173';
    const redirectUrl = `${appUrl}?premium_status=${status}`;
    
    return c.redirect(redirectUrl);
  } catch (error) {
    console.error('[Premium Callback] Erro:', error);
    return c.json({ error: 'Erro no callback' }, 500);
  }
});

// ============================================
// ROTAS INTERNACIONAIS (REST Countries, ExchangeRate, Overpass, Wikipedia)
// ============================================
// 
// 📋 ARQUITETURA DAS APIS:
// 
// 1️⃣ Nominatim (OpenStreetMap) - /geocode
//    → Autocomplete de cidades (rápido, otimizado para busca)
//    → Usado em: CityAutocomplete, AddTripModal
// 
// 2️⃣ REST Countries - /countries/*
//    → Dados de países (moeda, bandeira, idioma)
//    → Usado em: Viagens internacionais, conversão de moeda
// 
// 3️⃣ ExchangeRate-API - /exchange-rate
//    → Taxas de câmbio em tempo real
//    → Usado em: Orçamento internacional, conversão de valores
// 
// 4️⃣ Overpass API - /attractions, /cities/search
//    → Atrações turísticas (museus, monumentos, parques)
//    → POIs detalhados e dados geográficos complexos
//    → Usado em: Mapa interativo, guia turístico
// 
// 5️⃣ Wikipedia API - /wikipedia/summary
//    → Resumos culturais e históricos
//    → Usado em: Guia turístico, central de informações
// 
// ============================================

// Cache em memória (válido enquanto o edge function estiver ativo)
const apiCache = new Map<string, { data: any; expiresAt: number }>();

// Helper para cache
function getCached<T>(key: string): T | null {
  const cached = apiCache.get(key);
  if (!cached) return null;
  
  if (Date.now() > cached.expiresAt) {
    apiCache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

function setCache(key: string, data: any, ttlMinutes: number): void {
  apiCache.set(key, {
    data,
    expiresAt: Date.now() + (ttlMinutes * 60 * 1000),
  });
}

// 1️⃣ GET /countries - Listar todos os países (com cache de 24h)
app.get('/make-server-5f5857fb/countries', async (c) => {
  try {
    const cacheKey = 'all_countries';
    const cached = getCached(cacheKey);
    
    if (cached) {
      console.log('[Countries] Retornando do cache');
      return c.json({ success: true, data: cached, cached: true });
    }

    console.log('[Countries] Buscando da REST Countries API...');
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,cca3,capital,region,currencies,flags,population,latlng');
    
    if (!response.ok) {
      throw new Error(`REST Countries API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Cache por 24 horas (países não mudam frequentemente)
    setCache(cacheKey, data, 24 * 60);
    
    console.log(`[Countries] ✅ ${data.length} países carregados`);
    return c.json({ success: true, data, cached: false });
  } catch (error: any) {
    console.error('[Countries] Erro:', error.message);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 2️⃣ GET /countries/:code - Detalhes de um país específico
app.get('/make-server-5f5857fb/countries/:code', async (c) => {
  try {
    const code = c.req.param('code').toUpperCase();
    const cacheKey = `country_${code}`;
    const cached = getCached(cacheKey);
    
    if (cached) {
      console.log(`[Country] Retornando ${code} do cache`);
      return c.json({ success: true, data: cached, cached: true });
    }

    console.log(`[Country] Buscando ${code} da REST Countries API...`);
    const response = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
    
    if (!response.ok) {
      throw new Error(`Country not found: ${code}`);
    }

    const data = await response.json();
    
    // Cache por 24 horas
    setCache(cacheKey, data[0], 24 * 60);
    
    return c.json({ success: true, data: data[0], cached: false });
  } catch (error: any) {
    console.error('[Country] Erro:', error.message);
    return c.json({ success: false, error: error.message }, 404);
  }
});

// 3️⃣ GET /exchange-rate/:from/:to - Obter taxa de câmbio
app.get('/make-server-5f5857fb/exchange-rate/:from/:to', async (c) => {
  try {
    const from = c.req.param('from').toUpperCase();
    const to = c.req.param('to').toUpperCase();
    const cacheKey = `exchange_${from}_${to}`;
    const cached = getCached(cacheKey);
    
    // Cache de 1 hora para taxas de câmbio
    if (cached) {
      console.log(`[Exchange] Retornando ${from}→${to} do cache`);
      return c.json({ success: true, data: cached, cached: true });
    }

    console.log(`[Exchange] Buscando taxa ${from}→${to}...`);
    // ExchangeRate-API gratuito (1500 requests/mês)
    const response = await fetch(`https://open.exchangerate-api.com/v6/latest/${from}`);
    
    if (!response.ok) {
      throw new Error(`ExchangeRate API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.rates || !data.rates[to]) {
      throw new Error(`Currency ${to} not found`);
    }

    const result = {
      base: from,
      target: to,
      rate: data.rates[to],
      lastUpdate: data.time_last_update_utc,
    };
    
    // Cache por 1 hora (taxas mudam ao longo do dia)
    setCache(cacheKey, result, 60);
    
    return c.json({ success: true, data: result, cached: false });
  } catch (error: any) {
    console.error('[Exchange] Erro:', error.message);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 4️⃣ GET /attractions - Buscar pontos turísticos com Overpass API
app.get('/make-server-5f5857fb/attractions', async (c) => {
  try {
    const lat = parseFloat(c.req.query('lat') || '0');
    const lon = parseFloat(c.req.query('lon') || '0');
    const radius = parseInt(c.req.query('radius') || '5000'); // Reduzido para 5km
    
    if (!lat || !lon) {
      return c.json({ success: false, error: 'Latitude e longitude são obrigatórios' }, 400);
    }

    const cacheKey = `attractions_${lat}_${lon}_${radius}`;
    const cached = getCached(cacheKey);
    
    // Cache de 7 dias (pontos turísticos não mudam rapidamente)
    if (cached) {
      console.log(`[Attractions] Retornando do cache (${lat}, ${lon}) - ${cached.length} atrações`);
      return c.json({ success: true, data: cached, cached: true });
    }

    console.log(`[Attractions] Buscando pontos turísticos em raio de ${radius}m de (${lat}, ${lon})...`);
    
    // Query Overpass SIMPLIFICADA para evitar timeout
    const query = `
      [out:json][timeout:15];
      (
        node[~"^(tourism|historic)$"~"."](around:${radius},${lat},${lon});
        way[~"^(tourism|historic)$"~"."](around:${radius},${lat},${lon});
      );
      out center 50;
    `;
    
    // Tentar com timeout de 10 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    let response;
    try {
      response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
        signal: controller.signal,
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // Se der timeout ou erro, retornar array vazio mas com sucesso
      if (fetchError.name === 'AbortError') {
        console.log('[Attractions] ⚠️ Timeout na Overpass API, retornando lista vazia');
        return c.json({ success: true, data: [], cached: false, message: 'Nenhuma atração encontrada no momento' });
      }
      throw fetchError;
    }
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log(`[Attractions] ⚠️ Overpass API error: ${response.status}, retornando lista vazia`);
      return c.json({ success: true, data: [], cached: false, message: 'Nenhuma atração encontrada no momento' });
    }

    const data = await response.json();
    
    console.log(`[Attractions] API retornou ${data.elements?.length || 0} elementos brutos`);
    
    // Processar elementos com categorização melhorada
    const attractions = data.elements.map((el: any) => {
      // Determinar categoria principal
      let type = 'attraction';
      if (el.tags?.tourism) type = el.tags.tourism;
      else if (el.tags?.historic) type = 'monument';
      else if (el.tags?.leisure) type = el.tags.leisure === 'park' ? 'theme_park' : 'attraction';
      else if (el.tags?.amenity) type = el.tags.amenity;
      else if (el.tags?.natural) type = 'viewpoint';
      
      return {
        id: `osm_${el.id}`,
        name: el.tags?.name || el.tags?.['name:en'] || el.tags?.['name:pt'] || 'Sem nome',
        type: type,
        lat: el.lat || el.center?.lat,
        lon: el.lon || el.center?.lon,
        address: el.tags?.['addr:street'] || el.tags?.['addr:city'],
        website: el.tags?.website || el.tags?.['contact:website'],
        openingHours: el.tags?.opening_hours,
        phone: el.tags?.phone || el.tags?.['contact:phone'],
        wikipedia: el.tags?.wikipedia,
        description: el.tags?.description,
      };
    })
    .filter((a: any) => a.lat && a.lon && a.name !== 'Sem nome') // Filtrar inválidos
    .slice(0, 30); // Limitar a 30 atrações
    
    // Cache por 7 dias
    setCache(cacheKey, attractions, 7 * 24 * 60);
    
    console.log(`[Attractions] ✅ ${attractions.length} atrações válidas encontradas`);
    return c.json({ success: true, data: attractions, cached: false });
  } catch (error: any) {
    console.error('[Attractions] Erro:', error.message);
    // Retornar array vazio em vez de erro 500
    return c.json({ success: true, data: [], cached: false, message: 'Nenhuma atração encontrada no momento' });
  }
});

// 🆕 GET /cities/search - Buscar cidades com Overpass API
app.get('/make-server-5f5857fb/cities/search', async (c) => {
  try {
    const query = c.req.query('query');
    
    if (!query || query.length < 2) {
      return c.json({ success: false, error: 'Query deve ter pelo menos 2 caracteres' }, 400);
    }

    const cacheKey = `cities_${query.toLowerCase()}`;
    const cached = getCached(cacheKey);
    
    // Cache de 30 dias (cidades não mudam)
    if (cached) {
      console.log(`[Cities] Retornando "${query}" do cache`);
      return c.json({ success: true, data: cached, cached: true });
    }

    console.log(`[Cities] Buscando cidades: "${query}"...`);
    
    // Query Overpass: buscar cidades, vilas e municípios
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["place"~"city|town|village"]["name"~"${query}",i];
        area["place"~"city|town|village"]["name"~"${query}",i];
      );
      out body;
      >;
      out skel qt;
    `;
    
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: overpassQuery,
    });
    
    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Processar elementos e priorizar cidades maiores
    const cities = data.elements
      .filter((el: any) => el.tags?.name && el.tags?.place)
      .map((el: any) => {
        // Extrair informações de localização
        const name = el.tags.name;
        const place = el.tags.place; // city, town, village
        const country = el.tags['addr:country'] || el.tags['is_in:country'] || '';
        const state = el.tags['addr:state'] || el.tags['is_in:state'] || '';
        const population = parseInt(el.tags.population || '0');
        
        // Calcular prioridade (cidades grandes primeiro)
        const placeOrder: any = { city: 1, town: 2, village: 3 };
        const priority = placeOrder[place] || 999;
        
        return {
          name,
          display_name: [name, state, country].filter(Boolean).join(', '),
          type: place,
          address: {
            city: name,
            state,
            country,
          },
          lat: el.lat?.toString() || '',
          lon: el.lon?.toString() || '',
          population,
          priority,
        };
      })
      // Ordenar por prioridade e população
      .sort((a: any, b: any) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return b.population - a.population;
      })
      // Limitar a 10 resultados
      .slice(0, 10);
    
    console.log(`[Cities] ✅ Encontradas ${cities.length} cidades para: "${query}"`);
    
    // Cache por 30 dias
    setCache(cacheKey, cities, 30 * 24 * 60);
    
    return c.json({ success: true, data: cities, cached: false });
  } catch (error: any) {
    console.error('[Cities] Erro:', error.message);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 5️⃣ GET /wikipedia/summary - Buscar resumo da Wikipedia
app.get('/make-server-5f5857fb/wikipedia/summary', async (c) => {
  try {
    const title = c.req.query('title');
    const lang = c.req.query('lang') || 'pt'; // Padrão: português
    
    if (!title) {
      return c.json({ success: false, error: 'Título é obrigatório' }, 400);
    }

    const cacheKey = `wiki_${lang}_${title}`;
    const cached = getCached(cacheKey);
    
    // Cache de 30 dias (conteúdo da Wikipedia é estável)
    if (cached) {
      console.log(`[Wikipedia] Retornando "${title}" (${lang}) do cache`);
      return c.json({ success: true, data: cached, cached: true });
    }

    console.log(`[Wikipedia] Buscando "${title}" (${lang})...`);
    
    const response = await fetch(
      `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
    );
    
    if (!response.ok) {
      throw new Error(`Wikipedia API error: ${response.status}`);
    }

    const data = await response.json();
    
    const summary = {
      title: data.title,
      extract: data.extract,
      thumbnail: data.thumbnail,
      coordinates: data.coordinates,
      pageUrl: data.content_urls?.desktop?.page,
    };
    
    // Cache por 30 dias
    setCache(cacheKey, summary, 30 * 24 * 60);
    
    return c.json({ success: true, data: summary, cached: false });
  } catch (error: any) {
    console.error('[Wikipedia] Erro:', error.message);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 6️⃣ GET /geocode - Geocodificar cidade/endereço (usando Nominatim - OpenStreetMap)
app.get('/make-server-5f5857fb/geocode', async (c) => {
  try {
    const query = c.req.query('q');
    
    if (!query) {
      return c.json({ success: false, error: 'Query é obrigatório' }, 400);
    }

    const cacheKey = `geocode_${query}`;
    const cached = getCached(cacheKey);
    
    // Cache de 30 dias (coordenadas de cidades não mudam)
    if (cached) {
      console.log(`[Geocode] Retornando "${query}" do cache`);
      return c.json({ success: true, data: cached, cached: true });
    }

    console.log(`[Geocode] Buscando coordenadas para "${query}"...`);
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'PlanejeViagem/1.0 (https://planejeviagem.com.br)',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Cache por 30 dias
    setCache(cacheKey, data, 30 * 24 * 60);
    
    console.log(`[Geocode] ✅ ${data.length} resultados encontrados`);
    return c.json({ success: true, data, cached: false });
  } catch (error: any) {
    console.error('[Geocode] Erro:', error.message);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ============================================================================
// FEATURE 2: EXCHANGE RATE APIs
// ============================================================================

// Cache simples em memória (em produção, usar Redis ou similar)
const exchangeCache: Map<string, { data: any; timestamp: number }> = new Map();
const EXCHANGE_CACHE_DURATION = 60 * 60 * 1000; // 1 hora

// Simular histórico de 30 dias (em produção, buscar de API real ou database)
function generateHistoricalRates(currentRate: number, days: number = 30): any[] {
  const history: any[] = [];
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Simular variação de ±5% da taxa atual
    const variation = (Math.random() - 0.5) * 0.1; // -5% a +5%
    const rate = currentRate * (1 + variation);
    
    history.push({
      date: date.toISOString().split('T')[0],
      rate: parseFloat(rate.toFixed(4)),
      high: parseFloat((rate * 1.02).toFixed(4)),
      low: parseFloat((rate * 0.98).toFixed(4)),
    });
  }
  
  return history;
}

// Analisar tendência do histórico
function analyzeTrend(history: any[]): {
  trend: 'up' | 'down' | 'stable';
  variation: number;
  recommendation: string;
  bestMoment: 'now' | 'wait' | 'monitor';
} {
  if (history.length < 7) {
    return {
      trend: 'stable',
      variation: 0,
      recommendation: 'Dados insuficientes para análise',
      bestMoment: 'monitor',
    };
  }

  const recentRates = history.slice(-7).map(h => h.rate);
  const olderRates = history.slice(0, 7).map(h => h.rate);
  
  const recentAvg = recentRates.reduce((a, b) => a + b) / recentRates.length;
  const olderAvg = olderRates.reduce((a, b) => a + b) / olderRates.length;
  
  const variation = ((recentAvg - olderAvg) / olderAvg) * 100;
  
  let trend: 'up' | 'down' | 'stable' = 'stable';
  let recommendation = '';
  let bestMoment: 'now' | 'wait' | 'monitor' = 'monitor';
  
  if (variation > 2) {
    trend = 'up';
    recommendation = 'A moeda está em alta. Considere aguardar alguns dias para uma possível queda.';
    bestMoment = 'wait';
  } else if (variation < -2) {
    trend = 'down';
    recommendation = 'A moeda está em queda. Bom momento para comprar!';
    bestMoment = 'now';
  } else {
    trend = 'stable';
    recommendation = 'A moeda está estável. Você pode comprar agora com segurança.';
    bestMoment = 'now';
  }
  
  return {
    trend,
    variation: parseFloat(variation.toFixed(2)),
    recommendation,
    bestMoment,
  };
}

// Informações completas das moedas
function getCurrencyInfo(code: string): any {
  const currencyData: Record<string, any> = {
    // Américas
    'BRL': { code: 'BRL', name: 'Real Brasileiro', flag: '🇧🇷', region: 'Américas', symbol: 'R$' },
    'USD': { code: 'USD', name: 'Dólar Americano', flag: '🇺🇸', region: 'Américas', symbol: '$' },
    'CAD': { code: 'CAD', name: 'Dólar Canadense', flag: '🇨🇦', region: 'Américas', symbol: 'C$' },
    'MXN': { code: 'MXN', name: 'Peso Mexicano', flag: '🇲🇽', region: 'Américas', symbol: 'MX$' },
    'ARS': { code: 'ARS', name: 'Peso Argentino', flag: '🇦🇷', region: 'Américas', symbol: 'AR$' },
    'CLP': { code: 'CLP', name: 'Peso Chileno', flag: '🇨🇱', region: 'Américas', symbol: 'CL$' },
    'COP': { code: 'COP', name: 'Peso Colombiano', flag: '🇨🇴', region: 'Américas', symbol: 'CO$' },
    'PEN': { code: 'PEN', name: 'Sol Peruano', flag: '🇵🇪', region: 'Américas', symbol: 'S/' },
    'UYU': { code: 'UYU', name: 'Peso Uruguaio', flag: '🇺🇾', region: 'Américas', symbol: 'UY$' },
    
    // Europa
    'EUR': { code: 'EUR', name: 'Euro', flag: '🇪🇺', region: 'Europa', symbol: '€' },
    'GBP': { code: 'GBP', name: 'Libra Esterlina', flag: '🇬🇧', region: 'Europa', symbol: '£' },
    'CHF': { code: 'CHF', name: 'Franco Suíço', flag: '🇨🇭', region: 'Europa', symbol: 'CHF' },
    'SEK': { code: 'SEK', name: 'Coroa Sueca', flag: '🇸🇪', region: 'Europa', symbol: 'kr' },
    'NOK': { code: 'NOK', name: 'Coroa Norueguesa', flag: '🇳🇴', region: 'Europa', symbol: 'kr' },
    'DKK': { code: 'DKK', name: 'Coroa Dinamarquesa', flag: '🇩🇰', region: 'Europa', symbol: 'kr' },
    'PLN': { code: 'PLN', name: 'Zloty Polonês', flag: '🇵🇱', region: 'Europa', symbol: 'zł' },
    'CZK': { code: 'CZK', name: 'Coroa Tcheca', flag: '🇨🇿', region: 'Europa', symbol: 'Kč' },
    'HUF': { code: 'HUF', name: 'Forint Húngaro', flag: '🇭🇺', region: 'Europa', symbol: 'Ft' },
    'RON': { code: 'RON', name: 'Leu Romeno', flag: '🇷🇴', region: 'Europa', symbol: 'lei' },
    'RUB': { code: 'RUB', name: 'Rublo Russo', flag: '🇷🇺', region: 'Europa', symbol: '₽' },
    'TRY': { code: 'TRY', name: 'Lira Turca', flag: '🇹🇷', region: 'Europa', symbol: '₺' },
    
    // Ásia
    'JPY': { code: 'JPY', name: 'Iene Japonês', flag: '🇯🇵', region: 'Ásia', symbol: '¥' },
    'CNY': { code: 'CNY', name: 'Yuan Chinês', flag: '🇨🇳', region: 'Ásia', symbol: '¥' },
    'KRW': { code: 'KRW', name: 'Won Sul-Coreano', flag: '🇰🇷', region: 'Ásia', symbol: '₩' },
    'INR': { code: 'INR', name: 'Rúpia Indiana', flag: '🇮🇳', region: 'Ásia', symbol: '₹' },
    'SGD': { code: 'SGD', name: 'Dólar de Singapura', flag: '🇸🇬', region: 'Ásia', symbol: 'S$' },
    'HKD': { code: 'HKD', name: 'Dólar de Hong Kong', flag: '🇭🇰', region: 'Ásia', symbol: 'HK$' },
    'THB': { code: 'THB', name: 'Baht Tailandês', flag: '🇹🇭', region: 'Ásia', symbol: '฿' },
    'MYR': { code: 'MYR', name: 'Ringgit Malaio', flag: '🇲🇾', region: 'Ásia', symbol: 'RM' },
    'IDR': { code: 'IDR', name: 'Rupia Indonésia', flag: '🇮🇩', region: 'Ásia', symbol: 'Rp' },
    'PHP': { code: 'PHP', name: 'Peso Filipino', flag: '🇵🇭', region: 'Ásia', symbol: '₱' },
    'VND': { code: 'VND', name: 'Dong Vietnamita', flag: '🇻🇳', region: 'Ásia', symbol: '₫' },
    'PKR': { code: 'PKR', name: 'Rúpia Paquistanesa', flag: '🇵🇰', region: 'Ásia', symbol: '₨' },
    'BDT': { code: 'BDT', name: 'Taka de Bangladesh', flag: '🇧🇩', region: 'Ásia', symbol: '৳' },
    
    // Oceania
    'AUD': { code: 'AUD', name: 'Dólar Australiano', flag: '🇦🇺', region: 'Oceania', symbol: 'A$' },
    'NZD': { code: 'NZD', name: 'Dólar Neozelandês', flag: '🇳🇿', region: 'Oceania', symbol: 'NZ$' },
    
    // Oriente Médio
    'AED': { code: 'AED', name: 'Dirham dos Emirados', flag: '🇦🇪', region: 'Oriente Médio', symbol: 'د.إ' },
    'SAR': { code: 'SAR', name: 'Riyal Saudita', flag: '🇸🇦', region: 'Oriente Médio', symbol: '﷼' },
    'ILS': { code: 'ILS', name: 'Shekel Israelense', flag: '🇮🇱', region: 'Oriente Médio', symbol: '₪' },
    'QAR': { code: 'QAR', name: 'Riyal do Catar', flag: '🇶🇦', region: 'Oriente Médio', symbol: 'ر.ق' },
    'KWD': { code: 'KWD', name: 'Dinar Kuwaitiano', flag: '🇰🇼', region: 'Oriente Médio', symbol: 'د.ك' },
    
    // África
    'ZAR': { code: 'ZAR', name: 'Rand Sul-Africano', flag: '🇿🇦', region: 'África', symbol: 'R' },
    'EGP': { code: 'EGP', name: 'Libra Egípcia', flag: '🇪🇬', region: 'África', symbol: 'E£' },
    'NGN': { code: 'NGN', name: 'Naira Nigeriana', flag: '🇳🇬', region: 'África', symbol: '₦' },
    'KES': { code: 'KES', name: 'Xelim Queniano', flag: '🇰🇪', region: 'África', symbol: 'KSh' },
    'MAD': { code: 'MAD', name: 'Dirham Marroquino', flag: '🇲🇦', region: 'África', symbol: 'د.م.' },
  };
  
  return currencyData[code] || null;
}

// Buscar taxa de câmbio de API externa
async function fetchExchangeRate(from: string, to: string): Promise<number> {
  const cacheKey = `rate:${from}:${to}`;
  const cached = exchangeCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < EXCHANGE_CACHE_DURATION) {
    console.log(`[Exchange] Cache hit for ${from}→${to}`);
    return cached.data;
  }
  
  try {
    // Usar ExchangeRate-API (gratuito)
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${from}`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    const rate = data.rates[to];
    
    if (!rate) {
      throw new Error(`Currency ${to} not found`);
    }
    
    // Cachear resultado
    exchangeCache.set(cacheKey, { data: rate, timestamp: Date.now() });
    
    console.log(`[Exchange] Fetched rate ${from}→${to}: ${rate}`);
    return rate;
  } catch (error) {
    console.error(`[Exchange] Error fetching rate:`, error);
    throw error; // Não usar fallback - forçar uso de API real
  }
}

// Calcular quanto levar em espécie
function calculateCashRecommendation(
  totalBudget: number,
  days: number,
  destination: string
): {
  cash: number;
  card: number;
  cashPercentage: number;
  cardPercentage: number;
  recommendations: string[];
} {
  // Recomendações variam por destino
  const cashRecommendations: Record<string, number> = {
    // Europa - menos espécie (cartão amplamente aceito)
    'France': 20,
    'Germany': 25,
    'Italy': 30,
    'Spain': 25,
    'Portugal': 30,
    'United Kingdom': 15,
    
    // Ásia - mais espécie (muitos lugares só aceitam dinheiro)
    'Japan': 40,
    'Thailand': 50,
    'China': 30,
    'India': 60,
    'Vietnam': 55,
    
    // Américas
    'United States': 20,
    'Canada': 20,
    'Mexico': 35,
    'Argentina': 40,
    'Chile': 30,
    
    // Oceania
    'Australia': 20,
    'New Zealand': 20,
    
    // África
    'South Africa': 35,
    'Morocco': 45,
    'Egypt': 50,
    
    // Oriente Médio
    'United Arab Emirates': 30,
  };
  
  const cashPercentage = cashRecommendations[destination] || 30; // Default 30%
  const cardPercentage = 100 - cashPercentage;
  
  const cash = (totalBudget * cashPercentage) / 100;
  const card = totalBudget - cash;
  
  const recommendations: string[] = [];
  
  // Recomendações gerais
  recommendations.push(
    `Leve ${cashPercentage}% em espécie para pequenas despesas e locais que não aceitam cartão.`
  );
  recommendations.push(
    `Use cartão de crédito internacional para ${cardPercentage}% dos gastos (hotéis, restaurantes, compras).`
  );
  
  // Recomendações específicas por destino
  if (cashPercentage >= 50) {
    recommendations.push(
      '⚠️ Este destino tem preferência por dinheiro em espécie. Certifique-se de trocar em casas de câmbio confiáveis.'
    );
  }
  
  if (cashPercentage <= 20) {
    recommendations.push(
      '💳 Cartões são amplamente aceitos neste destino. Priorize pagamentos digitais para segurança.'
    );
  }
  
  // Dicas de segurança
  recommendations.push(
    '🔐 Nunca carregue todo o dinheiro em um só lugar. Divida entre carteira, bolsa e cofre do hotel.'
  );
  
  recommendations.push(
    `💡 Para ${days} dias, considere levar dinheiro suficiente para os primeiros dias e sacar o restante em ATMs locais conforme necessário.`
  );
  
  return {
    cash: parseFloat(cash.toFixed(2)),
    card: parseFloat(card.toFixed(2)),
    cashPercentage,
    cardPercentage,
    recommendations,
  };
}

// GET /api/exchange/currencies - Lista de moedas disponíveis
app.get('/make-server-5f5857fb/api/exchange/currencies', async (c) => {
  try {
    console.log('[Exchange] GET available currencies');
    
    // Buscar moedas disponíveis da API
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    const availableCodes = Object.keys(data.rates);
    
    // Mapear para estrutura completa com informações de cada moeda
    const currencies = availableCodes.map((code: string) => {
      return getCurrencyInfo(code);
    }).filter((c: any) => c !== null);
    
    console.log(`[Exchange] ✅ Returning ${currencies.length} currencies`);
    
    return c.json({
      currencies,
      total: currencies.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Exchange] Error fetching currencies:', error);
    return c.json({ error: 'Failed to fetch currencies' }, 500);
  }
});

// GET /api/exchange/rate/:from/:to - Taxa de câmbio atual
app.get('/make-server-5f5857fb/api/exchange/rate/:from/:to', async (c) => {
  try {
    const from = c.req.param('from').toUpperCase();
    const to = c.req.param('to').toUpperCase();
    
    console.log(`[Exchange] GET rate ${from}→${to}`);
    
    const rate = await fetchExchangeRate(from, to);
    
    return c.json({
      from,
      to,
      rate,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Exchange] Error:', error);
    return c.json({ error: 'Failed to fetch exchange rate' }, 500);
  }
});

// GET /api/exchange/history/:from/:to - Histórico de 30 dias
app.get('/make-server-5f5857fb/api/exchange/history/:from/:to', async (c) => {
  try {
    const from = c.req.param('from').toUpperCase();
    const to = c.req.param('to').toUpperCase();
    const days = parseInt(c.req.query('days') || '30');
    
    console.log(`[Exchange] GET history ${from}→${to} (${days} days)`);
    
    // Buscar taxa atual
    const currentRate = await fetchExchangeRate(from, to);
    
    // Gerar histórico simulado
    const history = generateHistoricalRates(currentRate, days);
    
    return c.json({
      from,
      to,
      currentRate,
      history,
      period: `${days} days`,
    });
  } catch (error) {
    console.error('[Exchange] Error:', error);
    return c.json({ error: 'Failed to fetch history' }, 500);
  }
});

// GET /api/exchange/trend/:from/:to - Análise de tendência
app.get('/make-server-5f5857fb/api/exchange/trend/:from/:to', async (c) => {
  try {
    const from = c.req.param('from').toUpperCase();
    const to = c.req.param('to').toUpperCase();
    
    console.log(`[Exchange] GET trend ${from}→${to}`);
    
    // Buscar taxa atual e histórico
    const currentRate = await fetchExchangeRate(from, to);
    const history = generateHistoricalRates(currentRate, 30);
    
    // Analisar tendência
    const analysis = analyzeTrend(history);
    
    return c.json({
      from,
      to,
      currentRate,
      ...analysis,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Exchange] Error:', error);
    return c.json({ error: 'Failed to analyze trend' }, 500);
  }
});

// POST /api/exchange/calculate-cash - Calculadora de espécie
app.post('/make-server-5f5857fb/api/exchange/calculate-cash', async (c) => {
  try {
    const body = await c.req.json();
    const { totalBudget, days, destination, currency } = body;
    
    console.log(`[Exchange] Calculate cash for ${destination}`);
    
    if (!totalBudget || !days || !destination) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Calcular recomendação
    const recommendation = calculateCashRecommendation(
      totalBudget,
      days,
      destination
    );
    
    // Se tiver moeda estrangeira, converter valores
    let cashInLocalCurrency = recommendation.cash;
    let cardInLocalCurrency = recommendation.card;
    let exchangeRate = 1;
    
    if (currency && currency !== 'BRL') {
      exchangeRate = await fetchExchangeRate('BRL', currency);
      cashInLocalCurrency = recommendation.cash * exchangeRate;
      cardInLocalCurrency = recommendation.card * exchangeRate;
    }
    
    return c.json({
      totalBudget,
      days,
      destination,
      currency: currency || 'BRL',
      exchangeRate,
      inBRL: {
        cash: recommendation.cash,
        card: recommendation.card,
      },
      inLocalCurrency: {
        cash: parseFloat(cashInLocalCurrency.toFixed(2)),
        card: parseFloat(cardInLocalCurrency.toFixed(2)),
      },
      percentages: {
        cash: recommendation.cashPercentage,
        card: recommendation.cardPercentage,
      },
      recommendations: recommendation.recommendations,
    });
  } catch (error) {
    console.error('[Exchange] Error:', error);
    return c.json({ error: 'Failed to calculate cash' }, 500);
  }
});

console.log('[Exchange] ✅ Routes registered');

// ============================================
// IMPORTANTE: INSTRUÇÃO DE MIGRAÇÃO
// ============================================
console.log('');
console.log('='.repeat(60));
console.log('⚠️  ATENÇÃO: MIGRAÇÃO NECESSÁRIA');
console.log('='.repeat(60));
console.log('Para o sistema funcionar corretamente, execute este SQL no Supabase:');
console.log('');
console.log('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_city TEXT;');
console.log('');
console.log('Onde executar:');
console.log('1. Acesse o Supabase Dashboard');
console.log('2. Vá em "SQL Editor"');
console.log('3. Cole o comando acima');
console.log('4. Clique em "Run"');
console.log('='.repeat(60));
console.log('');

// Mount Travelpayouts routes
app.route('/make-server-5f5857fb/travelpayouts', travelpayoutsRoutes);

Deno.serve(app.fetch);