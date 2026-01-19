# 🎨 Design do Logo - Planeje Fácil

## 📐 Conceito do Logo

O logo do **Planeje Fácil** utiliza a letra **P** estilizada como um **caminho de viagem**, com **pontos conectados** representando etapas do planejamento.

### Simbolismo

- **P** → Inicial de "Planeje" e caminho visual
- **📍 Pontos** → Etapas da jornada, marcos do planejamento
- **🛤️ Caminho** → Jornada de viagem, progresso contínuo
- **⚪ Início e Fim** → Pontos maiores marcando origem e destino

### Filosofia do Design

1. **Minimalismo** - Forma simples e reconhecível
2. **Tecnológico** - Design clean e moderno
3. **Confiável** - Estrutura sólida e equilibrada
4. **Memorável** - Fácil de lembrar e reproduzir
5. **Escalável** - Funciona em qualquer tamanho

---

## 🎭 Variações do Logo

### 1. Logo Completo (`variant="full"`)
**Uso:** Header, branding principal

```tsx
<Logo size={40} variant="full" />
```

**Composição:**
- Letra P como caminho
- 6 pontos de etapas
- Texto "Planeje Fácil"
- Ideal para: Headers, telas principais

**Dimensões recomendadas:** 32-48px

---

### 2. Apenas Ícone (`variant="icon"`)
**Uso:** Favicon, app icon, espaços reduzidos

```tsx
<Logo size={40} variant="icon" />
```

**Composição:**
- Apenas o símbolo P + pontos
- Sem texto
- Ponto final com animação pulsante
- Ideal para: Favicon, botões, ícones de app

**Dimensões recomendadas:** 16-128px

---

### 3. Apenas Texto (`variant="text"`)
**Uso:** Rodapés, textos inline

```tsx
<Logo variant="text" />
```

**Composição:**
- Apenas "Planeje Fácil"
- Sem ícone
- Ideal para: Rodapés, menções de marca

---

### 4. Logo Gradiente (`<LogoGradient />`)
**Uso:** Versão premium com gradiente

```tsx
<LogoGradient size={40} />
```

**Composição:**
- P com gradiente azul céu
- Sombra suave
- Efeito mais rico
- Ideal para: Landing pages, marketing

**Dimensões recomendadas:** 40-80px

---

### 5. Logo Circular (`<LogoCircular />`)
**Uso:** App icon, ícone de perfil

```tsx
<LogoCircular size={64} className="text-sky-500" />
```

**Composição:**
- Círculo de fundo colorido
- P em branco centralizado
- Perfeito para ícones circulares
- Ideal para: App stores, avatares

**Tamanho recomendado:** 64-512px

---

### 6. Logo Splash (`<LogoSplash />`)
**Uso:** Tela de abertura do app

```tsx
<LogoSplash />
```

**Composição:**
- Versão grande (120px)
- Animação de desenhar o caminho
- Pontos aparecem sequencialmente
- Efeito de blur/glow
- Texto incluído
- Ideal para: Splash screen apenas

**Tamanho fixo:** 120px

---

## 🎨 Anatomia do Logo

### Elementos Gráficos

```
┌─────────────────────────────────────┐
│                                     │
│     ●  ← Início (r=5)              │
│    /                                │
│   ●  ← Etapa 1 (r=4)               │
│    \                                │
│     ●  ← Etapa 2 (r=4)             │
│    P                                │
│     ●  ← Etapa 3 (r=4)             │
│    |                                │
│     ●  ← Etapa 4 (r=4)             │
│    |                                │
│     ●  ← Destino (r=5, pulsante)   │
│                                     │
└─────────────────────────────────────┘

Elementos:
• Caminho P: strokeWidth=6
• Pontos: 2 grandes (r=5) + 4 médios (r=4)
• Opacidade: 100% (início/fim) | 80% (etapas)
```

### Estrutura do Caminho P

```
Coordenadas principais:
- Base vertical: x=25
- Topo: y=15
- Base: y=85
- Curva direita: x=60-75

Curva Bezier:
- Início: (25, 15)
- Controle: (45, 10), (60, 20)
- Topo curva: (75, 30)
- Meio: (75, 45)
- Retorno: (60, 55)
- Fim: (25, 55)
```

---

## 🎨 Cores

### Cor Principal
```css
Azul Céu: #0EA5E9 (sky-500)
```

