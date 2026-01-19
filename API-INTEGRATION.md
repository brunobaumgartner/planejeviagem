# 🌐 Guia de Integração de APIs - Planeje Fácil

Este documento explica como integrar APIs gratuitas no aplicativo para obter informações reais sobre viagens.

---

## 📋 APIs Gratuitas Disponíveis

### 1. ☁️ OpenWeatherMap - Clima e Temperatura

**O que faz:** Fornece dados de clima em tempo real para qualquer cidade do mundo.

**Limite gratuito:** 1.000 chamadas/dia

**Como obter API Key:**

1. Acesse: https://openweathermap.org/api
2. Clique em "Sign Up" (criar conta gratuita)
3. Confirme seu email
4. Vá em "API Keys" no dashboard
5. Copie sua chave API

**Como configurar:**

```typescript
// Em /src/services/api.ts, linha 35
const API_KEY = 'sua_chave_aqui';
```

**Dados fornecidos:**
- ✅ Temperatura atual
- ✅ Descrição do clima
- ✅ Umidade
- ✅ Velocidade do vento
- ✅ Ícone do clima

**Exemplo de resposta:**
```json
{
  "temperature": 28,
  "description": "céu limpo",
  "humidity": 65,
  "windSpeed": 5.2
}
```

---

### 2. 🌍 REST Countries - Informações de Países

**O que faz:** Fornece informações detalhadas sobre todos os países do mundo.

**Limite gratuito:** Ilimitado (sem necessidade de API Key)

**URL:** https://restcountries.com/

**Como usar:**

```typescript
import { getCountryInfo } from '@/services/api';

const info = await getCountryInfo('France');
console.log(info);
```

**Dados fornecidos:**
- ✅ Nome oficial do país
- ✅ Capital
- ✅ População
- ✅ Moeda (símbolo e código)
- ✅ Idioma oficial
- ✅ Bandeira (SVG)
- ✅ Região
- ✅ Fuso horário

**Exemplo de resposta:**
```json
{
  "name": "France",
  "capital": "Paris",
  "population": 67391582,
  "currency": "EUR",
  "currencySymbol": "€",
  "language": "French",
  "flag": "https://flagcdn.com/fr.svg"
}
```

---

### 3. 💱 Exchange Rate API - Taxas de Câmbio

**O que faz:** Fornece taxas de câmbio atualizadas entre moedas.

**Limite gratuito:** 1.500 chamadas/mês

**Como obter API Key:**

1. Acesse: https://www.exchangerate-api.com/
2. Clique em "Get Free Key"
3. Preencha o formulário
4. Confirme seu email
5. Copie sua chave API

**Como configurar:**

```typescript
// Em /src/services/api.ts, linha 99
const API_KEY = 'sua_chave_aqui';
```

**Dados fornecidos:**
- ✅ Taxa de conversão entre moedas
- ✅ Data da última atualização
- ✅ Suporte para 160+ moedas

**Exemplo de resposta:**
```json
{
  "from": "USD",
  "to": "BRL",
  "rate": 5.45,
  "lastUpdate": "2026-01-13T10:00:00Z"
}
```

---

### 4. 📍 Nominatim (OpenStreetMap) - Geocoding

**O que faz:** Converte nomes de lugares em coordenadas (latitude/longitude).

**Limite gratuito:** Gratuito, com rate limit de 1 request/segundo

**URL:** https://nominatim.org/

**Como usar:**

```typescript
import { geocodeCity } from '@/services/api';

const location = await geocodeCity('Paris');
console.log(location.lat, location.lon);
```

**Observação importante:**
- ⚠️ Deve incluir um User-Agent nas requisições
- ⚠️ Respeite o rate limit de 1 request/segundo
- ⚠️ Não faça milhares de requisições (use cache)

**Dados fornecidos:**
- ✅ Latitude
- ✅ Longitude
- ✅ Nome completo do local
- ✅ País

---

### 5. 🖼️ Unsplash - Imagens de Alta Qualidade

**O que faz:** Fornece imagens profissionais de destinos turísticos.

**Status:** Já integrado via `unsplash_tool`

**Como usar:**

```typescript
// O unsplash_tool já está configurado
// Basta usar na aplicação
```

---

## 🚀 Como Começar

