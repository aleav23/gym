"use client";

import { motion } from "framer-motion";
import { WorkoutDay } from "@/lib/types";
import { BarChart2 } from "lucide-react";

interface Props {
  days: WorkoutDay[];
  onSelectDay: (day: WorkoutDay) => void;
  onViewHistory: () => void;
}

const DAY_COLORS = [
  { bg: "linear-gradient(145deg, #007AFF, #0055D4)", shadow: "rgba(0,122,255,0.3)" },
  { bg: "linear-gradient(145deg, #34C759, #248A3D)", shadow: "rgba(52,199,89,0.3)" },
  { bg: "linear-gradient(145deg, #FF9500, #C93400)", shadow: "rgba(255,149,0,0.3)" },
  { bg: "linear-gradient(145deg, #AF52DE, #7B2FBE)", shadow: "rgba(175,82,222,0.3)" },
  { bg: "linear-gradient(145deg, #FF2D55, #C91F3E)", shadow: "rgba(255,45,85,0.3)" },
  { bg: "linear-gradient(145deg, #5AC8FA, #007AFF)", shadow: "rgba(90,200,250,0.3)" },
  { bg: "linear-gradient(145deg, #FFD60A, #FF9500)", shadow: "rgba(255,214,10,0.3)" },
];

export default function DaySelector({
  days,
  onSelectDay,
  onViewHistory,
}: Props) {
  return (
    <div className="min-h-screen px-4 pb-10">
      {/* Header */}
      <div className="pt-16 pb-8 flex items-end justify-between">
        <div>
          <p
            className="text-sm font-medium mb-1"
            style={{ color: "var(--label-secondary)" }}
          >
            {new Date().toLocaleDateString("es-AR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <h1
            className="text-4xl font-bold"
            style={{ letterSpacing: "-0.03em" }}
          >
            ¿Qué día
            <br />
            entrenás?
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onViewHistory}
            className="pressable w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "var(--bg-elevated)" }}
          >
            <BarChart2 size={18} style={{ color: "var(--blue)" }} />
          </button>
        </div>
      </div>

      {/* Day cards */}
      <div className="flex flex-col gap-3">
        {days.map((day, i) => {
          const color = DAY_COLORS[i % DAY_COLORS.length];
          return (
            <motion.button
              key={day.day}
              onClick={() => onSelectDay(day)}
              className="pressable w-full text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: i * 0.06,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              <div
                style={{
                  background: color.bg,
                  borderRadius: "var(--radius-lg)",
                  padding: "20px 22px",
                  boxShadow: `0 8px 24px ${color.shadow}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <p
                    className="text-white/80 text-sm font-medium mb-0.5"
                  >
                    {day.day}
                  </p>
                  <p className="text-white text-xl font-bold" style={{ letterSpacing: "-0.02em" }}>
                    {day.label || day.day}
                  </p>
                  <p className="text-white/70 text-sm mt-1">
                    {day.exercises.length} ejercicios
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.2)" }}
                >
                  <span className="text-white text-2xl font-bold">
                    {i + 1}
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
