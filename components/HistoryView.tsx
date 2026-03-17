"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, ChevronRight, Flame, Trophy, Dumbbell } from "lucide-react";
import { WorkoutSession } from "@/lib/types";

interface Props {
  sessions: WorkoutSession[];
  onBack: () => void;
}

interface ExerciseEntry {
  date: string;
  sessionDay: string;
  bestWeight: number;
  bestReps: number;
  totalVolume: number; // sum of weight * reps for all done sets
  sets: { weight: number | null; reps: number | null; done: boolean }[];
}

interface ExerciseData {
  [exerciseName: string]: ExerciseEntry[];
}

function buildData(sessions: WorkoutSession[]): ExerciseData {
  const data: ExerciseData = {};
  const sorted = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (const session of sorted) {
    for (const ex of session.exercises) {
      if (!data[ex.exerciseName]) data[ex.exerciseName] = [];
      const doneSets = ex.sets.filter((s) => s.done && s.weight !== null && s.reps !== null);
      if (doneSets.length === 0) continue;

      const bestWeight = Math.max(...doneSets.map((s) => s.weight ?? 0));
      const bestReps = doneSets.find((s) => s.weight === bestWeight)?.reps ?? 0;
      const totalVolume = doneSets.reduce((sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0), 0);

      data[ex.exerciseName].push({
        date: session.date,
        sessionDay: session.day,
        bestWeight,
        bestReps: bestReps ?? 0,
        totalVolume,
        sets: ex.sets,
      });
    }
  }
  return data;
}

function getCurrentStreak(sessions: WorkoutSession[]): number {
  if (sessions.length === 0) return 0;
  const sorted = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].date);
    const curr = new Date(sorted[i].date);
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 3) streak++;
    else break;
  }
  return streak;
}

// SVG line chart for weight progression
function LineChart({ entries }: { entries: ExerciseEntry[] }) {
  if (entries.length < 2) return null;
  const recent = entries.slice(-10);
  const weights = recent.map((e) => e.bestWeight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;

  const W = 300, H = 80, PAD = 12;
  const points = recent.map((e, i) => {
    const x = PAD + (i / (recent.length - 1)) * (W - PAD * 2);
    const y = PAD + (1 - (e.bestWeight - minW) / range) * (H - PAD * 2);
    return { x, y, entry: e };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaD = `${pathD} L${points[points.length - 1].x},${H} L${points[0].x},${H} Z`;

  const isUp = weights[weights.length - 1] >= weights[0];

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 80, overflow: "visible" }}>
        {/* Area fill */}
        <path d={areaD} fill={isUp ? "rgba(0,122,255,0.08)" : "rgba(255,59,48,0.06)"} />
        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={isUp ? "var(--blue)" : "var(--red)"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Dots */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === points.length - 1 ? 4 : 2.5}
            fill={i === points.length - 1 ? (isUp ? "var(--blue)" : "var(--red)") : "white"}
            stroke={isUp ? "var(--blue)" : "var(--red)"}
            strokeWidth="1.5"
          />
        ))}
      </svg>
      {/* Min/max labels */}
      <div className="flex justify-between mt-0.5">
        <span className="text-[10px] tabular-nums" style={{ color: "var(--label-tertiary)" }}>
          {new Date(recent[0].date).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
        </span>
        <span className="text-[10px] tabular-nums" style={{ color: "var(--label-tertiary)" }}>
          {new Date(recent[recent.length - 1].date).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
        </span>
      </div>
    </div>
  );
}

