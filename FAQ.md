# ❓ FAQ - Perguntas Frequentes

## 📱 Sobre o Aplicativo

### O que é o Planeje Fácil?
É um aplicativo de planejamento de viagens com foco em ajudar usuários a organizarem suas viagens sem pressão de vendas. O tom é acolhedor e a interface é minimalista.

### O app é gratuito?
Sim, este é um protótipo funcional educacional e gratuito.

### Funciona offline?
Atualmente não. Os dados são mantidos em memória durante a sessão. Planejamos adicionar LocalStorage em versões futuras.

### É apenas um mockup/protótipo?
Não! Todas as funcionalidades principais estão **totalmente funcionais**:
- ✅ Adicionar/excluir viagens
- ✅ Adicionar/excluir tarefas
- ✅ Marcar/desmarcar tarefas
- ✅ Progresso automático
- ✅ Estatísticas em tempo real

---

## 🚀 Instalação e Uso

### Como instalo o app?
```bash
npm install
npm run dev
```
Veja detalhes no [README.md](./README.md)

### Qual Node.js preciso?
Node.js v18+ ou v20+

### Não está rodando. O que faço?
1. Verifique se tem Node.js instalado: `node --version`
2. Limpe node_modules: `rm -rf node_modules`
3. Reinstale: `npm install`
4. Tente novamente: `npm run dev`

### Como adiciono uma viagem?
1. Vá para "Minhas viagens"
2. Clique no botão azul **+**
3. Preencha o formulário
4. Clique em "Criar Viagem"

Veja guia completo no [LEIA-ME.md](./LEIA-ME.md)

---

## 💻 Para Desenvolvedores

### Onde está o código principal?
```
/src/app/App.tsx - Componente principal
/src/app/components/ - Todos os componentes
/src/app/context/ - Gerenciamento de estado
```

### Como adiciono um novo componente?
1. Crie arquivo em `/src/app/components/`
2. Use TypeScript
3. Siga padrões do design system
4. Importe e use

Veja exemplos em [EXEMPLOS-CODIGO.md](./EXEMPLOS-CODIGO.md)

### Como funciona o estado global?
Usamos Context API com dois contextos:
- **NavigationContext** - Navegação entre telas
- **TripsContext** - Gerenciamento de viagens

Veja detalhes em [DOCUMENTACAO.md](./DOCUMENTACAO.md)

### Por que não usa Redux?
Context API é suficiente para este caso de uso. É mais simples e atende perfeitamente às necessidades do app.

### Como adiciono persistência de dados?
Opções:
1. **LocalStorage** (mais simples)
2. **Backend com Supabase** (planejado v2.0)

Exemplo de LocalStorage:
```tsx
// Salvar
localStorage.setItem('trips', JSON.stringify(trips));

// Carregar
const saved = localStorage.getItem('trips');
const trips = saved ? JSON.parse(saved) : [];
```

### Posso usar outra biblioteca de ícones?
Sim, mas recomendamos manter Lucide React por consistência.

---

## 🎨 Design

### Quais são as cores principais?
```
Azul Céu:  #0EA5E9
Branco:    #FFFFFF
Cinza:     #6B7280
Âmbar:     #F59E0B
Vermelho:  #EF4444
```

Veja paleta completa em [GUIA-VISUAL.md](./GUIA-VISUAL.md)

### Por que não vejo as barras de rolagem?
É proposital! Parte do design minimalista. O scroll funciona normalmente, mas as barras estão escondidas visualmente.

### Como altero as cores?
As cores usam Tailwind classes:
- `bg-sky-500` - Azul principal
- `text-gray-600` - Texto secundário
- etc.

Consulte [GUIA-VISUAL.md](./GUIA-VISUAL.md) para o design system completo.

### Posso mudar o layout?
Sim, mas siga os princípios:
1. Mobile-first
2. Minimalista
3. Cores da paleta
4. Espaçamentos consistentes

---

## ⚙️ Funcionalidades

### Como marco uma tarefa como concluída?
Clique diretamente na tarefa (no círculo ou no texto).

