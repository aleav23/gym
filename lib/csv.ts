import Papa from "papaparse";
import { Exercise, WorkoutDay } from "./types";

/**
 * Expected CSV format (flexible):
 *
 * dia,label,ejercicio,series,repeticiones,descanso,notas
 * Día 1,Push,Press Banca,4,8-12,90s,
 * Día 1,Push,Press Inclinado,3,10,60s,
 * Día 2,Pull,Dominadas,4,al fallo,90s,
 *
 * OR simpler (no label, no rest, no notes):
 * dia,ejercicio,series,repeticiones
 * Día 1,Sentadilla,4,10
 */
export function parseRoutineCSV(csvText: string): WorkoutDay[] {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  if (result.errors.length > 0) {
    console.warn("CSV parse warnings:", result.errors);
  }

  const rows = result.data as Record<string, string>[];
  const dayMap = new Map<string, WorkoutDay>();

  for (const row of rows) {
    // Normalize column names (Spanish and English variants)
    const dayKey =
      row["dia"] || row["día"] || row["day"] || row["d"] || "";
    const label =
      row["label"] || row["etiqueta"] || row["tipo"] || undefined;
    const name =
      row["ejercicio"] || row["exercise"] || row["nombre"] || row["name"] || "";
    const sets = parseInt(
      row["series"] || row["sets"] || row["s"] || "3",
      10
    );
    const reps =
      row["repeticiones"] || row["reps"] || row["rep"] || row["r"] || "10";
    const rest =
      row["descanso"] || row["rest"] || row["pausa"] || undefined;
    const notes =
      row["notas"] || row["notes"] || row["nota"] || undefined;

    if (!dayKey || !name) continue;

    const exercise: Exercise = {
      name: name.trim(),
      sets: isNaN(sets) ? 3 : sets,
      reps: reps.trim(),
      rest: rest?.trim() || undefined,
      notes: notes?.trim() || undefined,
    };

    if (!dayMap.has(dayKey)) {
      dayMap.set(dayKey, {
        day: dayKey.trim(),
        label: label?.trim(),
        exercises: [],
      });
    }

    const wd = dayMap.get(dayKey)!;
    // Update label if found later in file
    if (label && !wd.label) wd.label = label.trim();
    wd.exercises.push(exercise);
  }

  return Array.from(dayMap.values());
}

export const EXAMPLE_CSV = `dia,label,ejercicio,series,repeticiones,descanso,notas
Día 1,Push,Press de Banca,4,8-12,90s,Agarre medio
Día 1,Push,Press Inclinado con Mancuernas,3,10-12,60s,
Día 1,Push,Aperturas en Cable,3,15,45s,
Día 1,Push,Press Militar,4,8-10,90s,
Día 1,Push,Extensiones de Tríceps,3,12,45s,
Día 2,Pull,Dominadas,4,al fallo,90s,Lastre si necesario
Día 2,Pull,Remo con Barra,4,8-10,90s,
Día 2,Pull,Pullover en Polea,3,12-15,60s,
Día 2,Pull,Curl de Bíceps,3,10-12,45s,
Día 2,Pull,Martillo,3,10,45s,
Día 3,Piernas,Sentadilla,5,5,120s,Pausa abajo
Día 3,Piernas,Prensa,4,12,90s,
Día 3,Piernas,Extensión de Cuádriceps,3,15,45s,
Día 3,Piernas,Curl Femoral,3,12-15,45s,
Día 3,Piernas,Pantorrillas de Pie,4,15-20,30s,
`;
