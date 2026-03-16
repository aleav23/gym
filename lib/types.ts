export interface Exercise {
  name: string;
  sets: number;
  reps: string; // e.g. "10" or "8-12" or "al fallo"
  rest?: string; // e.g. "60s"
  notes?: string;
}

export interface WorkoutDay {
  day: string; // e.g. "Día 1", "Lunes", etc.
  label?: string; // e.g. "Push", "Pull", "Piernas"
  exercises: Exercise[];
}

export interface SetLog {
  weight: number | null;
  reps: number | null;
  done: boolean;
}

export interface ExerciseLog {
  exerciseName: string;
  sets: SetLog[];
  completedAt?: string;
}

export interface WorkoutSession {
  id: string;
  day: string;
  date: string; // ISO string
  exercises: ExerciseLog[];
  completedAt?: string;
}

export interface ProgressEntry {
  date: string;
  weight: number;
  reps: number;
}

export interface ExerciseHistory {
  [exerciseName: string]: ProgressEntry[];
}
