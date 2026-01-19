import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';
import * as dataFetcher from './data-fetcher.tsx';

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

// Helper to extract access token from request
function getAccessToken(c: any): string | null {
  // Tentar primeiro o header customizado X-User-Token
  const customHeader = c.req.header('X-User-Token');
  console.log('[Auth] X-User-Token header:', customHeader ? 'presente' : 'ausente');
  if (customHeader) {
    console.log('[Auth] Usando X-User-Token');
    return customHeader;
  }
  
  // Fallback para Authorization header (compatibilidade)
  const authHeader = c.req.header('Authorization');
  console.log('[Auth] Authorization header:', authHeader ? 'presente' : 'ausente');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[Auth] Authorization header inválido ou ausente');
    return null;
  }
  console.log('[Auth] Usando Authorization header');
  return authHeader.substring(7);
}

// Helper to verify and extract user ID from JWT
async function verifyAndGetUserId(c: any): Promise<string | null> {
  const accessToken = getAccessToken(c);
  if (!accessToken) {
    console.error('[Auth] No access token found');
    return null;
  }

  try {
    // IMPORTANTE: Usar supabaseAnon para validar tokens de usuários
    // O SERVICE_ROLE_KEY não deve ser usado para validar JWTs de usuários
    const { data: { user }, error } = await supabaseAnon.auth.getUser(accessToken);
    
    if (error || !user) {
      console.error('[Auth] Invalid token:', error?.message);
      return null;
    }
    
    console.log('[Auth] Token válido para usuário:', user.email);
    return user.id;
  } catch (error) {
    console.error('[Auth] Error verifying token:', error);
    return null;
  }
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
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Email, senha e nome são obrigatórios' }, 400);
    }

    // Create user with Supabase Auth
    // Note: The trigger "on_auth_user_created" will automatically create the profile
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since we don't have email server configured
      user_metadata: { name },
    });

    if (authError) {
      console.error('Auth error:', authError);
      return c.json({ error: authError.message }, 400);
    }

    // Profile is automatically created by database trigger (handle_new_user)
    // No need to manually insert into profiles table

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
app.post('/make-server-5f5857fb/auth/upgrade-premium', async (c) => {
  try {
    const { userId } = await c.req.json();

    if (!userId) {
      return c.json({ error: 'userId é obrigatório' }, 400);
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

    if (!tripId || !amount) {
      return c.json({ error: 'tripId e amount são obrigatórios' }, 400);
    }

    // Generate purchase ID
    const purchaseId = `purchase_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create purchase record in KV store
    const purchase = {
      id: purchaseId,
      user_id: user.id,
      trip_id: tripId,
      amount,
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
        unit_price: amount,
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

// Get city budget data
app.get('/make-server-5f5857fb/budgets/:cityName', async (c) => {
  try {
    const cityName = c.req.param('cityName');

    const { data, error } = await supabaseAdmin
      .from('city_budgets')
      .select('*')
      .ilike('city_name', cityName)
      .single();

    if (error || !data) {
      // Return default budget if city not found
      return c.json({
        cityBudget: {
          city_name: cityName,
          country: 'Unknown',
          daily_budgets: {
            economy: 150,
            medium: 300,
            comfort: 500,
          },
          flight_estimates: {
            domestic: { min: 400, max: 1200 },
            international: { min: 1500, max: 5000 },
          },
          last_updated: new Date().toISOString(),
        },
      });
    }

    return c.json({ cityBudget: data });
  } catch (error) {
    console.error('Get city budget error:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
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
    console.log('[Notifications] Listando notificações...');
    
    const accessToken = getAccessToken(c);
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Token inválido' }, 401);
    }

    const allNotifications = await kv.getByPrefix('notification:');
    const userNotifications = allNotifications
      .filter(n => n.user_id === user.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const unreadCount = userNotifications.filter(n => !n.read).length;

    console.log('[Notifications] Encontradas:', userNotifications.length, 'Não lidas:', unreadCount);

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
    
    const accessToken = getAccessToken(c);
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Token inválido' }, 401);
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
    
    const accessToken = getAccessToken(c);
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Token inválido' }, 401);
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
    
    const accessToken = getAccessToken(c);
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Token inválido' }, 401);
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
    // Usar addressdetails e extratags para melhor filtragem
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&extratags=1&limit=20`,
      {
        headers: {
          'User-Agent': 'PlanejeFacil/1.0 (contact@planejefacil.com)'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar endereços no Nominatim');
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
        const rejectTypes = ['state', 'region', 'country', 'county', 'province', 'administrative'];
        if (rejectTypes.includes(type) || rejectTypes.includes(addressType)) {
          return false;
        }
        
        // Aceitar APENAS cidades, vilas e municípios
        const validTypes = ['city', 'town', 'village', 'municipality'];
        const isValidType = validTypes.includes(type) || validTypes.includes(addressType);
        
        // Flexibilizar: aceitar se for place OU se tiver tipo válido
        const isPlace = placeClass === 'place';
        
        // Deve ter endereço com cidade definida
        const hasCity = place.address?.city || place.address?.town || place.address?.village || place.address?.municipality;
        
        return (isPlace || isValidType) && hasCity;
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
      // Formatar resposta
      .map((place: any) => ({
        display_name: place.display_name,
        name: place.name,
        type: place.type,
        address: place.address,
        lat: place.lat,
        lon: place.lon,
        importance: place.importance
      }));

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

Deno.serve(app.fetch);