### Como excluo uma tarefa?
1. Passe o mouse sobre a tarefa
2. Clique no ícone de lixeira que aparece
3. Confirme a exclusão

### O progresso é manual ou automático?
**Automático!** É calculado baseado nas tarefas:
```
Progresso = (Tarefas Concluídas / Total de Tarefas) × 100
```

### Posso editar uma viagem depois de criada?
Atualmente não, mas está planejado para v1.1. Por enquanto, você pode:
- Adicionar/remover tarefas
- Excluir e recriar a viagem

### Quantas viagens posso criar?
Ilimitado! Mas lembre-se que os dados estão em memória, então serão perdidos ao recarregar a página.

### Os dados são salvos?
Não atualmente. Os dados ficam em memória durante a sessão. Planejamos:
- v1.1: LocalStorage
- v2.0: Backend com Supabase

---

## 🐛 Problemas Conhecidos

### Meus dados sumiram ao recarregar!
Isso é esperado. Atualmente não há persistência. Os dados ficam apenas em memória durante a sessão.

### A estatística não está atualizando
Deveria atualizar automaticamente. Tente:
1. Navegar para outra tela e voltar
2. Recarregar a página

Se persistir, é um bug - reporte!

### O botão não está funcionando
Verifique no console do navegador se há erros. Reporte com:
- Qual botão
- Qual tela
- Mensagem de erro (se houver)

---

## 📱 Mobile

### Funciona em celular?
Sim! O design é mobile-first, otimizado para celular.

### Posso instalar como app?
Não atualmente. É uma web app que roda no navegador. PWA está planejado para versões futuras.

### Touch funciona?
Sim, todos os gestos touch básicos funcionam.

### Por que algumas coisas parecem pequenas no desktop?
O design é mobile-first. No desktop, mantenha a janela em tamanho médio (não maximize) para melhor visualização.

---

## 📚 Documentação

### Onde encontro a documentação?
Temos 6 documentos principais:
1. **README.md** - Visão geral
2. **LEIA-ME.md** - Guia de uso
3. **DOCUMENTACAO.md** - Docs técnica
4. **EXEMPLOS-CODIGO.md** - Exemplos práticos
5. **GUIA-VISUAL.md** - Design system
6. **CHANGELOG.md** - Histórico

Use o [INDICE-DOCUMENTACAO.md](./INDICE-DOCUMENTACAO.md) para navegar.

### A documentação está em inglês?
Não! Toda documentação está em **português** (PT-BR).

### Posso contribuir com a docs?
Sim! Mantenha:
- Português claro
- Exemplos práticos
- Formatação consistente

---

## 🚀 Próximas Versões

### Quando sai a v1.1?
Sem data definida. Acompanhe o [CHANGELOG.md](./CHANGELOG.md)

### O que vem na v1.1?
- Editar viagens
- LocalStorage (persistência)
- Toast notifications
- Melhorias gerais

### Quando terá backend?
Planejado para v2.0. Usaremos Supabase.

### Posso sugerir funcionalidades?
Sim! Abra uma issue ou entre em contato.

---

## 🔧 Customização

### Posso personalizar o design?
Sim! É open source. Mas mantenha:
- Mobile-first
- Acessibilidade
- Performance

### Como adiciono uma nova tela?
1. Crie componente em `/src/app/components/screens/`
2. Adicione no `App.tsx`
3. Adicione opção no `BottomNavigation.tsx`
4. Atualize `NavigationContext.tsx`

Veja exemplo em [EXEMPLOS-CODIGO.md](./EXEMPLOS-CODIGO.md)

### Posso usar em produção?
É um protótipo educacional. Para produção:
1. Adicione persistência de dados
2. Implemente autenticação
3. Adicione validações de segurança
4. Configure backend
5. Faça testes completos

---

## 🤝 Contribuição

### Como contribuo?
1. Fork o projeto
2. Leia a documentação
3. Siga os padrões de código
4. Teste tudo
5. Faça pull request

### Preciso saber React?
Sim, conhecimento de React + TypeScript é necessário.

