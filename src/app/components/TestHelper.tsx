import { useState } from 'react';
import { 
  Info, 
  X, 
  CreditCard, 
  CheckCircle, 
  User,
  Luggage,
  Star,
  Heart,
  Share2,
  Bell,
  CheckSquare,
  FileText,
  Shield,
  UserCog,
  Wallet,
  TrendingUp,
  LogIn,
  UserPlus,
  LogOut,
  Crown,
  DollarSign,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

type TestCategory = 'auth' | 'trips' | 'premium' | 'features' | 'admin';

interface TestStep {
  title: string;
  icon: string;
  category: TestCategory;
  instructions: string[];
  highlight?: {
    type: 'card' | 'success' | 'warning';
    title: string;
    content: string;
  };
}

export function TestHelper() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<TestCategory | 'all'>('all');

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-50 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
        title="Guia de Teste Completo"
      >
        <Info className="w-6 h-6" />
      </button>
    );
  }

  const allSteps: TestStep[] = [
    // ============================================
    // AUTENTICAÇÃO & USUÁRIOS
    // ============================================
    {
      title: 'Criar Conta (Modo Guest)',
      icon: '👤',
      category: 'auth',
      instructions: [
        'Ao abrir o app pela primeira vez, você está em modo "Guest"',
        'Modo Guest permite: explorar destinos e calcular orçamentos',
        'Modo Guest NÃO permite: criar viagens ou usar features avançadas',
        'Observe o ícone de usuário no canto superior direito',
      ],
      highlight: {
        type: 'warning',
        title: 'Modo Guest',
        content: 'Perfeito para conhecer o app sem compromisso! 🎯',
      },
    },
    {
      title: 'Criar Conta de Usuário',
      icon: '📝',
      category: 'auth',
      instructions: [
        'Clique no avatar (canto superior direito)',
        'Clique em "Entrar" → "Criar nova conta"',
        'Email: teste@planeje.com',
        'Senha: 123456',
        'Nome: João Teste',
        'Clique em "Criar conta"',
        'Você agora é usuário "Logado"!',
      ],
      highlight: {
        type: 'success',
        title: 'Conta Criada!',
        content: 'Agora você pode criar viagens e usar features básicas! ✅',
      },
    },
    {
      title: 'Login com Conta Existente',
      icon: '🔑',
      category: 'auth',
      instructions: [
        'Se já tem conta, clique no avatar',
        'Clique em "Entrar"',
        'Email: seu email cadastrado',
        'Senha: sua senha',
        'Clique em "Entrar"',
        'Sessão mantida entre recargas!',
      ],
    },
    {
      title: 'Redefinir Senha',
      icon: '🔐',
      category: 'auth',
      instructions: [
        'Na tela de login, clique em "Esqueceu a senha?"',
        'Digite seu email cadastrado',
        'Clique em "Enviar link de redefinição"',
        'Verifique seu email (link do Supabase)',
        'Clique no link e defina nova senha',
        'Faça login com a nova senha',
      ],
      highlight: {
        type: 'warning',
        title: 'Email Server',
        content: 'Configure um servidor de email no Supabase para produção!',
      },
    },
    {
      title: 'Atualizar Perfil',
      icon: '⚙️',
      category: 'auth',
      instructions: [
        'Clique no avatar → "Perfil"',
        'Clique em "Editar Dados da Conta"',
        'Use as abas: Nome, Email, Senha',
        'Altere o campo desejado',
        'Clique em "Salvar"',
        'Dados atualizados no sistema!',
      ],
      highlight: {
        type: 'card',
        title: 'Edição Segura',
        content: 'Seus dados são atualizados de forma segura no Supabase! 🔒',
      },
    },
    {
      title: 'Fazer Logout',
      icon: '🚪',
      category: 'auth',
      instructions: [
        'Clique no avatar',
        'Clique em "Sair"',
        'Você volta ao modo Guest',
        'Suas viagens e dados estão salvos!',
        'Faça login novamente quando quiser',
      ],
    },

    // ============================================
    // VIAGENS
    // ============================================
    {
      title: 'Criar Primeira Viagem',
      icon: '🧳',
      category: 'trips',
      instructions: [
        'Faça login primeiro (usuários Guest não podem criar viagens)',
        'Vá para "Minhas Viagens" (ícone de mala)',
        'Clique no botão "+" (canto inferior direito)',
        'Destino: Rio de Janeiro',
        'Data início: 7 dias no futuro',
        'Data fim: 14 dias no futuro (7 dias de viagem)',
        'Orçamento: R$ 5.000',
        'Clique em "Criar viagem"',
      ],
      highlight: {
        type: 'success',
        title: 'Viagem Criada!',
        content: 'Sua viagem foi salva e está em modo "Planejamento" 🎉',
      },
    },
    {
      title: 'Ver Recomendações de Orçamento',
      icon: '💰',
      category: 'trips',
      instructions: [
        'Ao criar/editar viagem, veja a seção "Recomendações"',
        'Sistema mostra 3 níveis: Econômico, Moderado, Conforto',
        'Dados baseados em 18 cidades brasileiras',
        'Inclui: hospedagem, alimentação, transporte e passeios',
        'Use como referência para seu orçamento!',
      ],
      highlight: {
        type: 'card',
        title: 'Orçamento Inteligente',
        content: 'Estimativas realistas para planejar melhor! 📊',
      },
    },
    {
      title: 'Editar Viagem',
      icon: '✏️',
      category: 'trips',
      instructions: [
        'Na lista de viagens, clique na viagem',
        'Clique no ícone de editar (lápis)',
        'Altere qualquer informação (destino, datas, orçamento)',
        'Clique em "Salvar alterações"',
        'Viagem atualizada!',
      ],
    },
    {
      title: 'Excluir Viagem',
      icon: '🗑️',
      category: 'trips',
      instructions: [
        'Na lista de viagens, clique na viagem',
        'Clique no ícone de lixeira',
        'Confirme a exclusão no modal',
        'Viagem removida permanentemente',
        'Cuidado: ação irreversível!',
      ],
    },
    {
      title: 'Filtrar e Buscar Viagens',
      icon: '🔍',
      category: 'trips',
      instructions: [
        'Na aba "Minhas Viagens", use a busca no topo',
        'Digite o nome do destino (ex: "Rio")',
        'Use os filtros: Planejamento, Em Progresso, Concluídas',
        'Viagens filtradas em tempo real',
        'Limpe a busca para ver todas novamente',
      ],
    },
    {
      title: 'Adicionar Anexos nas Tarefas (NOVO!)',
      icon: '📎',
      category: 'trips',
      instructions: [
        '🎯 Vá para "Minhas Viagens" (aba com ícone de mala)',
        '➕ Crie uma viagem ou abra uma existente',
        '✅ Adicione uma tarefa (ex: "Comprar passagem aérea")',
        '📎 Abaixo da tarefa, clique em "Adicionar anexo"',
        '🔗 Escolha o tipo: Link, Imagem ou Documento',
        '📄 Link: Cole URL da passagem (ex: Decolar, MaxMilhas)',
        '🖼️ Imagem: Upload de screenshot ou voucher em imagem',
        '📋 Documento: Upload de PDF da passagem ou reserva',
        '💾 Anexo salvo automaticamente!',
        '👁️ Clique no anexo para abrir/baixar quando precisar',
      ],
      highlight: {
        type: 'success',
        title: 'Guarde Tudo em um Só Lugar!',
        content: 'Passagens, vouchers, reservas de hotel, ingressos - tudo organizado nas tarefas! 🎫✈️🏨',
      },
    },

    // ============================================
    // PREMIUM & PAGAMENTOS
    // ============================================
    {
      title: 'Comprar Planejamento (Upgrade Premium)',
      icon: '⭐',
      category: 'premium',
      instructions: [
        'Crie uma viagem primeiro (modo Logado)',
        'Na lista, clique em "Comprar Planejamento Personalizado"',
        'Modal exibe benefícios: roteiro completo, checklist, recomendações',
        'Preço: R$ 1,00',
        'Clique em "Comprar Agora"',
        'Aguarde redirecionamento ao Mercado Pago',
      ],
      highlight: {
        type: 'card',
        title: 'Upgrade para Premium',
        content: 'Ganhe acesso a roteiros detalhados e editor manual! 👑',
      },
    },
    {
      title: 'Pagar com Mercado Pago (Teste)',
      icon: '💳',
      category: 'premium',
      instructions: [
        'No checkout do Mercado Pago, escolha "Cartão de crédito"',
        'Número: 5031 4332 1540 6351',
        'Vencimento: 11/25',
        'CVV: 123',
        'Nome: APRO (importante para aprovar!)',
        'CPF: qualquer válido',
        'Clique em "Pagar"',
        'Aguarde confirmação',
      ],
      highlight: {
        type: 'card',
        title: 'Cartão de Teste',
        content: '5031 4332 1540 6351 | 11/25 | CVV: 123 | Nome: APRO',
      },
    },
    {
      title: 'Verificar Upgrade Premium',
      icon: '✨',
      category: 'premium',
      instructions: [
        'Após pagamento aprovado, volte ao app',
        'Clique no avatar → veja badge "Premium"',
        'Na viagem comprada, veja status "EM PROGRESSO"',
        'Novas features desbloqueadas: Editor de Roteiro Manual',
        'Seu perfil agora é Premium permanentemente!',
      ],
      highlight: {
        type: 'success',
        title: 'Premium Ativo!',
        content: 'Você agora tem acesso total ao sistema! 🎊',
      },
    },
    {
      title: 'Teste Rápido de Premium (Desenvolvimento)',
      icon: '⚡',
      category: 'premium',
      instructions: [
        'ATENÇÃO: Use apenas em ambiente de desenvolvimento!',
        'Clique no avatar → "Testar Upgrade Premium"',
        'Confirmação instantânea (sem pagamento)',
        'Perfil muda para Premium',
        'Útil para testar features sem passar pelo fluxo completo',
      ],
      highlight: {
        type: 'warning',
        title: 'Apenas para Testes',
        content: 'Remova esta opção em produção! ⚠️',
      },
    },

    // ============================================
    // FUNCIONALIDADES ESSENCIAIS
    // ============================================
    {
      title: 'Sistema de Notificações',
      icon: '🔔',
      category: 'features',
      instructions: [
        'Clique no ícone de sino (topo da tela)',
        'Veja notificações do sistema',
        'Tipos: bem-vindo, viagem criada, pagamento confirmado',
        'Clique em uma notificação para marcá-la como lida',
        'Badge mostra quantidade de não lidas',
        'Limpe todas com o botão no topo do painel',
      ],
    },
    {
      title: 'Compartilhar Viagem',
      icon: '🔗',
      category: 'features',
      instructions: [
        'Clique no ícone de compartilhar na viagem',
        'Modal exibe resumo da viagem',
        'Clique em "Copiar Link" para compartilhar',
        'Link copiado para área de transferência',
        'Cole o link em WhatsApp, email, etc.',
        'Destinatário vê resumo público da viagem',
      ],
      highlight: {
        type: 'card',
        title: 'Compartilhamento',
        content: 'Compartilhe suas viagens com amigos e família! 🎁',
      },
    },
    {
      title: 'Checklist de Bagagem',
      icon: '✅',
      category: 'features',
      instructions: [
        'Abra uma viagem',
        'Clique na aba "Checklist de Bagagem"',
        'Veja categorias: Documentos, Roupas, Eletrônicos, Higiene, etc.',
        'Marque itens conforme você os prepara',
        'Progresso atualizado em tempo real',
        'Adicione itens personalizados se necessário',
      ],
    },
    {
      title: 'Documentos Importantes',
      icon: '📄',
      category: 'features',
      instructions: [
        'Abra uma viagem',
        'Clique na aba "Documentos"',
        'Veja lista de documentos essenciais',
        'RG, CPF, Passaporte, Visa, Seguro Viagem, etc.',
        'Marque documentos que você já tem',
        'Status mostra quantidade preparada vs total',
      ],
    },

    // ============================================
    // PAINEL ADMINISTRATIVO
    // ============================================
    {
      title: 'Acessar Painel Admin',
      icon: '👨‍💼',
      category: 'admin',
      instructions: [
        'IMPORTANTE: Apenas usuários com role "admin" podem acessar',
        'Faça login com conta admin',
        'Clique no avatar → "Admin"',
        'Painel administrativo abre',
        'Visão geral do sistema e usuários',
      ],
      highlight: {
        type: 'warning',
        title: 'Acesso Restrito',
        content: 'Configure o primeiro admin manualmente no banco de dados!',
      },
    },
    {
      title: 'Gerenciar Usuários (Admin)',
      icon: '👥',
      category: 'admin',
      instructions: [
        'No painel admin, veja aba "Usuários"',
        'Lista todos os usuários do sistema',
        'Informações: email, role, data de cadastro',
        'Altere role de usuários (guest → logado → premium → admin)',
        'Use busca para encontrar usuário específico',
        'Mudanças salvas automaticamente',
      ],
    },
    {
      title: 'Gerenciar Viagens (Admin)',
      icon: '🗺️',
      category: 'admin',
      instructions: [
        'No painel admin, veja aba "Viagens"',
        'Lista TODAS as viagens do sistema',
        'Veja viagens de todos os usuários',
        'Informações: destino, usuário, status, orçamento',
        'Altere status de viagens se necessário',
        'Útil para suporte e moderação',
      ],
    },
    {
      title: 'Dashboard de Estatísticas (Admin)',
      icon: '📊',
      category: 'admin',
      instructions: [
        'No painel admin, veja cards no topo',
        'Total de Usuários (breakdown por role)',
        'Total de Viagens (breakdown por status)',
        'Receita Total (soma dos pagamentos)',
        'Métricas atualizadas em tempo real',
        'Use para monitorar crescimento do app',
      ],
    },
    {
      title: 'Atualizar Dados Automáticos',
      icon: '🔄',
      category: 'admin',
      instructions: [
        'Entre como admin',
        'Vá para \"Painel Admin\"',
        'Clique na aba \"Dados\"',
        'Clique em \"Atualizar Dados\"',
        'Aguarde 10-15 segundos',
        'Dados atualizados com sucesso! 🎉',
      ],
      highlight: {
        type: 'card',
        title: 'Dados Reais e Atualizados',
        content: 'Sistema calcula preços baseado em índices de custo de vida reais! 📊',
      },
    },
    {
      title: 'Adicionar Anexos nas Tarefas',
      icon: '📎',
      category: 'admin',
      instructions: [
        '🔐 Entre como admin (admin@planeje.com / admin123)',
        '📋 Vá para \"Painel Admin\" → \"Viagens\"',
        '🎯 Encontre uma viagem com status \"Aguardando\" ou \"Em Andamento\"',
        '✏️ Clique em \"Entregar Planejamento\" (botão azul)',
        '📝 Na aba \"Checklist\", crie ou edite uma tarefa',
        '📎 Clique em \"Adicionar anexo\" abaixo da tarefa',
        '🔗 Escolha: Link, Imagem ou Documento',
        '✅ Anexo aparece com ícone, nome e botões de ação',
        '💾 Clique em \"Marcar como Entregue\" para salvar tudo',
      ],
      highlight: {
        type: 'success',
        title: 'Anexos Funcionais!',
        content: 'Links, imagens (JPG/PNG) e documentos (PDF/Word/Excel) até 10MB! 📄🖼️',
      },
    },
  ];

  const categories = [
    { id: 'all' as const, name: 'Todos', icon: Info, color: 'purple' },
    { id: 'auth' as const, name: 'Autenticação', icon: User, color: 'blue' },
    { id: 'trips' as const, name: 'Viagens', icon: Luggage, color: 'green' },
    { id: 'premium' as const, name: 'Premium', icon: Crown, color: 'yellow' },
    { id: 'features' as const, name: 'Features', icon: Star, color: 'pink' },
    { id: 'admin' as const, name: 'Admin', icon: Shield, color: 'red' },
  ];

  const filteredSteps = selectedCategory === 'all' 
    ? allSteps 
    : allSteps.filter(step => step.category === selectedCategory);

  const currentStepData = filteredSteps[currentStep - 1];

  const handleNext = () => {
    if (currentStep < filteredSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCategoryChange = (category: TestCategory | 'all') => {
    setSelectedCategory(category);
    setCurrentStep(1); // Reset to first step
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{currentStepData?.icon || '📚'}</div>
              <div>
                <h2 className="text-lg font-semibold">Guia de Teste Completo</h2>
                <p className="text-sm text-gray-600">
                  Passo {currentStep} de {filteredSteps.length} {selectedCategory !== 'all' && `(${categories.find(c => c.id === selectedCategory)?.name})`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              const colorClasses = {
                purple: isActive ? 'bg-purple-100 text-purple-700 border-purple-300' : 'bg-gray-50 text-gray-600 border-gray-200',
                blue: isActive ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-gray-50 text-gray-600 border-gray-200',
                green: isActive ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-50 text-gray-600 border-gray-200',
                yellow: isActive ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'bg-gray-50 text-gray-600 border-gray-200',
                pink: isActive ? 'bg-pink-100 text-pink-700 border-pink-300' : 'bg-gray-50 text-gray-600 border-gray-200',
                red: isActive ? 'bg-red-100 text-red-700 border-red-300' : 'bg-gray-50 text-gray-600 border-gray-200',
              };

              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium whitespace-nowrap transition-colors ${colorClasses[cat.color]}`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {currentStepData && (
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">{currentStepData.title}</h3>
            
            <ul className="space-y-3 mb-4">
              {currentStepData.instructions.map((instruction, index) => (
                <li key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-700 flex-1">{instruction}</p>
                </li>
              ))}
            </ul>

            {/* Highlight Box */}
            {currentStepData.highlight && (
              <div className={`mt-4 p-4 rounded-xl ${
                currentStepData.highlight.type === 'card' ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white' :
                currentStepData.highlight.type === 'success' ? 'bg-green-50 border-2 border-green-200' :
                'bg-yellow-50 border-2 border-yellow-200'
              }`}>
                <h4 className={`font-semibold mb-2 flex items-center gap-2 ${
                  currentStepData.highlight.type === 'card' ? 'text-white' :
                  currentStepData.highlight.type === 'success' ? 'text-green-700' :
                  'text-yellow-700'
                }`}>
                  {currentStepData.highlight.type === 'card' && <CreditCard className="w-5 h-5" />}
                  {currentStepData.highlight.type === 'success' && <CheckCircle className="w-5 h-5" />}
                  {currentStepData.highlight.type === 'warning' && '⚠️'}
                  {currentStepData.highlight.title}
                </h4>
                <p className={`text-sm ${
                  currentStepData.highlight.type === 'card' ? 'text-white' :
                  currentStepData.highlight.type === 'success' ? 'text-green-600' :
                  'text-yellow-600'
                }`}>
                  {currentStepData.highlight.content}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Progress bar */}
        <div className="px-6 pb-4">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / filteredSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="sticky bottom-0 bg-white p-6 border-t border-gray-200">
          <div className="flex gap-3 mb-3">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
            <button
              onClick={handleNext}
              disabled={currentStep === filteredSteps.length}
              className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {currentStep === filteredSteps.length ? 'Concluído ✓' : (
                <>
                  Próximo
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-center text-gray-500">
            💡 Você pode fechar este guia a qualquer momento clicando no X ou fora do modal
          </p>
        </div>
      </div>
    </div>
  );
}