import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Users, Mail, Calendar, Crown, User as UserIcon, Shield, KeyRound } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'logged' | 'premium';
  avatar_url?: string;
  created_at: string;
  trips_count?: number;
  purchases_count?: number;
}

export function UsersList() {
  const { getAccessToken } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'logged' | 'premium'>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const accessToken = await getAccessToken();
      console.log('[Admin Users Frontend] ========== DIAGNÓSTICO ==========');
      console.log('[Admin Users Frontend] 1. projectId:', projectId);
      console.log('[Admin Users Frontend] 2. access_token existe?', !!accessToken);
      console.log('[Admin Users Frontend] 3. access_token length:', accessToken?.length || 0);
      
      if (!accessToken) {
        throw new Error('Token de acesso não disponível. Faça login novamente.');
      }

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/admin/users`;
      console.log('[Admin Users Frontend] 4. URL completa:', url);

      // CORREÇÃO: Usar publicAnonKey no Authorization e accessToken no X-User-Token
      const headers = {
        'Authorization': `Bearer ${publicAnonKey}`,
        'X-User-Token': accessToken,
      };
      console.log('[Admin Users Frontend] 5. Headers:', Object.keys(headers));

      const response = await fetch(url, { headers });

      console.log('[Admin Users Frontend] 6. Response status:', response.status);
      console.log('[Admin Users Frontend] 7. Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Admin Users Frontend] 8. Error response:', errorText);
        throw new Error(`Erro ao carregar usuários (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('[Admin Users Frontend] 9. Data received:', data);
      console.log('[Admin Users Frontend] 10. Users count:', data.users?.length || 0);
      
      setUsers(data.users || []);
    } catch (err: any) {
      console.error('[Admin Users Frontend] ❌ ERRO FINAL:', err);
      console.error('[Admin Users Frontend] ❌ Stack:', err.stack);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradeUser = async (userId: string, newRole: 'logged' | 'premium') => {
    try {
      const accessToken = await getAccessToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/admin/users/${userId}/role`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-User-Token': accessToken || '',
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao atualizar usuário');
      }

      // Atualizar lista local
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      console.log('[Admin] Usuário atualizado com sucesso');
    } catch (err: any) {
      console.error('[Admin] Erro ao atualizar usuário:', err);
      alert(err.message);
    }
  };

  const handleResetPassword = async (userEmail: string, userName: string) => {
    const confirmed = confirm(
      `Deseja realmente enviar um link de redefinição de senha para ${userName} (${userEmail})?`
    );

    if (!confirmed) return;

    try {
      const accessToken = await getAccessToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/admin/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-User-Token': accessToken || '',
          },
          body: JSON.stringify({ email: userEmail }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao enviar link de redefinição');
      }

      alert(`✅ Link de redefinição de senha enviado para ${userEmail}`);
      console.log('[Admin] Link de reset enviado com sucesso');
    } catch (err: any) {
      console.error('[Admin] Erro ao enviar link de reset:', err);
      alert(`❌ Erro: ${err.message}`);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    logged: users.filter(u => u.role === 'logged').length,
    premium: users.filter(u => u.role === 'premium').length,
  };

  const getRoleBadge = (role: User['role']) => {
    if (role === 'premium') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-xs font-medium">
          <Crown className="w-3 h-3" />
          Premium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
        <UserIcon className="w-3 h-3" />
        Usuário
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Carregando usuários...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-medium">Erro ao carregar usuários</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={fetchUsers}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-100 rounded-lg">
              <Users className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total de Usuários</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.logged}</div>
              <div className="text-sm text-gray-600">Usuários Logados</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg">
              <Crown className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.premium}</div>
              <div className="text-sm text-gray-600">Usuários Premium</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setRoleFilter('all')}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-colors
                ${roleFilter === 'all' 
                  ? 'bg-sky-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
              `}
            >
              Todos
            </button>
            <button
              onClick={() => setRoleFilter('logged')}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-colors
                ${roleFilter === 'logged' 
                  ? 'bg-sky-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
              `}
            >
              Logados
            </button>
            <button
              onClick={() => setRoleFilter('premium')}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-colors
                ${roleFilter === 'premium' 
                  ? 'bg-sky-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
              `}
            >
              Premium
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Usuários</h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'usuário' : 'usuários'}
          </p>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            Nenhum usuário encontrado
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <div key={user.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        {getRoleBadge(user.role)}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{user.email}</span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Cadastro: {formatDate(user.created_at)}
                        </div>
                        {user.trips_count !== undefined && (
                          <div>
                            {user.trips_count} {user.trips_count === 1 ? 'viagem' : 'viagens'}
                          </div>
                        )}
                        {user.purchases_count !== undefined && user.purchases_count > 0 && (
                          <div>
                            {user.purchases_count} {user.purchases_count === 1 ? 'compra' : 'compras'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex items-center gap-2">
                    {user.role === 'logged' && (
                      <button
                        onClick={() => handleUpgradeUser(user.id, 'premium')}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white rounded-lg text-xs font-medium transition-all"
                      >
                        <Crown className="w-3 h-3" />
                        Tornar Premium
                      </button>
                    )}
                    {user.role === 'premium' && (
                      <button
                        onClick={() => handleUpgradeUser(user.id, 'logged')}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        <Shield className="w-3 h-3" />
                        Remover Premium
                      </button>
                    )}
                    <button
                      onClick={() => handleResetPassword(user.email, user.name)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
                    >
                      <KeyRound className="w-3 h-3" />
                      Resetar Senha
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}