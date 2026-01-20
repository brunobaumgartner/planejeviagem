import { Check, X, Eye, Edit2, Plane, Calendar, DollarSign } from "lucide-react";
import { useState } from "react";
import type { Trip } from "@/types";
import { useAuth } from "@/app/context/AuthContext";
import { useTrips } from "@/app/context/TripsContext";

interface AcceptSharedTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip | null;
  shareToken: string;
}

export function AcceptSharedTripModal({ 
  isOpen, 
  onClose, 
  trip, 
  shareToken 
}: AcceptSharedTripModalProps) {
  const { user } = useAuth();
  const { addTrip } = useTrips();
  const [isAccepting, setIsAccepting] = useState(false);

  if (!isOpen || !trip) return null;

  // Formatar datas
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  // Calcular número de dias
  const getDays = () => {
    if (!trip.startDate || !trip.endDate) return 0;
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const days = getDays();

  // Aceitar viagem compartilhada
  const handleAccept = async () => {
    setIsAccepting(true);

    try {
      // Criar uma cópia da viagem para o usuário atual
      const sharedTrip: Trip = {
        ...trip,
        id: `shared_${trip.id}_${Date.now()}`, // Novo ID para a cópia
        userId: user?.id || 'guest',
        ownerId: trip.userId, // Guardar quem é o dono original
        isShared: true,
        sharedBy: trip.userId,
        permission: 'view', // Por padrão, apenas visualização
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Adicionar a viagem compartilhada
      addTrip(sharedTrip);

      // Salvar informação do compartilhamento
      const shareInfo = {
        originalTripId: trip.id,
        shareToken: shareToken,
        acceptedAt: new Date().toISOString(),
        userId: user?.id || 'guest'
      };
      
      localStorage.setItem(`share_${shareToken}`, JSON.stringify(shareInfo));

      // Mostrar mensagem de sucesso
      if (!user || user.role === 'guest') {
        alert('✅ Viagem adicionada!\n\n⚠️ Crie uma conta para manter esta viagem salva permanentemente.');
      } else {
        alert('✅ Viagem adicionada com sucesso!');
      }

      onClose();
    } catch (error) {
      console.error('Erro ao aceitar viagem:', error);
      alert('Erro ao adicionar viagem. Tente novamente.');
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-sky-400 to-blue-500 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
              <Plane className="w-6 h-6" />
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-2xl font-bold mb-1">Viagem Compartilhada!</h2>
          <p className="text-sky-100 text-sm">
            Alguém compartilhou uma viagem com você
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Destino */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {trip.destination}
            </h3>
            {trip.country && (
              <p className="text-gray-600">{trip.country}</p>
            )}
          </div>

          {/* Informações da viagem */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-xl">
              <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Período</p>
                <p className="font-semibold text-gray-900">
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </p>
                <p className="text-xs text-sky-600">{days} dia{days !== 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Orçamento</p>
                <p className="font-semibold text-gray-900">{trip.budget}</p>
              </div>
            </div>
          </div>

          {/* Informações sobre o compartilhamento */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-blue-900 mb-2">
              📋 O que você vai receber:
            </h4>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Acesso completo aos detalhes da viagem</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Roteiro completo (se disponível)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Atualizações em tempo real</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Seu próprio checklist de bagagem</span>
              </li>
            </ul>
          </div>

          {/* Permissões */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Suas permissões:
            </h4>
            <p className="text-sm text-gray-700">
              Por padrão, você terá permissão de <strong>visualização</strong>. 
              O dono da viagem pode alterar para permitir que você edite.
            </p>
          </div>

          {/* Aviso para usuários guest */}
          {(!user || user.role === 'guest') && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h4 className="font-semibold text-amber-900 mb-2">
                ⚠️ Atenção!
              </h4>
              <p className="text-sm text-amber-800">
                Você está como <strong>visitante</strong>. A viagem será salva temporariamente. 
                <strong> Crie uma conta</strong> para manter suas viagens salvas permanentemente!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-3">
          <button
            onClick={handleAccept}
            disabled={isAccepting}
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isAccepting ? (
              <span>Adicionando...</span>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Aceitar e Adicionar
              </>
            )}
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
}
