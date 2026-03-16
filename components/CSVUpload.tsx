"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Dumbbell } from "lucide-react";
import { parseRoutineCSV, EXAMPLE_CSV } from "@/lib/csv";
import { WorkoutDay } from "@/lib/types";

interface Props {
  onRoutineLoaded: (days: WorkoutDay[]) => void;
}

export default function CSVUpload({ onRoutineLoaded }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processText = (text: string) => {
    try {
      const days = parseRoutineCSV(text);
      if (days.length === 0) {
        setError(
          "No se encontraron días en el CSV. Revisá el formato."
        );
        return;
      }
      setError(null);
      onRoutineLoaded(days);
    } catch {
      setError("Error al procesar el archivo. Verificá el formato CSV.");
    }
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      setError("Solo se aceptan archivos .csv");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => processText(e.target?.result as string);
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-16">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col items-center mb-12"
      >
        <div
          className="w-20 h-20 rounded-[22px] flex items-center justify-center mb-4 shadow-lg"
          style={{ background: "linear-gradient(145deg, #007AFF, #0055D4)" }}
        >
          <Dumbbell size={36} color="white" strokeWidth={2} />
        </div>
        <h1
          className="text-4xl font-bold tracking-tight"
          style={{ letterSpacing: "-0.03em", color: "var(--label)" }}
        >
          GymFlow
        </h1>
        <p
          className="text-base mt-1"
          style={{ color: "var(--label-secondary)" }}
        >
          Tu rutina, tu progreso.
        </p>
      </motion.div>

      {/* Upload area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-sm"
      >
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className="pressable"
          style={{
            background: dragging ? "rgba(0,122,255,0.08)" : "var(--bg-elevated)",
            border: `2px dashed ${dragging ? "var(--blue)" : "var(--separator)"}`,
            borderRadius: "var(--radius-xl)",
            padding: "40px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(0,122,255,0.1)" }}
          >
            <Upload size={26} style={{ color: "var(--blue)" }} />
          </div>
          <div className="text-center">
            <p
              className="font-semibold text-base"
              style={{ color: "var(--blue)" }}
            >
              Subir rutina CSV
            </p>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--label-secondary)" }}
            >
              Tocá o arrastrá tu archivo .csv
            </p>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-center mt-3"
            style={{ color: "var(--red)" }}
          >
            {error}
          </motion.p>
        )}

        {/* Use example */}
        <button
          onClick={() => processText(EXAMPLE_CSV)}
          className="pressable w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-2xl"
          style={{
            background: "var(--bg-elevated)",
            color: "var(--blue)",
            fontSize: "15px",
            fontWeight: 500,
          }}
        >
          <FileText size={16} />
          Usar rutina de ejemplo
        </button>

        {/* Format hint */}
        <div
          className="mt-6 rounded-2xl p-4"
          style={{ background: "var(--bg-elevated)" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: "var(--label-secondary)" }}
          >
            Formato CSV esperado
          </p>
          <code
            className="text-xs block"
            style={{ color: "var(--label)", lineHeight: 1.8 }}
          >
            dia,label,ejercicio,series,repeticiones
            <br />
            Día 1,Push,Press Banca,4,8-12
            <br />
            Día 2,Pull,Dominadas,4,al fallo
            <br />
            Día 3,Piernas,Sentadilla,5,5
          </code>
        </div>
      </motion.div>
    </div>
  );
}
