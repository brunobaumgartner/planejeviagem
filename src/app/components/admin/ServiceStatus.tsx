import { useState, useEffect } from 'react';
import { 
  Activity, Database, CreditCard, Server, Cloud, 
  CheckCircle2, AlertCircle, XCircle, Clock, RefreshCw,
  Zap, Lock, Users, FileText
} from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { LoadingState } from '@/app/components/ui/LoadingState';

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  message: string;
  responseTime?: number;
  lastChecked?: string;
  details?: Record<string, any>;
}

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  services: {
    database: ServiceHealth;
    auth: ServiceHealth;
    storage: ServiceHealth;
    server: ServiceHealth;
    mercadopago?: ServiceHealth;
  };
  stats?: {
    totalUsers: number;
    totalTrips: number;
    totalPurchases: number;
  };
}

export function ServiceStatus() {
  const [healthData, setHealthData] = useState<HealthCheckResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    // Carregar na montagem
    checkHealth();

    // Auto-refresh a cada 5 minutos se ativado
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        checkHealth();
      }, 5 * 60 * 1000); // 5 minutos
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const checkHealth = async () => {
    try {
      setIsLoading(true);
      const startTime = Date.now();
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/health`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        setHealthData({
          ...data,
          services: {
            ...data.services,
            server: {
              ...data.services.server,
              responseTime,
            }
          }
        });
        setLastCheck(new Date());
      } else {
        // Servidor com erro
        setHealthData({
          status: 'down',
          timestamp: new Date().toISOString(),
          services: {
            database: { name: 'Database', status: 'unknown', message: 'Não foi possível verificar' },
            auth: { name: 'Authentication', status: 'unknown', message: 'Não foi possível verificar' },
            storage: { name: 'Storage', status: 'unknown', message: 'Não foi possível verificar' },
            server: { 
              name: 'Server', 
              status: 'error', 
              message: `HTTP ${response.status}: ${response.statusText}`,
              responseTime 
            },
          },
        });
      }
    } catch (error) {
      console.error('Erro ao verificar health:', error);
      setHealthData({
        status: 'down',
        timestamp: new Date().toISOString(),
        services: {
          database: { name: 'Database', status: 'unknown', message: 'Não foi possível verificar' },
          auth: { name: 'Authentication', status: 'unknown', message: 'Não foi possível verificar' },
          storage: { name: 'Storage', status: 'unknown', message: 'Não foi possível verificar' },
          server: { 
            name: 'Server', 
            status: 'error', 
            message: error instanceof Error ? error.message : 'Erro de conexão' 
          },
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: ServiceHealth['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="size-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="size-5 text-amber-600" />;
      case 'error':
        return <XCircle className="size-5 text-red-600" />;
      default:
        return <Clock className="size-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ServiceHealth['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getOverallStatusColor = (status: HealthCheckResponse['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-amber-500';
      case 'down':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const serviceIcons: Record<string, any> = {
    database: Database,
    auth: Lock,
    storage: Cloud,
    server: Server,
    mercadopago: CreditCard,
  };

  if (!healthData && isLoading) {
    return <LoadingState message="Verificando status dos serviços..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="size-7 text-sky-500" />
            Status dos Serviços
          </h1>
          <p className="text-gray-600 mt-1">
            Monitore a saúde de todos os serviços e APIs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-sky-500 focus:ring-sky-500"
            />
            Auto-refresh (5min)
          </label>

          <button
            onClick={checkHealth}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Status Geral */}
      {healthData && (
        <div className={`rounded-xl p-6 border-2 ${getStatusColor(
          healthData.status === 'healthy' ? 'healthy' 
          : healthData.status === 'degraded' ? 'warning' 
          : 'error'
        )}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${getOverallStatusColor(healthData.status)}`}>
                <Zap className="size-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {healthData.status === 'healthy' && '✅ Todos os Sistemas Operacionais'}
                  {healthData.status === 'degraded' && '⚠️ Sistema com Avisos'}
                  {healthData.status === 'down' && '🔴 Sistema com Problemas'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {lastCheck && `Última verificação: ${lastCheck.toLocaleString('pt-BR')}`}
                </p>
              </div>
            </div>

            {healthData.stats && (
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-sky-600">{healthData.stats.totalUsers}</div>
                  <div className="text-gray-600">Usuários</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{healthData.stats.totalTrips}</div>
                  <div className="text-gray-600">Viagens</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{healthData.stats.totalPurchases}</div>
                  <div className="text-gray-600">Compras</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cards de Serviços */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {healthData && Object.entries(healthData.services).map(([key, service]) => {
          const Icon = serviceIcons[key] || Server;
          
          return (
            <div
              key={key}
              className={`rounded-xl p-5 border-2 ${getStatusColor(service.status)} transition-all hover:shadow-md`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Icon className="size-5 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    {service.responseTime && (
                      <p className="text-xs text-gray-500">{service.responseTime}ms</p>
                    )}
                  </div>
                </div>
                {getStatusIcon(service.status)}
              </div>

              <p className="text-sm text-gray-700 mb-3">{service.message}</p>

              {service.details && (
                <div className="space-y-1 pt-3 border-t border-gray-200">
                  {Object.entries(service.details).map(([detailKey, detailValue]) => (
                    <div key={detailKey} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{detailKey}:</span>
                      <span className="font-medium text-gray-900">
                        {typeof detailValue === 'boolean' 
                          ? (detailValue ? '✅ Sim' : '❌ Não')
                          : String(detailValue)
                        }
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {service.lastChecked && (
                <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                  Verificado: {new Date(service.lastChecked).toLocaleString('pt-BR')}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Informações Adicionais */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <FileText className="size-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-2">ℹ️ Sobre as Verificações</p>
            <ul className="space-y-1 text-blue-800">
              <li>• <strong>Database:</strong> Verifica conexão com Supabase PostgreSQL</li>
              <li>• <strong>Authentication:</strong> Testa sistema de autenticação</li>
              <li>• <strong>Storage:</strong> Verifica buckets de armazenamento</li>
              <li>• <strong>Server:</strong> Status do servidor Hono/Deno</li>
              <li>• <strong>Mercado Pago:</strong> Verifica se a chave de API está configurada</li>
            </ul>
            <p className="mt-3 text-xs text-blue-700">
              💡 <strong>Dica:</strong> As verificações são feitas sob demanda para não consumir limites de API. 
              Use o auto-refresh com moderação.
            </p>
          </div>
        </div>
      </div>

      {/* Configurações do Ambiente */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Server className="size-5" />
          Configurações do Ambiente
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Project ID:</span>
            <p className="font-mono text-gray-900 mt-1">{projectId}</p>
          </div>
          <div>
            <span className="text-gray-600">API URL:</span>
            <p className="font-mono text-gray-900 mt-1 break-all">
              {`https://${projectId}.supabase.co`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
