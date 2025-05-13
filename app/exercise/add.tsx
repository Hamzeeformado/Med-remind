import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { addExerciseEntry } from "../../utils/health-storage";

interface ExerciseType {
  id: string;
  label: string;
  icon:
    | "barbell-outline"
    | "bicycle-outline"
    | "walk-outline"
    | "fitness-outline";
  color: string;
}

interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
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

const COMMON_EXERCISES = {
  strength: [
    "Bench Press",
    "Squats",
    "Deadlifts",
    "Pull-ups",
    "Push-ups",
    "Shoulder Press",
    "Bicep Curls",
    "Tricep Extensions",
  ],
  cardio: [
    "Running",
    "Cycling",
    "Swimming",
    "Jump Rope",
    "Rowing",
    "Elliptical",
    "Stair Master",
  ],
  walking: ["Walking", "Hiking", "Treadmill Walking"],
  flexibility: [
    "Yoga",
    "Stretching",
    "Pilates",
    "Mobility Work",
    "Dynamic Stretching",
  ],
};

export default function AddWorkoutScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string>("strength");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState<Exercise>({
    name: "",
  });
  const [workoutDuration, setWorkoutDuration] = useState("");

  const addExercise = () => {
    if (!currentExercise.name.trim()) {
      Alert.alert("Error", "Please enter an exercise name");
      return;
    }

    setExercises([...exercises, currentExercise]);
    setCurrentExercise({ name: "" });
  };

  const removeExercise = (index: number) => {
    const newExercises = [...exercises];
    newExercises.splice(index, 1);
    setExercises(newExercises);
  };

  const saveWorkout = async () => {
    if (exercises.length === 0) {
      Alert.alert("Error", "Please add at least one exercise");
      return;
    }

    if (!workoutDuration.trim()) {
      Alert.alert("Error", "Please enter workout duration");
      return;
    }

    try {
      const duration = parseInt(workoutDuration);
      if (isNaN(duration) || duration <= 0) {
        Alert.alert("Error", "Please enter a valid duration");
        return;
      }

      // Calculate calories burned (simple estimation)
      const caloriesBurned = Math.round(duration * 5); // 5 calories per minute as a rough estimate

      await addExerciseEntry({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        type: selectedType,
        exercises: exercises,
        duration: duration,
        caloriesBurned: caloriesBurned,
      });

      Alert.alert("Success", "Workout saved successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error saving workout:", error);
      Alert.alert("Error", "Failed to save workout");
    }
  };

  const renderExerciseInputs = () => {
    switch (selectedType) {
      case "strength":
        return (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Sets</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={currentExercise.sets?.toString() || ""}
                onChangeText={(text) =>
                  setCurrentExercise({
                    ...currentExercise,
                    sets: parseInt(text) || undefined,
                  })
                }
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Reps</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={currentExercise.reps?.toString() || ""}
                onChangeText={(text) =>
                  setCurrentExercise({
                    ...currentExercise,
                    reps: parseInt(text) || undefined,
                  })
                }
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={currentExercise.weight?.toString() || ""}
                onChangeText={(text) =>
                  setCurrentExercise({
                    ...currentExercise,
                    weight: parseInt(text) || undefined,
                  })
                }
              />
            </View>
          </>
        );
      case "cardio":
      case "walking":
        return (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Duration (min)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={currentExercise.duration?.toString() || ""}
                onChangeText={(text) =>
                  setCurrentExercise({
                    ...currentExercise,
                    duration: parseInt(text) || undefined,
                  })
                }
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Distance (km)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={currentExercise.distance?.toString() || ""}
                onChangeText={(text) =>
                  setCurrentExercise({
                    ...currentExercise,
                    distance: parseInt(text) || undefined,
                  })
                }
              />
            </View>
          </>
        );
      case "flexibility":
        return (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Duration (min)</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              keyboardType="numeric"
              value={currentExercise.duration?.toString() || ""}
              onChangeText={(text) =>
                setCurrentExercise({
                  ...currentExercise,
                  duration: parseInt(text) || undefined,
                })
              }
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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
          <Text style={styles.headerTitle}>Add Workout</Text>
        </View>

        <ScrollView style={styles.form}>
          <View style={styles.exerciseTypeContainer}>
            <Text style={styles.sectionTitle}>Exercise Type</Text>
            <View style={styles.exerciseTypeButtons}>
              {EXERCISE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.exerciseTypeButton,
                    selectedType === type.id && {
                      backgroundColor: type.color,
                    },
                  ]}
                  onPress={() => setSelectedType(type.id)}
                >
                  <Ionicons
                    name={type.icon}
                    size={24}
                    color={selectedType === type.id ? "white" : type.color}
                  />
                  <Text
                    style={[
                      styles.exerciseTypeLabel,
                      selectedType === type.id && { color: "white" },
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.exercisesContainer}>
            <Text style={styles.sectionTitle}>Exercises</Text>
            {exercises.map((exercise, index) => (
              <View key={index} style={styles.exerciseItem}>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseDetails}>
                    {exercise.sets && `${exercise.sets} sets`}
                    {exercise.reps && ` • ${exercise.reps} reps`}
                    {exercise.weight && ` • ${exercise.weight} kg`}
                    {exercise.duration && ` • ${exercise.duration} min`}
                    {exercise.distance && ` • ${exercise.distance} km`}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => removeExercise(index)}
                  style={styles.removeButton}
                >
                  <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.addExerciseContainer}>
              <Text style={styles.sectionTitle}>Add Exercise</Text>
              <View style={styles.exerciseNameContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Exercise name"
                  value={currentExercise.name}
                  onChangeText={(text) =>
                    setCurrentExercise({ ...currentExercise, name: text })
                  }
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.commonExercises}
                >
                  {COMMON_EXERCISES[
                    selectedType as keyof typeof COMMON_EXERCISES
                  ].map((name) => (
                    <TouchableOpacity
                      key={name}
                      style={styles.commonExerciseButton}
                      onPress={() =>
                        setCurrentExercise({ ...currentExercise, name })
                      }
                    >
                      <Text style={styles.commonExerciseText}>{name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.exerciseDetailsContainer}>
                {renderExerciseInputs()}
              </View>

              <TouchableOpacity
                style={styles.addExerciseButton}
                onPress={addExercise}
              >
                <Ionicons name="add" size={24} color="white" />
                <Text style={styles.addExerciseButtonText}>Add Exercise</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.workoutDurationContainer}>
            <Text style={styles.sectionTitle}>Workout Duration</Text>
            <TextInput
              style={styles.input}
              placeholder="Duration in minutes"
              keyboardType="numeric"
              value={workoutDuration}
              onChangeText={setWorkoutDuration}
            />
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.saveButton} onPress={saveWorkout}>
          <Text style={styles.saveButtonText}>Save Workout</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  form: {
    flex: 1,
  },
  exerciseTypeContainer: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  exerciseTypeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  exerciseTypeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "white",
  },
  exerciseTypeLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
  exercisesContainer: {
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
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  exerciseDetails: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
  },
  addExerciseContainer: {
    marginTop: 20,
  },
  exerciseNameContainer: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  commonExercises: {
    marginTop: -10,
    marginBottom: 10,
  },
  commonExerciseButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
  },
  commonExerciseText: {
    fontSize: 12,
    color: "#666",
  },
  exerciseDetailsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  inputGroup: {
    flex: 1,
    minWidth: "45%",
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  addExerciseButton: {
    backgroundColor: "#1a8e2d",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  addExerciseButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  workoutDurationContainer: {
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
  saveButton: {
    backgroundColor: "#1a8e2d",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
