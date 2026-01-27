/**
 * WIKIVOYAGE SERVICE
 * 
 * Integração com Wikivoyage API para obter informações PRÁTICAS de viagem.
 * Wikivoyage é um guia de viagens livre, feito especificamente para turistas!
 * 
 * Features:
 * ✅ Busca de guias em múltiplos idiomas (pt, en, es)
 * ✅ Seções estruturadas (Get in, See, Do, Eat, Sleep, Stay safe)
 * ✅ Informações práticas e atualizadas
 * ✅ Dicas reais de viajantes
 * ✅ Cache local (1 semana)
 * ✅ Fallback entre idiomas
 * ✅ FILTRO inteligente para destinos turísticos
 * 
 * APIs utilizadas:
 * - Wikivoyage API (https://en.wikivoyage.org/api/rest_v1/)
 * - MediaWiki Action API
 */

export interface WikiArticle {
  title: string;
  extract: string; // Resumo/introdução
  fullUrl: string;
  thumbnail?: string;
  language: 'pt';
  lastModified?: string;
}

export interface WikiSection {
  title: string;
  content: string;
  level: number;
}

export interface CityGuide {
  cityName: string;
  summary: string; // Resumo geral
  history?: string;
  culture?: string;
  tourism?: string;
  tips?: string[]; // Dicas práticas extraídas
  images: WikiImage[];
  article: WikiArticle;
  sections: WikiSection[];
}

export interface WikiImage {
  url: string;
  title: string;
  description?: string;
}

export interface TravelTips {
  bestTime: string;
  currency: string;
  language: string;
  transportation: string;
  safety: string;
  customs: string[];
}

// Cache em memória (1 semana)
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dias
const cache = new Map<string, { data: any; timestamp: number }>();

