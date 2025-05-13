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
import { addDietEntry } from "../../utils/health-storage";

interface MealType {
  id: string;
  label: string;
  icon:
    | "restaurant-outline"
    | "cafe-outline"
    | "fast-food-outline"
    | "nutrition-outline";
  color: string;
}

interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const MEAL_TYPES: MealType[] = [
  {
    id: "breakfast",
    label: "Breakfast",
    icon: "restaurant-outline",
    color: "#FF6B6B",
  },
  { id: "lunch", label: "Lunch", icon: "cafe-outline", color: "#4ECDC4" },
  {
    id: "dinner",
    label: "Dinner",
    icon: "fast-food-outline",
    color: "#45B7D1",
  },
  {
    id: "snacks",
    label: "Snacks",
    icon: "nutrition-outline",
    color: "#96CEB4",
  },
];

export default function AddMealScreen() {
  const router = useRouter();
  const [selectedMealType, setSelectedMealType] = useState<string>("breakfast");
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [currentFood, setCurrentFood] = useState<FoodItem>({
    name: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  const addFoodItem = () => {
    if (!currentFood.name.trim()) {
      Alert.alert("Error", "Please enter a food name");
      return;
    }

    setFoodItems([...foodItems, currentFood]);
    setCurrentFood({
      name: "",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    });
  };

  const removeFoodItem = (index: number) => {
    const newFoodItems = [...foodItems];
    newFoodItems.splice(index, 1);
    setFoodItems(newFoodItems);
  };

  const calculateTotals = () => {
    return foodItems.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        carbs: acc.carbs + item.carbs,
        fat: acc.fat + item.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const saveMeal = async () => {
    if (foodItems.length === 0) {
      Alert.alert("Error", "Please add at least one food item");
      return;
    }

    try {
      const totals = calculateTotals();
      await addDietEntry({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        mealType: selectedMealType,
        foods: foodItems,
        totalCalories: totals.calories,
        totalProtein: totals.protein,
        totalCarbs: totals.carbs,
        totalFat: totals.fat,
      });

      Alert.alert("Success", "Meal saved successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error saving meal:", error);
      Alert.alert("Error", "Failed to save meal");
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
          <Text style={styles.headerTitle}>Add Meal</Text>
        </View>

        <ScrollView style={styles.formContainer}>
          <View style={styles.mealTypeContainer}>
            <Text style={styles.sectionTitle}>Meal Type</Text>
            <View style={styles.mealTypeButtons}>
              {MEAL_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.mealTypeButton,
                    selectedMealType === type.id && {
                      backgroundColor: type.color,
                    },
                  ]}
                  onPress={() => setSelectedMealType(type.id)}
                >
                  <Ionicons
                    name={type.icon}
                    size={24}
                    color={selectedMealType === type.id ? "white" : type.color}
                  />
                  <Text
                    style={[
                      styles.mealTypeLabel,
                      selectedMealType === type.id && { color: "white" },
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.foodItemsContainer}>
            <Text style={styles.sectionTitle}>Food Items</Text>
            {foodItems.map((item, index) => (
              <View key={index} style={styles.foodItem}>
                <View style={styles.foodItemInfo}>
                  <Text style={styles.foodItemName}>{item.name}</Text>
                  <Text style={styles.foodItemNutrition}>
                    {item.calories} cal | P: {item.protein}g | C: {item.carbs}g
                    | F: {item.fat}g
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => removeFoodItem(index)}
                  style={styles.removeButton}
                >
                  <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.addFoodContainer}>
              <Text style={styles.sectionTitle}>Add Food Item</Text>
              <TextInput
                style={styles.input}
                placeholder="Food name"
                value={currentFood.name}
                onChangeText={(text) =>
                  setCurrentFood({ ...currentFood, name: text })
                }
              />
              <View style={styles.nutritionInputs}>
                <View style={styles.nutritionInput}>
                  <Text style={styles.inputLabel}>Calories</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    keyboardType="numeric"
                    value={currentFood.calories.toString()}
                    onChangeText={(text) =>
                      setCurrentFood({
                        ...currentFood,
                        calories: parseInt(text) || 0,
                      })
                    }
                  />
                </View>
                <View style={styles.nutritionInput}>
                  <Text style={styles.inputLabel}>Protein (g)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    keyboardType="numeric"
                    value={currentFood.protein.toString()}
                    onChangeText={(text) =>
                      setCurrentFood({
                        ...currentFood,
                        protein: parseInt(text) || 0,
                      })
                    }
                  />
                </View>
                <View style={styles.nutritionInput}>
                  <Text style={styles.inputLabel}>Carbs (g)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    keyboardType="numeric"
                    value={currentFood.carbs.toString()}
                    onChangeText={(text) =>
                      setCurrentFood({
                        ...currentFood,
                        carbs: parseInt(text) || 0,
                      })
                    }
                  />
                </View>
                <View style={styles.nutritionInput}>
                  <Text style={styles.inputLabel}>Fat (g)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    keyboardType="numeric"
                    value={currentFood.fat.toString()}
                    onChangeText={(text) =>
                      setCurrentFood({
                        ...currentFood,
                        fat: parseInt(text) || 0,
                      })
                    }
                  />
                </View>
              </View>
              <TouchableOpacity
                style={styles.addFoodButton}
                onPress={addFoodItem}
              >
                <Ionicons name="add" size={24} color="white" />
                <Text style={styles.addFoodButtonText}>Add Food Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.saveButton} onPress={saveMeal}>
          <Text style={styles.saveButtonText}>Save Meal</Text>
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
  formContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  mealTypeContainer: {
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
  mealTypeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  mealTypeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "white",
  },
  mealTypeLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
  foodItemsContainer: {
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
  foodItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  foodItemInfo: {
    flex: 1,
  },
  foodItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  foodItemNutrition: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
  },
  addFoodContainer: {
    marginTop: 20,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  nutritionInputs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  nutritionInput: {
    flex: 1,
    minWidth: "45%",
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  addFoodButton: {
    backgroundColor: "#1a8e2d",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  addFoodButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
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
