import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useNavigation } from '@/app/context/NavigationContext';
import { Users, Package, CreditCard, DollarSign, ArrowLeft, Activity, Database, AlertTriangle } from 'lucide-react';
import { UsersList } from '@/app/components/admin/UsersList';
import { TripsList } from '@/app/components/admin/TripsList';
import { PurchasesList } from '@/app/components/admin/PurchasesList';
import { BudgetEditor } from '@/app/components/admin/BudgetEditor';
import { ServiceStatus } from '@/app/components/admin/ServiceStatus';
import { DataUpdater } from '@/app/components/DataUpdater';
import { DiagnosticPanel } from '@/app/components/admin/DiagnosticPanel';

// Lista de admins autorizados (por email)
const ADMIN_EMAILS = [
  'admin@planejefacil.com',
  'suporte@planejefacil.com',
  'teste@planejefacil.com', // Para testes
];

type AdminTab = 'status' | 'users' | 'trips' | 'purchases' | 'budgets' | 'data' | 'diagnostic';

export function Admin() {
  const { user, isLoading } = useAuth();
  const { setCurrentScreen } = useNavigation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentTab, setCurrentTab] = useState<AdminTab>('trips');

  useEffect(() => {
    if (isLoading) return;
    
    if (!user || !ADMIN_EMAILS.includes(user.email)) {
      // Redireciona se não autorizado
      console.warn('[Admin] Acesso negado para:', user?.email);
      setCurrentScreen('home');
      return;
    }

    console.log('[Admin] Acesso autorizado para:', user.email);
    setIsAuthorized(true);
  }, [user, isLoading, setCurrentScreen]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Verificando permissões...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  const tabs = [
    { id: 'status' as AdminTab, label: 'Status', icon: Activity },
    { id: 'trips' as AdminTab, label: 'Viagens', icon: Package },
    { id: 'purchases' as AdminTab, label: 'Compras', icon: CreditCard },
    { id: 'users' as AdminTab, label: 'Usuários', icon: Users },
    { id: 'budgets' as AdminTab, label: 'Orçamentos', icon: DollarSign },
    { id: 'data' as AdminTab, label: 'Dados', icon: Database },
    { id: 'diagnostic' as AdminTab, label: 'Diagnóstico', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentScreen('home')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Voltar para Home"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Painel Admin</h1>
                <p className="text-sm text-gray-500">Gerenciamento do Planeje Viagem</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                Admin
              </div>
              <div className="text-sm text-gray-600">{user?.email}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${
                      currentTab === tab.id
                        ? 'border-sky-500 text-sky-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'status' && <ServiceStatus />}
        {currentTab === 'users' && <UsersList />}
        {currentTab === 'trips' && <TripsList />}
        {currentTab === 'purchases' && <PurchasesList />}
        {currentTab === 'budgets' && <BudgetEditor />}
        {currentTab === 'data' && <DataUpdater />}
        {currentTab === 'diagnostic' && <DiagnosticPanel />}
      </div>
    </div>
  );
}