**Aplicação:**
- Todo o logo usa `currentColor`
- Herde a cor do elemento pai
- Exemplo: `className="text-sky-500"`

### Gradiente (LogoGradient)
```css
--gradient-start: #7DD3FC (sky-300)
--gradient-end: #0EA5E9 (sky-500)
Direção: diagonal (top-left to bottom-right)
```

### Variações de Cor

```tsx
// Azul (padrão)
<Logo className="text-sky-500" />

// Branco (para fundos escuros)
<Logo className="text-white" />

// Cinza (versão neutra)
<Logo className="text-gray-600" />

// Preto (para impressão)
<Logo className="text-black" />
```

### Logo Circular
```css
Fundo: currentColor (azul)
P e pontos: white
Contraste: Sempre 100%
```

---

## 📏 Tamanhos Recomendados

### Por Contexto

| Contexto | Tamanho | Variante |
|----------|---------|----------|
| Favicon 16x16 | 16px | `icon` |
| Favicon 32x32 | 32px | `icon` |
| Header mobile | 32px | `full` |
| Header desktop | 40-48px | `full` |
| App icon iOS | 64-180px | `circular` |
| App icon Android | 72-512px | `circular` |
| Splash screen | 120px | `splash` |
| Marketing | 64-96px | `gradient` |

### Grid de Tamanhos

```
16px  ●     Favicon pequeno
32px  ●●    Header mobile
40px  ●●●   Header desktop padrão
48px  ●●●●  Header grande
64px  ●●●●● App icon pequeno
120px ●●●●●●●●● Splash screen
512px ●●●●●●●●●●●●●●●● App store
```

---

## ✨ Animações

### Splash Screen
**Sequência animada:**

```
1. Caminho P (0-1.5s)  → Desenha da base ao topo
2. Ponto início (0.3s) → Fade in
3. Ponto 1 (0.5s)      → Fade in
4. Ponto 2 (0.7s)      → Fade in
5. Ponto 3 (0.9s)      → Fade in
6. Ponto 4 (1.1s)      → Fade in
7. Ponto fim (1.3s)    → Fade in
8. Texto (1.5s)        → Fade in
```

**Efeito de desenhar:**
```css
@keyframes drawPath {
  from { stroke-dashoffset: 300; }
  to { stroke-dashoffset: 0; }
}
```

### Ícone Pulsante
```tsx
<animate
  attributeName="r"
  values="5;6.5;5"
  dur="2s"
  repeatCount="indefinite"
/>
```

O ponto final pulsa continuamente na versão `icon`.

---

## 🖼️ Espaçamento

### Área de Proteção
```
┌─────────────────────────────┐
│                             │
│  [8px espaço mínimo]       │
│                             │
│     ┌────────────┐         │
│     │    LOGO    │         │
│     └────────────┘         │
│                             │
│  [8px espaço mínimo]       │
│                             │
└─────────────────────────────┘
```

**Regra:** Mínimo 8px de margem em todos os lados.

---

## 🎯 Guia de Uso

### ✅ Faça

- ✅ Use as variantes apropriadas para cada contexto
- ✅ Mantenha proporções originais
- ✅ Use cores da paleta oficial
- ✅ Mantenha área de proteção
- ✅ Use `LogoCircular` para ícones de app
- ✅ Use `LogoGradient` para destaque visual

### ❌ Não Faça

- ❌ Distorcer ou esticar o logo
- ❌ Mudar a estrutura do P
- ❌ Remover ou adicionar pontos
- ❌ Usar cores não aprovadas
- ❌ Adicionar efeitos 3D pesados
- ❌ Rotacionar o logo
- ❌ Mudar opacidade dos elementos

---

## 📱 Para App Stores

### iOS (App Store)

```tsx
// Gerar ícones iOS
<LogoCircular size={180} className="text-sky-500" />
```

Tamanhos necessários:
- 20x20 (@2x, @3x)
- 29x29 (@2x, @3x)
- 40x40 (@2x, @3x)
- 60x60 (@2x, @3x)
- 76x76 (@1x, @2x)
- 83.5x83.5 (@2x)
- 1024x1024 (App Store)

### Android (Play Store)

```tsx
<LogoCircular size={512} className="text-sky-500" />
```

Tamanhos necessários:
- 48x48 (mdpi)
- 72x72 (hdpi)
- 96x96 (xhdpi)
- 144x144 (xxhdpi)
- 192x192 (xxxhdpi)
- 512x512 (Play Store)