### Passo 1: Obter API Keys

1. **OpenWeatherMap** (para clima)
   - Crie conta gratuita
   - Obtenha API key

2. **ExchangeRate API** (para câmbio)
   - Crie conta gratuita
   - Obtenha API key

### Passo 2: Configurar no Código

Abra `/src/services/api.ts` e substitua as chaves:

```typescript
// Linha 35 - OpenWeatherMap
const API_KEY = 'sua_chave_openweathermap';

// Linha 99 - ExchangeRate API
const API_KEY = 'sua_chave_exchangerate';
```

### Passo 3: Testar

```typescript
import { getWeather, getCountryInfo, getExchangeRate } from '@/services/api';

// Teste clima
const weather = await getWeather('Paris');
console.log('Clima:', weather);

// Teste país
const country = await getCountryInfo('France');
console.log('País:', country);

// Teste câmbio
const rate = await getExchangeRate('USD', 'BRL');
console.log('Câmbio:', rate);
```

---

## 📊 Limites e Uso Responsável

### Limites por API

| API | Chamadas Gratuitas | Período | Precisa Key? |
|-----|-------------------|---------|--------------|
| OpenWeatherMap | 1.000 | Por dia | ✅ Sim |
| REST Countries | Ilimitado | - | ❌ Não |
| ExchangeRate API | 1.500 | Por mês | ✅ Sim |
| Nominatim | 1/segundo | Rate limit | ❌ Não |
| Unsplash | Integrado | - | ❌ Não |

### Boas Práticas

1. **✅ Use Cache**
   ```typescript
   // Armazene resultados para evitar chamadas repetidas
   const cache = new Map();
   
   async function getCachedWeather(city: string) {
     if (cache.has(city)) {
       return cache.get(city);
     }
     const data = await getWeather(city);
     cache.set(city, data);
     return data;
   }
   ```

2. **✅ Trate Erros**
   ```typescript
   try {
     const weather = await getWeather('Paris');
   } catch (error) {
     console.error('Erro ao buscar clima:', error);
     // Mostre mensagem amigável ao usuário
   }
   ```

3. **✅ Use Loading States**
   ```typescript
   const [loading, setLoading] = useState(true);
   const [data, setData] = useState(null);
   
   useEffect(() => {
     async function load() {
       setLoading(true);
       const result = await getWeather('Paris');
       setData(result);
       setLoading(false);
     }
     load();
   }, []);
   ```

4. **✅ Implemente Retry Logic**
   ```typescript
   async function fetchWithRetry(fn: Function, retries = 3) {
     for (let i = 0; i < retries; i++) {
       try {
         return await fn();
       } catch (error) {
         if (i === retries - 1) throw error;
         await new Promise(r => setTimeout(r, 1000 * (i + 1)));
       }
     }
   }
   ```

---

## 🎯 Exemplos de Uso no App

### Exemplo 1: Mostrar Clima na Tela de Pacotes

```tsx
import { useState, useEffect } from 'react';
import { getWeather } from '@/services/api';

function PackageCard({ destination }) {
  const [weather, setWeather] = useState(null);
  
  useEffect(() => {
    getWeather(destination).then(setWeather);
  }, [destination]);
  
  return (
    <div>
      <h3>{destination}</h3>
      {weather && (
        <div>
          <p>🌡️ {weather.temperature}°C</p>
          <p>{weather.description}</p>
        </div>
      )}
    </div>
  );
}
```

### Exemplo 2: Converter Preços

```tsx
import { useState, useEffect } from 'react';
import { getExchangeRate, convertCurrency } from '@/services/api';

function PriceDisplay({ priceUSD }) {
  const [priceBRL, setPriceBRL] = useState(null);
  
  useEffect(() => {
    async function convert() {
      const rate = await getExchangeRate('USD', 'BRL');
      if (rate) {
        setPriceBRL(convertCurrency(priceUSD, rate.rate));
      }
    }
    convert();
  }, [priceUSD]);
  
  return (
    <div>
      <p>Preço: ${priceUSD}</p>
      {priceBRL && <p>≈ R$ {priceBRL.toFixed(2)}</p>}
    </div>
  );
}
```

### Exemplo 3: Informações do País

