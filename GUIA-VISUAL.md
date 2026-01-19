# 🎨 Guia Visual de Componentes - Planeje Fácil

## 📱 Telas do Aplicativo

```
┌─────────────────────────────────────┐
│  ← Planeje Fácil ✈️      ⟳ ⤴ ⋮     │ ← Header
├─────────────────────────────────────┤
│                                     │
│  Viajar pode ser leve.              │
│  Planejar também.                   │
│                                     │
│  🔍 Para onde você quer ir...       │ ← Busca
│                                     │
│  Voos                               │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ →        │ ← Scroll
│  │img│ │img│ │img│ │img│           │   Horizontal
│  └───┘ └───┘ └───┘ └───┘           │
│                                     │
│  Hotéis                             │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ →        │
│  │img│ │img│ │img│ │img│           │
│  └───┘ └───┘ └───┘ └───┘           │
│                                     │
├─────────────────────────────────────┤
│  🏠    ✈️    🗺️    👤              │ ← Navegação
│ Explorar Viagens Roteiro Conta     │
└─────────────────────────────────────┘
```

---

## 🏠 Tela: Explorar (Home)

### Estrutura
```
Header
  ↓
Hero (Título + Subtítulo)
  ↓
Barra de Busca
  ↓
4 Seções de Categoria:
  - Voos
  - Hotéis
  - Veículos
  - Pacotes prontos
  (cada uma com scroll horizontal)
  ↓
Mensagem de Suporte
  ↓
Navegação Inferior
```

### Elementos Interativos
- 🔍 Barra de busca (placeholder dinâmico)
- ← → Setas de navegação nos carrosséis
- 📱 Cards clicáveis de viagem
- 🎯 Navegação entre telas

---

## ✈️ Tela: Minhas Viagens

### Card de Viagem (Exemplo)
```
┌─────────────────────────────────────┐
│ Rio de Janeiro              ⋮       │ ← Nome + Menu
│ 📅 15-20 Mar  💰 R$ 3.500          │ ← Info
│                                     │
│ Progresso              75%          │
│ ▓▓▓▓▓▓▓▓▓▓░░░░░                    │ ← Barra
│                                     │
│ ✓ Reservar voo                 🗑   │ ← Tarefa completa
│ ✓ Reservar hotel               🗑   │
│ ○ Alugar carro                 🗑   │ ← Tarefa pendente
│ ○ Roteiro de passeios          🗑   │
│                                     │
│ + Adicionar tarefa                  │ ← Botão adicionar
└─────────────────────────────────────┘
```

### Estados do Card

**Estado Normal:**
- Título grande
- Data e orçamento visíveis
- Barra de progresso
- Lista de tarefas
- Menu de 3 pontos

**Estado Hover (Mouse sobre tarefa):**
- Aparece botão 🗑 (lixeira) vermelho
- Tarefa fica destacada

**Estado Expandido (clicou no ⋮):**
- Mostra opção "Excluir viagem"
- Fundo vermelho claro

**Estado Vazio (sem viagens):**
```
       ┌───────┐
       │  📍   │
       │ Ícone │
       └───────┘

  Nenhuma viagem planejada
  Comece a planejar sua próxima aventura

      [Criar nova viagem]
```

### Interatividade
✅ Clicar em tarefa → marca/desmarca  
✅ Hover em tarefa → mostra lixeira  
✅ Clicar em lixeira → confirma e exclui  
✅ Clicar em ⋮ → mostra menu  
✅ Clicar em "+" flutuante → abre modal  
✅ Clicar em "+ Adicionar tarefa" → abre modal  

---

## 📝 Modal: Nova Viagem

```
     ╔═══════════════════════════════╗
     ║ Nova Viagem               ✕   ║
     ╠═══════════════════════════════╣
     ║                               ║
     ║ Destino                       ║
     ║ ┌───────────────────────────┐ ║
     ║ │ Ex: Rio de Janeiro        │ ║
     ║ └───────────────────────────┘ ║
     ║                               ║
     ║ Data de Início  Data Final    ║
     ║ ┌───────────┐ ┌─────────────┐ ║
     ║ │ 15 Mar    │ │ 20 Mar      │ ║
     ║ └───────────┘ └─────────────┘ ║
     ║                               ║
     ║ Orçamento                     ║
     ║ ┌───────────────────────────┐ ║
     ║ │ R$ 3.500                  │ ║
     ║ └───────────────────────────┘ ║
     ║                               ║
     ║ ┌───────────────────────────┐ ║
     ║ │💡 Dica: Algumas tarefas   │ ║
     ║ │   básicas já serão        │ ║
     ║ │   adicionadas!            │ ║
     ║ └───────────────────────────┘ ║
     ║                               ║
     ║ [Cancelar]  [Criar Viagem]    ║
     ╚═══════════════════════════════╝
```

