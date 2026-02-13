import { useState } from "react";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { useNavigation } from "@/app/context/NavigationContext";

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeModal = () => {
    setIsModalOpen(false);
    setStatus({ type: "idle", message: "" });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus({ type: "idle", message: "" });
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5f5857fb/contact/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ nome, email, mensagem }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data?.success) {
        const errorMessage = data?.error || `Erro ao enviar mensagem (HTTP ${response.status})`;
        throw new Error(errorMessage);
      }

      setStatus({
        type: "success",
        message: "Mensagem enviada com sucesso. Obrigado pelo contato!",
      });

      setNome("");
      setEmail("");
      setMensagem("");
      setIsModalOpen(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao enviar mensagem.";
      setStatus({ type: "error", message });
      setIsModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 pb-24 lg:pb-0">
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => setCurrentScreen("profile")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Voltar para inicio"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Fale com nosso time</h1>
            <p className="text-sm text-gray-600">Estamos aqui para ajudar voce</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <section className="bg-white rounded-xl p-5 border border-sky-100 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-sky-100 text-sky-600 rounded-lg">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Envie sua mensagem</h2>
              <p className="text-sm text-gray-600 mt-1">
                Preencha o formulario abaixo ou use um dos canais diretos de atendimento.
              </p>
            </div>
          </div>
        </section>

        <section className="grid sm:grid-cols-2 gap-4">
          <a
            href="http://wa.me/21989078588"
            target="_blank"
            rel="noreferrer"
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-green-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <FaWhatsapp className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-gray-900">WhatsApp</h3>
            </div>
            <p className="text-sm text-gray-600">Atendimento mais rapido para duvidas e suporte.</p>
          </a>

          <a
            href="https://www.instagram.com/planejeviagem_ofc/9"
            target="_blank"
            rel="noreferrer"
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-pink-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
                <FaInstagram className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-gray-900">Instagram</h3>
            </div>
            <p className="text-sm text-gray-600">Novidades e contato direto pelas redes sociais.</p>
          </a>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Formulario de contato</h3>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome *</label>
              <input
                type="text"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                className="mt-1 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">E-mail *</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mensagem *</label>
              <textarea
                value={mensagem}
                onChange={(event) => setMensagem(event.target.value)}
                className="mt-1 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
                rows={5}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-sky-600 hover:to-blue-700 transition-colors disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar mensagem"}
            </button>
          </form>
        </section>
      </main>

      {isModalOpen && status.type !== "idle" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
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
                  {status.type === "success" ? "OK" : "!"}
                </div>

                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {status.type === "success" ? "Mensagem enviada!" : "Nao foi possivel enviar"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">{status.message}</p>
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