export default function HistoryView({ sessions, onBack }: Props) {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const data = buildData(sessions);
  const exerciseNames = Object.keys(data).sort();
  const selected = selectedExercise ? data[selectedExercise] : null;
  const streak = getCurrentStreak(sessions);

  // Stats
  const totalVolume = sessions.reduce((sum, s) =>
    sum + s.exercises.reduce((es, ex) =>
      es + ex.sets.filter(s => s.done).reduce((ss, set) => ss + (set.weight ?? 0) * (set.reps ?? 0), 0), 0), 0);

  const pr = selected ? Math.max(...selected.map((e) => e.bestWeight)) : null;
  const prEntry = selected?.find((e) => e.bestWeight === pr);

  const latestEntry = selected?.[selected.length - 1];
  const prevEntry = selected?.[selected.length - 2];
  const weightDiff = latestEntry && prevEntry ? latestEntry.bestWeight - prevEntry.bestWeight : null;
  const weightPct = prevEntry && weightDiff !== null && prevEntry.bestWeight > 0
    ? ((weightDiff / prevEntry.bestWeight) * 100).toFixed(1)
    : null;

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <div className="px-4 pt-12 pb-2">
        <button
          onClick={() => { if (selectedExercise) setSelectedExercise(null); else onBack(); }}
          className="pressable flex items-center gap-1 mb-4"
          style={{ color: "var(--blue)" }}
        >
          <ArrowLeft size={20} />
          <span className="text-base">{selectedExercise ? "Historial" : "Días"}</span>
        </button>
        <h2 className="text-3xl font-bold" style={{ letterSpacing: "-0.02em" }}>
          {selectedExercise ?? "Progreso"}
        </h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--label-secondary)" }}>
          {selectedExercise
            ? `${selected?.length ?? 0} sesiones registradas`
            : `${sessions.length} sesiones · ${exerciseNames.length} ejercicios`}
        </p>
      </div>

      {/* Empty state */}
      {sessions.length === 0 && (
        <div className="flex flex-col items-center py-20 gap-3 px-4 text-center">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-2"
            style={{ background: "rgba(0,122,255,0.1)" }}>
            <TrendingUp size={32} style={{ color: "var(--blue)" }} />
          </div>
          <p className="font-semibold text-lg">Sin entrenamientos aún</p>
          <p className="text-sm" style={{ color: "var(--label-secondary)" }}>
            Completá tu primer rutina para ver el progreso acá.
          </p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ── OVERVIEW ── */}
        {!selectedExercise && sessions.length > 0 && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Summary cards */}
            <div className="px-4 grid grid-cols-3 gap-2 mb-4">
              <div className="rounded-2xl p-3 flex flex-col gap-1" style={{ background: "var(--bg-elevated)" }}>
                <Flame size={16} style={{ color: "var(--orange)" }} />
                <p className="text-xl font-bold tabular-nums">{streak}</p>
                <p className="text-[11px]" style={{ color: "var(--label-secondary)" }}>racha</p>
              </div>
              <div className="rounded-2xl p-3 flex flex-col gap-1" style={{ background: "var(--bg-elevated)" }}>
                <Dumbbell size={16} style={{ color: "var(--blue)" }} />
                <p className="text-xl font-bold tabular-nums">{sessions.length}</p>
                <p className="text-[11px]" style={{ color: "var(--label-secondary)" }}>sesiones</p>
              </div>
              <div className="rounded-2xl p-3 flex flex-col gap-1" style={{ background: "var(--bg-elevated)" }}>
                <Trophy size={16} style={{ color: "var(--green)" }} />
                <p className="text-xl font-bold tabular-nums">
                  {totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}t` : `${totalVolume}kg`}
                </p>
                <p className="text-[11px]" style={{ color: "var(--label-secondary)" }}>volumen</p>
              </div>
            </div>

            {/* Exercise list */}
            <div className="px-4 flex flex-col gap-2">
              {exerciseNames.map((name, i) => {
                const entries = data[name];
                const latest = entries[entries.length - 1];
                const prev = entries[entries.length - 2];
                const diff = prev ? latest.bestWeight - prev.bestWeight : null;
                const pct = prev && diff !== null && prev.bestWeight > 0
                  ? ((diff / prev.bestWeight) * 100).toFixed(1) : null;

                return (
                  <motion.button
                    key={name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelectedExercise(name)}
                    className="pressable w-full text-left rounded-2xl"
                    style={{ background: "var(--bg-elevated)" }}
                  >
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[15px] truncate">{name}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--label-secondary)" }}>
                          Último: <span className="font-semibold tabular-nums" style={{ color: "var(--label)" }}>{latest.bestWeight}kg</span>
                          {" "}× {latest.bestReps} reps
                          {" · "}{new Date(latest.date).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {diff !== null && pct !== null && (
                          <div className="flex items-center gap-0.5">
                            {diff > 0
                              ? <TrendingUp size={13} style={{ color: "var(--green)" }} />
                              : diff < 0
                              ? <TrendingDown size={13} style={{ color: "var(--red)" }} />
                              : null}
                            <span className="text-xs font-bold tabular-nums" style={{
                              color: diff > 0 ? "var(--green)" : diff < 0 ? "var(--red)" : "var(--label-secondary)"
                            }}>
                              {diff > 0 ? "+" : ""}{pct}%
                            </span>
                          </div>
                        )}
                        <ChevronRight size={14} style={{ color: "var(--label-tertiary)" }} />
                      </div>
                    </div>

                    {/* Sparkline */}
                    {entries.length > 1 && (
                      <div className="px-4 pb-3">
                        {(() => {
                          const recent = entries.slice(-8);
                          const weights = recent.map((e) => e.bestWeight);
                          const minW = Math.min(...weights);
                          const maxW = Math.max(...weights);
                          const range = maxW - minW || 1;
                          const W = 200, H = 28;
                          const pts = recent.map((e, i) => {
                            const x = (i / (recent.length - 1)) * W;
                            const y = 4 + (1 - (e.bestWeight - minW) / range) * (H - 8);
                            return `${x},${y}`;
                          }).join(" ");
                          const isUp = weights[weights.length - 1] >= weights[0];
                          return (
                            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 28 }}>
                              <polyline points={pts} fill="none"
                                stroke={isUp ? "var(--blue)" : "var(--red)"}
                                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                                opacity="0.5"
                              />
                            </svg>
                          );
                        })()}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── EXERCISE DETAIL ── */}
        {selectedExercise && selected && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="px-4"
          >
            {/* PR + trend stat row */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="rounded-2xl p-3" style={{ background: "var(--bg-elevated)" }}>
                <p className="text-[11px] mb-1" style={{ color: "var(--label-secondary)" }}>PR</p>
                <p className="text-lg font-bold tabular-nums">{pr}kg</p>
                <p className="text-[10px]" style={{ color: "var(--label-tertiary)" }}>
                  {prEntry ? new Date(prEntry.date).toLocaleDateString("es-AR", { day: "numeric", month: "short" }) : ""}
                </p>
              </div>
              <div className="rounded-2xl p-3" style={{ background: "var(--bg-elevated)" }}>
                <p className="text-[11px] mb-1" style={{ color: "var(--label-secondary)" }}>Último</p>
                <p className="text-lg font-bold tabular-nums">{latestEntry?.bestWeight}kg</p>
                <p className="text-[10px]" style={{ color: "var(--label-tertiary)" }}>
                  × {latestEntry?.bestReps} reps
                </p>
              </div>
              <div className="rounded-2xl p-3" style={{ background: "var(--bg-elevated)" }}>
                <p className="text-[11px] mb-1" style={{ color: "var(--label-secondary)" }}>Cambio</p>
                {weightDiff !== null && weightPct !== null ? (
                  <>
                    <p className="text-lg font-bold tabular-nums" style={{
                      color: weightDiff > 0 ? "var(--green)" : weightDiff < 0 ? "var(--red)" : "var(--label)"
                    }}>
                      {weightDiff > 0 ? "+" : ""}{weightDiff}kg
                    </p>
                    <p className="text-[10px]" style={{
                      color: weightDiff > 0 ? "var(--green)" : weightDiff < 0 ? "var(--red)" : "var(--label-tertiary)"
                    }}>
                      {weightDiff > 0 ? "+" : ""}{weightPct}%
                    </p>
                  </>
                ) : (
                  <p className="text-lg font-bold" style={{ color: "var(--label-tertiary)" }}>—</p>
                )}
              </div>
            </div>

            {/* Line chart */}
            {selected.length > 1 && (
              <div className="rounded-2xl p-4 mb-4" style={{ background: "var(--bg-elevated)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: "var(--label-secondary)" }}>
                  Progresión de peso máximo
                </p>
                <LineChart entries={selected} />
              </div>
            )}

            {/* Session history */}
            <div className="flex flex-col gap-2">
              {[...selected].reverse().map((entry, i) => {
                const doneSets = entry.sets.filter((s) => s.done && s.weight !== null);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-2xl overflow-hidden"
                    style={{ background: "var(--bg-elevated)" }}
                  >
                    {/* Session header */}
                    <div className="flex items-center justify-between px-4 py-3"
                      style={{ borderBottom: doneSets.length > 0 ? "1px solid var(--separator)" : "none" }}>
                      <div className="flex items-center gap-2">
                        <Calendar size={13} style={{ color: "var(--label-tertiary)" }} />
                        <span className="text-sm font-semibold">
                          {new Date(entry.date).toLocaleDateString("es-AR", {
                            weekday: "short", day: "numeric", month: "short"
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs tabular-nums" style={{ color: "var(--label-secondary)" }}>
                          Vol: <span className="font-semibold" style={{ color: "var(--label)" }}>{entry.totalVolume}kg</span>
                        </span>
                        <span className="text-sm font-bold tabular-nums" style={{ color: "var(--blue)" }}>
                          {entry.bestWeight}kg
                        </span>
                      </div>
                    </div>

                    {/* Sets detail */}
                    {doneSets.length > 0 && (
                      <div className="px-4 py-2 flex gap-2 flex-wrap">
                        {doneSets.map((set, j) => (
                          <span key={j} className="text-xs tabular-nums px-2 py-1 rounded-lg font-medium"
                            style={{
                              background: set.weight === entry.bestWeight
                                ? "rgba(0,122,255,0.1)" : "var(--fill)",
                              color: set.weight === entry.bestWeight
                                ? "var(--blue)" : "var(--label-secondary)"
                            }}>
                            {set.weight}kg×{set.reps}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
