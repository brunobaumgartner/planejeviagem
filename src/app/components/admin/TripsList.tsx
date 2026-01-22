import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Package, Calendar, DollarSign, Edit, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { DeliverPlanning } from './DeliverPlanning';

interface Trip {
  id: string;
  user_id: string;
  destination: string;
  country?: string;
  start_date: string;
  end_date: string;
  budget: string;
  budget_amount?: number;
  progress: number;
  tasks: any[];
  itinerary?: any[];
  status: 'planning' | 'purchased' | 'in_progress' | 'delivered' | 'completed';
  purchase_id?: string;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

type StatusFilter = 'all' | 'planning' | 'purchased' | 'in_progress' | 'delivered';

export function TripsList() {
  const { getAccessToken } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedTripForDelivery, setSelectedTripForDelivery] = useState<Trip | null>(null);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const accessToken = await getAccessToken();
      console.log('[Admin Trips Frontend] ========== DIAGNÓSTICO ==========');
      console.log('[Admin Trips Frontend] 1. projectId:', projectId);
      console.log('[Admin Trips Frontend] 2. access_token existe?', !!accessToken);
      console.log('[Admin Trips Frontend] 3. access_token length:', accessToken?.length || 0);
      
      if (!accessToken) {
        throw new Error('Token de acesso não disponível. Faça login novamente.');
      }

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/admin/trips`;
      console.log('[Admin Trips Frontend] 4. URL completa:', url);

      // CORREÇÃO: Usar publicAnonKey no Authorization e accessToken no X-User-Token
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        'X-User-Token': accessToken,
      };
      console.log('[Admin Trips Frontend] 5. Headers:', Object.keys(headers));

      const response = await fetch(url, { headers });

      console.log('[Admin Trips Frontend] 6. Response status:', response.status);
      console.log('[Admin Trips Frontend] 7. Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Admin Trips Frontend] 8. Error response:', errorText);
        throw new Error(`Erro ao carregar viagens (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('[Admin Trips Frontend] 9. Data received:', data);
      console.log('[Admin Trips Frontend] 10. Trips count:', data.trips?.length || 0);
      
      setTrips(data.trips || []);
    } catch (err: any) {
      console.error('[Admin Trips Frontend] ❌ ERRO FINAL:', err);
      console.error('[Admin Trips Frontend] ❌ Stack:', err.stack);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTrips = trips.filter((trip) => {
    if (statusFilter === 'all') return true;
    return trip.status === statusFilter;
  });

  const getStatusBadge = (status: Trip['status']) => {
    const badges = {
      planning: { label: 'Planejando', color: 'bg-gray-100 text-gray-700', icon: Package },
      purchased: { label: 'Aguardando Confirmação', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      in_progress: { label: 'Em Andamento', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
      delivered: { label: 'Entregue', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      completed: { label: 'Completo', color: 'bg-purple-100 text-purple-700', icon: CheckCircle },
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const statusCounts = {
    all: trips.length,
    planning: trips.filter(t => t.status === 'planning').length,
    purchased: trips.filter(t => t.status === 'purchased').length,
    in_progress: trips.filter(t => t.status === 'in_progress').length,
    delivered: trips.filter(t => t.status === 'delivered').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Carregando viagens...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-medium">Erro ao carregar viagens</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={fetchTrips}
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
        {[
          { key: 'all' as StatusFilter, label: 'Total', count: statusCounts.all, color: 'bg-gray-50 border-gray-200' },
          { key: 'planning' as StatusFilter, label: 'Planejando', count: statusCounts.planning, color: 'bg-gray-50 border-gray-200' },
          { key: 'purchased' as StatusFilter, label: 'Aguardando', count: statusCounts.purchased, color: 'bg-yellow-50 border-yellow-200' },
          { key: 'in_progress' as StatusFilter, label: 'Em Andamento', count: statusCounts.in_progress, color: 'bg-blue-50 border-blue-200' },
          { key: 'delivered' as StatusFilter, label: 'Entregues', count: statusCounts.delivered, color: 'bg-green-50 border-green-200' },
        ].map((stat) => (
          <button
            key={stat.key}
            onClick={() => setStatusFilter(stat.key)}
            className={`
              p-4 rounded-lg border-2 text-left transition-all
              ${statusFilter === stat.key ? 'ring-2 ring-sky-500 ring-offset-2' : ''}
              ${stat.color}
              hover:shadow-md
            `}
          >
            <div className="text-2xl font-bold text-gray-900">{stat.count}</div>
            <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
          </button>
        ))}
      </div>

      {/* Trips List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">
            {statusFilter === 'all' ? 'Todas as Viagens' : `Viagens - ${statusFilter}`}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredTrips.length} {filteredTrips.length === 1 ? 'viagem' : 'viagens'}
          </p>
        </div>

        {filteredTrips.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            Nenhuma viagem encontrada
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTrips.map((trip) => (
              <div key={trip.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {trip.destination}
                      </h3>
                      {getStatusBadge(trip.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                          {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span>{trip.budget}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span>
                          {trip.user_name || trip.user_email || 'Usuário'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      ID: {trip.id.substring(0, 8)}...
                      {trip.purchase_id && ` • Compra: ${trip.purchase_id.substring(0, 8)}...`}
                    </div>
                  </div>

                  <div className="ml-4">
                    {(trip.status === 'in_progress' || trip.status === 'purchased') && (
                      <button
                        onClick={() => setSelectedTripForDelivery(trip)}
                        className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Entregar Planejamento
                      </button>
                    )}
                    {trip.status === 'delivered' && (
                      <button
                        onClick={() => setSelectedTripForDelivery(trip)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Entrega */}
      {selectedTripForDelivery && (
        <DeliverPlanning
          trip={selectedTripForDelivery}
          onClose={() => setSelectedTripForDelivery(null)}
          onDelivered={() => {
            setSelectedTripForDelivery(null);
            fetchTrips();
          }}
        />
      )}
    </div>
  );
}