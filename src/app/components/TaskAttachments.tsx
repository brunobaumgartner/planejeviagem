import { useState } from 'react';
import { Link2, Upload, Image as ImageIcon, FileText, Trash2, ExternalLink, Download } from 'lucide-react';
import type { TaskAttachment } from '@/types';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface TaskAttachmentsProps {
  taskId: string;
  attachments: TaskAttachment[];
  onUpdate: (attachments: TaskAttachment[]) => void;
}

export function TaskAttachments({ taskId, attachments = [], onUpdate }: TaskAttachmentsProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleAddLink = () => {
    if (!linkUrl.trim()) return;

    const newAttachment: TaskAttachment = {
      id: `attachment-${Date.now()}`,
      type: 'link',
      name: linkName.trim() || linkUrl,
      url: linkUrl,
      addedAt: new Date().toISOString(),
    };

    onUpdate([...attachments, newAttachment]);
    setLinkUrl('');
    setLinkName('');
    setShowAddMenu(false);
  };

  const handleFileUpload = async (file: File, type: 'document' | 'image') => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('taskId', taskId);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/upload-attachment`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao fazer upload');
      }

      const data = await response.json();

      const newAttachment: TaskAttachment = {
        id: `attachment-${Date.now()}`,
        type,
        name: file.name,
        url: data.url,
        size: file.size,
        mimeType: file.type,
        addedAt: new Date().toISOString(),
      };

      onUpdate([...attachments, newAttachment]);
      setShowAddMenu(false);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setUploadError(error instanceof Error ? error.message : 'Erro ao fazer upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAttachment = (id: string) => {
    onUpdate(attachments.filter(a => a.id !== id));
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(0)} KB`;
  };

  const getIcon = (type: TaskAttachment['type']) => {
    switch (type) {
      case 'link':
        return <Link2 className="w-4 h-4" />;
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="mt-2 space-y-2">
      {/* Lista de anexos existentes */}
      {attachments.length > 0 && (
        <div className="space-y-1">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm group"
            >
              <div className="text-gray-600">
                {getIcon(attachment.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {attachment.name}
                </p>
                {attachment.size && (
                  <p className="text-xs text-gray-500">
                    {formatFileSize(attachment.size)}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {attachment.type === 'link' && (
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors"
                    title="Abrir link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {(attachment.type === 'image' || attachment.type === 'document') && (
                  <a
                    href={attachment.url}
                    download={attachment.name}
                    className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors"
                    title="Baixar"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => handleRemoveAttachment(attachment.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Remover"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botão adicionar anexo */}
      {!showAddMenu && (
        <button
          onClick={() => setShowAddMenu(true)}
          className="text-xs text-sky-600 hover:text-sky-700 flex items-center gap-1"
        >
          <Link2 className="w-3.5 h-3.5" />
          Adicionar anexo
        </button>
      )}

      {/* Menu de adicionar */}
      {showAddMenu && (
        <div className="border border-gray-200 rounded-lg p-3 space-y-3 bg-white">
          {uploadError && (
            <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
              {uploadError}
            </div>
          )}

          {/* Adicionar Link */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700">📎 Adicionar Link</p>
            <input
              type="url"
              placeholder="https://exemplo.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <input
              type="text"
              placeholder="Nome do link (opcional)"
              value={linkName}
              onChange={(e) => setLinkName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              onClick={handleAddLink}
              disabled={!linkUrl.trim()}
              className="w-full bg-sky-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Adicionar Link
            </button>
          </div>

          <div className="border-t border-gray-200 my-2" />

          {/* Upload de Imagem */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700">🖼️ Adicionar Imagem</p>
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'image');
                }}
                disabled={isUploading}
                className="hidden"
              />
              <div className="w-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg px-3 py-3 text-center cursor-pointer hover:bg-gray-100 transition-colors">
                <ImageIcon className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                <p className="text-xs text-gray-600">
                  {isUploading ? 'Enviando...' : 'Clique para selecionar'}
                </p>
              </div>
            </label>
          </div>

          {/* Upload de Documento */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700">📄 Adicionar Documento</p>
            <label className="block">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'document');
                }}
                disabled={isUploading}
                className="hidden"
              />
              <div className="w-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg px-3 py-3 text-center cursor-pointer hover:bg-gray-100 transition-colors">
                <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                <p className="text-xs text-gray-600">
                  {isUploading ? 'Enviando...' : 'Clique para selecionar'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF, Word, Excel, TXT
                </p>
              </div>
            </label>
          </div>

          <button
            onClick={() => {
              setShowAddMenu(false);
              setLinkUrl('');
              setLinkName('');
              setUploadError(null);
            }}
            className="w-full text-sm text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
