"use client";

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
    if (next.every((s) => s.done)) {
      setTimeout(() => onComplete(next), 300);
    }
  };

  return (
    <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--radius)" }}>
      {/* Header tap area */}
      <button className="pressable w-full text-left" onClick={onToggleExpand}>
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Compact progress pill */}
          <div
            className="flex-shrink-0 tabular-nums text-xs font-bold px-2 py-1 rounded-lg"
            style={{
              background: allDone ? "rgba(52,199,89,0.12)" : "rgba(0,122,255,0.1)",
              color: allDone ? "var(--green)" : "var(--blue)",
              minWidth: 36,
              textAlign: "center",
            }}
          >
            {completedCount}/{sets.length}
          </div>

          <div className="flex-1 min-w-0">
            <p
              className="font-semibold text-[15px] truncate"
              style={{
                color: "var(--label)",
                textDecoration: allDone ? "line-through" : "none",
                opacity: allDone ? 0.45 : 1,
              }}
            >
              {exercise.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs" style={{ color: "var(--label-secondary)" }}>
                {exercise.sets}×{exercise.reps}
              </span>
              {exercise.rest && (
                <span className="flex items-center gap-0.5 text-xs" style={{ color: "var(--label-tertiary)" }}>
                  <Clock size={10} />
                  {exercise.rest}
                </span>
              )}
            </div>
          </div>

          <div style={{ color: "var(--label-tertiary)", flexShrink: 0 }}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </button>

      {/* Expanded sets — compact grid */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="px-3 pb-3"
              style={{ borderTop: "1px solid var(--separator)" }}
            >
              {/* Column headers */}
              <div
                className="grid gap-1.5 pt-2 pb-1"
                style={{ gridTemplateColumns: "28px 1fr 1fr 36px" }}
              >
                <div />
                <div className="text-[10px] font-semibold uppercase tracking-wider text-center" style={{ color: "var(--label-tertiary)" }}>KG</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-center" style={{ color: "var(--label-tertiary)" }}>REPS</div>
                <div />
              </div>

              {sets.map((set, i) => (
                <div
                  key={i}
                  className="grid gap-1.5 mb-1.5 items-center"
                  style={{ gridTemplateColumns: "28px 1fr 1fr 36px" }}
                >
                  {/* Set badge */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: set.done ? "var(--green)" : "rgba(0,122,255,0.1)",
                      color: set.done ? "white" : "var(--blue)",
                    }}
                  >
                    {i + 1}
                  </div>

                  {/* KG input */}
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="—"
                    value={set.weight ?? ""}
                    onChange={(e) => updateSet(i, "weight", e.target.value)}
                    disabled={set.done}
                    style={{
                      background: set.done ? "transparent" : "var(--fill)",
                      color: "var(--label)",
                      opacity: set.done ? 0.35 : 1,
                      fontSize: "16px",     // critical: prevents iOS auto-zoom
                      fontWeight: 600,
                      textAlign: "center",
                      borderRadius: 10,
                      border: "none",
                      outline: "none",
                      padding: "6px 4px",
                      width: "100%",
                      WebkitAppearance: "none",
                    }}
                  />

                  {/* Reps input */}
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="—"
                    value={set.reps ?? ""}
                    onChange={(e) => updateSet(i, "reps", e.target.value)}
                    disabled={set.done}
                    style={{
                      background: set.done ? "transparent" : "var(--fill)",
                      color: "var(--label)",
                      opacity: set.done ? 0.35 : 1,
                      fontSize: "16px",     // critical: prevents iOS auto-zoom
                      fontWeight: 600,
                      textAlign: "center",
                      borderRadius: 10,
                      border: "none",
                      outline: "none",
                      padding: "6px 4px",
                      width: "100%",
                      WebkitAppearance: "none",
                    }}
                  />

                  {/* Done checkmark */}
                  <button
                    onClick={() => toggleSetDone(i)}
                    className="pressable flex items-center justify-center rounded-xl"
                    style={{
                      background: set.done ? "var(--green)" : "rgba(52,199,89,0.12)",
                      width: 36,
                      height: 32,
                    }}
                  >
                    <Check size={15} style={{ color: set.done ? "white" : "var(--green)", strokeWidth: 2.5 }} />
                  </button>
                </div>
              ))}

              {exercise.notes && (
                <p className="text-[11px] mt-1.5 italic" style={{ color: "var(--label-tertiary)" }}>
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
