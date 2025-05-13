import AsyncStorage from "@react-native-async-storage/async-storage";

const DIET_KEY = "@diet_entries";
const EXERCISE_KEY = "@exercise_entries";

export interface DietEntry {
  id: string;
  date: string;
  mealType: string;
  foods: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface ExerciseEntry {
  id: string;
  date: string;
  type: string;
  exercises: {
    name: string;
    sets?: number;
    reps?: number;
    weight?: number;
    duration?: number;
    distance?: number;
  }[];
  duration: number;
  caloriesBurned: number;
}

export async function getDietEntries(): Promise<DietEntry[]> {
  try {
    const data = await AsyncStorage.getItem(DIET_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting diet entries:", error);
    return [];
  }
}

export async function addDietEntry(entry: DietEntry): Promise<void> {
  try {
    const entries = await getDietEntries();
    entries.push(entry);
    await AsyncStorage.setItem(DIET_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error("Error adding diet entry:", error);
    throw error;
  }
}

export async function getExerciseEntries(): Promise<ExerciseEntry[]> {
  try {
    const data = await AsyncStorage.getItem(EXERCISE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting exercise entries:", error);
    return [];
  }
}

export async function addExerciseEntry(entry: ExerciseEntry): Promise<void> {
  try {
    const entries = await getExerciseEntries();
    entries.push(entry);
    await AsyncStorage.setItem(EXERCISE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error("Error adding exercise entry:", error);
    throw error;
  }
}

export async function getTodaysDietEntries(): Promise<DietEntry[]> {
  try {
    const entries = await getDietEntries();
    const today = new Date().toDateString();
    return entries.filter(
      (entry) => new Date(entry.date).toDateString() === today
    );
  } catch (error) {
    console.error("Error getting today's diet entries:", error);
    return [];
  }
}

export async function getTodaysExerciseEntries(): Promise<ExerciseEntry[]> {
  try {
    const entries = await getExerciseEntries();
    const today = new Date().toDateString();
    return entries.filter(
      (entry) => new Date(entry.date).toDateString() === today
    );
  } catch (error) {
    console.error("Error getting today's exercise entries:", error);
    return [];
  }
}

export async function getWeeklyExerciseProgress(): Promise<{
  strength: number;
  cardio: number;
  walking: number;
  flexibility: number;
}> {
  try {
    const entries = await getExerciseEntries();
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const weeklyEntries = entries.filter(
      (entry) =>
        new Date(entry.date) >= weekStart && new Date(entry.date) < weekEnd
    );

    return {
      strength: weeklyEntries.filter((entry) => entry.type === "strength")
        .length,
      cardio: weeklyEntries.filter((entry) => entry.type === "cardio").length,
      walking: weeklyEntries.filter((entry) => entry.type === "walking").length,
      flexibility: weeklyEntries.filter((entry) => entry.type === "flexibility")
        .length,
    };
  } catch (error) {
    console.error("Error getting weekly exercise progress:", error);
    return {
      strength: 0,
      cardio: 0,
      walking: 0,
      flexibility: 0,
    };
  }
}

export async function clearHealthData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([DIET_KEY, EXERCISE_KEY]);
  } catch (error) {
    console.error("Error clearing health data:", error);
    throw error;
  }
}
