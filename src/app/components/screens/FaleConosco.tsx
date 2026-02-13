import { useState } from "react";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { useAuth } from "@/app/context/AuthContext";
import { ArrowLeft } from "lucide-react";
import { useNavigation } from '@/app/context/NavigationContext';

export function FaleConosco() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const { setCurrentScreen } = useNavigation();

  const [status, setStatus] = useState<{
    type: "success" | "error" | "idle";
    message: string;
  }>({ type: "idle", message: "" });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ Hook no topo do componente
  const { getAccessToken } = useAuth();

  const closeModal = () => {
    setIsModalOpen(false);
    setStatus({ type: "idle", message: "" });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // ✅ impede reload
    setStatus({ type: "idle", message: "" });
    setIsSubmitting(true);

    try {
      const accessToken = await getAccessToken();

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/contact/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ nome, email, mensagem }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.success) {
        const errorMessage =
          data?.error || `Erro ao enviar mensagem (HTTP ${response.status})`;
        throw new Error(errorMessage);
      }

      setStatus({
        type: "success",
        message: "Mensagem enviada com sucesso. Obrigado pelo contato!",
      });

      setNome("");
      setEmail("");
      setMensagem("");

      setIsModalOpen(true); // ✅ abre modal
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao enviar mensagem.";

      setStatus({ type: "error", message });
      setIsModalOpen(true); // ✅ abre modal também no erro (opcional)
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleBack = () => {
      setCurrentScreen('home');
  };

  return (
    
    <div className="mx-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="text-sm text-gray-600">
            <h1>Fale Conosco</h1>
          </div>
        </div>
      </header>
      

      <p className="text-gray-600 mb-3">
        Tem alguma dúvida, sugestão ou reclamação? <br />
        Preencha o formulário abaixo para nos enviar uma mensagem <br /> ou entre
        em contato diretamente pelos nossos canais de atendimento.
        <a
          href="http://wa.me/21989078588"
          target="_blank"
          rel="noreferrer"
          className=""
        >
          <FaWhatsapp className="w-6 h-6 p-0.5 text-green-500 border border-green-500 rounded-full inline ml-2" />
        </a>
        <a
          href="https://www.instagram.com/planejeviagem_ofc/9"
          target="_blank"
          rel="noreferrer"
        >
          <FaInstagram className="w-6 h-6 p-0.5 text-green-500 border border-green-500 rounded-full inline ml-2" />
        </a>
      </p>

      {/* ✅ onSubmit no form (não onClick) */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nome *
          </label>
          <input
            type="text"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            E-mail *
          </label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Mensagem *
          </label>
          <textarea
            value={mensagem}
            onChange={(event) => setMensagem(event.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
            rows={4}
            required
          />
        </div>

        <button
          type="submit"
          className="bg-sky-500 text-white py-2 px-4 rounded-md hover:bg-sky-600 transition-colors disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Enviando..." : "Enviar"}
        </button>
      </form>

      {/* ✅ Modal */}
      {isModalOpen && status.type !== "idle" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={closeModal} // fecha clicando fora
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()} // evita fechar ao clicar dentro
          >
            <div className="p-6">
              <div className="flex items-start gap-3">
                <div
                  className={
                    status.type === "success"
                      ? "mt-1 h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center"
                      : "mt-1 h-10 w-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center"
                  }
                >
                  {status.type === "success" ? "✓" : "!"}
                </div>

                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {status.type === "success"
                      ? "Mensagem enviada!"
                      : "Não foi possível enviar"}
                  </h2>
                  <p
                    className={
                      status.type === "success"
                        ? "mt-1 text-sm text-gray-600"
                        : "mt-1 text-sm text-gray-600"
                    }
                  >
                    {status.message}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Fechar
                </button>

                {status.type === "success" && (
                  <a
                    href="http://wa.me/21989078588"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
                  >
                    Falar no WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
