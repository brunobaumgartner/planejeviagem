# 📱 Planeje Fácil - Documentação Completa

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Telas e Funcionalidades](#telas-e-funcionalidades)
4. [Componentes](#componentes)
5. [Contextos e Estado](#contextos-e-estado)
6. [Design System](#design-system)
7. [Guia de Uso](#guia-de-uso)

---

## 🎯 Visão Geral

**Planeje Fácil** é um aplicativo de planejamento de viagens com abordagem não-comercial e educativa, focado em ajudar usuários a explorar opções sem pressão de vendas.

### Características Principais
- ✅ Tom acolhedor e de apoio
- ✅ Exploração gratuita
- ✅ Assistência humana opcional
- ✅ Interface minimalista e moderna
- ✅ Design mobile-first
- ✅ Paleta de cores azul-céu (tranquilidade e confiança)

### Slogan
> "Viajar pode ser leve. Planejar também."

---

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── components/
│   │   ├── screens/           # Telas principais
│   │   │   ├── Home.tsx       # Tela inicial/explorar
│   │   │   ├── MinhasViagens.tsx  # Gerenciamento de viagens
│   │   │   ├── Roteiro.tsx    # Timeline da viagem
│   │   │   └── Perfil.tsx     # Conta do usuário
│   │   ├── BottomNavigation.tsx   # Navegação inferior
│   │   ├── CategorySection.tsx    # Seções de categoria
│   │   ├── Header.tsx             # Cabeçalho
│   │   ├── ScrollableSection.tsx  # Scroll horizontal com setas
│   │   ├── SearchBar.tsx          # Barra de busca
│   │   ├── SplashScreen.tsx       # Tela inicial
│   │   └── TravelCard.tsx         # Cards de viagem
│   ├── context/
│   │   ├── NavigationContext.tsx  # Controle de navegação
│   │   └── TripsContext.tsx       # Estado das viagens
│   └── App.tsx                    # Componente principal
└── styles/
    ├── tailwind.css              # Estilos Tailwind
    ├── theme.css                 # Tema e tokens
    └── fonts.css                 # Fontes

```

---

## 📱 Telas e Funcionalidades

### 1. 🏠 Home (Explorar)

**Descrição:** Tela inicial onde usuários exploram opções de viagem.

**Elementos:**
- Header com logo "Planeje Fácil"
- Frase principal: "Viajar pode ser leve. Planejar também"
- Barra de busca inteligente
- 4 Seções de categorias:
  - **Voos** - "Compare opções e entenda o custo da viagem"
  - **Hotéis** - "Veja opções de hospedagem para o seu estilo e orçamento"
  - **Veículos** - "Aluguel de carros e transporte no destino"
  - **Pacotes prontos** - "Ideias de viagens já organizadas para você adaptar"
- Mensagem de suporte
- Navegação inferior

**Funcionalidades:**
- Scroll horizontal nas seções de categorias
- Setas de navegação automáticas
- Busca (placeholder inteligente)

---

### 2. ✈️ Minhas Viagens

**Descrição:** Gerenciamento completo das viagens planejadas.

**Elementos:**
- Lista de viagens com:
  - Nome do destino
  - Data da viagem
  - Orçamento
  - Barra de progresso
  - Checklist de tarefas
- Botão flutuante "+" para adicionar viagem
- Estado vazio com call-to-action

**Funcionalidades Interativas:**
- ✅ **Adicionar nova viagem** (modal com formulário)
- ✅ **Marcar/desmarcar tarefas** (atualização em tempo real)
- ✅ **Adicionar tarefas** a uma viagem existente
- ✅ **Deletar viagem**
- ✅ **Cálculo automático de progresso** baseado em tarefas concluídas
- ✅ **Persistência de dados** (Context API)

**Como Usar:**
1. Clique no botão "+" para adicionar uma viagem
2. Preencha: destino, data inicial, data final, orçamento
3. Clique nas tarefas para marcar como concluídas
4. Progresso é atualizado automaticamente

---

### 3. 🗺️ Roteiro

**Descrição:** Timeline detalhada do dia a dia da viagem.

**Elementos:**
- Informações da viagem selecionada
- Timeline por dia com:
  - Número do dia
  - Data
  - Atividades programadas com:
    - Horário
    - Duração
    - Local
    - Avaliação (estrelas)
- Botão para adicionar mais dias

**Funcionalidades:**
- Visualização em linha do tempo
- Organização por dias
- Cards de atividades

---

### 4. 👤 Perfil (Minha Conta)

**Descrição:** Área do usuário com configurações e estatísticas.

**Elementos:**
- Card de perfil com:
  - Avatar
  - Nome e email
  - Estatísticas (viagens, países, cidades)
- Banner Premium
- Menu de opções:
  - Configurações
  - Assinatura (com badge Premium)
  - Notificações
  - Ajuda e Suporte
- Mensagem de suporte
- Botão de logout

**Funcionalidades:**
- Navegação entre seções
- Visualização de estatísticas
- Acesso rápido a configurações

---

## 🧩 Componentes

### BottomNavigation
**Propósito:** Navegação principal do app

**Props:**
- `activeTab` (opcional): Define qual aba está ativa

**Abas:**
- Home (Explorar)
- Trips (Minhas viagens)
- Itinerary (Roteiro)
- Profile (Minha conta)

---

### Header
**Propósito:** Cabeçalho consistente em todas as telas

**Props:**
- `showBackButton`: Mostrar botão voltar
- `showActions`: Mostrar ações (recarregar, compartilhar, mais)

---

### SearchBar
**Propósito:** Barra de busca inteligente

**Props:**
- `placeholder`: Texto do placeholder

---

### CategorySection
**Propósito:** Seção de categoria com título e subtítulo

**Props:**
- `title`: Título da seção
- `subtitle`: Subtítulo explicativo
- `children`: Conteúdo (cards)

---

### ScrollableSection
**Propósito:** Container com scroll horizontal e setas de navegação

**Características:**
- Setas aparecem automaticamente quando há conteúdo para rolar
- Scroll suave
- Sem barra de rolagem visível
- Setas discretas e modernas

---

### TravelCard
**Propósito:** Card de opção de viagem

**Props:**
- `imageUrl`: URL da imagem

---

### SplashScreen
**Propósito:** Tela inicial de abertura do app

**Props:**
- `onFinish`: Callback quando animação termina

**Duração:** 2.5 segundos

---

## 🎨 Design System

### Paleta de Cores

```css
Principais:
- Azul Céu Principal: #0EA5E9 (sky-500)
- Azul Céu Claro: #7DD3FC (sky-300)
- Azul Céu Escuro: #0284C7 (sky-600)

Neutros:
- Branco: #FFFFFF
- Cinza Claro: #F9FAFB (gray-50)
- Cinza Médio: #6B7280 (gray-600)
- Cinza Escuro: #1F2937 (gray-800)

Destaque:
- Âmbar (Premium): #F59E0B (amber-500)
- Verde (Sucesso): #10B981 (emerald-500)
- Vermelho (Erro): #EF4444 (red-500)
```

### Tipografia

```
Títulos Principais: 24px (text-2xl)
Títulos Secundários: 20px (text-xl)
Subtítulos: 18px (text-lg)
Texto Base: 16px (text-base)
Texto Pequeno: 14px (text-sm)
Texto Extra Pequeno: 12px (text-xs)
```

### Espaçamento

```
Padding Padrão: 16px (p-4)
Gap entre elementos: 8px (gap-2)
Margem entre seções: 24px (mb-6)
```

### Bordas e Sombras

```
Border Radius Padrão: 12px (rounded-xl)
Border Radius Completo: 9999px (rounded-full)
Sombra Suave: shadow-sm
Sombra Média: shadow-md
Sombra Grande: shadow-lg
```

---

## 🔄 Contextos e Estado

### NavigationContext

**Propósito:** Gerencia navegação entre telas

**Estado:**
- `currentScreen`: Tela atual ("home" | "trips" | "itinerary" | "profile")

**Métodos:**
- `setCurrentScreen(screen)`: Navega para tela especificada

---

### TripsContext

**Propósito:** Gerencia estado global das viagens

**Estado:**
- `trips`: Array de viagens
- `selectedTrip`: Viagem selecionada para visualizar roteiro

**Métodos:**
- `addTrip(trip)`: Adiciona nova viagem
- `deleteTrip(id)`: Remove viagem
- `toggleTask(tripId, taskId)`: Marca/desmarca tarefa
- `addTask(tripId, task)`: Adiciona tarefa a viagem
- `selectTrip(id)`: Seleciona viagem para roteiro

**Estrutura de Trip:**
```typescript
{
  id: string,
  destination: string,
  startDate: string,
  endDate: string,
  budget: string,
  progress: number, // calculado automaticamente
  tasks: [
    {
      id: string,
      text: string,
      completed: boolean
    }
  ]
}
```

---

## 📖 Guia de Uso

### Para Desenvolvedores

**Instalação:**
```bash
npm install
```

**Desenvolvimento:**
```bash
npm run dev
```

**Build:**
```bash
npm run build
```

### Adicionar Nova Tela

1. Criar componente em `/src/app/components/screens/`
2. Adicionar rota no `App.tsx`
3. Atualizar `NavigationContext` se necessário
4. Adicionar aba no `BottomNavigation`

### Adicionar Nova Funcionalidade

1. Verificar se precisa de estado global (usar Context)
2. Criar componente reutilizável se aplicável
3. Seguir padrões de design estabelecidos
4. Manter código em português onde apropriado

---

## 🎯 Princípios de Design

1. **Minimalismo**: Apenas elementos essenciais
2. **Clareza**: Informação clara e objetiva
3. **Acolhimento**: Tom amigável e sem pressão
4. **Responsividade**: Mobile-first, adaptável
5. **Acessibilidade**: Contraste adequado, textos legíveis
6. **Consistência**: Padrões visuais em todas as telas

---

## 🚀 Próximos Passos (Roadmap)

- [ ] Integração com API real de voos/hotéis
- [ ] Persistência de dados (LocalStorage/Backend)
- [ ] Sistema de autenticação
- [ ] Compartilhamento de viagens
- [ ] Modo offline
- [ ] Notificações push
- [ ] Integração com calendário
- [ ] Exportar roteiro em PDF
- [ ] Modo escuro
- [ ] Múltiplos idiomas

---

## 📄 Licença

Projeto educacional - Planeje Fácil © 2026

---

## 👥 Suporte

Para dúvidas ou sugestões, entre em contato através do botão "Fale com nosso time" no app.

---

**Última atualização:** Janeiro 2026
**Versão:** 1.0.0
