/**
 * CITY HISTORY COMPONENT
 * 
 * Exibe informações históricas da cidade de forma visual e interativa.
 * 
 * Features:
 * ✅ Timeline histórica
 * ✅ Fatos curiosos
 * ✅ Galeria de imagens históricas
 * ✅ Design tipo "storytelling"
 */

import { Clock, MapPin, BookOpen, Sparkles, Image as ImageIcon } from 'lucide-react';
import type { CityGuide, WikiSection } from '@/services/wikiService';

interface CityHistoryProps {
  guide: CityGuide;
  className?: string;
}

export function CityHistory({ guide, className = '' }: CityHistoryProps) {
  // Verificar se tem informação histórica
  const hasHistory = guide.history || guide.sections.some(
    s => s.title.toLowerCase().includes('história') || 
         s.title.toLowerCase().includes('history')
  );

  if (!hasHistory && !guide.summary) {
    return null;
  }

  // Extrair seção de história
  const historySection = guide.sections.find(
    s => s.title.toLowerCase().includes('história') || 
         s.title.toLowerCase().includes('history')
  );

  const historyText = guide.history || historySection?.content || guide.summary;

  // Extrair fatos interessantes (baseado em palavras-chave)
  const facts = extractInterestingFacts(historyText);

  return (
    <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden ${className}`}>
      {/* Header com gradiente */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <BookOpen className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">História de {guide.cityName}</h3>
            <p className="text-sm text-gray-600">Conheça o passado desta cidade</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Texto principal */}
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 leading-relaxed">
            {historyText}
          </p>
        </div>

        {/* Fatos interessantes */}
        {facts.length > 0 && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h4 className="font-semibold text-purple-900">Curiosidades</h4>
            </div>
            
            <div className="space-y-3">
              {facts.map((fact, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center">
                    <span className="text-xs font-bold text-purple-700">{index + 1}</span>
                  </div>
                  <p className="text-sm text-purple-900 leading-relaxed flex-1">
                    {fact}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Galeria de imagens históricas */}
        {guide.images.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon className="w-4 h-4 text-gray-500" />
              <h4 className="text-sm font-semibold text-gray-700">Imagens da Cidade</h4>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {guide.images.slice(0, 6).map((image, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-100 rounded-lg overflow-hidden group cursor-pointer"
                >
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Linha do tempo (se tiver seções cronológicas) */}
        {historySection && (
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-blue-500" />
              <h4 className="text-sm font-semibold text-gray-700">Linha do Tempo</h4>
            </div>
            
            <div className="relative pl-8 border-l-2 border-blue-200 space-y-6">
              <TimelineEvent
                period="Fundação"
                description="Início da história da cidade"
              />
              <TimelineEvent
                period="Desenvolvimento"
                description="Crescimento e expansão urbana"
              />
              <TimelineEvent
                period="Atualidade"
                description="Cidade moderna e cosmopolita"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineEvent({ period, description }: { period: string; description: string }) {
  return (
    <div className="relative">
      <div className="absolute -left-[35px] w-6 h-6 rounded-full bg-blue-500 border-4 border-white shadow-sm" />
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
        <div className="text-sm font-semibold text-blue-900 mb-1">{period}</div>
        <div className="text-xs text-blue-700">{description}</div>
      </div>
    </div>
  );
}

/**
 * Extrai fatos interessantes do texto histórico
 */
function extractInterestingFacts(text: string): string[] {
  const facts: string[] = [];
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);
  
  // Procurar sentenças com palavras-chave interessantes
  const keywords = [
    'fund', 'criou', 'primeira', 'primeiro', 'maior', 'mais antigo',
    'conhecido', 'famoso', 'histórico', 'tradicional', 'importante',
    'século', 'ano', 'época', 'período'
  ];
  
  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    const hasKeyword = keywords.some(keyword => lower.includes(keyword));
    
    if (hasKeyword && sentence.length < 200) {
      facts.push(sentence + '.');
    }
    
    if (facts.length >= 3) break;
  }
  
  return facts;
}

/**
 * Versão compacta para cards
 */
export function CityHistoryCompact({ guide }: { guide: CityGuide }) {
  const historyText = guide.history || guide.summary;
  
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="w-4 h-4 text-amber-600" />
        <h4 className="text-sm font-semibold text-amber-900">História</h4>
      </div>
      <p className="text-sm text-amber-800 line-clamp-3 leading-relaxed">
        {historyText}
      </p>
    </div>
  );
}