function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const age = Date.now() - cached.timestamp;
  if (age > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

function setCache(key: string, data: any): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Busca artigo do Wikivoyage sobre uma cidade
 * Wikivoyage > Wikipedia para informações de viagem!
 */
export async function getWikipediaArticle(
  cityName: string,
  language: 'pt'
): Promise<WikiArticle | null> {
  const cacheKey = `wikivoyage_article_${cityName}_${language}`;
  const cached = getCached<WikiArticle>(cacheKey);
  if (cached) return cached;

  try {
    // Tentar Wikivoyage primeiro (melhor para viagens!)
    const voyageDomain =  'pt.wikivoyage.org';
    
    let url = `https://${voyageDomain}/api/rest_v1/page/summary/${encodeURIComponent(cityName)}`;
    let response = await fetch(url);
    
    // Se não encontrar no Wikivoyage, tentar Wikipedia como fallback
    if (!response.ok && language === 'pt') {
      console.log('[WikiService] Não encontrado no Wikivoyage PT, tentando EN...');
      url = `https://en.wikivoyage.org/api/rest_v1/page/summary/${encodeURIComponent(cityName)}`;
      response = await fetch(url);
      language = 'en';
    }
    
    // Fallback final: Wikipedia
    if (!response.ok) {
      console.log('[WikiService] Wikivoyage não disponível, usando Wikipedia como fallback...');
      const wikiDomain = 'pt.wikipedia.org';
      url = `https://${wikiDomain}/api/rest_v1/page/summary/${encodeURIComponent(cityName)}`;
      response = await fetch(url);
    }
    
    if (!response.ok) {
      console.log(`[WikiService] Artigo não encontrado em nenhuma fonte:`, cityName);
      return null;
    }
    
    const data = await response.json();
    
    const article: WikiArticle = {
      title: data.title,
      extract: data.extract || data.description || '',
      fullUrl: data.content_urls?.desktop?.page || url,
      thumbnail: data.thumbnail?.source || data.originalimage?.source,
      language,
      lastModified: data.timestamp,
    };
    
    setCache(cacheKey, article);
    return article;
  } catch (error) {
    console.error('[WikiService] Erro ao buscar artigo:', error);
    return null;
  }
}

/**
 * Busca seções estruturadas do Wikivoyage
 * Seções específicas: Understand, Get in, Get around, See, Do, Eat, Drink, Sleep, Stay safe
 */
export async function getArticleSections(
  cityName: string,
  language: 'pt'
): Promise<WikiSection[]> {
  const cacheKey = `wikivoyage_sections_${cityName}_${language}`;
  const cached = getCached<WikiSection[]>(cacheKey);
  if (cached) return cached;

  try {
    // Tentar Wikivoyage primeiro
    let voyageDomain = 'pt.wikivoyage.org';
    
    // Buscar conteúdo usando extracts API
    let textUrl = `https://${voyageDomain}/w/api.php?` +
      `action=query&` +
      `format=json&` +
      `prop=extracts&` +
      `titles=${encodeURIComponent(cityName)}&` +
      `explaintext=1&` +
      `exsectionformat=plain&` +
      `origin=*`;
    
    let textResponse = await fetch(textUrl);
    
    // Fallback para EN Wikivoyage
    if (!textResponse.ok && language === 'pt') {
      voyageDomain = 'en.wikivoyage.org';
      textUrl = `https://${voyageDomain}/w/api.php?` +
        `action=query&` +
        `format=json&` +
        `prop=extracts&` +
        `titles=${encodeURIComponent(cityName)}&` +
        `explaintext=1&` +
        `exsectionformat=plain&` +
        `origin=*`;
      textResponse = await fetch(textUrl);
      language = 'en';
    }
    
    // Fallback final: Wikipedia
    if (!textResponse.ok) {
      const wikiDomain = 'pt.wikipedia.org';
      textUrl = `https://${wikiDomain}/w/api.php?` +
        `action=query&` +
        `format=json&` +
        `prop=extracts&` +
        `titles=${encodeURIComponent(cityName)}&` +
        `explaintext=1&` +
        `exsectionformat=plain&` +
        `origin=*`;
      textResponse = await fetch(textUrl);
    }
    
    if (!textResponse.ok) return [];
    
    const textData = await textResponse.json();
    const pages = textData.query?.pages || {};
    const page = Object.values(pages)[0] as any;
    
    const sections: WikiSection[] = [];
    
    if (page?.extract) {
      const fullText = page.extract;
      
      // Dividir por seções usando == TÍTULO ==
      const sectionRegex = /==+\s*(.+?)\s*==+/g;
      const parts = fullText.split(sectionRegex);
      
      // Primeira parte é a introdução
      if (parts[0].trim()) {
        sections.push({
          title: 'Introdução',
          content: parts[0].trim(),
          level: 1,
        });
      }
      
      // Processar o resto das seções
      for (let i = 1; i < parts.length; i += 2) {
        const title = parts[i];
        const content = parts[i + 1] || '';
        
        if (title && content.trim()) {
          sections.push({
            title: title.trim(),
            content: content.trim(),
            level: 2,
          });
        }
      }
    }
    
    setCache(cacheKey, sections);
    return sections;
  } catch (error) {
    console.error('[WikiService] Erro ao buscar seções:', error);
    return [];
  }
}

/**
 * Busca imagens do artigo usando WIKIMEDIA COMMONS
 * Commons tem fotos de ALTA QUALIDADE!
 */
export async function getArticleImages(
  cityName: string,
  language: 'pt',
  limit: number = 10
): Promise<WikiImage[]> {
  const cacheKey = `wikivoyage_images_${cityName}_${language}_${limit}`;
  const cached = getCached<WikiImage[]>(cacheKey);
  if (cached) return cached;

  try {
    // Usar Wikimedia Commons diretamente (tem TODAS as imagens de qualidade!)
    const searchUrl = `https://commons.wikimedia.org/w/api.php?` +
      `action=query&` +
      `format=json&` +
      `generator=search&` +
      `gsrsearch=${encodeURIComponent(cityName)}&` +
      `gsrnamespace=6&` + // Namespace 6 = Files
      `gsrlimit=${limit * 2}&` + // Pegar mais para filtrar
      `prop=imageinfo&` +
      `iiprop=url|size|mime&` +
      `iiurlwidth=800&` + // Thumbnail de 800px
      `origin=*`;
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      console.log('[WikiService] Erro ao buscar no Commons, tentando Wikipedia...');
      return await getImagesFromWikipedia(cityName, language, limit);
    }
    
    const data = await response.json();
    const pages = data.query?.pages || {};
    const images: WikiImage[] = [];
    
    Object.values(pages).forEach((page: any) => {
      const imageInfo = page.imageinfo?.[0];
      
      if (!imageInfo) return;
      
      const url = imageInfo.thumburl || imageInfo.url;
      const mime = imageInfo.mime || '';
      
      // Filtrar apenas imagens válidas (JPG, PNG, WEBP)
      if (!mime.match(/image\/(jpeg|jpg|png|webp)/i)) return;
      
      // Filtrar imagens muito pequenas
      if (imageInfo.width < 400 || imageInfo.height < 300) return;
      
      // Filtrar logos, bandeiras, mapas genéricos
      const title = (page.title || '').toLowerCase();
      if (title.includes('logo') || title.includes('flag') || 
          title.includes('coat') || title.includes('map')) return;
      
      images.push({
        url,
        title: page.title?.replace('File:', '').replace('Arquivo:', '') || '',
        description: imageInfo.extmetadata?.ImageDescription?.value,
      });
    });
    
    // Pegar apenas as melhores
    const filteredImages = images.slice(0, limit);
    
    setCache(cacheKey, filteredImages);
    return filteredImages;
  } catch (error) {
    console.error('[WikiService] Erro ao buscar imagens no Commons:', error);
    return [];
  }
}