---

## 📝 Modal: Nova Tarefa

```
     ╔═══════════════════════════════╗
     ║ Nova Tarefa               ✕   ║
     ║ Rio de Janeiro                ║
     ╠═══════════════════════════════╣
     ║                               ║
     ║ Descrição da tarefa           ║
     ║ ┌───────────────────────────┐ ║
     ║ │ Ex: Comprar passagem...   │ ║
     ║ └───────────────────────────┘ ║
     ║                               ║
     ║ [Cancelar]   [Adicionar]      ║
     ╚═══════════════════════════════╝
```

---

## 🗺️ Tela: Roteiro (Timeline)

```
┌─────────────────────────────────────┐
│ Rio de Janeiro            🧭        │
│ 15-20 Mar 2026 • 6 dias            │
└─────────────────────────────────────┘

    ┌───┐
    │ 1 │ Dia 1
    └───┘ 15 Mar
      │
      ├─● 09:00 • 2h
      │ ┌─────────────────────────┐
      │ │ Cristo Redentor    ⭐4.8│
      │ │ 📍 Corcovado           │
      │ └─────────────────────────┘
      │
      ├─● 14:00 • 3h
      │ ┌─────────────────────────┐
      │ │ Pão de Açúcar      ⭐4.9│
      │ │ 📍 Urca                │
      │ └─────────────────────────┘
      │
      └─● 19:00 • 2h
        ┌─────────────────────────┐
        │ Jantar em Ipanema ⭐4.5│
        │ 📍 Ipanema             │
        └─────────────────────────┘

    ┌───┐
    │ 2 │ Dia 2
    └───┘ 16 Mar
      │
      ├─● 10:00 • 4h
      │ ┌─────────────────────────┐
      │ │ Praia Copacabana  ⭐4.7│
      │ │ 📍 Copacabana          │
      │ └─────────────────────────┘

[+ Adicionar dia ao roteiro]
```

### Elementos
- ⚫ Ponto na timeline (azul)
- 📍 Localização
- ⏰ Horário e duração
- ⭐ Avaliação
- Linha vertical conectando atividades

---

## 👤 Tela: Minha Conta

### Card de Perfil
```
╔═══════════════════════════════════════╗
║  ┌─────┐                              ║
║  │ 👤  │ Maria Silva                  ║
║  │     │ maria.silva@email.com        ║
║  └─────┘                              ║
║─────────────────────────────────────  ║
║    2         1         7              ║
║  Viagens  Concluídas Tarefas          ║
╚═══════════════════════════════════════╝
```

### Banner Premium
```
┌─────────────────────────────────────┐
│ 👑 Planeje Fácil Premium        →  │
│    Desbloqueie recursos exclusivos  │
└─────────────────────────────────────┘
```

### Menu de Opções
```
┌─────────────────────────────────────┐
│ ⚙️  Configurações               →  │
│    Preferências do aplicativo       │
├─────────────────────────────────────┤
│ 💳 Assinatura    [Premium]      →  │
│    Gerenciar plano e pagamento      │
├─────────────────────────────────────┤
│ 🔔 Notificações                 →  │
│    Alertas e lembretes              │
├─────────────────────────────────────┤
│ ❓ Ajuda e Suporte              →  │
│    Central de ajuda                 │
└─────────────────────────────────────┘
```

---

## 🎨 Cores e Estados

### Cores Principais
```
🔵 Azul Céu (#0EA5E9)
   - Botões primários
   - Progresso
   - Ícones ativos
   - Links

⚪ Branco (#FFFFFF)
   - Fundo dos cards
   - Textos em fundos escuros

⚫ Cinza (#6B7280)
   - Textos secundários
   - Ícones inativos
   - Bordas

🟡 Âmbar (#F59E0B)
   - Premium/Destaque
   - Avaliações

🔴 Vermelho (#EF4444)
   - Exclusão
   - Erros

🟢 Verde (#10B981)
   - Sucesso
   - Confirmação
```

### Estados Visuais

**Normal:**
```
[  Botão Normal  ]
Fundo: Branco
Borda: Cinza
Texto: Cinza Escuro
```

**Hover:**
```
[  Botão Hover  ]
Fundo: Cinza Claro
Borda: Cinza
Texto: Cinza Escuro
(+ Transição suave)
```

**Ativo/Selecionado:**
```
[  Botão Ativo  ]
Fundo: Azul Céu
Borda: Azul Céu
Texto: Branco
```

**Disabled:**
```
[  Botão Disabled  ]
Fundo: Cinza Claro
Borda: Cinza Claro
Texto: Cinza Claro
Cursor: not-allowed
```

