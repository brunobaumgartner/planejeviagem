# 📱 Planeje Fácil - Guia Rápido

## 🚀 Como Usar o Protótipo

### Navegação
Use a **barra inferior** para navegar entre as telas:
- 🏠 **Explorar** - Tela inicial com categorias de viagem
- ✈️ **Minhas viagens** - Gerenciar suas viagens
- 🗺️ **Roteiro** - Ver timeline da viagem
- 👤 **Minha conta** - Perfil e configurações

---

## ✨ Funcionalidades Interativas

### ➕ Adicionar Nova Viagem

1. Na tela **Minhas viagens**, clique no botão **+ (azul flutuante)**
2. Preencha os dados:
   - **Destino** (ex: Rio de Janeiro)
   - **Data de Início** (ex: 15 Mar)
   - **Data Final** (ex: 20 Mar)
   - **Orçamento** (ex: R$ 3.500)
3. Clique em **Criar Viagem**
4. Três tarefas padrão serão criadas automaticamente

### ✅ Marcar/Desmarcar Tarefas

- **Clique diretamente** na tarefa (no círculo ou no texto)
- A tarefa será marcada com ✓ e riscada
- O **progresso da viagem é atualizado automaticamente**
- A barra de progresso reflete a porcentagem de tarefas concluídas

### ➕ Adicionar Nova Tarefa

1. No card da viagem, clique em **+ Adicionar tarefa**
2. Digite a descrição da tarefa
3. Clique em **Adicionar**
4. A tarefa aparecerá na lista

### 🗑️ Excluir Tarefa

1. **Passe o mouse** sobre a tarefa
2. Clique no ícone de **lixeira** (vermelho) que aparece
3. Confirme a exclusão
4. O progresso será recalculado

### 🗑️ Excluir Viagem

1. Clique no ícone **⋮ (três pontos)** no canto superior direito do card
2. Clique em **Excluir viagem**
3. Confirme a exclusão

---

## 📊 Estatísticas em Tempo Real

Na tela **Minha conta**, você verá:
- **Viagens** - Total de viagens criadas
- **Concluídas** - Viagens com 100% de progresso
- **Tarefas** - Total de tarefas em todas as viagens

Essas estatísticas são **calculadas automaticamente** e atualizadas em tempo real!

---

## 🎨 Características do Design

✅ **Sem barras de rolagem visíveis** - Design clean e moderno  
✅ **Setas de navegação** automáticas nos carrosséis  
✅ **Animações suaves** em todas as interações  
✅ **Feedback visual** ao passar o mouse  
✅ **Responsivo** e mobile-first  

---

## 🔧 Dados de Exemplo

O app vem com **2 viagens de exemplo**:
1. **Rio de Janeiro** - 15-20 Mar • R$ 3.500
2. **Gramado** - 10-15 Jun • R$ 2.800

Você pode:
- Excluí-las
- Marcar/desmarcar suas tarefas
- Adicionar novas tarefas
- Ver o progresso sendo atualizado

---

## 💡 Dicas de Uso

### Para Testar Completamente:

1. **Teste o progresso automático:**
   - Marque todas as tarefas de uma viagem
   - Veja o progresso chegar a 100%
   - Vá para **Minha conta** e veja as estatísticas

2. **Teste criar uma viagem do zero:**
   - Delete as viagens de exemplo
   - Adicione uma nova viagem
   - Adicione suas próprias tarefas

3. **Explore todas as telas:**
   - **Home** tem scroll horizontal com setas
   - **Roteiro** tem timeline visual
   - **Perfil** tem estatísticas dinâmicas

---

## 📁 Estrutura de Dados

Cada viagem contém:
```
{
  destino: "Rio de Janeiro",
  data_inicio: "15 Mar",
  data_final: "20 Mar",
  orçamento: "R$ 3.500",
  progresso: 50%, // calculado automaticamente
  tarefas: [
    { texto: "Reservar voo", concluída: true },
    { texto: "Reservar hotel", concluída: false }
  ]
}
```

---

## 🎯 O Que É Funcional

✅ Adicionar viagens  
✅ Excluir viagens  
✅ Adicionar tarefas  
✅ Excluir tarefas  
✅ Marcar/desmarcar tarefas  
✅ Cálculo automático de progresso  
✅ Navegação entre telas  
✅ Estatísticas em tempo real  
✅ Scroll horizontal com setas  
✅ Animações e transições  

---

## 📚 Documentação Completa

Para informações detalhadas sobre:
- Arquitetura do código
- Componentes disponíveis
- Design system
- Guia para desenvolvedores

Consulte: **[DOCUMENTACAO.md](./DOCUMENTACAO.md)**

---

## 🎨 Paleta de Cores

🔵 **Azul Céu** - Cor principal (#0EA5E9)  
⚪ **Branco** - Fundo principal  
⚫ **Cinza** - Textos e bordas  
🟡 **Âmbar** - Premium/Destaque  
🔴 **Vermelho** - Excluir/Erro  
🟢 **Verde** - Sucesso  

---

## 🌟 Próximos Passos Sugeridos

Se quiser expandir o protótipo:
1. Adicionar edição de viagens
2. Drag & drop para reordenar tarefas
3. Filtros e busca de viagens
4. Integração com LocalStorage (persistência)
5. Exportar viagem como PDF
6. Compartilhar viagem

---

**Aproveite o protótipo! 🚀✈️**
