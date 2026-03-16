"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DaySelector from "@/components/DaySelector";
import WorkoutView from "@/components/WorkoutView";
import HistoryView from "@/components/HistoryView";
import { WorkoutDay, WorkoutSession } from "@/lib/types";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { ROUTINE } from "@/lib/routine";

type View = "days" | "workout" | "history";

const pageVariants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

const pageTransition = {
  duration: 0.25,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

export default function Home() {
  const [sessions, setSessions] = useLocalStorage<WorkoutSession[]>(
    "gymflow:sessions",
    []
  );
  const [view, setView] = useState<View>("days");
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);

  const handleSelectDay = (day: WorkoutDay) => {
    setSelectedDay(day);
    setView("workout");
  };

  const handleSessionComplete = (session: WorkoutSession) => {
    setSessions((prev) => [...prev, session]);
    setView("days");
  };

  return (
    <main className="max-w-lg mx-auto min-h-screen" style={{ background: "var(--bg-grouped)" }}>
      <AnimatePresence mode="wait">
        {view === "days" && (
          <motion.div
            key="days"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <DaySelector
              days={ROUTINE}
              onSelectDay={handleSelectDay}
              onViewHistory={() => setView("history")}
            />
          </motion.div>
        )}

        {view === "workout" && selectedDay && (
          <motion.div
            key="workout"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <WorkoutView
              day={selectedDay}
              onBack={() => setView("days")}
              onSessionComplete={handleSessionComplete}
            />
          </motion.div>
        )}

        {view === "history" && (
          <motion.div
            key="history"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <HistoryView
              sessions={sessions}
              onBack={() => setView("days")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