/**
 * Fallback: buscar imagens diretamente do Wikipedia/Wikivoyage
 */
async function getImagesFromWikipedia(
  cityName: string,
  language: 'pt',
  limit: number
): Promise<WikiImage[]> {
  try {
    const domain = 'pt.wikipedia.org';
    
    const url = `https://${domain}/w/api.php?` +
      `action=query&` +
      `format=json&` +
      `prop=pageimages|images&` +
      `titles=${encodeURIComponent(cityName)}&` +
      `pilimit=${limit}&` +
      `imlimit=${limit}&` +
      `pithumbsize=800&` +
      `origin=*`;
    
    const response = await fetch(url);
    if (!response.ok) return [];
    
    const data = await response.json();
    const pages = data.query?.pages || {};
    const page = Object.values(pages)[0] as any;
    const images: WikiImage[] = [];
    
    // Adicionar thumbnail principal se existir
    if (page?.thumbnail?.source) {
      images.push({
        url: page.thumbnail.source,
        title: cityName,
      });
    }
    
    // Buscar outras imagens do artigo
    if (page?.images) {
      for (const img of page.images.slice(0, limit)) {
        const imgUrl = `https://${domain}/w/api.php?` +
          `action=query&` +
          `format=json&` +
          `titles=${encodeURIComponent(img.title)}&` +
          `prop=imageinfo&` +
          `iiprop=url|size&` +
          `iiurlwidth=800&` +
          `origin=*`;
        
        try {
          const imgResponse = await fetch(imgUrl);
          if (imgResponse.ok) {
            const imgData = await imgResponse.json();
            const imgPages = imgData.query?.pages || {};
            const imgPage = Object.values(imgPages)[0] as any;
            const imageInfo = imgPage?.imageinfo?.[0];
            
            if (imageInfo?.thumburl || imageInfo?.url) {
              const url = imageInfo.thumburl || imageInfo.url;
              
              // Filtrar apenas imagens válidas
              if (url.match(/\.(jpg|jpeg|png|webp)$/i)) {
                images.push({
                  url,
                  title: img.title.replace('File:', '').replace('Arquivo:', ''),
                });
              }
            }
          }
        } catch (err) {
          // Ignorar erro individual
        }
      }
    }
    
    return images.slice(0, limit);
  } catch (error) {
    console.error('[WikiService] Erro ao buscar imagens do Wikipedia:', error);
    return [];
  }
}

/**
 * Busca guia completo da cidade usando WIKIVOYAGE
 */
