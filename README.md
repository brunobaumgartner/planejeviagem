# 🌍 Planeje Fácil - MVP Profissional

> Sistema completo de planejamento de viagens com autenticação, monetização e painel administrativo

![Status](https://img.shields.io/badge/status-MVP%20Completo-brightgreen)
![Versão](https://img.shields.io/badge/versão-6.0-blue)
![Última Atualização](https://img.shields.io/badge/atualizado-Janeiro%202026-orange)

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Status do Projeto](#-status-do-projeto)
3. [Arquitetura](#-arquitetura)
4. [Funcionalidades](#-funcionalidades)
5. [Tecnologias](#-tecnologias)
6. [Setup e Instalação](#-setup-e-instalação)
7. [Documentação Completa](#-documentação-completa)
8. [Como Testar](#-como-testar)
9. [Resolução de Problemas](#-resolução-de-problemas)

---

## 🎯 Visão Geral

**Planeje Fácil** é um aplicativo web mobile-first para planejamento de viagens com abordagem não-comercial e educativa. O objetivo é ajudar usuários a explorar opções de viagem sem pressão de vendas, com tom acolhedor e interface minimalista.

### 🎨 Proposta de Valor
- **Gratuito para explorar**: Todos podem calcular orçamentos e criar viagens
- **Sem pressão comercial**: Foco em planejamento, não vendas
- **Educativo e acolhedor**: Tom conversacional e inclusivo
- **Mobile-first**: Interface otimizada para smartphones

---

## ✅ Status do Projeto

### 🎉 MVP COMPLETO - Todas as 6 Fases Implementadas

| Fase | Funcionalidade | Status | Data |
|------|---------------|--------|------|
| **Fase 1** | Sistema de Autenticação Guest/Logado | ✅ Concluída | Jan 2026 |
| **Fase 2** | Sistema de Níveis (Guest/Logado/Premium) | ✅ Concluída | Jan 2026 |
| **Fase 3** | Sistema de Orçamento Inteligente | ✅ Concluída | Jan 2026 |
| **Fase 4** | Painel Administrativo Completo | ✅ Concluída | Jan 2026 |
| **Fase 5** | Sistema de Monetização (MercadoPago) | ✅ Concluída | Jan 2026 |
| **Fase 6** | Sistema de Anexos para Checklists | ✅ Concluída | Jan 2026 |

### 🚀 Últimas Atualizações (19 Jan 2026)

#### ✨ Sistema de Autocomplete Global
- **100+ cidades** de 6 continentes disponíveis
- Busca inteligente em tempo real
- Formato padronizado "Cidade, País"
- Componente reutilizável `CityAutocomplete.tsx`

#### 🌐 Sistema de Coordenadas Expandido
- **100+ cidades** com coordenadas precisas
- Cálculo de distância e transporte para viagens internacionais
- Eliminados warnings de "Cidade não encontrada"
- Suporte a todos os continentes

#### 🌍 Orçamentos Internacionais
- **80+ cidades internacionais** com orçamentos realistas
- Botão "🌍 Init Internacional" no painel Admin
- Orçamentos por continente (Europa, Ásia, América, etc)
- Inicialização automática via API `/admin/init-international-budgets`

#### 🔄 Sincronização Guest → Logado
- **Migração automática** de dados ao fazer login
- Notificação visual de sucesso
- Preservação completa do trabalho do Guest
- Zero perda de dados

#### 🧹 Código Limpo (NOVO - 19 Jan 2026)
- **Removidos TODOS os dados estáticos/demo**
- Usuários novos começam com tela vazia
- EmptyStates claros e convidativos
- Apenas dados criados pelo próprio usuário aparecem
- Experiência personalizada desde o primeiro uso

---

## 🏗️ Arquitetura

### Arquitetura de 3 Camadas

```
┌─────────────────────────────────────────┐
│         FRONTEND (React + Vite)         │
│  - Interface mobile-first               │
│  - Context API (Auth, Trips, Notifs)    │
│  - Tailwind CSS v4                      │
└──────────────┬──────────────────────────┘
               │ HTTPS + JWT
┌──────────────▼──────────────────────────┐
│    SERVER (Supabase Edge Function)      │
│  - Hono Web Server                      │
│  - Autenticação JWT                     │
│  - Rotas de API                         │
│  - Integração MercadoPago               │
└──────────────┬──────────────────────────┘
               │ SQL + Storage
┌──────────────▼──────────────────────────┐
│     DATABASE (Supabase Postgres)        │
│  - KV Store (viagens, usuários)         │
│  - Supabase Auth                        │
│  - Supabase Storage (anexos)            │
└─────────────────────────────────────────┘
```

### 📁 Estrutura de Arquivos

```
/
├── src/
│   ├── app/
│   │   ├── components/         # Componentes React
│   │   │   ├── screens/        # Telas principais
│   │   │   ├── admin/          # Painel Admin
│   │   │   └── ui/             # Componentes UI
│   │   ├── context/            # Context API
│   │   └── hooks/              # Custom hooks
│   ├── services/               # APIs e serviços
│   ├── utils/                  # Utilitários
│   └── types/                  # TypeScript types
├── supabase/
│   └── functions/server/       # Backend Hono
├── docs/                       # Documentação detalhada
└── guidelines/                 # Diretrizes de dev
```

**📖 Documentação completa:** Ver [REFERENCIA-RAPIDA-ARQUIVOS.md](REFERENCIA-RAPIDA-ARQUIVOS.md)

---

## 🎯 Funcionalidades

### 👤 Sistema de Usuários (3 Níveis)

#### 🆓 Guest (Não Logado)
- ✅ Criar até 3 viagens
- ✅ Calcular orçamentos
- ✅ Dados salvos no localStorage
- ✅ Migração automática ao fazer login
- ❌ Sem sincronização entre dispositivos

#### 🔐 Logado (Conta Gratuita)
- ✅ Viagens ilimitadas
- ✅ Sincronização na nuvem
- ✅ Checklists com anexos
- ✅ Acesso em múltiplos dispositivos
- ❌ Sem planejamento profissional

#### 💎 Premium (Pago)
- ✅ Tudo do plano Logado
- ✅ **Compra de planejamento profissional**
- ✅ Roteiro dia-a-dia detalhado
- ✅ Recomendações personalizadas
- ✅ Suporte prioritário

### 🧮 Sistema de Orçamento Inteligente

#### 📊 3 Níveis de Recomendação
```
🟢 ECONÔMICO     R$ 2.000 - R$ 4.000
🟡 BALANCEADO    R$ 4.000 - R$ 8.000
🔴 LUXO          R$ 8.000+
```

#### 🌍 Cobertura Global
- **45 cidades brasileiras** com dados completos
- **80+ cidades internacionais** (6 continentes)
- **100+ cidades** no autocomplete
- Cálculo automático de transporte via Google Maps API

#### 🚗 Cálculo de Transporte
- Distâncias entre **100+ cidades** globais
- Custos de avião, carro, ônibus
- Atualização automática via APIs públicas
- Coordenadas precisas (lat/lng)

### 🗺️ Gestão de Viagens

#### ✈️ Criar e Gerenciar Viagens
- Destino com autocomplete global
- Período (data início/fim)
- Número de pessoas
- Orçamento sugerido automaticamente
- Categorias de gastos detalhadas

#### ✅ Checklists Inteligentes
- Tarefas personalizadas
- Anexos (fotos, PDFs até 5MB)
- Upload para Supabase Storage
- Download de arquivos
- Progresso visual

#### 🗓️ Roteiros Dia-a-Dia
- Editor de itinerário visual
- Atividades por dia
- Horários e localizações
- Descrições e notas
- Visualização limpa

### 💰 Monetização

#### 💳 Integração MercadoPago
- Pagamento via Pix
- Checkout seguro
- Callback automático
- Validação de status

#### 🎁 Produtos
- **Planejamento Profissional**: R$ 150,00
  - Roteiro completo
  - Recomendações personalizadas
  - Entrega em até 48h

### 🛠️ Painel Administrativo

#### 👥 Gerenciamento
- **Usuários**: Lista, detalhes, níveis
- **Viagens**: Todas as viagens criadas
- **Compras**: Status de pagamentos
- **Orçamentos**: Editor de cidades

#### 📊 Diagnóstico
- Status de serviços (API, DB, Storage)
- Logs em tempo real
- Monitoramento de saúde
- Estatísticas de uso

#### 🌍 Ferramentas Admin
- Inicializar orçamentos internacionais
- Atualizar dados de APIs
- Entregar planejamentos
- Gerenciar buckets de storage

---

## 🛠️ Tecnologias

### Frontend
- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS v4** (estilização)
- **Lucide React** (ícones)
- **Context API** (gerenciamento de estado)

### Backend
- **Supabase Edge Functions**
- **Hono** (web server)
- **PostgreSQL** (banco de dados)
- **Supabase Auth** (autenticação)
- **Supabase Storage** (arquivos)

### Integrações
- **MercadoPago** (pagamentos)
- **Google Maps API** (distâncias)
- **Unsplash** (imagens)

---

## 🚀 Setup e Instalação

### Pré-requisitos
```bash
Node.js 18+
npm ou yarn
Conta Supabase
Conta MercadoPago (para pagamentos)
```

### 1️⃣ Variáveis de Ambiente

O sistema já possui as seguintes secrets configuradas no Supabase:
```bash
SUPABASE_URL=xxx
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
SUPABASE_DB_URL=xxx
MERCADOPAGO_ACCESS_TOKEN=xxx
```

### 2️⃣ Instalação

```bash
# Clone o repositório
git clone [url-do-repositorio]

# Instale as dependências
npm install

# Execute o projeto
npm run dev
```

### 3️⃣ Configuração do Banco

```sql
-- Execute o schema inicial
-- Ver: /supabase/schema.sql

-- (Opcional) Popule cidades brasileiras
-- Ver: /supabase/seed-city-budgets.sql
```

### 4️⃣ Inicializar Dados

1. Acesse o painel Admin (`/admin`)
2. Clique em **"🌍 Init Internacional"**
3. Confirme para adicionar 80+ cidades globais

---

## 📚 Documentação Completa

### 📖 Documentos Principais

| Documento | Descrição |
|-----------|-----------|
| [INDICE-GERAL.md](INDICE-GERAL.md) | Índice completo de toda documentação |
| [ARQUITETURA-MVP-PROFISSIONAL.md](ARQUITETURA-MVP-PROFISSIONAL.md) | Arquitetura detalhada do sistema |
| [GUIA-COMPLETO-TESTES.md](GUIA-COMPLETO-TESTES.md) | Como testar todas as funcionalidades |
| [REFERENCIA-RAPIDA-ARQUIVOS.md](REFERENCIA-RAPIDA-ARQUIVOS.md) | Onde está cada funcionalidade |
| [API-INTEGRATION.md](API-INTEGRATION.md) | Integração com APIs externas |
| [GUIA-MANUTENCAO.md](GUIA-MANUTENCAO.md) | Como manter e evoluir o sistema |

### 📁 Documentação Estruturada

```
/docs/
├── 01-introducao/         # Conceitos e visão geral
├── 02-arquitetura/        # Arquitetura técnica
├── 03-setup/              # Configuração inicial
├── 04-desenvolvimento/    # Guias de implementação
├── 05-design/             # Design system e UX
├── 06-resolucao-problemas/# Troubleshooting
└── 07-documentacao-original/ # Histórico
```

### 🔧 Guias Específicos

- **Autenticação**: [docs/02-arquitetura/README.md](docs/02-arquitetura/README.md)
- **Sistema de Pagamentos**: [GUIA-TESTE-PAGAMENTO.md](GUIA-TESTE-PAGAMENTO.md)
- **APIs Externas**: [API-INTEGRATION.md](API-INTEGRATION.md)
- **Resolução de Erros**: [docs/06-resolucao-problemas/README.md](docs/06-resolucao-problemas/README.md)

---

## 🧪 Como Testar

### 🎯 Teste Rápido (5 minutos)

**📱 Como Usuário Guest:**
```
1. Abra o app (sem login)
2. Veja tela vazia "Nenhuma viagem planejada"
3. Clique no botão "+"
4. Crie uma viagem (ex: "Paris, França")
5. Veja orçamento calculado automaticamente
6. Adicione tarefas ao checklist
```

**🔐 Como Usuário Logado:**
```
1. Faça Signup (email + senha)
2. Veja mensagem de sincronização (se tinha viagens como Guest)
3. Suas viagens do Guest agora estão na conta
4. Crie viagens ilimitadas
5. Adicione anexos aos checklists
```

**👨‍💼 Como Admin:**
```
1. Login como admin@planejefacil.com / Admin@2026
2. Acesse painel Admin (ícone de usuário > Admin)
3. Veja estatísticas em tempo real
4. Gerencie usuários, viagens, compras
5. Inicialize orçamentos internacionais
```

### 📋 Teste Completo

Ver documentação detalhada: **[GUIA-COMPLETO-TESTES.md](GUIA-COMPLETO-TESTES.md)**

Inclui:
- ✅ Fluxos completos de autenticação
- ✅ Testes de pagamento (Modo Teste)
- ✅ Validação de cálculos
- ✅ Testes de sincronização
- ✅ Testes de anexos

---

## 🐛 Resolução de Problemas

### ❌ Erro Comum #1: "Orçamento não disponível"
**Solução:**
```
1. Acesse painel Admin
2. Clique em "🌍 Init Internacional"
3. Aguarde conclusão
4. Tente criar viagem novamente
```

### ❌ Erro Comum #2: "Cidade não encontrada"
**Solução:**
- Use o autocomplete ao digitar
- Formato correto: "Cidade, País"
- Exemplo: "Nova York, Estados Unidos"

### ❌ Erro Comum #3: "Token inválido"
**Solução:**
```
1. Faça logout
2. Limpe cache do navegador
3. Faça login novamente
```

### 📖 Troubleshooting Completo

Ver: **[docs/06-resolucao-problemas/README.md](docs/06-resolucao-problemas/README.md)**

---

## 📊 Estatísticas do Projeto

```
📁 Arquivos:    120+ arquivos TypeScript/TSX
📝 Linhas:      15.000+ linhas de código
🌍 Cidades:     100+ cidades (6 continentes)
💰 Orçamentos:  125+ orçamentos (45 BR + 80 INT)
🧪 Fases:       6 fases completas
⏱️ Desenvolvimento: 3 meses (Out 2025 - Jan 2026)
```

---

## 🎉 Estado Atual

### ✅ Pronto para Produção

- ✅ **Sistema 100% funcional**
- ✅ **Código limpo e documentado**
- ✅ **Sem dados estáticos/demo**
- ✅ **Testes validados**
- ✅ **Performance otimizada**
- ✅ **Mobile-first responsivo**
- ✅ **Segurança implementada**
- ✅ **Monetização integrada**

### 🚀 Próximos Passos (Opcional)

1. **Marketing e Lançamento**
   - Landing page
   - Campanhas de divulgação
   - Onboarding aprimorado

2. **Novas Features**
   - Integração com agências de viagem
   - Sistema de reviews
   - Compartilhamento de viagens
   - App mobile nativo

3. **Melhorias**
   - PWA (Progressive Web App)
   - Notificações push
   - Modo offline
   - Internacionalização (i18n)

---

## 👥 Contato e Suporte

- **Documentação**: Ver [INDICE-GERAL.md](INDICE-GERAL.md)
- **Issues**: Use o sistema de issues do repositório
- **Dúvidas**: Consulte [FAQ.md](FAQ.md)

---

## 📄 Licença

Este projeto é privado e proprietário.

---

## 🙏 Créditos

- **Design**: Interface minimalista mobile-first
- **Ícones**: Lucide React
- **Imagens**: Unsplash
- **APIs**: Google Maps, MercadoPago
- **Infraestrutura**: Supabase

---

**🌍 Planeje Fácil** - Viajar pode ser leve. Planejar também.

*Última atualização: 19 de Janeiro de 2026*