```tsx
import { useState, useEffect } from 'react';
import { getCountryInfo } from '@/services/api';

function CountryInfo({ countryName }) {
  const [info, setInfo] = useState(null);
  
  useEffect(() => {
    getCountryInfo(countryName).then(setInfo);
  }, [countryName]);
  
  if (!info) return <p>Carregando...</p>;
  
  return (
    <div>
      <img src={info.flag} alt={info.name} width="40" />
      <h4>{info.name}</h4>
      <p>Capital: {info.capital}</p>
      <p>Moeda: {info.currencySymbol} {info.currency}</p>
      <p>Idioma: {info.language}</p>
    </div>
  );
}
```

---

## 🔒 Segurança

### ⚠️ IMPORTANTE: Não exponha API Keys

**Problema:**
```typescript
// ❌ NUNCA faça isso em produção
const API_KEY = 'minha_chave_secreta_123';
```

**Solução:**
```typescript
// ✅ Use variáveis de ambiente
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
```

**Como configurar variáveis de ambiente:**

1. Crie arquivo `.env.local` na raiz do projeto:
```
VITE_OPENWEATHER_API_KEY=sua_chave_aqui
VITE_EXCHANGERATE_API_KEY=sua_chave_aqui
```

2. Adicione `.env.local` ao `.gitignore`:
```
.env.local
```

3. Use no código:
```typescript
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
```

---

## 🐛 Troubleshooting

### Problema: "API key inválida"

**Solução:**
- Verifique se copiou a chave corretamente
- Confirme que ativou a chave no site da API
- Aguarde alguns minutos (pode demorar para ativar)

### Problema: "CORS error"

**Solução:**
- Algumas APIs bloqueiam chamadas do navegador
- Use um proxy ou backend para fazer as chamadas
- Verifique se a API permite chamadas do frontend

### Problema: "Rate limit exceeded"

**Solução:**
- Implemente cache para reduzir chamadas
- Aguarde antes de fazer novas requisições
- Considere upgrade para plano pago se necessário

### Problema: "Network error"

**Solução:**
- Verifique sua conexão com internet
- Confirme que a URL da API está correta
- Teste a API diretamente no navegador

---

## 📚 Recursos Adicionais

### Documentação Oficial

- [OpenWeatherMap Docs](https://openweathermap.org/api)
- [REST Countries Docs](https://restcountries.com/)
- [ExchangeRate API Docs](https://www.exchangerate-api.com/docs)
- [Nominatim Docs](https://nominatim.org/release-docs/develop/api/Overview/)

### Ferramentas Úteis

- [Postman](https://www.postman.com/) - Testar APIs
- [RapidAPI](https://rapidapi.com/) - Hub de APIs
- [Public APIs](https://github.com/public-apis/public-apis) - Lista de APIs gratuitas

---

## 🎓 Próximos Passos

1. ✅ Obter API keys
2. ✅ Configurar no código
3. ✅ Testar cada API individualmente
4. ✅ Implementar cache
5. ✅ Adicionar tratamento de erros
6. ✅ Integrar nas telas do app
7. ✅ Otimizar performance
8. ✅ Monitorar uso de quota

---

## 💡 Dicas Profissionais

### 1. Use TypeScript

```typescript
interface WeatherResponse {
  temperature: number;
  description: string;
}

async function getWeather(city: string): Promise<WeatherResponse> {
  // ...
}
```

### 2. Crie um Hook Customizado

```typescript
function useWeather(city: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    getWeather(city)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [city]);
  
  return { data, loading, error };
}

// Uso
const { data: weather, loading } = useWeather('Paris');
```

### 3. Implemente Debounce

```typescript
import { debounce } from 'lodash';

const debouncedSearch = debounce(async (query) => {
  const results = await searchDestinations(query);
  setResults(results);
}, 500);
```

---

## 📞 Suporte

Se tiver dúvidas:

1. Consulte a documentação oficial da API
2. Verifique os exemplos neste documento
3. Teste com ferramentas como Postman
4. Revise o código em `/src/services/api.ts`

---

<div align="center">

**Integração de APIs - Planeje Fácil**

Dados reais | Gratuito | Fácil de usar

[Ver Código](./src/services/api.ts) • [Documentação Principal](./README.md)

</div>
