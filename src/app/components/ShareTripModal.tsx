import { X, Share2, Copy, Check, Users, Edit2, Eye, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Trip } from "@/types";
import { useAuth } from "@/app/context/AuthContext";
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface ShareTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip | null;
}

interface SharedUser {
  email: string;
  permission: 'view' | 'edit';
}

export function ShareTripModal({ isOpen, onClose, trip }: ShareTripModalProps) {
  const { user } = useAuth();
  const [copiedLink, setCopiedLink] = useState(false);
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPermission, setNewUserPermission] = useState<'view' | 'edit'>('view');
  const [isSaving, setIsSaving] = useState(false);
  const [shareLink, setShareLink] = useState("");

  if (!isOpen || !trip) return null;

  // Verificar se o usuário é o dono
  const isOwner = !trip.isShared || trip.userId === trip.ownerId;

  // Gerar link de compartilhamento e salvar no backend
  const generateShareLink = async () => {
    if (shareLink) return shareLink; // Já gerado
    
    // IMPORTANTE: No ambiente Figma Make, usar apenas o hash, não a URL completa
    // O link será usado dentro do próprio app
    const shareToken = btoa(`${trip.id}_${Date.now()}`);
    
    // Para uso dentro do Figma Make, só precisamos do hash
    const link = `#share=${shareToken}&tripId=${trip.id}`;
    
    setShareLink(link);
    
    // Salvar no backend em background
    try {
      setIsSaving(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/shared-trips`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            tripId: trip.id,
            tripData: {
              ...trip,
              sharedById: user?.id || trip.userId
            },
            shareToken
          })
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao salvar viagem compartilhada');
      }

      console.log('✅ Viagem salva no backend para compartilhamento');
    } catch (error) {
      console.error('Erro ao salvar viagem:', error);
      // Fallback para localStorage
      localStorage.setItem(`shared_trip_${trip.id}`, JSON.stringify({
        ...trip,
        sharedAt: new Date().toISOString(),
        sharedById: user?.id || trip.userId
      }));
    } finally {
      setIsSaving(false);
    }
    
    return link;
  };

  // Gerar link ao abrir o modal
  if (!shareLink && trip) {
    generateShareLink();
  }

  // Copiar link
  const copyLink = async () => {
    const link = shareLink || await generateShareLink();
    
    // Para compartilhar externamente, precisamos da URL completa
    const fullLink = `${window.location.origin}${window.location.pathname}${link}`;
    
    try {
      await navigator.clipboard.writeText(fullLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      // Fallback para criar elemento temporário
      const tempInput = document.createElement('input');
      tempInput.value = fullLink;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Compartilhar via WhatsApp
  const shareViaWhatsApp = async () => {
    const link = shareLink || await generateShareLink();
    const fullLink = `${window.location.origin}${window.location.pathname}${link}`;
    
    const message = `Olá! Gostaria de compartilhar minha viagem para *${trip.destination}* com você.\n\nAcesse o link para visualizar: ${fullLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Adicionar usuário para compartilhar
  const addSharedUser = () => {
    if (!newUserEmail.trim()) return;
    
    // Verificar se já foi adicionado
    if (sharedUsers.some(u => u.email === newUserEmail)) {
      alert('Este usuário já foi adicionado!');
      return;
    }

    setSharedUsers([...sharedUsers, {
      email: newUserEmail,
      permission: newUserPermission
    }]);
    setNewUserEmail("");
    setNewUserPermission('view');
  };

  // Remover usuário compartilhado
  const removeSharedUser = (email: string) => {
    setSharedUsers(sharedUsers.filter(u => u.email !== email));
  };

  // Alterar permissão
  const togglePermission = (email: string) => {
    setSharedUsers(sharedUsers.map(u => 
      u.email === email 
        ? { ...u, permission: u.permission === 'view' ? 'edit' : 'view' }
        : u
    ));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Share2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Compartilhar Viagem</h2>
              <p className="text-sm text-gray-600">{trip.destination}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Info sobre compartilhamento */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Como funciona?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Usuários <strong>logados</strong> recebem a viagem automaticamente</li>
              <li>• Usuários <strong>sem conta</strong> veem como guest (precisam criar conta)</li>
              <li>• Alterações na viagem são sincronizadas em tempo real</li>
              <li>• Cada pessoa tem seu próprio checklist de bagagem</li>
            </ul>
          </div>

          {/* Link de compartilhamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link de compartilhamento
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <button
                onClick={copyLink}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="text-sm">Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Botão WhatsApp */}
          <button
            onClick={shareViaWhatsApp}
            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Compartilhar no WhatsApp
          </button>

          {/* Gerenciar permissões (apenas para donos) */}
          {isOwner && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Gerenciar Permissões
              </h3>

              {/* Adicionar novo usuário */}
              <div className="space-y-3 mb-4">
                <input
                  type="email"
                  placeholder="Email do usuário"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                
                <div className="flex gap-2">
                  <select
                    value={newUserPermission}
                    onChange={(e) => setNewUserPermission(e.target.value as 'view' | 'edit')}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="view">👁️ Apenas visualizar</option>
                    <option value="edit">✏️ Pode editar</option>
                  </select>
                  
                  <button
                    onClick={addSharedUser}
                    disabled={!newUserEmail.trim()}
                    className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Lista de usuários com acesso */}
              {sharedUsers.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Pessoas com acesso ({sharedUsers.length})
                  </p>
                  {sharedUsers.map((sharedUser) => (
                    <div
                      key={sharedUser.email}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-sky-700">
                            {sharedUser.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {sharedUser.email}
                          </p>
                          <p className="text-xs text-gray-500">
                            {sharedUser.permission === 'view' ? '👁️ Visualizar' : '✏️ Editar'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => togglePermission(sharedUser.email)}
                          className="p-2 hover:bg-gray-200 rounded transition-colors"
                          title="Alternar permissão"
                        >
                          {sharedUser.permission === 'view' ? (
                            <Eye className="w-4 h-4 text-gray-600" />
                          ) : (
                            <Edit2 className="w-4 h-4 text-sky-600" />
                          )}
                        </button>
                        <button
                          onClick={() => removeSharedUser(sharedUser.email)}
                          className="p-2 hover:bg-red-50 rounded transition-colors"
                          title="Remover acesso"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Aviso se não for dono */}
          {!isOwner && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800">
                <strong>Nota:</strong> Você {trip.permission === 'view' ? 'pode apenas visualizar' : 'pode editar'} esta viagem. 
                Apenas o dono pode gerenciar permissões.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}