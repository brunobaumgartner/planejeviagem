/**
 * TRAVEL TIPS COMPONENT
 * 
 * Exibe dicas práticas de viagem extraídas da Wikipedia e outras fontes.
 * 
 * Features:
 * ✅ Dicas categorizadas (Clima, Transporte, Idioma, etc.)
 * ✅ Ícones intuitivos
 * ✅ Layout em cards
 * ✅ Animações suaves
 */

import { 
  Sun, 
  Train, 
  Languages, 
  Shield, 
  Wallet, 
  Clock,
  MapPin,
  Info,
  Lightbulb,
  Calendar,
  CreditCard,
  Phone,
  Building2,
  Utensils,
  Music,
  Plane,
  ShoppingBag,
  Hotel,
  ScrollText,
  Users,
  Globe,
  Trophy,
  PartyPopper,
  Building,
  Leaf,
  Briefcase,
  Laptop,
  GraduationCap,
  Hospital,
  FileText,
  Sparkles,
  Book,
  Target,
  Navigation,
  Beer,
  Smartphone,
  Hand,
  Eye,
  AlertTriangle
} from 'lucide-react';
import type { CityGuide } from '@/services/wikiService';

interface TravelTipsProps {
  guide: CityGuide;
  className?: string;
}

interface Tip {
  icon: React.ReactNode;
  category: string;
  text: string;
  color: string;
}

