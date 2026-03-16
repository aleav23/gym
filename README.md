# 💪 GymFlow

Tu rutina de gym, con estética Apple. Cargá tu rutina desde un CSV y llevá el registro de pesos y repeticiones.

## Stack

- **Next.js 14** (App Router)
- **Framer Motion** – animaciones fluidas
- **PapaParse** – parseo de CSV
- **Tailwind CSS** – estilos
- **localStorage** – persistencia local (sin backend)

## Instalación

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Formato del CSV

El CSV acepta estas columnas (los nombres son flexibles, en español o inglés):

| Columna | Obligatoria | Ejemplo |
|---|---|---|
| `dia` | ✅ | `Día 1` |
| `ejercicio` | ✅ | `Press de Banca` |
| `series` | ✅ | `4` |
| `repeticiones` | ✅ | `8-12` |
| `label` | ❌ | `Push` |
| `descanso` | ❌ | `90s` |
| `notas` | ❌ | `Agarre medio` |

### Ejemplo mínimo

```csv
dia,ejercicio,series,repeticiones
Día 1,Press de Banca,4,8-12
Día 1,Press Militar,3,10
Día 2,Dominadas,4,al fallo
Día 3,Sentadilla,5,5
```

### Ejemplo completo

Ver `public/rutina-ejemplo.csv`.

## Features

- 📅 **Selector de días** — elegís qué día entrenás
- ✅ **Marcar series** — cada serie se marca individualmente con peso y reps
- 📉 **Desaparecen al completar** — ejercicios completados desaparecen con animación
- 🔄 **Auto-reinicio** — al terminar, la rutina se reinicia lista para la próxima
- 📊 **Historial** — registro de todos los entrenamientos
- 📈 **Progreso por ejercicio** — mini gráfico de evolución de peso
- 💾 **Persistencia local** — todo guardado en localStorage, sin server

## Personalización

Para agregar más días, simplemente añadí más `Día N` en tu CSV. La app soporta cualquier cantidad de días.
