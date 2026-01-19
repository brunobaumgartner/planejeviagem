# 💻 Exemplos de Código - Planeje Fácil

## 📝 Como Usar os Contextos

### TripsContext - Gerenciamento de Viagens

```tsx
import { useTrips } from './context/TripsContext';

function MeuComponente() {
  const { 
    trips,           // Array de todas as viagens
    addTrip,         // Adicionar nova viagem
    deleteTrip,      // Excluir viagem
    toggleTask,      // Marcar/desmarcar tarefa
    addTask,         // Adicionar tarefa
    deleteTask,      // Excluir tarefa
    selectTrip       // Selecionar viagem para roteiro
  } = useTrips();

  // Exemplo: Adicionar uma viagem
  const handleAddTrip = () => {
    addTrip({
      destination: "Paris",
      startDate: "10 Jun",
      endDate: "20 Jun",
      budget: "R$ 8.000",
      tasks: [
        { id: "1", text: "Reservar passagem", completed: false }
      ]
    });
  };

  // Exemplo: Marcar tarefa como concluída
  const handleToggleTask = (tripId: string, taskId: string) => {
    toggleTask(tripId, taskId);
  };

  // Exemplo: Adicionar tarefa
  const handleAddTask = (tripId: string) => {
    addTask(tripId, "Comprar seguro viagem");
  };

  return (
    <div>
      {trips.map(trip => (
        <div key={trip.id}>
          <h3>{trip.destination}</h3>
          <p>Progresso: {trip.progress}%</p>
        </div>
      ))}
    </div>
  );
}
```

---

### NavigationContext - Navegação entre Telas

```tsx
import { useNavigation } from './context/NavigationContext';

function MeuBotao() {
  const { currentScreen, setCurrentScreen } = useNavigation();

  return (
    <button onClick={() => setCurrentScreen('trips')}>
      Ir para Minhas Viagens
    </button>
  );
}
```

---

## 🎨 Como Criar um Modal

```tsx
import { X } from "lucide-react";
import { useState } from "react";

interface MeuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dados: any) => void;
}

export function MeuModal({ isOpen, onClose, onSubmit }: MeuModalProps) {
  const [valor, setValor] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ valor });
    setValor("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl">Meu Modal</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="Digite algo..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600"
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

## 📊 Como Calcular Progresso

```tsx
// Exemplo de cálculo automático de progresso
const calculateProgress = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;
  
  const completed = tasks.filter(t => t.completed).length;
  return Math.round((completed / tasks.length) * 100);
};

// Uso:
const progress = calculateProgress(trip.tasks);
console.log(`Progresso: ${progress}%`); // Progresso: 75%
```

---

## 🎯 Como Criar um Card Interativo

```tsx
import { CheckCircle2, Circle } from "lucide-react";

interface TaskCardProps {
  task: {
    id: string;
    text: string;
    completed: boolean;
  };
  onToggle: () => void;
}

export function TaskCard({ task, onToggle }: TaskCardProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 w-full p-3 hover:bg-gray-50 rounded-lg transition-colors"
    >
      {task.completed ? (
        <CheckCircle2 className="w-5 h-5 text-sky-500" />
      ) : (
        <Circle className="w-5 h-5 text-gray-300" />
      )}
      
      <span className={`text-sm ${
        task.completed ? "line-through text-gray-400" : "text-gray-700"
      }`}>
        {task.text}
      </span>
    </button>
  );
}
```

---

## 🔄 Como Fazer Animações com Tailwind

```tsx
// Barra de progresso animada
<div className="w-full bg-gray-200 rounded-full h-2">
  <div
    className="bg-sky-500 h-2 rounded-full transition-all duration-500"
    style={{ width: `${progress}%` }}
  />
</div>

// Botão com hover
<button className="px-4 py-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors">
  Clique aqui
</button>

// Elemento que aparece ao hover
<div className="group">
  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
    Aparece ao passar o mouse
  </div>
</div>

// Fade in
<div className="animate-fade-in">
  Conteúdo com fade
</div>
```

---

## 🎨 Padrões de Design Usados

### 1. Card Container
```tsx
<div className="bg-white rounded-xl p-4 shadow-sm">
  {/* Conteúdo */}
</div>
```

### 2. Botão Primário
```tsx
<button className="px-6 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors">
  Texto
</button>
```

### 3. Botão Secundário
```tsx
<button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
  Texto
</button>
```

### 4. Botão de Ícone
```tsx
<button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
  <IconComponent className="w-5 h-5" />
</button>
```

### 5. Input de Formulário
```tsx
<input
  type="text"
  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
  placeholder="Digite..."