### Tem guia de contribuição?
Veja:
- [DOCUMENTACAO.md](./DOCUMENTACAO.md) - Arquitetura
- [EXEMPLOS-CODIGO.md](./EXEMPLOS-CODIGO.md) - Padrões
- [GUIA-VISUAL.md](./GUIA-VISUAL.md) - Design

---

## 🎓 Aprendizado

### É bom para aprender React?
Sim! O projeto demonstra:
- Context API
- Hooks (useState, useEffect, useContext)
- TypeScript
- Componentes reutilizáveis
- Tailwind CSS
- Boas práticas

### Posso usar em portfólio?
Sim! É um projeto completo e funcional, perfeito para portfólio.

### Tem tutorial passo a passo?
A documentação funciona como tutorial. Siga a ordem:
1. [README.md](./README.md)
2. [DOCUMENTACAO.md](./DOCUMENTACAO.md)
3. [EXEMPLOS-CODIGO.md](./EXEMPLOS-CODIGO.md)

---

## 📊 Performance

### O app é rápido?
Sim! É bem otimizado:
- Componentes leves
- Sem bibliotecas pesadas
- Animações CSS
- Código eficiente

### Como otimizo mais?
- Use React.memo para componentes pesados
- Implemente virtualização em listas longas
- Lazy load de imagens
- Code splitting

---

## 🌐 Idiomas

### Tem em inglês?
Não, apenas português (PT-BR).

### Posso traduzir?
Sim! Contribuições são bem-vindas. Implemente i18n (internacionalização).

---

## 🔒 Segurança

### É seguro usar?
É um protótipo sem backend. Não há:
- Autenticação
- Dados sensíveis
- Comunicação com servidor

Para produção, implemente segurança adequada.

### Posso armazenar dados pessoais?
Este protótipo não é adequado para dados sensíveis. Não use para:
- Informações bancárias
- Documentos pessoais
- Dados confidenciais

---

## 💡 Dicas

### Melhor browser para usar?
Chrome ou Edge (ambos baseados em Chromium). Também funciona em:
- Firefox
- Safari
- Opera

### Atalhos de teclado?
Atualmente não há. Planejado para versões futuras.

### Como reporto bugs?
Forneça:
1. Descrição do problema
2. Passos para reproduzir
3. Browser e versão
4. Screenshots

---

## 📞 Suporte

### Onde peço ajuda?
1. Leia a [documentação](./INDICE-DOCUMENTACAO.md)
2. Veja este FAQ
3. Verifique issues abertas
4. Abra nova issue

### Quanto tempo demora para responder?
Este é um projeto educacional mantido por contribuidores. Não há SLA definido.

### Tem comunidade/Discord?
Não atualmente.

---

## 🎯 Casos de Uso

### Para que serve este app?
- Planejar viagens pessoais
- Organizar tarefas de viagem
- Acompanhar progresso
- Aprender React/TypeScript
- Portfólio de desenvolvedores
- Estudo de UI/UX

### Não serve para?
- Reservar passagens/hotéis
- Pagamentos
- Compartilhar publicamente
- Uso comercial sem adaptações
- Dados sensíveis

---

## 📈 Estatísticas

### Quantas linhas de código?
~2.000+ linhas de código
~24.500 palavras de documentação

### Quantos componentes?
12+ componentes principais

### Tamanho do projeto?
~2-3 MB (com node_modules: ~200MB)

---

## 🏆 Créditos

### Quem fez?
Este é um projeto educacional desenvolvido para demonstrar boas práticas de desenvolvimento web.

### Posso usar comercialmente?
Verifique a licença. Para uso educacional, está liberado.

---

## ❓ Não Encontrou sua Pergunta?

1. Consulte a [documentação completa](./INDICE-DOCUMENTACAO.md)
2. Busque nas issues do projeto
3. Abra uma nova issue com sua dúvida

---

<div align="center">

**Alguma pergunta não respondida?**

[Abrir Issue](.) • [Ver Docs](./INDICE-DOCUMENTACAO.md) • [Contribuir](./README.md)

</div>
