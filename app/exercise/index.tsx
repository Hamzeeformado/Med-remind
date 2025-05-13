import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import {
  getTodaysExerciseEntries,
  getWeeklyExerciseProgress,
  ExerciseEntry,
} from "../../utils/health-storage";

interface ExerciseType {
  id: string;
  label: string;
  icon:
    | "barbell-outline"
    | "walk-outline"
    | "bicycle-outline"
    | "fitness-outline";
  color: string;
}

const EXERCISE_TYPES: ExerciseType[] = [
  {
    id: "strength",
    label: "Strength",
    icon: "barbell-outline",
    color: "#FF6B6B",
  },
  { id: "cardio", label: "Cardio", icon: "bicycle-outline", color: "#4ECDC4" },
  { id: "walking", label: "Walking", icon: "walk-outline", color: "#45B7D1" },
  {
    id: "flexibility",
    label: "Flexibility",
    icon: "fitness-outline",
    color: "#96CEB4",
  },
];

const WEEKLY_GOALS = {
  strength: 3,
  cardio: 4,
  walking: 5,
  flexibility: 3,
};

export default function ExerciseScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<ExerciseEntry[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState({
    strength: 0,
    cardio: 0,
    walking: 0,
    flexibility: 0,
  });

  const loadWorkouts = useCallback(async () => {
    try {
      const todaysWorkouts = await getTodaysExerciseEntries();
      setWorkouts(todaysWorkouts);

      const progress = await getWeeklyExerciseProgress();
      setWeeklyProgress(progress);
    } catch (error) {
      console.error("Error loading workouts:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [loadWorkouts])
  );

  const renderWorkoutSection = (exerciseType: ExerciseType) => {
    const typeWorkouts = workouts.filter((w) => w.type === exerciseType.id);
    return (
      <TouchableOpacity
        key={exerciseType.id}
        style={styles.workoutCard}
        onPress={() => router.push("/exercise/add" as any)}
      >
        <View style={styles.workoutHeader}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: exerciseType.color },
            ]}
          >
            <Ionicons name={exerciseType.icon} size={24} color="white" />
          </View>
          <View style={styles.workoutInfo}>
            <Text style={styles.workoutTitle}>{exerciseType.label}</Text>
            <Text style={styles.workoutProgress}>
              {typeWorkouts.length} entries today
            </Text>
          </View>
        </View>
        {typeWorkouts.length > 0 ? (
          <View style={styles.workoutContent}>
            {typeWorkouts.map((workout) => (
              <View key={workout.id} style={styles.workoutItem}>
                <Text style={styles.workoutTime}>
                  {new Date(workout.date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
                <Text style={styles.workoutDetails}>
                  {workout.exercises.length} exercises • {workout.duration} min
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.addWorkoutText}>
            Tap to add {exerciseType.label}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderProgressBar = (
    label: string,
    value: number,
    goal: number,
    color: string
  ) => {
    const percentage = Math.min((value / goal) * 100, 100);
    return (
      <View style={styles.progressItem}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>{label}</Text>
          <Text style={styles.progressValue}>
            {value}/{goal}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${percentage}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1a8e2d", "#146922"]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#1a8e2d" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Exercise Tracker</Text>
        </View>

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Weekly Progress</Text>
          {renderProgressBar(
            "Strength",
            weeklyProgress.strength,
            WEEKLY_GOALS.strength,
            "#FF6B6B"
          )}
          {renderProgressBar(
            "Cardio",
            weeklyProgress.cardio,
            WEEKLY_GOALS.cardio,
            "#4ECDC4"
          )}
          {renderProgressBar(
            "Walking",
            weeklyProgress.walking,
            WEEKLY_GOALS.walking,
            "#45B7D1"
          )}
          {renderProgressBar(
            "Flexibility",
            weeklyProgress.flexibility,
            WEEKLY_GOALS.flexibility,
            "#96CEB4"
          )}
        </View>

        <ScrollView style={styles.workoutsContainer}>
          {EXERCISE_TYPES.map(renderWorkoutSection)}
        </ScrollView>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/exercise/add" as any)}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Add Workout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginLeft: 10,
  },
  summaryContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  progressItem: {
    marginBottom: 15,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  progressValue: {
    fontSize: 14,
    color: "#666",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  workoutsContainer: {
    flex: 1,
  },
  workoutCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  workoutProgress: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  workoutContent: {
    marginLeft: 50,
  },
  workoutItem: {
    marginBottom: 10,
  },
  workoutTime: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  workoutDetails: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  addWorkoutText: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
    marginLeft: 50,
  },
  addButton: {
    backgroundColor: "#1a8e2d",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 25,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