export async function getCityGuide(
  cityName: string,
  language: 'pt'
): Promise<CityGuide | null> {
  const cacheKey = `city_guide_${cityName}_${language}`;
  const cached = getCached<CityGuide>(cacheKey);
  if (cached) return cached;

  try {
    console.log('[WikiService] Buscando guia no Wikivoyage para:', cityName, language);
    
    // Buscar artigo principal
    const article = await getWikipediaArticle(cityName, language);
    if (!article) {
      console.log('[WikiService] Artigo não encontrado');
      return null;
    }
    
    // Buscar seções e imagens em paralelo
    const [sections, images] = await Promise.all([
      getArticleSections(cityName, article.language),
      getArticleImages(cityName, article.language, 6),
    ]);
    
    console.log(`[WikiService] Encontradas ${sections.length} seções`);
    
    // Extrair seções específicas do Wikivoyage - SEM DUPLICATAS!
    let summary: string | undefined;
    let history: string | undefined;
    let culture: string | undefined;
    let tourism: string | undefined;
    
    sections.forEach((section) => {
      const title = section.title.toLowerCase();
      
      // Introdução / Summary (PRIMEIRA seção apenas!)
      if (title === 'introdução' && !summary) {
        summary = section.content.substring(0, 500);
        return; // Já pegou, não processar mais
      }
      
      // História EXCLUSIVA (não pegar "Understand" que é mais genérico)
      if ((title.includes('história') || title.includes('history')) && 
          !title.includes('understand') && !title.includes('compreenda') && !history) {
        history = section.content.substring(0, 500);
        return;
      }
      
      // Cultura EXCLUSIVA
      if ((title.includes('cultura') || title.includes('culture') ||
          title.includes('tradição') || title.includes('tradition')) && 
          !title.includes('see') && !title.includes('do') && !culture) {
        culture = section.content.substring(0, 500);
        return;
      }
      
      // Turismo EXCLUSIVO (apenas See/Do/Atrações)
      if ((title.includes('see') || title.includes('do') || 
           title.includes('veja') || title.includes('faça') ||
           title.includes('atrações') || title.includes('attractions')) && 
          !title.includes('história') && !title.includes('history') && !tourism) {
        tourism = section.content.substring(0, 500);
        return;
      }
    });
    
    // Gerar dicas práticas baseadas nas seções do Wikivoyage
    const tips = await generateTravelTipsFromWikivoyage(cityName, article.language);
    
    const guide: CityGuide = {
      cityName: article.title,
      summary: article.extract,
      history,
      culture,
      tourism,
      tips,
      images,
      article,
      sections,
    };
    
    setCache(cacheKey, guide);
    return guide;
  } catch (error) {
    console.error('[WikiService] Erro ao buscar guia:', error);
    return null;
  }
}

/**
 * Gera dicas de viagem baseadas nas seções estruturadas do WIKIVOYAGE
 * USA A API PARSE para obter HTML estruturado!
 */
