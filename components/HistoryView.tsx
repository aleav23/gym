"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, Calendar, ChevronRight } from "lucide-react";
import { WorkoutSession, ExerciseHistory } from "@/lib/types";

interface Props {
  sessions: WorkoutSession[];
  onBack: () => void;
}

function buildHistory(sessions: WorkoutSession[]): ExerciseHistory {
  const history: ExerciseHistory = {};

  for (const session of sessions) {
    for (const ex of session.exercises) {
      if (!history[ex.exerciseName]) history[ex.exerciseName] = [];

      // Get max weight from the session for this exercise
      const best = ex.sets
        .filter((s) => s.done && s.weight !== null)
        .reduce(
          (best, s) => {
            if (s.weight === null) return best;
            return s.weight > (best.weight ?? -1) ? s : best;
          },
          { weight: null as number | null, reps: null as number | null }
        );

      if (best.weight !== null) {
        history[ex.exerciseName].push({
          date: session.date,
          weight: best.weight,
          reps: best.reps ?? 0,
        });
      }
    }
  }

  return history;
}

export default function HistoryView({ sessions, onBack }: Props) {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const history = buildHistory(sessions);

  const exerciseNames = Object.keys(history).sort();
  const selected = selectedExercise ? history[selectedExercise] : null;

  return (
    <div className="min-h-screen pb-10">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <button
          onClick={() => {
            if (selectedExercise) setSelectedExercise(null);
            else onBack();
          }}
          className="pressable flex items-center gap-1 mb-4"
          style={{ color: "var(--blue)" }}
        >
          <ArrowLeft size={20} />
          <span className="text-base">
            {selectedExercise ? "Historial" : "Días"}
          </span>
        </button>

        <h2
          className="text-3xl font-bold"
          style={{ letterSpacing: "-0.02em" }}
        >
          {selectedExercise ?? "Historial"}
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--label-secondary)" }}>
          {selectedExercise
            ? `${selected?.length ?? 0} registros`
            : `${sessions.length} sesiones · ${exerciseNames.length} ejercicios`}
        </p>
      </div>

      {/* No sessions */}
      {sessions.length === 0 && (
        <div className="flex flex-col items-center py-20 gap-3 px-4 text-center">
          <TrendingUp
            size={48}
            style={{ color: "var(--label-tertiary)" }}
          />
          <p className="font-semibold text-lg">Sin entrenamientos aún</p>
          <p style={{ color: "var(--label-secondary)", fontSize: 15 }}>
            Completá tu primer rutina para ver el progreso acá.
          </p>
        </div>
      )}

      {/* Exercise list */}
      {!selectedExercise && exerciseNames.length > 0 && (
        <div className="px-4 flex flex-col gap-2">
          {exerciseNames.map((name, i) => {
            const entries = history[name];
            const latest = entries[entries.length - 1];
            const previous = entries[entries.length - 2];
            const trend =
              previous && latest
                ? latest.weight - previous.weight
                : null;

            return (
              <motion.button
                key={name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedExercise(name)}
                className="pressable w-full text-left flex items-center gap-3 p-4 rounded-2xl"
                style={{ background: "var(--bg-elevated)" }}
              >
                <div className="flex-1">
                  <p className="font-semibold text-base">{name}</p>
                  {latest && (
                    <p
                      className="text-sm mt-0.5"
                      style={{ color: "var(--label-secondary)" }}
                    >
                      Última vez: {latest.weight}kg × {latest.reps} reps
                    </p>
                  )}
                </div>
                {trend !== null && (
                  <span
                    className="text-sm font-bold tabular-nums"
                    style={{
                      color:
                        trend > 0
                          ? "var(--green)"
                          : trend < 0
                          ? "var(--red)"
                          : "var(--label-secondary)",
                    }}
                  >
                    {trend > 0 ? "+" : ""}
                    {trend}kg
                  </span>
                )}
                <ChevronRight
                  size={16}
                  style={{ color: "var(--label-tertiary)" }}
                />
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Exercise detail */}
      {selectedExercise && selected && (
        <div className="px-4">
          {/* Mini chart - bar chart of weights */}
          {selected.length > 1 && (
            <div
              className="p-4 rounded-2xl mb-4"
              style={{ background: "var(--bg-elevated)" }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: "var(--label-secondary)" }}
              >
                Progresión de peso
              </p>
              <div className="flex items-end gap-1.5 h-24">
                {selected.slice(-12).map((entry, i) => {
                  const max = Math.max(...selected.map((e) => e.weight));
                  const height = max > 0 ? (entry.weight / max) * 100 : 0;
                  return (
                    <div
                      key={i}
                      className="flex flex-col items-center flex-1 gap-1"
                    >
                      <motion.div
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        style={{
                          height: `${height}%`,
                          minHeight: 4,
                          background:
                            i === selected.slice(-12).length - 1
                              ? "var(--blue)"
                              : "var(--fill)",
                          borderRadius: 6,
                          width: "100%",
                          transformOrigin: "bottom",
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-1">
                <span
                  className="text-xs tabular-nums"
                  style={{ color: "var(--label-tertiary)" }}
                >
                  {selected[Math.max(0, selected.length - 12)]?.weight}kg
                </span>
                <span
                  className="text-xs tabular-nums"
                  style={{ color: "var(--blue)", fontWeight: 600 }}
                >
                  {selected[selected.length - 1]?.weight}kg
                </span>
              </div>
            </div>
          )}

          {/* Entries list */}
          <div className="flex flex-col gap-2">
            {[...selected].reverse().map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center p-4 rounded-2xl"
                style={{ background: "var(--bg-elevated)" }}
              >
                <Calendar
                  size={16}
                  className="mr-3 flex-shrink-0"
                  style={{ color: "var(--label-tertiary)" }}
                />
                <span
                  className="text-sm flex-1"
                  style={{ color: "var(--label-secondary)" }}
                >
                  {new Date(entry.date).toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="font-bold tabular-nums">
                  {entry.weight}kg
                </span>
                <span
                  className="text-sm ml-2 tabular-nums"
                  style={{ color: "var(--label-secondary)" }}
                >
                  × {entry.reps}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
