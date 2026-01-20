import { useState, useEffect } from "react";
import { 
  X, Plus, Package, Shirt, Droplet, Laptop, 
  FileText, Pill, MoreHorizontal, Trash2, 
  CheckCircle2, Circle, Search, Check
} from "lucide-react";
import type { PackingItem, Trip } from "@/types";

type CategoryType = 'roupas' | 'higiene' | 'eletronicos' | 'documentos' | 'medicamentos' | 'outros';

interface CategoryInfo {
  icon: any;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const CATEGORIES: Record<CategoryType, CategoryInfo> = {
  roupas: {
    icon: Shirt,
    label: "Roupas",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  higiene: {
    icon: Droplet,
    label: "Higiene",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  eletronicos: {
    icon: Laptop,
    label: "Eletrônicos",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  },
  documentos: {
    icon: FileText,
    label: "Documentos",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  },
  medicamentos: {
    icon: Pill,
    label: "Medicamentos",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200"
  },
  outros: {
    icon: MoreHorizontal,
    label: "Outros",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200"
  }
};

// Itens sugeridos por categoria
const SUGGESTED_ITEMS: Record<CategoryType, string[]> = {
  roupas: [
    "Camisetas", "Calças", "Shorts", "Vestidos", "Roupas íntimas",
    "Meias", "Pijama", "Casaco", "Sapatos", "Chinelos", 
    "Traje de banho", "Boné/Chapéu", "Óculos de sol"
  ],
  higiene: [
    "Escova de dentes", "Pasta de dentes", "Shampoo", "Condicionador",
    "Sabonete", "Desodorante", "Protetor solar", "Perfume",
    "Escova de cabelo", "Lâmina de barbear", "Hidratante",
    "Absorventes", "Preservativos"
  ],
  eletronicos: [
    "Celular", "Carregador de celular", "Fone de ouvido", "Câmera fotográfica",
    "Notebook", "Tablet", "Carregador de notebook", "Power bank",
    "Adaptador de tomada", "Pen drive", "Kindle/E-reader"
  ],
  documentos: [
    "RG/CNH", "CPF", "Passaporte", "Passagens aéreas", "Reserva de hotel",
    "Seguro viagem", "Cartão de vacina", "Cartão de crédito", 
    "Cartão de débito", "Dinheiro em espécie", "Comprovante de reservas"
  ],
  medicamentos: [
    "Analgésico", "Antitérmico", "Antialérgico", "Remédio para enjoo",
    "Band-aid", "Álcool gel", "Repelente", "Medicamentos de uso contínuo",
    "Termômetro", "Vitaminas"
  ],
  outros: [
    "Mochila/Bolsa", "Garrafa de água", "Guia turístico", "Mapa",
    "Cadeado", "Saco plástico", "Sacola de compras", "Caderno e caneta",
    "Livro", "Travesseiro de pescoço", "Máscara de dormir", "Lanterna"
  ]
};

interface PackingListModalProps {
  isOpen: boolean;
  trip: Trip | null;
  onClose: () => void;
  onUpdate: (packingItems: PackingItem[]) => void;
}

export function PackingListModal({ isOpen, trip, onClose, onUpdate }: PackingListModalProps) {
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<CategoryType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState("");

  // Sincronizar packingItems quando trip mudar
  useEffect(() => {
    if (trip) {
      setPackingItems(trip.packingItems || []);
    }
  }, [trip]);

  if (!isOpen || !trip) return null;

  const addItem = (name: string, category: CategoryType, quantity: number = 1) => {
    if (!name.trim()) return;

    const newItem: PackingItem = {
      id: `item_${Date.now()}_${Math.random()}`,
      trip_id: trip.id,
      category,
      name: name.trim(),
      quantity,
      packed: false,
      created_at: new Date().toISOString()
    };

    const updated = [...packingItems, newItem];
    setPackingItems(updated);
    onUpdate(updated);
  };

  const togglePacked = (itemId: string) => {
    const updated = packingItems.map(item =>
      item.id === itemId ? { ...item, packed: !item.packed } : item
    );
    setPackingItems(updated);
    onUpdate(updated);
  };

  const deleteItem = (itemId: string) => {
    const updated = packingItems.filter(item => item.id !== itemId);
    setPackingItems(updated);
    onUpdate(updated);
  };

  // Filtrar itens
  const filteredItems = packingItems.filter(item => {
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Agrupar por categoria
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<CategoryType, PackingItem[]>);

  // Calcular progresso
  const totalItems = packingItems.length;
  const packedItems = packingItems.filter(i => i.packed).length;
  const progress = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-2xl font-bold">Checklist de Bagagem</h2>
              <p className="text-sm text-gray-600 mt-1">{trip.destination}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Barra de progresso */}
          {totalItems > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {packedItems} de {totalItems} itens na mala
                </span>
                <span className="text-sm font-bold text-sky-600">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-sky-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Botão Sugestões */}
          <button
            onClick={() => setShowSuggestionsModal(true)}
            className="mt-3 px-4 py-2 bg-sky-500 text-white text-sm rounded-lg hover:bg-sky-600 transition-colors w-full"
          >
            💡 Ver Sugestões de Itens
          </button>
        </div>

        {/* Busca e Filtros */}
        <div className="p-6 border-b border-gray-200 space-y-3">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Filtro por categoria */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filterCategory === 'all'
                  ? 'bg-sky-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Todos
            </button>
            {Object.entries(CATEGORIES).map(([key, info]) => {
              const Icon = info.icon;
              const count = packingItems.filter(i => i.category === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setFilterCategory(key as CategoryType)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                    filterCategory === key
                      ? `${info.bgColor} ${info.color} border-2 ${info.borderColor}`
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {info.label}
                  {count > 0 && (
                    <span className="bg-white/50 px-1.5 py-0.5 rounded-full text-xs">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lista de Itens */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium mb-2">
                {searchTerm ? "Nenhum item encontrado" : "Nenhum item adicionado"}
              </p>
              <p className="text-sm text-gray-400 mb-4">
                {searchTerm ? "Tente outro termo de busca" : "Adicione itens à sua bagagem ou use as sugestões"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                >
                  Adicionar Item
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedItems).map(([category, items]) => {
                const categoryInfo = CATEGORIES[category as CategoryType];
                const Icon = categoryInfo.icon;
                const categoryPacked = items.filter(i => i.packed).length;

                return (
                  <div key={category} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 ${categoryInfo.bgColor} rounded-lg flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${categoryInfo.color}`} />
                        </div>
                        <h3 className="font-semibold text-gray-900">{categoryInfo.label}</h3>
                        <span className="text-xs text-gray-500">
                          {categoryPacked}/{items.length}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {items.map(item => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 bg-white rounded-lg group hover:bg-gray-50 transition-colors"
                        >
                          <button
                            onClick={() => togglePacked(item.id)}
                            className="flex-shrink-0"
                          >
                            {item.packed ? (
                              <CheckCircle2 className="w-6 h-6 text-green-500" />
                            ) : (
                              <Circle className="w-6 h-6 text-gray-300" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${
                              item.packed ? 'line-through text-gray-400' : 'text-gray-900'
                            }`}>
                              {item.name}
                              {item.quantity > 1 && (
                                <span className="ml-2 text-xs text-gray-500">
                                  x{item.quantity}
                                </span>
                              )}
                            </p>
                            {item.notes && (
                              <p className="text-xs text-gray-500 mt-0.5">{item.notes}</p>
                            )}
                          </div>

                          <button
                            onClick={() => deleteItem(item.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded transition-all flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer com botão adicionar */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            Adicionar Item
          </button>
        </div>
      </div>

      {/* Modal Adicionar Item */}
      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onAdd={addItem}
        />
      )}

      {/* Modal Sugestões */}
      {showSuggestionsModal && (
        <SuggestionsModal
          onClose={() => setShowSuggestionsModal(false)}
          onAddItems={(items) => {
            console.log('Itens recebidos para adicionar:', items);
            const newItems = items.map(item => ({
              id: `item_${Date.now()}_${Math.random()}`,
              trip_id: trip.id,
              category: item.category,
              name: item.name,
              quantity: item.quantity,
              packed: false,
              created_at: new Date().toISOString()
            }));
            const updated = [...packingItems, ...newItems];
            console.log('Items atualizados:', updated);
            setPackingItems(updated);
            onUpdate(updated);
          }}
          existingItems={packingItems}
        />
      )}
    </div>
  );
}

// Modal para adicionar item
function AddItemModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (name: string, category: CategoryType, quantity: number) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<CategoryType>('roupas');
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name, category, quantity);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4">Adicionar Item</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do item *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Camiseta"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(CATEGORIES).map(([key, info]) => {
                const Icon = info.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategory(key as CategoryType)}
                    className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                      category === key
                        ? `${info.bgColor} ${info.borderColor} ${info.color}`
                        : 'bg-white border-gray-200 text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal de Sugestões
function SuggestionsModal({ onClose, onAddItems, existingItems }: {
  onClose: () => void;
  onAddItems: (items: { name: string; category: CategoryType; quantity: number }[]) => void;
  existingItems: PackingItem[];
}) {
  const [selectedItems, setSelectedItems] = useState<Map<string, CategoryType>>(new Map());
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('roupas');

  const toggleItem = (item: string, category: CategoryType) => {
    const newMap = new Map(selectedItems);
    const key = `${category}:${item}`; // Chave única combinando categoria e nome
    
    if (newMap.has(key)) {
      newMap.delete(key);
    } else {
      newMap.set(key, category);
    }
    setSelectedItems(newMap);
  };

  const handleAddSelected = () => {
    const items = Array.from(selectedItems.entries()).map(([key, category]) => {
      const name = key.split(':')[1]; // Extrai o nome da chave
      return {
        name,
        category,
        quantity: 1
      };
    });
    onAddItems(items);
    onClose();
  };

  const suggestions = SUGGESTED_ITEMS[selectedCategory];
  const existingNames = new Set(existingItems.map(i => i.name.toLowerCase()));
  const availableSuggestions = suggestions.filter(s => !existingNames.has(s.toLowerCase()));
  
  // Contar total de itens selecionados de todas as categorias
  const totalSelected = selectedItems.size;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Sugestões de Itens</h2>
            {totalSelected > 0 && (
              <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm font-medium">
                {totalSelected} selecionado{totalSelected !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Categorias */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Object.entries(CATEGORIES).map(([key, info]) => {
              const Icon = info.icon;
              // Contar quantos itens desta categoria foram selecionados
              const categoryCount = Array.from(selectedItems.keys()).filter(k => k.startsWith(`${key}:`)).length;
              
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key as CategoryType)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                    selectedCategory === key
                      ? `${info.bgColor} ${info.color} border-2 ${info.borderColor}`
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {info.label}
                  {categoryCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-white/70 rounded-full text-xs font-bold">
                      {categoryCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {availableSuggestions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Todos os itens desta categoria já foram adicionados! 🎉
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {availableSuggestions.map(item => {
                const key = `${selectedCategory}:${item}`;
                const isSelected = selectedItems.has(key);
                return (
                  <button
                    key={item}
                    onClick={() => toggleItem(item, selectedCategory)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? 'bg-sky-50 border-sky-500 text-sky-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-sky-500 border-sky-500'
                          : 'border-gray-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddSelected}
              disabled={totalSelected === 0}
              className="flex-1 px-4 py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Adicionar ({totalSelected})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}