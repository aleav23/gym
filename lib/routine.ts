import { WorkoutDay } from "./types";

/**
 * Rutina hardcodeada desde rutina-ejemplo.csv
 * Para modificarla, editá este archivo directamente.
 */
export const ROUTINE: WorkoutDay[] = [
  {
    day: "Día 1",
    label: "Push",
    exercises: [
      { name: "Press de Banca", sets: 4, reps: "8-12", rest: "90s", notes: "Agarre medio" },
      { name: "Press Inclinado con Mancuernas", sets: 3, reps: "10-12", rest: "60s" },
      { name: "Aperturas en Cable", sets: 3, reps: "15", rest: "45s" },
      { name: "Press Militar", sets: 4, reps: "8-10", rest: "90s" },
      { name: "Extensiones de Tríceps en Polea", sets: 3, reps: "12", rest: "45s" },
    ],
  },
  {
    day: "Día 2",
    label: "Pull",
    exercises: [
      { name: "Dominadas", sets: 4, reps: "al fallo", rest: "90s", notes: "Lastre si necesario" },
      { name: "Remo con Barra", sets: 4, reps: "8-10", rest: "90s" },
      { name: "Pullover en Polea", sets: 3, reps: "12-15", rest: "60s" },
      { name: "Curl de Bíceps con Barra", sets: 3, reps: "10-12", rest: "45s" },
      { name: "Curl Martillo", sets: 3, reps: "10", rest: "45s" },
    ],
  },
  {
    day: "Día 3",
    label: "Piernas",
    exercises: [
      { name: "Sentadilla", sets: 5, reps: "5", rest: "120s", notes: "Pausa abajo" },
      { name: "Prensa de Piernas", sets: 4, reps: "12", rest: "90s" },
      { name: "Extensión de Cuádriceps", sets: 3, reps: "15", rest: "45s" },
      { name: "Curl Femoral", sets: 3, reps: "12-15", rest: "45s" },
      { name: "Pantorrillas de Pie", sets: 4, reps: "15-20", rest: "30s" },
    ],
  },
];
