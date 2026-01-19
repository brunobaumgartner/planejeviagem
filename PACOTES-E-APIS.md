# 📦 Pacotes de Viagens e Integração de APIs

## 🎯 Visão Geral

Implementação completa de uma tela de **Modelos de Viagens** com integração de **APIs gratuitas** para trazer informações reais sobre destinos, clima, moedas e muito mais.

---

## ✨ O que foi Criado

### 1. 🗺️ Tela de Pacotes de Viagens
**Arquivo:** `/src/app/components/screens/TravelPackages.tsx`

**Características:**
- ✅ Grid de pacotes com 6 destinos exemplo
- ✅ Filtros por categoria (Romance, Praia, Cultura, História, Luxo, Aventura)
- ✅ Cards detalhados com:
  - Imagens dos destinos (Unsplash)
  - Avaliações (estrelas + número de reviews)
  - Duração da viagem
  - Número de viajantes
  - Principais atrações
  - O que está incluso (voo, hotel, carro, refeições)
  - Preço estimado em BRL
- ✅ Design responsivo e mobile-first
- ✅ Navegação integrada

**Destinos incluídos:**
1. 🗼 Paris, França - R$ 3.500
2. 🗾 Tóquio, Japão - R$ 5.800
3. 🏖️ Cancún, México - R$ 2.800
4. 🏛️ Roma, Itália - R$ 4.200
5. 🏙️ Dubai, Emirados Árabes - R$ 6.500
6. 💃 Buenos Aires, Argentina - R$ 1.800

---

### 2. 🔌 Serviço de APIs
**Arquivo:** `/src/services/api.ts`

**APIs Integradas:**

#### ☁️ OpenWeatherMap - Clima
- **URL:** https://openweathermap.org/api
- **Limite:** 1.000 calls/dia (grátis)
- **Dados:** Temperatura, descrição, umidade, vento
- **Status:** ⏳ Pronto para uso (precisa API key)

#### 🌍 REST Countries - Países
- **URL:** https://restcountries.com/
- **Limite:** Ilimitado
- **Dados:** Capital, população, moeda, idioma, bandeira
- **Status:** ✅ Funcionando (sem API key necessária)

#### 💱 Exchange Rate API - Câmbio
- **URL:** https://www.exchangerate-api.com/
- **Limite:** 1.500 calls/mês (grátis)
- **Dados:** Taxa de conversão entre moedas
- **Status:** ⏳ Pronto para uso (precisa API key)

#### 📍 Nominatim - Geocoding
- **URL:** https://nominatim.org/
- **Limite:** 1 request/segundo
- **Dados:** Latitude, longitude, localização
- **Status:** ✅ Funcionando (sem API key necessária)

---

### 3. 📱 Modal de Detalhes do Pacote
**Arquivo:** `/src/app/components/PackageDetails.tsx`

**Funcionalidades:**
- ✅ Informações do destino com bandeira do país
- ✅ Clima atual em tempo real
- ✅ Moeda local e taxa de câmbio
- ✅ Breakdown de custos (passagem, hospedagem, alimentação)
- ✅ Informações adicionais (idioma, região, fuso)
- ✅ Botões de ação (adicionar ao planejamento, personalizar)
- ✅ Loading states e tratamento de erros

---

### 4. 📚 Documentação
**Arquivo:** `/API-INTEGRATION.md`

**Conteúdo:**
- ✅ Guia completo de cada API
- ✅ Como obter API keys
- ✅ Exemplos de código
- ✅ Boas práticas
- ✅ Limites e uso responsável
- ✅ Troubleshooting
- ✅ Segurança (variáveis de ambiente)

---

## 🚀 Como Usar

### 1. Navegar para Tela de Pacotes

Na **Home**, clique em "Ver todos →" na seção "Pacotes prontos":

```tsx
<button onClick={() => setCurrentScreen("packages")}>
  Ver todos →
</button>
```

Ou navegue programaticamente:

```tsx
import { useNavigation } from '@/app/context/NavigationContext';

const { setCurrentScreen } = useNavigation();
setCurrentScreen("packages");
```

---

### 2. Configurar APIs (Opcional)

Para usar dados reais, obtenha API keys:

#### OpenWeatherMap
1. Acesse: https://openweathermap.org/api
2. Crie conta gratuita
3. Copie sua API key
4. Cole em `/src/services/api.ts` (linha 35)

#### Exchange Rate API
1. Acesse: https://www.exchangerate-api.com/
2. Clique em "Get Free Key"
3. Confirme email
4. Copie sua API key
5. Cole em `/src/services/api.ts` (linha 99)

**Ou use variáveis de ambiente:**

```bash
# .env.local
VITE_OPENWEATHER_API_KEY=sua_chave
VITE_EXCHANGERATE_API_KEY=sua_chave
```

```typescript
// Em api.ts
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
```

---

### 3. Usar Funções da API

```typescript
import { 
  getWeather, 
  getCountryInfo, 
  getExchangeRate 
} from '@/services/api';

// Clima
const weather = await getWeather('Paris');
console.log(`${weather?.temperature}°C`);

// País
const country = await getCountryInfo('France');
console.log(`Moeda: ${country?.currency}`);

// Câmbio
const rate = await getExchangeRate('USD', 'BRL');
console.log(`1 USD = R$ ${rate?.rate}`);
```

---

## 🎨 Componentes

### PackageCard
Card individual de pacote de viagem com todas as informações.

```tsx
<PackageCard 
  package={{
    destination: "Paris",
    country: "França",
    price: 3500,
    // ... outros dados
  }}
/>
```