async function generateTravelTipsFromWikivoyage(cityName: string, language: 'pt'): Promise<string[]> {
  try {
    // Determinar domínio
    const domain = 'pt.wikivoyage.org';
    
    // USAR API PARSE para obter HTML estruturado
    let url = `https://${domain}/w/api.php?` +
      `action=parse&` +
      `page=${encodeURIComponent(cityName)}&` +
      `format=json&` +
      `prop=text&` +
      `origin=*`;
    
    let response = await fetch(url);
    
    // Fallback para inglês se não encontrar em português
    if (!response.ok && language === 'pt') {
      url = `https://en.wikivoyage.org/w/api.php?` +
        `action=parse&` +
        `page=${encodeURIComponent(cityName)}&` +
        `format=json&` +
        `prop=text&` +
        `origin=*`;
      response = await fetch(url);
      language = 'en';
    }
    
    if (!response.ok) {
      console.log('[WikiService] Página não encontrada no Wikivoyage');
      return [];
    }
    
    const data = await response.json();
    const html = data.parse?.text?.['*'];
    
    if (!html) return [];
    
    // Parser HTML simples para extrair dicas por seção
    const tips: string[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Mapeamento de seções do Wikivoyage para categorias
    const sectionMap: Record<string, { emoji: string; name: string; selectors: string[] }> = {
      eat: { emoji: '🍽️', name: 'Onde Comer', selectors: ['#Eat', '#Coma', '#Gastronomia'] },
      sleep: { emoji: '🏨', name: 'Onde Dormir', selectors: ['#Sleep', '#Durma', '#Hospedagem'] },
      getAround: { emoji: '🚇', name: 'Como se Locomover', selectors: ['#Get_around', '#Locomover', '#Transporte'] },
      getIn: { emoji: '✈️', name: 'Como Chegar', selectors: ['#Get_in', '#Chegar', '#Chegada'] },
      do: { emoji: '🎯', name: 'O que Fazer', selectors: ['#Do', '#Faça', '#Atividades'] },
      see: { emoji: '👀', name: 'O que Ver', selectors: ['#See', '#Veja', '#Atrações'] },
      staySafe: { emoji: '🛡️', name: 'Segurança e Emergências', selectors: ['#Stay_safe', '#Segurança', '#Safety'] },
      budget: { emoji: '💰', name: 'Quanto Custa', selectors: ['#Budget', '#Orçamento', '#Preços'] },
      climate: { emoji: '☀️', name: 'Melhor Época', selectors: ['#Climate', '#Clima', '#Tempo'] },
      drink: { emoji: '🍺', name: 'Vida Noturna', selectors: ['#Drink', '#Beber', '#Vida_noturna'] },
      buy: { emoji: '🛍️', name: 'Onde Comprar', selectors: ['#Buy', '#Comprar', '#Shopping'] },
      connect: { emoji: '📱', name: 'Internet e Conexão', selectors: ['#Connect', '#Internet', '#Conectar'] },
      respect: { emoji: '🙏', name: 'Respeito e Cultura', selectors: ['#Respect', '#Respeito', '#Etiquette'] },
      cope: { emoji: '⚠️', name: 'Dicas Importantes', selectors: ['#Cope', '#Dicas', '#Tips'] },
    };
    
    // Extrair dicas de cada seção
    Object.values(sectionMap).forEach(section => {
      let heading: HTMLElement | null = null;
      
      // Tentar encontrar o heading
      for (const selector of section.selectors) {
        heading = doc.querySelector(selector) as HTMLElement;
        if (heading) break;
      }
      
      if (!heading) return;
      
      // Pegar parágrafos depois do heading até o próximo h2/h3
      let element = heading.parentElement?.nextElementSibling;
      let count = 0;
      
      while (element && count < 2) { // APENAS 2 dicas por categoria!
        // Parar se encontrar outro heading
        if (element.tagName === 'H2' || element.tagName === 'H3') break;
        
        // Extrair texto de parágrafos
        if (element.tagName === 'P') {
          const text = element.textContent?.trim();
          
          if (text && text.length >= 50 && text.length <= 300) {
            // Limpar referências [1], [2], etc
            let cleaned = text.replace(/\[\d+\]/g, '').trim();
            
            // FILTROS DE QUALIDADE - Ignorar conteúdo inútil
            const isUseless = 
              cleaned.includes('✆') ||
              cleaned.includes('☎') ||
              /^[A-ZÀ-Ú][^.!?]+,\s*[^,]+,\s*[\(+]?\d{2,3}/.test(cleaned) ||
              /^(Hotel|Restaurante|Hostel|Pousada|Café|Bar|Polícia|Guarda|Hospital|Embaixada|Consulado)[^.!?]+,/.test(cleaned) ||
              /^(Polícia|Guarda|Hospital|Embaixada|Consulado).*\d{3}\s?\d{3}/i.test(cleaned) ||
              (cleaned.match(/\d/g) || []).length > cleaned.length * 0.2 ||
              /\(\+\d{2,3}\)/.test(cleaned) ||
              /^[A-Z][a-zà-ú\s]+\s[\w\s,]+\d+.*[\d\s]{5,}/.test(cleaned) ||
              /NOCC|FORMAT|MARKER|LISTING/i.test(cleaned) ||
              /^[\d\s,.\-✆☎+()]+$/.test(cleaned) ||
              /@/.test(cleaned) ||
              cleaned.length < 60;
            
            if (!isUseless && cleaned.length >= 50) {
              tips.push(`${section.emoji} ${section.name}: ${cleaned}`);
              count++;
            }
          }
        }
        
        // Extrair de listas (ul/ol)
        if (element.tagName === 'UL' || element.tagName === 'OL') {
          const items = element.querySelectorAll('li');
          
          items.forEach((item, i) => {
            if (count >= 2) return; // APENAS 2 por categoria!
            
            const text = item.textContent?.trim();
            if (text && text.length >= 50 && text.length <= 300) {
              let cleaned = text.replace(/\[\d+\]/g, '').trim();
              
              // FILTROS DE QUALIDADE - Ignorar conteúdo inútil
              const isUseless = 
                /^[A-Z][a-zà-ú\s]+\s[\w\s,]+\d+.*✆/i.test(cleaned) ||
                /^(Polícia|Guarda|Hospital|Embaixada|Consulado).*\d{3}\s?\d{3}/i.test(cleaned) ||
                (cleaned.match(/\d/g) || []).length > cleaned.length * 0.3 ||
                (cleaned.includes('✆') && cleaned.length < 100) ||
                /^[\d\s,.\-✆+()]+$/.test(cleaned);
              
              if (!isUseless && cleaned.length >= 50) {
                tips.push(`${section.emoji} ${section.name}: ${cleaned}`);
                count++;
              }
            }
          });
        }
        
        element = element.nextElementSibling;
      }
    });
    
    return tips;
  } catch (error) {
    console.error('[WikiService] Erro ao gerar dicas:', error);
    return [];
  }
}

/**
 * Busca artigos relacionados
 */
export async function getRelatedDestinations(
  cityName: string,
  limit: number = 5
): Promise<WikiArticle[]> {
  try {
    return [];
  } catch (error) {
    console.error('[WikiService] Erro ao buscar relacionados:', error);
    return [];
  }
}

/**
 * Busca cidades em tempo real
 * FILTRADO para trazer APENAS destinos turísticos
 */
export async function searchCities(
  query: string,
  language: 'pt',
  limit: number = 10
): Promise<Array<{ title: string; description?: string; thumbnail?: string }>> {
  if (!query.trim()) return [];

  const cacheKey = `search_cities_${query}_${language}_${limit}`;
  const cached = getCached<Array<{ title: string; description?: string; thumbnail?: string }>>(cacheKey);
  if (cached) return cached;

  try {
    // Tentar Wikivoyage primeiro (sempre retorna destinos!)
    let domain = 'pt.wikivoyage.org';
    
    let searchUrl = `https://${domain}/w/api.php?` +
      `action=opensearch&` +
      `format=json&` +
      `search=${encodeURIComponent(query)}&` +
      `limit=${limit}&` +
      `namespace=0&` +
      `origin=*`;
    
    let response = await fetch(searchUrl);
    
    // Fallback para EN Wikivoyage se PT não funcionar
    if (!response.ok && language === 'pt') {
      domain = 'en.wikivoyage.org';
      searchUrl = `https://${domain}/w/api.php?` +
        `action=opensearch&` +
        `format=json&` +
        `search=${encodeURIComponent(query)}&` +
        `limit=${limit}&` +
        `namespace=0&` +
        `origin=*`;
      response = await fetch(searchUrl);
    }
    
    // Fallback final: Wikipedia com filtro
    if (!response.ok) {
      domain = 'pt.wikipedia.org';
      searchUrl = `https://${domain}/w/api.php?` +
        `action=opensearch&` +
        `format=json&` +
        `search=${encodeURIComponent(query)}&` +
        `limit=${limit * 3}&` +
        `namespace=0&` +
        `origin=*`;
      response = await fetch(searchUrl);
    }
    
    if (!response.ok) {
      console.error('[WikiService] Erro na busca:', response.status);
      return [];
    }
    
    const data = await response.json();
    
    // Formato OpenSearch: [query, [titles], [descriptions], [urls]]
    const titles = data[1] || [];
    const descriptions = data[2] || [];
    
    // Se veio do Wikivoyage, não precisa filtrar (só tem destinos!)
    const isWikivoyage = domain.includes('wikivoyage');
    
    let filteredTitles = titles;
    
    // Filtrar apenas se vier da Wikipedia
    if (!isWikivoyage) {
      filteredTitles = titles.filter((title: string, index: number) => {
        const titleLower = title.toLowerCase();
        const descLower = (descriptions[index] || '').toLowerCase();
        const combined = titleLower + ' ' + descLower;
        
        const blacklist = [
          'anime', 'manga', 'filme', 'movie', 'série', 'series',
          'personagem', 'banda', 'álbum', 'jogador', 'ator', 'cantor',
          '(desambiguação)', 'disambiguation', 'empresa', 'partido',
        ];
        
        const hasBlacklist = blacklist.some(word => combined.includes(word));
        if (hasBlacklist) return false;
        
        const whitelist = [
          'cidade', 'city', 'capital', 'país', 'country', 'estado', 'ilha',
          'localizada', 'located', 'turística', 'tourist', 'destino',
        ];
        
        const hasWhitelist = whitelist.some(word => combined.includes(word));
        return hasWhitelist || title.split(' ').length <= 3;
      });
    }
    
    // Buscar thumbnails
    const results = await Promise.all(
      filteredTitles.slice(0, limit).map(async (title: string, originalIndex: number) => {
        const index = isWikivoyage ? originalIndex : titles.indexOf(title);
        let thumbnail: string | undefined;
        
        try {
          const infoUrl = `https://${domain}/w/api.php?` +
            `action=query&` +
            `format=json&` +
            `prop=pageimages&` +
            `titles=${encodeURIComponent(title)}&` +
            `pithumbsize=100&` +
            `origin=*`;
          
          const infoResponse = await fetch(infoUrl);
          if (infoResponse.ok) {
            const infoData = await infoResponse.json();
            const pages = infoData.query?.pages || {};
            const page = Object.values(pages)[0] as any;
            thumbnail = page?.thumbnail?.source;
          }
        } catch (err) {
          // Ignorar
        }
        
        return {
          title,
          description: descriptions[index] || undefined,
          thumbnail,
        };
      })
    );
    
    const validResults = results.filter(r => r !== null);
    
    setCache(cacheKey, validResults);
    return validResults;
  } catch (error) {
    console.error('[WikiService] Erro ao buscar cidades:', error);
    return [];
  }
}