export function TravelTips({ guide, className = '' }: TravelTipsProps) {
  // Processar dicas do guia
  const tips: Tip[] = [];

  if (guide.tips) {
    guide.tips.forEach((tip) => {
      // Mapeamento de emoji para ícone e cor
      const tipMappings: Record<string, { icon: React.ReactNode; category: string; color: string }> = {
        // Categorias PRÁTICAS do Wikivoyage
        '🍽️': { icon: <Utensils className="w-5 h-5" />, category: 'Onde Comer', color: 'yellow' },
        '🏨': { icon: <Hotel className="w-5 h-5" />, category: 'Onde Dormir', color: 'blue' },
        '🚇': { icon: <Train className="w-5 h-5" />, category: 'Como se Locomover', color: 'blue' },
        '✈️': { icon: <Plane className="w-5 h-5" />, category: 'Como Chegar', color: 'blue' },
        '🎯': { icon: <Target className="w-5 h-5" />, category: 'O que Fazer', color: 'purple' },
        '👀': { icon: <Eye className="w-5 h-5" />, category: 'O que Ver', color: 'indigo' },
        '🛡️': { icon: <Shield className="w-5 h-5" />, category: 'Segurança e Emergências', color: 'green' },
        '💰': { icon: <Wallet className="w-5 h-5" />, category: 'Quanto Custa', color: 'green' },
        '☀️': { icon: <Sun className="w-5 h-5" />, category: 'Melhor Época', color: 'orange' },
        '🍺': { icon: <Beer className="w-5 h-5" />, category: 'Vida Noturna', color: 'purple' },
        '🛍️': { icon: <ShoppingBag className="w-5 h-5" />, category: 'Onde Comprar', color: 'purple' },
        '📱': { icon: <Smartphone className="w-5 h-5" />, category: 'Internet e Conexão', color: 'blue' },
        '🙏': { icon: <Hand className="w-5 h-5" />, category: 'Respeito e Cultura', color: 'purple' },
        '⚠️': { icon: <AlertTriangle className="w-5 h-5" />, category: 'Dicas Importantes', color: 'red' },
        
        // Fallbacks genéricos
        '📖': { icon: <Book className="w-5 h-5" />, category: 'Sobre', color: 'blue' },
        '💡': { icon: <Lightbulb className="w-5 h-5" />, category: 'Dica', color: 'yellow' },
        '🏛️': { icon: <Building2 className="w-5 h-5" />, category: 'Atrações', color: 'blue' },
        '📍': { icon: <MapPin className="w-5 h-5" />, category: 'Roteiros', color: 'red' },
        '🗣️': { icon: <Languages className="w-5 h-5" />, category: 'Idioma', color: 'purple' },
        '🎭': { icon: <Hand className="w-5 h-5" />, category: 'Cultura Local', color: 'purple' },
        '🌃': { icon: <PartyPopper className="w-5 h-5" />, category: 'Vida Noturna', color: 'indigo' },
        '📜': { icon: <ScrollText className="w-5 h-5" />, category: 'História', color: 'orange' },
        '👥': { icon: <Users className="w-5 h-5" />, category: 'Demografia', color: 'green' },
        '🗺️': { icon: <Navigation className="w-5 h-5" />, category: 'Geografia', color: 'blue' },
        '⚽': { icon: <Trophy className="w-5 h-5" />, category: 'Esportes', color: 'green' },
        '🎪': { icon: <Calendar className="w-5 h-5" />, category: 'Eventos', color: 'purple' },
        '🏗️': { icon: <Building className="w-5 h-5" />, category: 'Arquitetura', color: 'indigo' },
        '🌿': { icon: <Leaf className="w-5 h-5" />, category: 'Natureza', color: 'green' },
        '💼': { icon: <Briefcase className="w-5 h-5" />, category: 'Economia', color: 'blue' },
        '💻': { icon: <Laptop className="w-5 h-5" />, category: 'Tecnologia', color: 'indigo' },
        '🎓': { icon: <GraduationCap className="w-5 h-5" />, category: 'Educação', color: 'purple' },
        '🏥': { icon: <Hospital className="w-5 h-5" />, category: 'Saúde', color: 'red' },
        '📋': { icon: <FileText className="w-5 h-5" />, category: 'Documentação', color: 'indigo' },
        '✨': { icon: <Sparkles className="w-5 h-5" />, category: 'Curiosidade', color: 'yellow' },
      };

      // Encontrar qual emoji está no início da dica
      let mapped = false;
      for (const [emoji, config] of Object.entries(tipMappings)) {
        if (tip.startsWith(emoji)) {
          const text = tip.replace(`${emoji} ${config.category}:`, '').trim();
          if (text) {
            tips.push({
              icon: config.icon,
              category: config.category,
              text,
              color: config.color,
            });
            mapped = true;
            break;
          }
        }
      }

      // Fallback para dicas sem emoji específico
      if (!mapped) {
        tips.push({
          icon: <Lightbulb className="w-5 h-5" />,
          category: 'Dica Importante',
          text: tip.replace('💡', '').trim(),
          color: 'yellow',
        });
      }
    });
  }

  const colorClasses = {
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-yellow-50 rounded-lg">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Dicas de Viagem</h3>
          <p className="text-sm text-gray-600">O que você precisa saber antes de ir</p>
        </div>
      </div>

      {/* Tips Grid */}
      {tips.length > 0 ? (
        <div className="space-y-3">
          {tips.map((tip, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 p-4 border rounded-lg transition-all hover:shadow-md ${
                colorClasses[tip.color as keyof typeof colorClasses]
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {tip.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wide mb-1 opacity-80">
                  {tip.category}
                </div>
                <p className="text-sm leading-relaxed">
                  {tip.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 px-4 bg-gray-50 rounded-lg">
          <Info className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium mb-1">
            Dicas específicas não disponíveis
          </p>
          <p className="text-sm text-gray-500">
            Informações práticas podem estar nas abas "Sobre" ou "História"
          </p>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            Dicas extraídas automaticamente do conteúdo da Wikipedia sobre {guide.cityName}.
            Sempre verifique informações atualizadas antes de viajar.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Versão compacta para usar em cards/modals
 */
export function TravelTipsCompact({ guide }: { guide: CityGuide }) {
  const tips = guide.tips?.slice(0, 3) || [];

  if (tips.length === 0) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4 text-yellow-600" />
        <h4 className="text-sm font-semibold text-yellow-900">Dicas Rápidas</h4>
      </div>
      
      <ul className="space-y-2">
        {tips.map((tip, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-yellow-800">
            <span className="text-yellow-600 font-bold flex-shrink-0">•</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}