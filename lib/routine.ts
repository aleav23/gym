import { WorkoutDay } from "./types";

/**
 * Rutina hardcodeada desde rutina-ejemplo.csv
 * Para modificarla, editá este archivo directamente.
 */
export const ROUTINE: WorkoutDay[] = [
  {
    day: "Día 1",
    label: "Upper",
    exercises: [
      { name: "Press Inclinado con Smith", sets: 3, reps: "8-10", rest: "90s" },
      { name: "Aperturas en Polea", sets: 3, reps: "8-10", rest: "60s" },
      { name: "Jalón al Pecho", sets: 3, reps: "8-10", rest: "90s" },
      { name: "Remo Pendlay", sets: 3, reps: "8-12", rest: "90s" },
      { name: "Elevaciones Laterales", sets: 3, reps: "12-15", rest: "60s" },
      { name: "Curl Bíceps", sets: 3, reps: "10-15", rest: "60s" },
      { name: "Extensión de Tríceps", sets: 3, reps: "10-15", rest: "60s" },
    ],
  },
  {
    day: "Día 2",
    label: "Lower",
    exercises: [
      { name: "Curl Femoral", sets: 3, reps: "10-12", rest: "60s" },
      { name: "Sentadilla / Prensa de Piernas", sets: 3, reps: "8-10", rest: "90s" },
      { name: "Peso Muerto Rumano", sets: 3, reps: "8", rest: "90s" },
      { name: "Hip Thrust", sets: 3, reps: "10", rest: "60s" },
      { name: "Extensión de Cuádriceps", sets: 2, reps: "12-15", rest: "60s" },
      { name: "Gemelos", sets: 3, reps: "12-15", rest: "45s" },
      { name: "Curl Femoral", sets: 3, reps: "12-15", rest: "45s" },
    ],
  },
  {
    day: "Día 3",
    label: "Full Body",
    exercises: [
      { name: "Press Inclinado con Smith", sets: 3, reps: "8-10", rest: "90s" },
      { name: "Jalón al Pecho", sets: 3, reps: "8-10", rest: "90s" },
      { name: "Prensa de Piernas", sets: 3, reps: "8", rest: "60s" },
      { name: "Peso Muerto Rumano", sets: 2, reps: "8", rest: "90s" },
      { name: "Elevaciones Laterales", sets: 2, reps: "15", rest: "60s" },
      { name: "Curl Bíceps", sets: 2, reps: "10-12", rest: "60s" },
      { name: "Extensión de Tríceps", sets: 2, reps: "10-12", rest: "60s" },
    ],
  },
];
