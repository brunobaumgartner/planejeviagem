import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import * as api from "@/services/api";
import type { Trip, Task } from "@/types";

interface TripsContextType {
  trips: Trip[];
  selectedTrip: Trip | null;
  isLoading: boolean;
  addTrip: (
    trip: Omit<
      Trip,
      "id" | "progress" | "createdAt" | "updatedAt"
    >,
  ) => Promise<void>;
  updateTrip: (
    tripId: string,
    updates: Partial<Trip>,
  ) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  toggleTask: (tripId: string, taskId: string) => Promise<void>;
  addTask: (tripId: string, taskText: string) => Promise<void>;
  deleteTask: (tripId: string, taskId: string) => Promise<void>;
  selectTrip: (id: string) => void;
  refreshTrips: () => Promise<void>;
}

const TripsContext = createContext<
  TripsContextType | undefined
>(undefined);

const GUEST_STORAGE_KEY = "planeje_facil_guest_trips";
const SELECTED_TRIP_KEY = "planeje_facil_selected_trip";

// Initial trips for new guest users
const initialGuestTrips: Trip[] = [];

export function TripsProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Use auth context with safe fallback during hot reload
  let authData;
  try {
    authData = useAuth();
  } catch (e) {
    // During React Refresh, AuthContext might not be ready
    // Return a loading state temporarily
    return <>{children}</>;
  }

  const { user, isGuest, getAccessToken } = authData;

  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [hasMigratedGuestData, setHasMigratedGuestData] =
    useState(false);

  // Calculate progress based on completed tasks
  const calculateProgress = (tasks: Task[]): number => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  };

  // Migrate guest data to logged user
  const migrateGuestDataToUser = async () => {
    if (isGuest || !user || hasMigratedGuestData) return;

    try {
      console.log(
        "[TripsContext] 🔄 Verificando dados do Guest para migração...",
      );
      const guestData = localStorage.getItem(GUEST_STORAGE_KEY);

      if (!guestData) {
        console.log(
          "[TripsContext] ✅ Nenhum dado de Guest encontrado para migrar",
        );
        setHasMigratedGuestData(true);
        return;
      }

      const guestTrips: Trip[] = JSON.parse(guestData);

      if (guestTrips.length === 0) {
        console.log(
          "[TripsContext] ✅ Nenhuma viagem para migrar",
        );
        localStorage.removeItem(GUEST_STORAGE_KEY);
        setHasMigratedGuestData(true);
        return;
      }

      console.log(
        `[TripsContext] 📦 Migrando ${guestTrips.length} viagens do Guest para o usuário logado...`,
      );

      const accessToken = await getAccessToken();
      if (!accessToken) {
        console.error(
          "[TripsContext] ❌ Access token não disponível para migração",
        );
        return;
      }

      // Create trips in database
      const migratedTrips: Trip[] = [];
      for (const guestTrip of guestTrips) {
        try {
          const newTrip = await api.createTrip(
            {
              ...guestTrip,
              userId: user.id,
              // Recalculate progress to ensure consistency
              progress: calculateProgress(
                guestTrip.tasks || [],
              ),
            },
            accessToken,
          );
          migratedTrips.push(newTrip);
          console.log(
            `[TripsContext] ✅ Viagem "${guestTrip.destination}" migrada com sucesso`,
          );
        } catch (error) {
          console.error(
            `[TripsContext] ❌ Erro ao migrar viagem "${guestTrip.destination}":`,
            error,
          );
        }
      }

      // Clear guest data from localStorage
      localStorage.removeItem(GUEST_STORAGE_KEY);

      if (migratedTrips.length > 0) {
        console.log(
          `[TripsContext] 🎉 Migração concluída! ${migratedTrips.length} viagens migradas`,
        );

        // Show success message to user
        const migrationKey = `migration_shown_${user.id}`;
        if (!localStorage.getItem(migrationKey)) {
          // Show a temporary visual notification
          const message =
            migratedTrips.length === 1
              ? `✅ Sua viagem para ${migratedTrips[0].destination} foi sincronizada com sucesso!`
              : `✅ ${migratedTrips.length} viagens foram sincronizadas com sua conta!`;

          // Create a temporary notification element
          const notification = document.createElement("div");
          notification.className =
            "fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-fade-in";
          notification.textContent = message;
          document.body.appendChild(notification);

          setTimeout(() => {
            notification.style.opacity = "0";
            notification.style.transition = "opacity 0.3s";
            setTimeout(
              () => document.body.removeChild(notification),
              300,
            );
          }, 4000);

          localStorage.setItem(migrationKey, "true");
        }
      }

      setHasMigratedGuestData(true);

      // Reload trips to show migrated data
      await loadTrips();
    } catch (error) {
      console.error(
        "[TripsContext] ❌ Erro na migração de dados do Guest:",
        error,
      );
      setHasMigratedGuestData(true); // Set to true to avoid retry loops
    }
  };

  // Load selected trip from localStorage
  useEffect(() => {
    const savedSelectedId = localStorage.getItem(
      SELECTED_TRIP_KEY,
    );
    if (savedSelectedId && trips.length > 0) {
      const trip = trips.find((t) => t.id === savedSelectedId);
      if (trip) {
        setSelectedTrip(trip);
      }
    } else if (trips.length > 0 && !selectedTrip) {
      // Auto-select first trip if none selected
      setSelectedTrip(trips[0]);
      localStorage.setItem(SELECTED_TRIP_KEY, trips[0].id);
    }
  }, [trips]);

  // Load trips on mount and when user changes
  useEffect(() => {
    (async () => {
      await loadTrips();
      // After loading trips, try to migrate guest data if user just logged in
      if (!isGuest && user) {
        await migrateGuestDataToUser();
      } else if (isGuest) {
        // Reset migration flag when user logs out
        setHasMigratedGuestData(false);
      }
    })();
  }, [user?.id, isGuest]);

  const loadTrips = async () => {
    setIsLoading(true);
    try {
      if (isGuest) {
        // Load from localStorage for guest users
        const stored = localStorage.getItem(GUEST_STORAGE_KEY);
        if (stored) {
          setTrips(JSON.parse(stored));
        } else {
          // First time guest - set initial trips
          setTrips(initialGuestTrips);
          localStorage.setItem(
            GUEST_STORAGE_KEY,
            JSON.stringify(initialGuestTrips),
          );
        }
      } else if (user) {
        // Load from database for logged users
        console.log(
          "[TripsContext] Carregando viagens do banco para userId:",
          user.id,
        );
        const accessToken = await getAccessToken();
        console.log(
          "[TripsContext] Access token obtido:",
          accessToken ? "SIM" : "NÃO",
        );

        if (accessToken) {
          console.log(
            "[TripsContext] Chamando api.getUserTrips...",
          );
          const userTrips = await api.getUserTrips(
            user.id,
            accessToken,
          );
          console.log(
            "[TripsContext] Viagens carregadas:",
            userTrips.length,
          );
          setTrips(userTrips);
        } else {
          console.error(
            "[TripsContext] Access token não disponível!",
          );
          setTrips([]);
        }
      } else {
        setTrips([]);
      }
    } catch (error: any) {
      console.error(
        "[TripsContext] Error loading trips (raw):",
        error,
      );

      setTrips([]); // estado seguro
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTrips = async () => {
    await loadTrips();
  };

  const saveGuestTrips = (updatedTrips: Trip[]) => {
    localStorage.setItem(
      GUEST_STORAGE_KEY,
      JSON.stringify(updatedTrips),
    );
    setTrips(updatedTrips);
  };

  const addTrip = async (
    tripData: Omit<
      Trip,
      "id" | "progress" | "createdAt" | "updatedAt"
    >,
  ) => {
    try {
      if (isGuest) {
        // Add to localStorage for guest
        const tasks = tripData.tasks ?? [];
        const newTrip: Trip = {
          ...tripData,
          tasks,
          id: Date.now().toString(),
          progress: calculateProgress(tasks),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const updatedTrips = [newTrip, ...trips];
        saveGuestTrips(updatedTrips);
      } else if (user) {
        // Add to database for logged user
        const accessToken = await getAccessToken();
        if (accessToken) {
          const newTrip = await api.createTrip(
            {
              ...tripData,
              userId: user.id,
              progress: calculateProgress(tripData.tasks),
            },
            accessToken,
          );
          setTrips([newTrip, ...trips]);
        }
      }
    } catch (error) {
      console.error("Error adding trip:", error);
      throw error;
    }
  };

  const updateTrip = async (
    tripId: string,
    updates: Partial<Trip>,
  ) => {
    try {
      if (isGuest) {
        // Update in localStorage
        const updatedTrips = trips.map((trip) => {
          if (trip.id === tripId) {
            return {
              ...trip,
              ...updates,
              updatedAt: new Date().toISOString(),
            };
          }
          return trip;
        });
        saveGuestTrips(updatedTrips);

        // Update selectedTrip if it's the one being updated
        if (selectedTrip?.id === tripId) {
          const updatedTrip = updatedTrips.find(
            (t) => t.id === tripId,
          );
          if (updatedTrip) {
            setSelectedTrip(updatedTrip);
          }
        }
      } else if (user) {
        // Update in database
        const accessToken = await getAccessToken();
        if (accessToken) {
          console.log(
            "[TripsContext] Atualizando trip no backend:",
            tripId,
            updates,
          );
          await api.updateTrip(tripId, updates, accessToken);

          const updatedTrips = trips.map((trip) => {
            if (trip.id === tripId) {
              return {
                ...trip,
                ...updates,
                updatedAt: new Date().toISOString(),
              };
            }
            return trip;
          });

          setTrips(updatedTrips);

          // Update selectedTrip if it's the one being updated
          if (selectedTrip?.id === tripId) {
            const updatedTrip = updatedTrips.find(
              (t) => t.id === tripId,
            );
            if (updatedTrip) {
              console.log(
                "[TripsContext] ✅ Atualizando selectedTrip com itinerary:",
                updatedTrip.itinerary,
              );
              setSelectedTrip(updatedTrip);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error updating trip:", error);
      throw error;
    }
  };

  const deleteTrip = async (id: string) => {
    try {
      if (isGuest) {
        // Delete from localStorage
        const updatedTrips = trips.filter(
          (trip) => trip.id !== id,
        );
        saveGuestTrips(updatedTrips);
        if (selectedTrip?.id === id) {
          setSelectedTrip(null);
        }
      } else if (user) {
        // Delete from database
        const accessToken = await getAccessToken();
        if (accessToken) {
          await api.deleteTrip(id, accessToken);
          setTrips(trips.filter((trip) => trip.id !== id));
          if (selectedTrip?.id === id) {
            setSelectedTrip(null);
          }
        }
      }
    } catch (error) {
      console.error("Error deleting trip:", error);
      throw error;
    }
  };

  const toggleTask = async (tripId: string, taskId: string) => {
    try {
      const updatedTrips = trips.map((trip) => {
        if (trip.id === tripId) {
          const updatedTasks = trip.tasks.map((task) =>
            task.id === taskId
              ? { ...task, completed: !task.completed }
              : task,
          );
          return {
            ...trip,
            tasks: updatedTasks,
            progress: calculateProgress(updatedTasks),
            updatedAt: new Date().toISOString(),
          };
        }
        return trip;
      });

      if (isGuest) {
        saveGuestTrips(updatedTrips);
      } else if (user) {
        const accessToken = await getAccessToken();
        if (accessToken) {
          const trip = updatedTrips.find(
            (t) => t.id === tripId,
          );
          if (trip) {
            await api.updateTrip(
              tripId,
              { tasks: trip.tasks, progress: trip.progress },
              accessToken,
            );
            setTrips(updatedTrips);
          }
        }
      }
    } catch (error) {
      console.error("Error toggling task:", error);
      throw error;
    }
  };

  const addTask = async (tripId: string, taskText: string) => {
    try {
      const updatedTrips = trips.map((trip) => {
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
            updatedAt: new Date().toISOString(),
          };
        }
        return trip;
      });

      if (isGuest) {
        saveGuestTrips(updatedTrips);
      } else if (user) {
        const accessToken = await getAccessToken();
        if (accessToken) {
          const trip = updatedTrips.find(
            (t) => t.id === tripId,
          );
          if (trip) {
            await api.updateTrip(
              tripId,
              { tasks: trip.tasks, progress: trip.progress },
              accessToken,
            );
            setTrips(updatedTrips);
          }
        }
      }
    } catch (error) {
      console.error("Error adding task:", error);
      throw error;
    }
  };

  const deleteTask = async (tripId: string, taskId: string) => {
    try {
      const updatedTrips = trips.map((trip) => {
        if (trip.id === tripId) {
          const updatedTasks = trip.tasks.filter(
            (task) => task.id !== taskId,
          );
          return {
            ...trip,
            tasks: updatedTasks,
            progress: calculateProgress(updatedTasks),
            updatedAt: new Date().toISOString(),
          };
        }
        return trip;
      });

      if (isGuest) {
        saveGuestTrips(updatedTrips);
      } else if (user) {
        const accessToken = await getAccessToken();
        if (accessToken) {
          const trip = updatedTrips.find(
            (t) => t.id === tripId,
          );
          if (trip) {
            await api.updateTrip(
              tripId,
              { tasks: trip.tasks, progress: trip.progress },
              accessToken,
            );
            setTrips(updatedTrips);
          }
        }
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  };

  const selectTrip = (id: string) => {
    const trip = trips.find((t) => t.id === id);
    setSelectedTrip(trip || null);
    localStorage.setItem(SELECTED_TRIP_KEY, id);
  };

  return (
    <TripsContext.Provider
      value={{
        trips,
        selectedTrip,
        isLoading,
        addTrip,
        updateTrip,
        deleteTrip,
        toggleTask,
        addTask,
        deleteTask,
        selectTrip,
        refreshTrips,
      }}
    >
      {children}
    </TripsContext.Provider>
  );
}

export function useTrips() {
  const context = useContext(TripsContext);
  if (!context) {
    throw new Error(
      "useTrips must be used within TripsProvider",
    );
  }
  return context;
}