---

## 🎨 Variações de Estilo

### Padrão (Atual)
```tsx
<Logo className="text-sky-500" />
```
- Stroke: 6px
- Pontos: sólidos
- Estilo: clean e moderno

### Versão Fina
```tsx
// Modificar strokeWidth para 4
<Logo className="text-sky-500" />
```
- Mais delicado
- Para contextos refinados

### Versão Grossa
```tsx
// Modificar strokeWidth para 8
<Logo className="text-sky-500" />
```
- Mais robusto
- Para impressão

---

## 🎨 Exemplos de Implementação

### Header
```tsx
import { Logo } from './components/Logo';

function Header() {
  return (
    <header className="bg-white border-b">
      <Logo size={40} variant="full" className="text-sky-500" />
    </header>
  );
}
```

### Splash Screen
```tsx
import { LogoSplash } from './components/Logo';

function Splash() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LogoSplash />
    </div>
  );
}
```

### App Icon (HTML)
```tsx
<LogoCircular size={64} className="text-sky-500" />
```

### Com Gradiente
```tsx
import { LogoGradient } from './components/Logo';

<LogoGradient size={64} />
```

---

## 📊 Comparação de Variantes

| Variante | Tamanho | Animação | Cor | Uso Principal |
|----------|---------|----------|-----|---------------|
| `full` | 32-48px | Não | Flexível | Headers |
| `icon` | 16-128px | Sim (pulso) | Flexível | Favicons |
| `text` | Auto | Não | Flexível | Rodapés |
| `gradient` | 40-80px | Não | Fixo | Marketing |
| `circular` | 64-512px | Não | Fundo+Branco | App icons |
| `splash` | 120px | Sim (draw) | Sky-500 | Splash |

---

## 🎓 Filosofia do Design

### Por que a letra P?

1. **Reconhecimento imediato** - Letra inicial de "Planeje"
2. **Forma perfeita** - Curva natural sugere caminho
3. **Versatilidade** - Funciona em qualquer tamanho
4. **Memorabilidade** - Fácil de lembrar e reproduzir

### Por que pontos conectados?

1. **Etapas** - Cada ponto é uma tarefa/marco
2. **Progresso** - Visualização da jornada
3. **Planejamento** - Estrutura organizada
4. **Simplicidade** - Conceito universal

### Por que o estilo clean?

1. **Modernidade** - Design atemporal
2. **Tecnologia** - Confiável e profissional
3. **Clareza** - Sem elementos desnecessários
4. **Escalabilidade** - Funciona em qualquer contexto

---

## 📝 Checklist de Qualidade

Antes de usar o logo:

- [ ] Tamanho apropriado (16-512px)
- [ ] Variante correta escolhida
- [ ] Cor da paleta oficial
- [ ] Área de proteção respeitada (8px)
- [ ] Testado em fundo claro
- [ ] Testado em fundo escuro
- [ ] Testado em diferentes resoluções
- [ ] Acessibilidade verificada (contraste)
- [ ] Formato correto (SVG preferencial)

---

## 🎨 Exportar SVG Standalone

Para usar fora do React:

```svg
<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Caminho P -->
  <path d="M 25 85 L 25 15 C 25 15, 45 10, 60 20 C 75 30, 75 45, 60 55 C 50 62, 35 60, 25 55" 
        stroke="#0EA5E9" stroke-width="6" stroke-linecap="round" 
        stroke-linejoin="round" fill="none"/>
  
  <!-- Pontos -->
  <circle cx="25" cy="15" r="5" fill="#0EA5E9"/>
  <circle cx="45" cy="18" r="4" fill="#0EA5E9" opacity="0.8"/>
  <circle cx="65" cy="30" r="4" fill="#0EA5E9" opacity="0.8"/>
  <circle cx="70" cy="45" r="4" fill="#0EA5E9" opacity="0.8"/>
  <circle cx="60" cy="55" r="4" fill="#0EA5E9" opacity="0.8"/>
  <circle cx="25" cy="55" r="5" fill="#0EA5E9"/>
</svg>
```

---

<div align="center">

**Logo Planeje Fácil v2.0**

Design minimalista | Letra P como caminho | Pontos de etapas

[Ver Código](./src/app/components/Logo.tsx) • [Design System](./GUIA-VISUAL.md)

</div>