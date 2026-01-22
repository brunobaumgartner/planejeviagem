import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

export function DiagnosticPanel() {
  const { user, getAccessToken } = useAuth();
  const [diagnostic, setDiagnostic] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const runDiagnostics = async () => {
    setTesting(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      checks: {},
    };

    try {
      // 1. Verificar usuário
      results.checks.user = {
        status: user ? 'success' : 'error',
        message: user ? `Usuário autenticado: ${user.email}` : 'Nenhum usuário autenticado',
        data: user ? { id: user.id, email: user.email, role: user.role } : null,
      };

      // 2. Verificar token
      const token = await getAccessToken();
      results.checks.token = {
        status: token ? 'success' : 'error',
        message: token ? `Token obtido (${token.length} caracteres)` : 'Falha ao obter token',
        data: token ? { 
          length: token.length,
          preview: `${token.substring(0, 20)}...${token.substring(token.length - 20)}`,
          // Decode JWT header and payload (without verification)
          decoded: (() => {
            try {
              const parts = token.split('.');
              if (parts.length === 3) {
                const header = JSON.parse(atob(parts[0]));
                const payload = JSON.parse(atob(parts[1]));
                return { header, payload };
              }
              return null;
            } catch {
              return null;
            }
          })(),
        } : null,
      };

      // 3. Verificar projectId e publicAnonKey
      results.checks.config = {
        status: projectId && publicAnonKey ? 'success' : 'error',
        message: 'Configuração do Supabase',
        data: {
          projectId: projectId || 'MISSING',
          publicAnonKeyLength: publicAnonKey?.length || 0,
        },
      };

      // 4. Testar endpoint /health SEM autenticação
      try {
        const healthUrl = `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/health`;
        const healthResponse = await fetch(healthUrl);
        
        const healthText = await healthResponse.text();
        let healthData = null;
        try {
          healthData = JSON.parse(healthText);
        } catch {
          healthData = { rawText: healthText };
        }
        
        results.checks.health = {
          status: healthResponse.status === 401 ? 'info' : (healthResponse.ok ? 'success' : 'warning'),
          message: healthResponse.status === 401 
            ? 'Edge Functions requer autenticação (comportamento esperado)' 
            : `Servidor respondeu com status ${healthResponse.status}`,
          data: {
            url: healthUrl,
            status: healthResponse.status,
            statusText: healthResponse.statusText,
            response: healthData,
          },
        };
      } catch (err: any) {
        results.checks.health = {
          status: 'error',
          message: `Erro ao conectar com servidor: ${err.message}`,
          data: null,
        };
      }

      // 4.5. Testar endpoint /health COM publicAnonKey
      try {
        const healthUrl = `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/health`;
        const healthResponse = await fetch(healthUrl, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });
        
        const healthText = await healthResponse.text();
        let healthData = null;
        try {
          healthData = JSON.parse(healthText);
        } catch {
          healthData = { rawText: healthText };
        }
        
        results.checks.healthWithAnonKey = {
          status: healthResponse.ok ? 'success' : 'warning',
          message: `Health endpoint com publicAnonKey: ${healthResponse.status}`,
          data: {
            url: healthUrl,
            status: healthResponse.status,
            statusText: healthResponse.statusText,
            response: healthData,
          },
        };
      } catch (err: any) {
        results.checks.healthWithAnonKey = {
          status: 'error',
          message: `Erro ao conectar com servidor: ${err.message}`,
          data: null,
        };
      }

      // 5. Testar endpoint admin com token
      if (token) {
        try {
          const adminUrl = `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/admin/users`;
          const adminResponse = await fetch(adminUrl, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
              'X-User-Token': token,
            },
          });

          const responseText = await adminResponse.text();
          let responseData = null;
          try {
            responseData = JSON.parse(responseText);
          } catch {
            responseData = { rawText: responseText };
          }

          results.checks.adminEndpoint = {
            status: adminResponse.ok ? 'success' : 'error',
            message: `Admin endpoint respondeu com status ${adminResponse.status}`,
            data: {
              url: adminUrl,
              status: adminResponse.status,
              statusText: adminResponse.statusText,
              response: responseData,
            },
          };
        } catch (err: any) {
          results.checks.adminEndpoint = {
            status: 'error',
            message: `Erro ao chamar admin endpoint: ${err.message}`,
            data: null,
          };
        }
      }

      setDiagnostic(results);
    } catch (err: any) {
      results.checks.general = {
        status: 'error',
        message: `Erro geral: ${err.message}`,
        data: null,
      };
      setDiagnostic(results);
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-6 h-6" />
          <h3 className="text-xl font-bold">Painel de Diagnóstico</h3>
        </div>
        <p className="text-purple-100 text-sm">
          Execute testes de conectividade e autenticação para identificar problemas
        </p>
      </div>

      {/* Run Button */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <button
          onClick={runDiagnostics}
          disabled={testing}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {testing ? 'Executando testes...' : 'Executar Diagnóstico'}
        </button>
      </div>

      {/* Results */}
      {diagnostic && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h4 className="font-semibold text-lg mb-4">Resultados</h4>
            <p className="text-sm text-gray-600 mb-4">
              Executado em: {new Date(diagnostic.timestamp).toLocaleString('pt-BR')}
            </p>

            <div className="space-y-3">
              {Object.entries(diagnostic.checks).map(([key, check]: [string, any]) => (
                <div
                  key={key}
                  className={`p-4 rounded-lg border ${getStatusColor(check.status)}`}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(check.status)}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </div>
                      <div className="text-sm text-gray-700 mb-2">
                        {check.message}
                      </div>
                      {check.data && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                            Ver detalhes
                          </summary>
                          <pre className="mt-2 p-2 bg-white rounded border border-gray-200 overflow-x-auto">
                            {JSON.stringify(check.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-2">Próximos Passos:</p>
                <ul className="space-y-1 text-blue-800">
                  <li>• Se todos os testes passaram, o problema pode ser intermitente</li>
                  <li>• Se o token falhou, tente fazer logout e login novamente</li>
                  <li>• Se o admin endpoint falhou, verifique se você é um admin autorizado</li>
                  <li>• Compartilhe esses resultados para obter suporte técnico</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}