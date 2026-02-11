import { useState } from "react";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { projectId, publicAnonKey } from "/utils/supabase/info";

export function FaleConosco() {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [status, setStatus] = useState<{
        type: "success" | "error" | "idle";
        message: string;
    }>({ type: "idle", message: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                        "Authorization": `Bearer ${publicAnonKey}`,
                    },
                    body: JSON.stringify({
                        nome,
                        email,
                        mensagem,
                    }),
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok || !data?.success) {
                const errorMessage =
                    data?.error ||
                    `Erro ao enviar mensagem (HTTP ${response.status})`;
                throw new Error(errorMessage);
            }

            setStatus({
                type: "success",
                message: "Mensagem enviada com sucesso. Obrigado pelo contato!",
            });
            setNome("");
            setEmail("");
            setMensagem("");
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Erro ao enviar mensagem.";
            setStatus({ type: "error", message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mx-auto">
            <h1 className="text-2x1 font-bold mt-4">Fale Conosco</h1>
            
            <p className="text-gray-600 mb-3">
                Tem alguma dúvida, sugestão ou reclamação? <br />
                Preencha o formulário abaixo para nos enviar uma mensagem <br /> ou entre em contato diretamente pelos nossos canais de atendimento. 
                <a href="http://wa.me/21989078588" target="_blank" className=""><FaWhatsapp className="w-6 h-6 p-0.5 text-green-500 border border-green-500 rounded-full inline ml-2" /></a>
                <a href="https://www.instagram.com/planejeviagem_ofc/9" target="_blank"><FaInstagram className="w-6 h-6 p-0.5 text-green-500 border border-green-500 rounded-full inline  ml-2" /></a>
            </p>

            
            

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nome *</label>
                    <input
                        type="text"
                        value={nome}
                        onChange={(event) => setNome(event.target.value)}
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">E-mail *</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Mensagem *</label>
                    <textarea
                        value={mensagem}
                        onChange={(event) => setMensagem(event.target.value)}
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                        rows={4}
                        required
                    ></textarea>
                </div>    
                <button
                    type="submit"
                    className="bg-sky-500 text-white py-2 px-4 rounded-md hover:bg-sky-600 transition-colors disabled:opacity-60"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Enviando..." : "Enviar"}
                </button>
                {status.type !== "idle" && (
                    <p
                        className={
                            status.type === "success"
                                ? "text-sm text-green-600"
                                : "text-sm text-red-600"
                        }
                    >
                        {status.message}
                    </p>
                )}
            </form>
        </div>
    )
}
