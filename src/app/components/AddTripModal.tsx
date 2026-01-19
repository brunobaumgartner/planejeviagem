import { X } from "lucide-react";
import { useState } from "react";

interface AddTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tripData: {
    destination: string;
    startDate: string;
    endDate: string;
    budget: string;
    tasks: Array<{ id: string; text: string; completed: boolean }>;
  }) => void;
}

export function AddTripModal({ isOpen, onClose, onSubmit }: AddTripModalProps) {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!destination || !startDate || !endDate || !budget) {
      alert("Por favor, preencha todos os campos");
      return;
    }

    // Tarefas padrão para uma nova viagem
    const defaultTasks = [
      { id: "1", text: "Pesquisar voos", completed: false },
      { id: "2", text: "Pesquisar hotéis", completed: false },
      { id: "3", text: "Planejar roteiro", completed: false },
    ];

    onSubmit({
      destination,
      startDate,
      endDate,
      budget,
      tasks: defaultTasks,
    });

    // Limpar formulário
    setDestination("");
    setStartDate("");
    setEndDate("");
    setBudget("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl">Nova Viagem</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Destino
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Ex: Rio de Janeiro"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Data de Início
              </label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="15 Mar"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Data Final
              </label>
              <input
                type="text"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="20 Mar"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Orçamento
            </label>
            <input
              type="text"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="R$ 3.500"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          <div className="bg-sky-50 rounded-xl p-4">
            <p className="text-sm text-gray-700">
              💡 <strong>Dica:</strong> Algumas tarefas básicas já serão adicionadas à sua viagem. Você pode personalizá-las depois!
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors"
            >
              Criar Viagem
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
