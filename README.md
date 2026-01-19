<<<<<<< HEAD
# ✈️ Planeje Fácil

> "Viajar pode ser leve. Planejar também."

[![Status](https://img.shields.io/badge/status-stable-green.svg)]()
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)]()
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)]()
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg)]()

## 📱 Sobre o Projeto

**Planeje Fácil** é um aplicativo de planejamento de viagens com abordagem não-comercial e educativa. O app ajuda usuários a explorar opções de viagem sem pressão de vendas, com um tom acolhedor e interface minimalista.

### ✨ Características Principais

- 🎯 **Totalmente Funcional** - Não é apenas mockup, todas funcionalidades interativas estão implementadas
- 📱 **Mobile-First** - Design otimizado para dispositivos móveis
- 🎨 **Design Minimalista** - Interface clean sem barras de rolagem
- ⚡ **Tempo Real** - Estatísticas e progresso atualizados instantaneamente
- 🔄 **Estado Global** - Gerenciamento eficiente com Context API
- 📚 **Bem Documentado** - 5 arquivos de documentação completa

## 🚀 Começando

### Pré-requisitos

```bash
Node.js v18+ ou v20+
npm v9+ ou v10+
```

### Instalação

```bash
# Clone o repositório
git clone [url-do-repositorio]

# Entre no diretório
cd planeje-facil

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

## 📖 Documentação

Este projeto possui documentação completa em português:

| Documento | Descrição |
|-----------|-----------|
| **[LEIA-ME.md](./LEIA-ME.md)** | 📖 Guia rápido de uso do protótipo |
| **[DOCUMENTACAO.md](./DOCUMENTACAO.md)** | 📚 Documentação técnica completa |
| **[EXEMPLOS-CODIGO.md](./EXEMPLOS-CODIGO.md)** | 💻 Exemplos práticos de código |
| **[GUIA-VISUAL.md](./GUIA-VISUAL.md)** | 🎨 Guia visual de componentes |
| **[CHANGELOG.md](./CHANGELOG.md)** | 📝 Histórico de mudanças |

### 🎯 Por onde começar?

1. **Novo usuário?** → Leia o [LEIA-ME.md](./LEIA-ME.md)
2. **Desenvolvedor?** → Consulte a [DOCUMENTACAO.md](./DOCUMENTACAO.md)
3. **Precisa de código?** → Veja os [EXEMPLOS-CODIGO.md](./EXEMPLOS-CODIGO.md)
4. **Designer?** → Explore o [GUIA-VISUAL.md](./GUIA-VISUAL.md)

## 🎮 Como Usar

### Navegação
Use a barra inferior para navegar entre as telas:
- 🏠 **Explorar** - Categorias de viagem
- ✈️ **Minhas viagens** - Gerenciar viagens
- 🗺️ **Roteiro** - Timeline da viagem
- 👤 **Minha conta** - Perfil e estatísticas

### Funcionalidades Interativas

#### ➕ Adicionar Viagem
1. Clique no botão **+** flutuante (azul)
2. Preencha destino, datas e orçamento
3. Tarefas básicas são criadas automaticamente

#### ✅ Gerenciar Tarefas
- **Clicar na tarefa** → marca/desmarca
- **Hover + clicar lixeira** → exclui tarefa
- **Botão "+ Adicionar tarefa"** → adiciona nova

#### 📊 Progresso Automático
- Calculado com base nas tarefas concluídas
- Barra visual atualizada em tempo real
- Estatísticas sincronizadas no perfil

## 🎨 Design System

### Paleta de Cores

```css
Azul Céu:  #0EA5E9  /* Cor principal */
Branco:    #FFFFFF  /* Fundos */
Cinza:     #6B7280  /* Textos secundários */
Âmbar:     #F59E0B  /* Premium */
Vermelho:  #EF4444  /* Exclusão */
```

### Componentes

- ✅ Buttons (Primário, Secundário, Ícone, FAB)
- ✅ Inputs (Text, com validação)
- ✅ Cards (Viagem, Perfil, Info)
- ✅ Modals (Nova viagem, Nova tarefa)
- ✅ Navigation (Bottom bar)
- ✅ Progress (Barra animada)
- ✅ Timeline (Roteiro visual)

## 🏗️ Estrutura do Projeto

```
planeje-facil/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── screens/          # Telas principais
│   │   │   │   ├── Home.tsx
│   │   │   │   ├── MinhasViagens.tsx
│   │   │   │   ├── Roteiro.tsx
│   │   │   │   └── Perfil.tsx
│   │   │   ├── AddTripModal.tsx
│   │   │   ├── AddTaskModal.tsx
│   │   │   ├── BottomNavigation.tsx
│   │   │   ├── CategorySection.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── ScrollableSection.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── SplashScreen.tsx
│   │   │   └── TravelCard.tsx
│   │   ├── context/
│   │   │   ├── NavigationContext.tsx
│   │   │   └── TripsContext.tsx
│   │   └── App.tsx
│   └── styles/
│       ├── tailwind.css
│       ├── theme.css
│       └── fonts.css
├── LEIA-ME.md               # Guia de uso
├── DOCUMENTACAO.md          # Docs técnica
├── EXEMPLOS-CODIGO.md       # Exemplos práticos
├── GUIA-VISUAL.md          # Guia visual
├── CHANGELOG.md            # Histórico
└── README.md               # Este arquivo
```

## 🔧 Tecnologias

### Frontend
- **React** 18+ - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS** v4 - Estilização
- **Lucide React** - Ícones

### Estado
- **Context API** - Gerenciamento de estado global
- **React Hooks** - useState, useEffect, useContext

### Tooling
- **Vite** - Build tool
- **ESLint** - Linter
- **TypeScript Compiler** - Verificação de tipos

## ✅ Funcionalidades Implementadas

### Totalmente Funcionais ✅

- [x] Sistema de navegação entre telas
- [x] Adicionar/excluir viagens
- [x] Adicionar/excluir tarefas
- [x] Marcar/desmarcar tarefas
- [x] Cálculo automático de progresso
- [x] Estatísticas em tempo real
- [x] Scroll horizontal com setas automáticas
- [x] Modais com formulários
- [x] Validações de input
- [x] Confirmações de exclusão
- [x] Animações e transições
- [x] Design responsivo

### Planejado para Futuras Versões 🔮

- [ ] Editar viagens
- [ ] Reordenar tarefas (drag & drop)
- [ ] Filtros e busca funcional
- [ ] Persistência (LocalStorage/Backend)
- [ ] Compartilhar viagem
- [ ] Exportar PDF
- [ ] Modo escuro
- [ ] Autenticação

## 📊 Métricas

```
Componentes:      12+
Telas:            4
Contextos:        2
Modais:           2
Linhas de Código: 2000+
Arquivos de Docs: 5
Funcionalidades:  15+
```

## 🎯 Casos de Uso

### Para Usuários Finais
- ✅ Planejar viagens pessoais
- ✅ Organizar tarefas de viagem
- ✅ Acompanhar progresso
- ✅ Ver estatísticas

### Para Desenvolvedores
- ✅ Aprender React + TypeScript
- ✅ Estudar Context API
- ✅ Entender Tailwind CSS v4
- ✅ Praticar componentes reutilizáveis

### Para Designers
- ✅ Design system consistente
- ✅ UI/UX mobile-first
- ✅ Animações suaves
- ✅ Paleta de cores definida

## 🐛 Reportar Bugs

Encontrou um bug? Por favor, forneça:
1. Descrição do problema
2. Passos para reproduzir
3. Comportamento esperado vs atual
4. Screenshots (se aplicável)
5. Navegador/dispositivo

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Leia a [DOCUMENTACAO.md](./DOCUMENTACAO.md)
2. Siga os padrões do [GUIA-VISUAL.md](./GUIA-VISUAL.md)
3. Use TypeScript com tipos completos
4. Mantenha código limpo e documentado
5. Teste todas funcionalidades

## 📄 Licença

Projeto educacional - Planeje Fácil © 2026

## 🌟 Destaques

### Por que este projeto é especial?

1. **✨ Totalmente Funcional** - Diferente de muitos protótipos, este app realmente funciona
2. **🎨 Design Polido** - Atenção aos detalhes em cada pixel
3. **📱 Mobile-First** - Pensado para dispositivos móveis desde o início
4. **🚀 Performance** - Leve, rápido e eficiente
5. **📚 Documentação Completa** - 5 arquivos detalhados em português
6. **💻 Código Limpo** - Organizado, tipado e bem estruturado

### Diferenciais Técnicos

- ✅ Estado global bem arquitetado
- ✅ Componentes reutilizáveis
- ✅ TypeScript sem erros
- ✅ Animações performáticas
- ✅ UI sem barras de rolagem
- ✅ Progresso calculado automaticamente

## 🎓 Aprendizados

Este projeto demonstra:
- Context API para estado global
- Componentes controlados
- TypeScript com React
- Tailwind CSS v4
- Modais e formulários
- Animações CSS
- Mobile-first design
- Clean code practices

## 📞 Suporte

Precisa de ajuda?
1. Consulte a documentação
2. Veja os exemplos de código
3. Entre em contato através do app

## 🗺️ Roadmap

### Versão 1.1 (Próxima)
- Editar viagens
- LocalStorage
- Toast notifications

### Versão 1.2
- Roteiro interativo
- Mapa de localização

### Versão 2.0
- Backend (Supabase)
- Autenticação
- Sincronização na nuvem

## 🏆 Status do Projeto

```
✅ Estável
✅ Pronto para uso
✅ Bem documentado
✅ Sem bugs conhecidos
✅ Performance otimizada
```

---

<div align="center">

**Desenvolvido com ❤️ e atenção aos detalhes**

[Ver Documentação](./DOCUMENTACAO.md) • [Guia Rápido](./LEIA-ME.md) • [Exemplos](./EXEMPLOS-CODIGO.md)

</div>
=======
# planejeviagem
>>>>>>> origin/master