/>
```

### 6. Badge
```tsx
<span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-xs font-medium rounded">
  Premium
</span>
```

### 7. Divider
```tsx
<div className="border-b border-gray-100" />
```

---

## 🛠️ Helpers Úteis

### Formatar Data
```tsx
const formatDateRange = (startDate: string, endDate: string) => {
  return `${startDate}-${endDate}`;
};

// Uso:
console.log(formatDateRange("15 Mar", "20 Mar")); // "15 Mar-20 Mar"
```

### Gerar ID Único
```tsx
const generateId = () => {
  return Date.now().toString();
};

// Uso:
const newTask = {
  id: generateId(),
  text: "Nova tarefa",
  completed: false
};
```

### Confirmar Ação
```tsx
const confirmDelete = (itemName: string) => {
  return confirm(`Deseja realmente excluir "${itemName}"?`);
};

// Uso:
if (confirmDelete(trip.destination)) {
  deleteTrip(trip.id);
}
```

---

## 🎯 TypeScript - Tipos Principais

```tsx
// Tarefa
interface Task {
  id: string;
  text: string;
  completed: boolean;
}

// Viagem
interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  progress: number;
  tasks: Task[];
}

// Telas disponíveis
type Screen = "home" | "trips" | "itinerary" | "profile";

// Props de componente com children
interface ComponentProps {
  children: ReactNode;
  className?: string;
}
```

---

## 🚀 Como Adicionar uma Nova Funcionalidade

### Exemplo: Adicionar "Editar Viagem"

#### 1. Adicionar método no Context
```tsx
// Em TripsContext.tsx
const updateTrip = (tripId: string, updates: Partial<Trip>) => {
  setTrips(
    trips.map((trip) => 
      trip.id === tripId ? { ...trip, ...updates } : trip
    )
  );
};

// Exportar no provider
return (
  <TripsContext.Provider value={{ 
    trips, 
    updateTrip, // <-- Novo método
    // ... outros métodos
  }}>
```

#### 2. Criar componente EditTripModal
```tsx
// Em components/EditTripModal.tsx
export function EditTripModal({ trip, isOpen, onClose, onSubmit }) {
  const [destination, setDestination] = useState(trip.destination);
  // ... resto do componente igual ao AddTripModal
}
```

#### 3. Usar no componente
```tsx
// Em MinhasViagens.tsx
const { updateTrip } = useTrips();
const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

const handleEdit = (trip: Trip) => {
  setEditingTrip(trip);
  setShowEditModal(true);
};

const handleUpdate = (updates: Partial<Trip>) => {
  if (editingTrip) {
    updateTrip(editingTrip.id, updates);
  }
};
```

---

## 📦 Estrutura Recomendada para Novos Componentes

```
src/app/components/
├── shared/              # Componentes reutilizáveis
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   └── Card.tsx
├── screens/             # Telas principais
│   └── NovaTelaAqui.tsx
└── features/            # Funcionalidades específicas
    └── trips/
        ├── TripCard.tsx
        ├── TripList.tsx
        └── TripForm.tsx
```

---

## 🎨 Classes Tailwind Mais Usadas

```css
/* Layout */
flex items-center justify-between
grid grid-cols-2 gap-4
space-y-4

/* Cores */
bg-sky-500 text-white
bg-gray-50 text-gray-700
border-gray-300

/* Tamanhos */
w-full h-full
p-4 px-6 py-3
text-sm text-lg text-2xl

/* Bordas e Sombras */
rounded-xl rounded-full
shadow-sm shadow-lg
border border-2

/* Estados */
hover:bg-gray-100
focus:ring-2 focus:ring-sky-500
transition-colors transition-all

/* Responsivo */
md:flex-row
lg:grid-cols-3
```

---

## 🔍 Debugging

```tsx
// Ver estado atual das viagens
const { trips } = useTrips();
console.log('Viagens atuais:', trips);

// Ver props do componente
console.log('Props recebidas:', { trip, onToggle });

// Ver evento
const handleClick = (e) => {
  console.log('Evento:', e);
  console.log('Target:', e.target);
};
```

---

## ✅ Checklist para Novo Componente

- [ ] Criar arquivo em `/src/app/components/`
- [ ] Definir interface de Props com TypeScript
- [ ] Usar classes Tailwind do design system
- [ ] Adicionar estados necessários (useState)
- [ ] Conectar com Context se precisar de dados globais
- [ ] Adicionar interatividade (onClick, onChange, etc)
- [ ] Testar responsividade mobile
- [ ] Adicionar animações/transições
- [ ] Documentar no código com comentários

---

**Estes exemplos cobrem 90% dos casos de uso do app! 🚀**
