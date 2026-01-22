import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { CreditCard, Calendar, CheckCircle, Clock, XCircle, AlertCircle, DollarSign } from 'lucide-react';

interface Purchase {
  id: string;
  user_id: string;
  trip_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  payment_id?: string;
  created_at: string;
  paid_at?: string;
  delivered_at?: string;
  user_name?: string;
  user_email?: string;
  trip_destination?: string;
}

type StatusFilter = 'all' | 'pending' | 'completed' | 'failed';

export function PurchasesList() {
  const { getAccessToken } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const accessToken = await getAccessToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/admin/purchases`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-User-Token': accessToken || '',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar compras');
      }

      const data = await response.json();
      setPurchases(data.purchases || []);
    } catch (err: any) {
      console.error('[Admin] Erro ao carregar compras:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPurchases = purchases.filter((purchase) => {
    if (statusFilter === 'all') return true;
    return purchase.status === statusFilter;
  });

  const getStatusBadge = (status: Purchase['status']) => {
    const badges = {
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      processing: { label: 'Processando', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
      completed: { label: 'Concluído', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      failed: { label: 'Falhou', color: 'bg-red-100 text-red-700', icon: XCircle },
      refunded: { label: 'Reembolsado', color: 'bg-gray-100 text-gray-700', icon: XCircle },
    };

    const badge = badges[status];
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const statusCounts = {
    all: purchases.length,
    pending: purchases.filter(p => p.status === 'pending').length,
    completed: purchases.filter(p => p.status === 'completed').length,
    failed: purchases.filter(p => p.status === 'failed').length,
  };

  const totalRevenue = purchases
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Carregando compras...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-medium">Erro ao carregar compras</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={fetchPurchases}
          className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 rounded text-sm font-medium transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalRevenue, 'BRL')}
              </div>
              <div className="text-sm text-gray-600">Receita Total</div>
            </div>
          </div>
        </div>

        {[
          { key: 'all' as StatusFilter, label: 'Total', count: statusCounts.all, color: 'bg-gray-100' },
          { key: 'pending' as StatusFilter, label: 'Pendentes', count: statusCounts.pending, color: 'bg-yellow-100' },
          { key: 'completed' as StatusFilter, label: 'Concluídas', count: statusCounts.completed, color: 'bg-green-100' },
          { key: 'failed' as StatusFilter, label: 'Falharam', count: statusCounts.failed, color: 'bg-red-100' },
        ].map((stat) => (
          <button
            key={stat.key}
            onClick={() => setStatusFilter(stat.key)}
            className={`
              p-6 rounded-lg border-2 text-left transition-all
              ${statusFilter === stat.key ? 'ring-2 ring-sky-500 ring-offset-2 border-sky-200' : 'border-gray-200'}
              ${stat.color}
              hover:shadow-md
            `}
          >
            <div className="text-2xl font-bold text-gray-900">{stat.count}</div>
            <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
          </button>
        ))}
      </div>

      {/* Purchases List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Compras</h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredPurchases.length} {filteredPurchases.length === 1 ? 'compra' : 'compras'}
          </p>
        </div>

        {filteredPurchases.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            Nenhuma compra encontrada
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário / Viagem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Criação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Pagamento
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {purchase.user_name || purchase.user_email || 'Usuário'}
                        </div>
                        <div className="text-gray-500">
                          {purchase.trip_destination || 'Viagem'}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          ID: {purchase.id.substring(0, 8)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(purchase.amount, purchase.currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(purchase.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        {purchase.payment_method === 'mercadopago' ? 'Mercado Pago' : purchase.payment_method}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(purchase.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(purchase.paid_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}