---

## 📏 Espaçamentos

```
Padding do Container: 16px (p-4)

Espaço entre Cards: 16px (gap-4)

Margem entre Seções: 24px (mb-6)

Espaço dentro do Card:
  - Horizontal: 16px
  - Vertical: 16px

Border Radius:
  - Cards: 12px (rounded-xl)
  - Botões: 12px (rounded-xl)
  - Input: 12px (rounded-xl)
  - Circular: 9999px (rounded-full)
```

---

## 📱 Hierarquia Visual

### Tipografia
```
H1 (Títulos Principais)
   24px • Peso Normal
   Ex: "Minhas Viagens"

H2 (Títulos de Card)
   20px • Peso Normal
   Ex: "Rio de Janeiro"

H3 (Subtítulos)
   18px • Peso Médio
   Ex: Títulos de Seção

Texto Normal
   16px • Peso Normal
   Ex: Descrições

Texto Pequeno
   14px • Peso Normal
   Ex: Informações secundárias

Texto Muito Pequeno
   12px • Peso Normal
   Ex: Labels, badges
```

### Hierarquia de Importância
```
1️⃣ Mais Importante
   - Título da viagem
   - Botões primários
   - Progresso

2️⃣ Importante
   - Data e orçamento
   - Tarefas
   - Ícones principais

3️⃣ Secundário
   - Descrições
   - Informações adicionais
   - Botões secundários

4️⃣ Terciário
   - Labels
   - Hints
   - Badges
```

---

## 🎯 Ícones e Significados

```
✈️ Avião       → Logo, Viagens
📍 Pin         → Localização
📅 Calendário  → Datas
💰 Dinheiro    → Orçamento
✓  Check       → Tarefa completa
○  Círculo     → Tarefa pendente
🗑️  Lixeira     → Excluir
⋮  3 Pontos    → Menu
→  Seta        → Navegação
🔍 Lupa        → Busca
🏠 Casa        → Home
🗺️  Mapa        → Roteiro
👤 Pessoa      → Perfil
⚙️  Engrenagem  → Configurações
🔔 Sino        → Notificações
❓ Interrogação→ Ajuda
👑 Coroa       → Premium
⭐ Estrela     → Avaliação
```

---

## ⚡ Animações e Transições

### Tipos de Animação

**1. Fade In (Entrada suave)**
```
Splash Screen
Modais
Elementos que aparecem
```

**2. Slide (Deslizar)**
```
Setas de navegação
Menus expansíveis
```

**3. Scale (Aumentar/Diminuir)**
```
Botões ao clicar
Cards ao hover
```

**4. Progress (Progresso)**
```
Barra de progresso
Indicadores de carregamento
```

### Duração Recomendada
```
Muito Rápido: 150ms
  - Hover states
  - Cliques

Rápido: 300ms
  - Transições de cor
  - Pequenas animações

Normal: 500ms
  - Modais
  - Slides

Lento: 1000ms+
  - Splash screen
  - Animações complexas
```

---

## 📐 Layout Responsivo

### Breakpoints
```
Mobile:  < 768px  (Padrão)
Tablet:  768px - 1024px
Desktop: > 1024px

Nota: App é mobile-first,
então otimizado para mobile.
```

### Grid System
```
Mobile:   1 coluna
Tablet:   2 colunas
Desktop:  3-4 colunas

Exemplo:
grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```

---

## 🎨 Design Tokens (CSS Variáveis)

```css
/* Cores */
--color-primary: #0EA5E9;      /* sky-500 */
--color-secondary: #6B7280;    /* gray-600 */
--color-success: #10B981;      /* green-500 */
--color-warning: #F59E0B;      /* amber-500 */
--color-error: #EF4444;        /* red-500 */

/* Espaçamentos */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;

/* Border Radius */
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-full: 9999px;

/* Sombras */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.15);
```

---

## 🎭 Componentes Reutilizáveis

### Botão
```tsx
// Primário (Azul)
<button className="bg-sky-500 text-white rounded-xl">

// Secundário (Borda)
<button className="border border-gray-300 text-gray-700 rounded-xl">

// Perigo (Vermelho)
<button className="bg-red-500 text-white rounded-xl">

// Ícone
<button className="p-2 rounded-full hover:bg-gray-100">

// Flutuante (FAB)
<button className="p-3 bg-sky-500 text-white rounded-full shadow-lg">
```

### Input
```tsx
<input className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500" />
```

### Card
```tsx
<div className="bg-white rounded-xl p-4 shadow-sm">
```

### Badge
```tsx
<span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-xs rounded">
```

---

**Este guia visual ajuda a manter consistência em todo o app! 🎨✨**