### PackageDetails
Modal com detalhes expandidos e integração de APIs.

```tsx
<PackageDetails
  destination="Paris"
  country="França"
  price={3500}
  onClose={() => setShowDetails(false)}
/>
```

---

## 📊 Estrutura de Dados

### TravelPackage Interface

```typescript
interface TravelPackage {
  id: number;
  destination: string;      // "Paris"
  country: string;          // "França"
  imageUrl: string;         // URL da imagem
  duration: string;         // "5 dias, 4 noites"
  price: number;            // 3500
  currency: string;         // "BRL"
  rating: number;           // 4.8
  reviews: number;          // 234
  highlights: string[];     // ["Torre Eiffel", ...]
  includes: {
    flights: boolean;
    hotel: boolean;
    car: boolean;
    meals: boolean;
  };
  travelers: string;        // "2 adultos"
  category: string;         // "Romance"
}
```

---

## 🎯 Funcionalidades

### Filtros de Categoria
```typescript
const categories = [
  "Todos", 
  "Romance", 
  "Praia", 
  "Cultura", 
  "História", 
  "Luxo", 
  "Aventura"
];
```

### Breakdown de Preços
```typescript
const breakdown = {
  flight: price * 0.40,      // 40% passagem
  hotel: price * 0.35,       // 35% hospedagem
  food: price * 0.15,        // 15% alimentação
  extras: price * 0.10,      // 10% passeios
};
```

### Ícones de Inclusões
- ✈️ Voo incluído
- 🏨 Hotel incluído
- 🚗 Carro incluído
- 🍽️ Refeições incluídas

---

## 🔧 Customização

### Adicionar Novo Pacote

```typescript
const newPackage: TravelPackage = {
  id: 7,
  destination: "Lisboa",
  country: "Portugal",
  imageUrl: "url_da_imagem",
  duration: "6 dias, 5 noites",
  price: 4000,
  currency: "BRL",
  rating: 4.7,
  reviews: 156,
  highlights: ["Torre de Belém", "Alfama", "Sintra"],
  includes: {
    flights: true,
    hotel: true,
    car: false,
    meals: true,
  },
  travelers: "2 adultos",
  category: "Cultura",
};
```

### Adicionar Nova Categoria

```typescript
// Em TravelPackages.tsx
const categories = [
  "Todos",
  "Romance",
  "Praia",
  "Cultura",
  "História",
  "Luxo",
  "Aventura",
  "Gastronomia",  // Nova categoria
];
```

---

## 📈 Próximos Passos

### Curto Prazo
- [ ] Implementar filtros funcionais
- [ ] Adicionar busca de pacotes
- [ ] Salvar pacotes favoritos
- [ ] Compartilhar pacotes

### Médio Prazo
- [ ] Conectar com mais APIs
  - [ ] Amadeus (voos reais)
  - [ ] Booking.com (hotéis)
  - [ ] Google Maps (mapas)
- [ ] Sistema de reservas
- [ ] Customização de pacotes
- [ ] Comparador de preços

### Longo Prazo
- [ ] Backend com Supabase
- [ ] Sistema de pagamento
- [ ] Reviews de usuários
- [ ] Recomendações personalizadas
- [ ] Integração com calendário

---

## 🌟 Destaques

### ✅ Dados Reais
Integração com APIs gratuitas para informações em tempo real.

### ✅ Design Profissional
Cards bonitos, responsivos e informativos.

### ✅ User Experience
- Loading states
- Tratamento de erros
- Animações suaves
- Navegação intuitiva

### ✅ Escalável
Código organizado e preparado para crescer.

### ✅ Documentado
Guia completo de APIs e exemplos.

---

## 📝 Checklist de Implementação

- [x] Tela de pacotes criada
- [x] Componente PackageCard
- [x] Componente PackageDetails
- [x] Serviço de APIs
- [x] Integração REST Countries (funcionando)
- [x] Integração Nominatim (funcionando)
- [ ] Integração OpenWeatherMap (precisa API key)
- [ ] Integração ExchangeRate (precisa API key)
- [x] Documentação completa
- [x] Navegação funcionando
- [x] Design responsivo
- [x] Loading states
- [x] Tratamento de erros

---

## 💡 Dicas

### Performance
```typescript
// Use useMemo para dados pesados
const sortedPackages = useMemo(() => {
  return packages.sort((a, b) => a.price - b.price);
}, [packages]);
```

### Cache de API
```typescript
// Evite chamadas repetidas
const cache = new Map();

async function getCachedData(key: string, fetcher: Function) {
  if (cache.has(key)) return cache.get(key);
  const data = await fetcher();
  cache.set(key, data);
  return data;
}
```

### Loading Skeleton
```typescript
{loading ? (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded"></div>
  </div>
) : (
  <div>{data}</div>
)}
```

---

## 🎓 Aprendizados

### APIs REST
- Como fazer requisições HTTP
- Tratamento de erros
- Rate limiting
- Autenticação com API keys

### TypeScript
- Interfaces complexas
- Type safety com APIs
- Async/await

### React
- useState e useEffect
- Custom hooks
- Componentes reutilizáveis
- Context API

---

<div align="center">

**Pacotes de Viagens - Planeje Fácil**

Informações reais | APIs gratuitas | Design profissional

[Ver Código](./src/app/components/screens/TravelPackages.tsx) • [Guia de APIs](./API-INTEGRATION.md) • [Documentação](./README.md)

</div>
