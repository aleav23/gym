"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { WorkoutDay, ExerciseLog, SetLog, WorkoutSession } from "@/lib/types";
import ExerciseCard from "./ExerciseCard";

interface Props {
  day: WorkoutDay;
  onBack: () => void;
  onSessionComplete: (session: WorkoutSession) => void;
}

interface ActiveWorkoutState {
  dayKey: string;
  // exerciseName -> SetLog[]
  setsMap: Record<string, SetLog[]>;
  completedExercises: string[];
  expandedExercise: string | null;
}

const STORAGE_KEY = "gymflow:active-workout";

function loadActiveWorkout(dayKey: string): ActiveWorkoutState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: ActiveWorkoutState = JSON.parse(raw);
    if (parsed.dayKey !== dayKey) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveActiveWorkout(state: ActiveWorkoutState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function clearActiveWorkout() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export default function WorkoutView({ day, onBack, onSessionComplete }: Props) {
  const dayKey = day.day;

  const initState = (): ActiveWorkoutState => {
    if (typeof window !== "undefined") {
      const saved = loadActiveWorkout(dayKey);
      if (saved) return saved;
    }
    return {
      dayKey,
      setsMap: Object.fromEntries(
        day.exercises.map((e) => [
          e.name,
          Array.from({ length: e.sets }, () => ({ weight: null, reps: null, done: false })),
        ])
      ),
      completedExercises: [],
      expandedExercise: null,
    };
  };

  const [state, setState] = useState<ActiveWorkoutState>(initState);
  const [showComplete, setShowComplete] = useState(false);

  // Hydrate from localStorage on mount (SSR safe)
  useEffect(() => {
    const saved = loadActiveWorkout(dayKey);
    if (saved) setState(saved);
  }, [dayKey]);

  // Persist on every change
  useEffect(() => {
    saveActiveWorkout(state);
  }, [state]);

  const totalExercises = day.exercises.length;
  const completedCount = state.completedExercises.length;
  const progress = completedCount / totalExercises;

  // Exercises still visible (not completed)
  const remaining = day.exercises.filter(
    (e) => !state.completedExercises.includes(e.name)
  );

  const handleSetsChange = (exerciseName: string, sets: SetLog[]) => {
    setState((prev) => ({
      ...prev,
      setsMap: { ...prev.setsMap, [exerciseName]: sets },
    }));
  };

  const handleExerciseComplete = (exerciseName: string, sets: SetLog[]) => {
    setState((prev) => {
      const next: ActiveWorkoutState = {
        ...prev,
        setsMap: { ...prev.setsMap, [exerciseName]: sets },
        completedExercises: [...prev.completedExercises, exerciseName],
        expandedExercise: null,
      };
      // Check if all done
      if (next.completedExercises.length === totalExercises) {
        setTimeout(() => setShowComplete(true), 600);
      }
      return next;
    });
  };

  const handleToggleExpand = (exerciseName: string) => {
    setState((prev) => ({
      ...prev,
      expandedExercise: prev.expandedExercise === exerciseName ? null : exerciseName,
    }));
  };

  const handleFinishWorkout = () => {
    const exerciseLogs: ExerciseLog[] = day.exercises
      .filter((e) => state.completedExercises.includes(e.name))
      .map((e) => ({
        exerciseName: e.name,
        sets: state.setsMap[e.name] ?? [],
        completedAt: new Date().toISOString(),
      }));

    const session: WorkoutSession = {
      id: Date.now().toString(),
      day: day.day,
      date: new Date().toISOString(),
      exercises: exerciseLogs,
      completedAt: new Date().toISOString(),
    };

    clearActiveWorkout();
    onSessionComplete(session);
  };

  return (
    <div className="min-h-screen pb-10">
      {/* Sticky header */}
      <div
        className="glass sticky top-0 z-20"
        style={{ borderBottom: "1px solid var(--separator)" }}
      >
        <div className="px-4 pt-12 pb-3">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={onBack}
              className="pressable flex items-center gap-1"
              style={{ color: "var(--blue)" }}
            >
              <ArrowLeft size={20} />
              <span className="text-base">Días</span>
            </button>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--label-secondary)" }}>
                {day.day}
              </p>
              <h2 className="text-2xl font-bold" style={{ letterSpacing: "-0.02em" }}>
                {day.label || day.day}
              </h2>
            </div>
            <span className="text-sm font-semibold tabular-nums" style={{ color: "var(--label-secondary)" }}>
              {completedCount}/{totalExercises}
            </span>
          </div>
          <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--fill)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "var(--blue)" }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
        </div>
      </div>

      {/* Exercise list */}
      <div className="px-4 pt-4 flex flex-col gap-3">
        <AnimatePresence>
          {remaining.map((exercise) => (
            <motion.div
              key={exercise.name}
              layout
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            >
              <ExerciseCard
                exercise={exercise}
                initialSets={state.setsMap[exercise.name]}
                expanded={state.expandedExercise === exercise.name}
                onToggleExpand={() => handleToggleExpand(exercise.name)}
                onSetsChange={(sets) => handleSetsChange(exercise.name, sets)}
                onComplete={(logs) => handleExerciseComplete(exercise.name, logs)}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {remaining.length === 0 && !showComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-12 gap-3"
          >
            <div className="text-5xl">🎉</div>
            <p className="text-xl font-bold">¡Todo listo!</p>
          </motion.div>
        )}
      </div>

      {/* Completion modal */}
      <AnimatePresence>
        {showComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-lg"
              style={{
                background: "var(--bg-elevated)",
                borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
                padding: "28px 24px 48px",
              }}
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="text-6xl">💪</div>
                <h2 className="text-2xl font-bold" style={{ letterSpacing: "-0.02em" }}>
                  ¡Rutina completada!
                </h2>
                <p style={{ color: "var(--label-secondary)" }}>
                  Terminaste {day.label || day.day} con {totalExercises} ejercicios.
                </p>
                <div className="w-full flex flex-col gap-3 mt-2">
                  <button
                    onClick={handleFinishWorkout}
                    className="pressable w-full py-4 rounded-2xl font-semibold text-white text-base"
                    style={{ background: "var(--green)" }}
                  >
                    Guardar y reiniciar
                  </button>
                  <button
                    onClick={() => setShowComplete(false)}
                    className="pressable w-full py-4 rounded-2xl font-semibold text-base"
                    style={{ background: "var(--fill)", color: "var(--label)" }}
                  >
                    Ver resumen
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
