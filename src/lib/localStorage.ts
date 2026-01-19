// Sistema de gerenciamento de dados locais para modo guest

export interface LocalTrip {
  id: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget: number;
  trip_type: string;
  status: string;
  created_at: string;
}

export interface LocalTask {
  id: string;
  trip_id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

const TRIPS_KEY = 'local_trips_474b5592';
const TASKS_KEY = 'local_tasks_474b5592';

// Trip functions
export const getLocalTrips = (): LocalTrip[] => {
  try {
    const data = localStorage.getItem(TRIPS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveLocalTrip = (trip: LocalTrip): void => {
  const trips = getLocalTrips();
  trips.push(trip);
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
};

export const deleteLocalTrip = (tripId: string): void => {
  const trips = getLocalTrips().filter(t => t.id !== tripId);
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
  
  // Also delete associated tasks
  const tasks = getLocalTasks().filter(t => t.trip_id !== tripId);
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};

// Task functions
export const getLocalTasks = (): LocalTask[] => {
  try {
    const data = localStorage.getItem(TASKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const getLocalTasksForTrip = (tripId: string): LocalTask[] => {
  return getLocalTasks().filter(t => t.trip_id === tripId);
};

export const saveLocalTask = (task: LocalTask): void => {
  const tasks = getLocalTasks();
  tasks.push(task);
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};

export const updateLocalTask = (taskId: string, updates: Partial<LocalTask>): void => {
  const tasks = getLocalTasks();
  const index = tasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updates };
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }
};

export const deleteLocalTask = (taskId: string): void => {
  const tasks = getLocalTasks().filter(t => t.id !== taskId);
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};

// Clear all local data
export const clearLocalData = (): void => {
  localStorage.removeItem(TRIPS_KEY);
  localStorage.removeItem(TASKS_KEY);
};

// Check if there's local data
export const hasLocalData = (): boolean => {
  return getLocalTrips().length > 0 || getLocalTasks().length > 0;
};

// Generate unique ID for local items
export const generateLocalId = (): string => {
  return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
