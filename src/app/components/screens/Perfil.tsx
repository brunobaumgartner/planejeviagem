import {
  User as UserIcon,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  LogIn,
  Crown,
  Sparkles,
  Shield,
  ArrowLeft,
} from 'lucide-react';
import { Logo } from '../Logo';
import { TopNavigation } from '../TopNavigation';
import { BottomNavigation } from '../BottomNavigation';
import { UserBadge } from '../UserBadge';
import { useTrips } from '@/app/context/TripsContext';
import { useAuth } from '@/app/context/AuthContext';
import { useNavigation } from '@/app/context/NavigationContext';
import { EditProfileModal } from '@/app/components/EditProfileModal';
import { UpgradePremiumModal } from '@/app/components/UpgradePremiumModal';
import { useState } from 'react';

export function Perfil() {
  const { trips } = useTrips();
  const { user, isGuest, isPremium, signOut, upgradeToPremium } = useAuth();
  const { setCurrentScreen } = useNavigation();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Lista de emails admin
  const ADMIN_EMAILS = [
    'admin@planejefacil.com',
    'suporte@planejefacil.com',
    'teste@planejefacil.com', // Para testes
  ];

  const isAdmin = !isGuest && user?.email && ADMIN_EMAILS.includes(user.email);

  const handleSignOut = async () => {
    await signOut();
    setCurrentScreen('home');
  };

  const handleUpgradeToPremium = async () => {
    setIsUpgrading(true);
    const { error } = await upgradeToPremium();
    setIsUpgrading(false);

    if (error) {
      alert(error);
    } else {
      alert('Upgrade para Premium realizado com sucesso! 🎉');
    }
  };

  const menuItems = [
    {
      icon: UserIcon,
      label: 'Editar Dados da Conta',
      description: 'Alterar nome, email e senha',
      onClick: () => setIsEditProfileOpen(true),
      showOnlyLoggedIn: true,
    },
    {
      icon: Bell,
      label: 'Notificações',
      description: 'Gerencie suas preferências',
      onClick: () => {},
      showOnlyLoggedIn: true,
    },
    // {
    //   icon: Settings,
    //   label: 'Configurações',
    //   description: 'Preferências do aplicativo',
    //   onClick: () => alert('Em breve'),
    // },
    {
      icon: HelpCircle,
      label: 'Ajuda e Suporte',
      description: 'Central de ajuda',
      onClick: () => alert('Em breve'),
    },
  ];

  // Calcular estatísticas reais
  const totalTrips = trips.length;
  const completedTrips = trips.filter((trip) => trip.progress === 100).length;
  const totalTasks = trips.reduce((sum, trip) => sum + trip.tasks.length, 0);

  const stats = [
    { label: 'Viagens', value: totalTrips.toString() },
    { label: 'Concluídas', value: completedTrips.toString() },
    { label: 'Tarefas', value: totalTasks.toString() },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-0">
      <main className="px-4 pt-6">
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <UserIcon className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl">{isGuest ? 'Visitante' : user?.name}</h2>
                <UserBadge role={isGuest ? 'guest' : user!.role} size="sm" />
              </div>
              {!isGuest && (
                <p className="text-white/90 text-sm">{user?.email}</p>
              )}
            </div>
          </div>

          <div className="flex justify-around pt-4 border-t border-white/20">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-semibold mb-1">{stat.value}</p>
                <p className="text-white/90 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Guest CTA */}
        {isGuest && (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border-2 border-sky-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-sky-100 rounded-full">
                <Sparkles className="w-6 h-6 text-sky-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">
                  Crie sua conta gratuita
                </h3>
                <p className="text-sm text-gray-600">
                  Salve suas viagens na nuvem e acesse de qualquer dispositivo
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentScreen('signup')}
              className="w-full bg-sky-500 text-white py-3 rounded-lg font-medium hover:bg-sky-600 transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Criar conta grátis
            </button>
            <button
              onClick={() => setCurrentScreen('login')}
              className="w-full mt-2 text-sky-500 py-2 rounded-lg font-medium hover:bg-sky-50 transition-colors"
            >
              Já tenho conta
            </button>
          </div>
        )}

        {/* Premium Upgrade CTA */}
        {!isGuest && !isPremium && (
          <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl p-6 mb-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                <Crown className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Upgrade para Premium</h3>
                <p className="text-sm text-white/90">
                  Crie e edite seus próprios roteiros de viagem
                </p>
              </div>
            </div>
            <ul className="space-y-2 mb-4 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                Criação manual de roteiros
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                Edição completa de atividades
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                Liberdade total no planejamento
              </li>
            </ul>
            <button
              onClick={() => setShowUpgradeModal(true)}
              disabled={isUpgrading}
              className="w-full bg-white text-amber-500 py-3 rounded-lg font-bold hover:bg-amber-50 transition-colors disabled:opacity-50"
            >
              {isUpgrading ? 'Processando...' : 'Fazer Upgrade Agora'}
            </button>
            {/* <p className="text-center text-xs text-white/80 mt-2">
              * Para teste: upgrade gratuito
            </p> */}
          </div>
        )}

        {/* Premium Benefits */}
        {isPremium && (
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-amber-700">
              <Crown className="w-5 h-5" />
              <p className="font-medium">
                Você é Premium! Crie roteiros ilimitados.
              </p>
            </div>
          </div>
        )}

        {/* Data Storage Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800">
            {isGuest ? (
              <>
                <strong>💾 Modo Visitante:</strong> Seus dados estão salvos apenas
                neste dispositivo. Crie uma conta para sincronizar na nuvem.
              </>
            ) : (
              <>
                <strong>☁️ Dados Sincronizados:</strong> Suas viagens estão salvas
                na nuvem e acessíveis de qualquer dispositivo.
              </>
            )}
          </p>
        </div>

        {/* Admin Access (only for admins) */}
        {isAdmin && (
          <button
            onClick={() => setCurrentScreen('admin')}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-4 mb-6 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Shield className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-lg">Painel Administrativo</p>
                <p className="text-sm text-white/90">
                  Gerenciar usuários, viagens e orçamentos
                </p>
              </div>
              <ChevronRight className="w-6 h-6" />
            </div>
          </button>
        )}

        {/* Menu Items */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          {menuItems
            .filter(item => !item.showOnlyLoggedIn || !isGuest)
            .map((item, index, filteredItems) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                  index !== filteredItems.length - 1
                    ? 'border-b border-gray-100'
                    : ''
                }`}
              >
                <div className="p-2 bg-sky-100 text-sky-500 rounded-lg">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{item.label}</p>
                  </div>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            );
          })}
        </div>

        {/* Support Message */}
        <div className="bg-sky-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-700 text-center">
            Precisa de ajuda para organizar sua viagem?
            <br />
            <button className="text-sky-500 font-medium mt-1 cursor-pointer" onClick={() => setCurrentScreen("FaleConosco")}>
              Fale com nosso time
            </button>
          </p>
        </div>

        {/* Logout or Login */}
        {!isGuest ? (
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair da conta</span>
          </button>
        ) : (
          <button
            onClick={() => setCurrentScreen('login')}
            className="w-full flex items-center justify-center gap-2 py-3 text-sky-500 hover:bg-sky-50 rounded-xl transition-colors border-2 border-sky-200"
          >
            <LogIn className="w-5 h-5" />
            <span>Fazer login</span>
          </button>
        )}
      </main>

      <BottomNavigation activeTab="profile" />
      
      {/* Edit Profile Modal */}
      <EditProfileModal 
        isOpen={isEditProfileOpen} 
        onClose={() => setIsEditProfileOpen(false)} 
      />
      
      {/* Upgrade Premium Modal */}
      <UpgradePremiumModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
}