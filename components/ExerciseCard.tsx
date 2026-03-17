"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { Exercise, SetLog } from "@/lib/types";

interface Props {
  exercise: Exercise;
  initialSets?: SetLog[];
  expanded: boolean;
  onToggleExpand: () => void;
  onSetsChange: (sets: SetLog[]) => void;
  onComplete: (logs: SetLog[]) => void;
}

export default function ExerciseCard({
  exercise,
  initialSets,
  expanded,
  onToggleExpand,
  onSetsChange,
  onComplete,
}: Props) {
  const sets: SetLog[] = initialSets ?? Array.from({ length: exercise.sets }, () => ({
    weight: null,
    reps: null,
    done: false,
  }));

  const completedCount = sets.filter((s) => s.done).length;
  const allDone = completedCount === sets.length;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const updateSet = (index: number, field: "weight" | "reps", value: string) => {
    const next = sets.map((s, i) =>
      i === index ? { ...s, [field]: value === "" ? null : Number(value) } : s
    );
    onSetsChange(next);
  };

  const toggleSetDone = (index: number) => {
    const next = sets.map((s, i) =>
      i === index ? { ...s, done: !s.done } : s
    );
    onSetsChange(next);
    const allCompleted = next.every((s) => s.done);
    if (allCompleted) {
      setTimeout(() => onComplete(next), 300);
    }
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 350);
  };

  return (
    <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--radius)" }}>
      <button className="pressable w-full text-left" onClick={onToggleExpand}>
        <div className="flex items-center gap-3 p-4">
          <div className="relative flex-shrink-0">
            <svg width="40" height="40" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" fill="none" stroke="var(--fill)" strokeWidth="3" />
              <circle
                cx="20" cy="20" r="16" fill="none"
                stroke={allDone ? "var(--green)" : "var(--blue)"}
                strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 16}`}
                strokeDashoffset={`${2 * Math.PI * 16 * (1 - completedCount / sets.length)}`}
                transform="rotate(-90 20 20)"
                style={{ transition: "stroke-dashoffset 0.4s ease" }}
              />
            </svg>
            <span
              className="absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums"
              style={{ color: allDone ? "var(--green)" : "var(--blue)" }}
            >
              {completedCount}/{sets.length}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p
              className="font-semibold text-base truncate"
              style={{
                color: "var(--label)",
                textDecoration: allDone ? "line-through" : "none",
                opacity: allDone ? 0.5 : 1,
              }}
            >
              {exercise.name}
            </p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-sm" style={{ color: "var(--label-secondary)" }}>
                {exercise.sets} series × {exercise.reps} reps
              </span>
              {exercise.rest && (
                <span className="flex items-center gap-1 text-xs" style={{ color: "var(--label-tertiary)" }}>
                  <Clock size={11} />
                  {exercise.rest}
                </span>
              )}
            </div>
          </div>

          <div style={{ color: "var(--label-tertiary)" }}>
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-4 pb-4" style={{ borderTop: "1px solid var(--separator)" }}>
              <div className="flex items-center gap-3 py-2 mb-1">
                <div className="w-8" />
                <div className="flex-1 text-xs font-semibold uppercase tracking-wider text-center" style={{ color: "var(--label-secondary)" }}>Kg</div>
                <div className="flex-1 text-xs font-semibold uppercase tracking-wider text-center" style={{ color: "var(--label-secondary)" }}>Reps</div>
                <div className="w-10" />
              </div>

              {sets.map((set, i) => (
                <div key={i} className="flex items-center gap-3 mb-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold"
                    style={{
                      background: set.done ? "var(--green)" : "rgba(0,122,255,0.1)",
                      color: set.done ? "white" : "var(--blue)",
                    }}
                  >
                    {i + 1}
                  </div>

                  <input
                    ref={(el) => { inputRefs.current[i * 2] = el; }}
                    type="number"
                    inputMode="decimal"
                    placeholder="—"
                    value={set.weight ?? ""}
                    onChange={(e) => updateSet(i, "weight", e.target.value)}
                    onFocus={handleInputFocus}
                    disabled={set.done}
                    className="flex-1 text-center font-semibold py-2 rounded-xl outline-none"
                    style={{
                      background: "var(--fill)",
                      color: "var(--label)",
                      opacity: set.done ? 0.5 : 1,
                      fontSize: "16px",
                    }}
                  />

                  <input
                    ref={(el) => { inputRefs.current[i * 2 + 1] = el; }}
                    type="number"
                    inputMode="numeric"
                    placeholder="—"
                    value={set.reps ?? ""}
                    onChange={(e) => updateSet(i, "reps", e.target.value)}
                    onFocus={handleInputFocus}
                    disabled={set.done}
                    className="flex-1 text-center font-semibold py-2 rounded-xl outline-none"
                    style={{
                      background: "var(--fill)",
                      color: "var(--label)",
                      opacity: set.done ? 0.5 : 1,
                      fontSize: "16px",
                    }}
                  />

                  <button
                    onClick={() => toggleSetDone(i)}
                    className="pressable w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: set.done ? "var(--green)" : "rgba(52,199,89,0.12)" }}
                  >
                    <Check size={18} style={{ color: set.done ? "white" : "var(--green)", strokeWidth: 2.5 }} />
                  </button>
                </div>
              ))}

              {exercise.notes && (
                <p className="text-xs mt-2 italic" style={{ color: "var(--label-tertiary)" }}>
                  💬 {exercise.notes}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
