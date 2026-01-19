import { createContext, useContext, useState, ReactNode } from "react";

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  progress: number;
  tasks: Task[];
}

interface TripsContextType {
  trips: Trip[];
  selectedTrip: Trip | null;
  addTrip: (trip: Omit<Trip, "id" | "progress">) => void;
  deleteTrip: (id: string) => void;
  toggleTask: (tripId: string, taskId: string) => void;
  addTask: (tripId: string, taskText: string) => void;
  deleteTask: (tripId: string, taskId: string) => void;
  selectTrip: (id: string) => void;
}

const TripsContext = createContext<TripsContextType | undefined>(undefined);

// Dados iniciais de exemplo
const initialTrips: Trip[] = [
  {
    id: "1",
    destination: "Rio de Janeiro",
    startDate: "15 Mar",
    endDate: "20 Mar",
    budget: "R$ 3.500",
    progress: 50,
    tasks: [
      { id: "1", text: "Reservar voo", completed: true },
      { id: "2", text: "Reservar hotel", completed: true },
      { id: "3", text: "Alugar carro", completed: false },
      { id: "4", text: "Roteiro de passeios", completed: false },
    ],
  },
  {
    id: "2",
    destination: "Gramado",
    startDate: "10 Jun",
    endDate: "15 Jun",
    budget: "R$ 2.800",
    progress: 33,
    tasks: [
      { id: "1", text: "Pesquisar hotéis", completed: true },
      { id: "2", text: "Reservar voo", completed: false },
      { id: "3", text: "Lista de restaurantes", completed: false },
    ],
  },
];

export function TripsProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  // Calcula o progresso baseado nas tarefas concluídas
  const calculateProgress = (tasks: Task[]): number => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  };

  const addTrip = (tripData: Omit<Trip, "id" | "progress">) => {
    const newTrip: Trip = {
      ...tripData,
      id: Date.now().toString(),
      progress: calculateProgress(tripData.tasks),
    };
    setTrips([newTrip, ...trips]);
  };

  const deleteTrip = (id: string) => {
    setTrips(trips.filter((trip) => trip.id !== id));
    if (selectedTrip?.id === id) {
      setSelectedTrip(null);
    }
  };

  const toggleTask = (tripId: string, taskId: string) => {
    setTrips(
      trips.map((trip) => {
        if (trip.id === tripId) {
          const updatedTasks = trip.tasks.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          );
          return {
            ...trip,
            tasks: updatedTasks,
            progress: calculateProgress(updatedTasks),
          };
        }
        return trip;
      })
    );
  };

  const addTask = (tripId: string, taskText: string) => {
    setTrips(
      trips.map((trip) => {
        if (trip.id === tripId) {
          const newTask: Task = {
            id: Date.now().toString(),
            text: taskText,
            completed: false,
          };
          const updatedTasks = [...trip.tasks, newTask];
          return {
            ...trip,
            tasks: updatedTasks,
            progress: calculateProgress(updatedTasks),
          };
        }
        return trip;
      })
    );
  };

  const deleteTask = (tripId: string, taskId: string) => {
    setTrips(
      trips.map((trip) => {
        if (trip.id === tripId) {
          const updatedTasks = trip.tasks.filter((task) => task.id !== taskId);
          return {
            ...trip,
            tasks: updatedTasks,
            progress: calculateProgress(updatedTasks),
          };
        }
        return trip;
      })
    );
  };

  const selectTrip = (id: string) => {
    const trip = trips.find((t) => t.id === id);
    setSelectedTrip(trip || null);
  };

  return (
    <TripsContext.Provider
      value={{
        trips,
        selectedTrip,
        addTrip,
        deleteTrip,
        toggleTask,
        addTask,
        deleteTask,
        selectTrip,
      }}
    >
      {children}
    </TripsContext.Provider>
  );
}

export function useTrips() {
  const context = useContext(TripsContext);
  if (!context) {
    throw new Error("useTrips must be used within TripsProvider");
  }
  return context;
}
