import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Dumbbell, Utensils, Moon, Clock, Zap } from 'lucide-react-native';

interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  exercise_type: string;
  duration_minutes: number;
  intensity: string;
  equipment_needed: string[];
  instructions: string[];
  day_of_week: number;
}

interface DietPlan {
  id: string;
  meal_type: string;
  meal_name: string;
  description: string;
  suggested_time: string;
  calories: number;
  protein_grams: number;
  carbs_grams: number;
  fats_grams: number;
  foods: string[];
}

interface SleepSchedule {
  bedtime: string;
  wake_time: string;
  target_hours: number;
}

export default function RecommendationsScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'workouts' | 'diet' | 'sleep'>(
    'workouts'
  );
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [meals, setMeals] = useState<DietPlan[]>([]);
  const [sleep, setSleep] = useState<SleepSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const { data: workoutsData } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', user!.id)
        .order('day_of_week');

      const { data: mealsData } = await supabase
        .from('diet_plans')
        .select('*')
        .eq('user_id', user!.id);

      const { data: sleepData } = await supabase
        .from('sleep_schedules')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (workoutsData) setWorkouts(workoutsData);
      if (mealsData) setMeals(mealsData);
      if (sleepData) setSleep(sleepData);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getIntensityColor = (intensity: string) => {
    if (intensity === 'high') return '#ef4444';
    if (intensity === 'moderate') return '#f59e0b';
    return '#10b981';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Plans</Text>
        <Text style={styles.subtitle}>Research-based recommendations</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'workouts' && styles.tabActive]}
          onPress={() => setActiveTab('workouts')}
        >
          <Dumbbell
            size={20}
            color={activeTab === 'workouts' ? '#2563eb' : '#9ca3af'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'workouts' && styles.tabTextActive,
            ]}
          >
            Workouts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'diet' && styles.tabActive]}
          onPress={() => setActiveTab('diet')}
        >
          <Utensils
            size={20}
            color={activeTab === 'diet' ? '#2563eb' : '#9ca3af'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'diet' && styles.tabTextActive,
            ]}
          >
            Nutrition
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sleep' && styles.tabActive]}
          onPress={() => setActiveTab('sleep')}
        >
          <Moon
            size={20}
            color={activeTab === 'sleep' ? '#2563eb' : '#9ca3af'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'sleep' && styles.tabTextActive,
            ]}
          >
            Sleep
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'workouts' && (
          <View style={styles.section}>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>
                Research-Based Workout Plan
              </Text>
              <Text style={styles.infoText}>
                Based on ACSM guidelines: 150-300 minutes of moderate aerobic
                activity per week, plus 2-3 days of resistance training for
                optimal health and fitness.
              </Text>
            </View>

            {workouts.map((workout) => (
              <View key={workout.id} style={styles.workoutCard}>
                <View style={styles.workoutHeader}>
                  <View style={styles.workoutDay}>
                    <Text style={styles.workoutDayText}>
                      {days[workout.day_of_week]}
                    </Text>
                  </View>
                  <View style={styles.workoutTitle}>
                    <Text style={styles.workoutName}>{workout.title}</Text>
                    <View style={styles.workoutMeta}>
                      <View style={styles.metaItem}>
                        <Clock size={12} color="#6b7280" />
                        <Text style={styles.metaText}>
                          {workout.duration_minutes} min
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Zap
                          size={12}
                          color={getIntensityColor(workout.intensity)}
                        />
                        <Text
                          style={[
                            styles.metaText,
                            {
                              color: getIntensityColor(workout.intensity),
                            },
                          ]}
                        >
                          {workout.intensity}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <Text style={styles.workoutDescription}>
                  {workout.description}
                </Text>

                {workout.equipment_needed &&
                  workout.equipment_needed.length > 0 && (
                    <View style={styles.equipmentSection}>
                      <Text style={styles.sectionLabel}>Equipment:</Text>
                      <View style={styles.equipmentList}>
                        {workout.equipment_needed.map((item, index) => (
                          <View key={index} style={styles.equipmentTag}>
                            <Text style={styles.equipmentText}>{item}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                {workout.instructions && workout.instructions.length > 0 && (
                  <View style={styles.instructionsSection}>
                    <Text style={styles.sectionLabel}>Instructions:</Text>
                    {workout.instructions.map((instruction, index) => (
                      <View key={index} style={styles.instructionItem}>
                        <Text style={styles.instructionNumber}>
                          {index + 1}.
                        </Text>
                        <Text style={styles.instructionText}>
                          {instruction}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {activeTab === 'diet' && (
          <View style={styles.section}>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Nutrition Plan</Text>
              <Text style={styles.infoText}>
                Balanced macros based on your goals. For muscle gain: 1.6-2.2g
                protein per kg body weight. For weight loss: 500 calorie
                deficit for safe, sustainable results.
              </Text>
            </View>

            {meals.map((meal) => (
              <View key={meal.id} style={styles.mealCard}>
                <View style={styles.mealHeader}>
                  <View>
                    <Text style={styles.mealName}>{meal.meal_name}</Text>
                    <Text style={styles.mealTime}>{meal.suggested_time}</Text>
                  </View>
                  <View style={styles.caloriesBadge}>
                    <Text style={styles.caloriesText}>{meal.calories}</Text>
                    <Text style={styles.caloriesLabel}>cal</Text>
                  </View>
                </View>

                <Text style={styles.mealDescription}>{meal.description}</Text>

                <View style={styles.macros}>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>
                      {Math.round(meal.protein_grams)}g
                    </Text>
                    <Text style={styles.macroLabel}>Protein</Text>
                  </View>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>
                      {Math.round(meal.carbs_grams)}g
                    </Text>
                    <Text style={styles.macroLabel}>Carbs</Text>
                  </View>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>
                      {Math.round(meal.fats_grams)}g
                    </Text>
                    <Text style={styles.macroLabel}>Fats</Text>
                  </View>
                </View>

                {meal.foods && meal.foods.length > 0 && (
                  <View style={styles.foodsSection}>
                    <Text style={styles.sectionLabel}>Foods:</Text>
                    {meal.foods.map((food, index) => (
                      <View key={index} style={styles.foodItem}>
                        <Text style={styles.foodBullet}>•</Text>
                        <Text style={styles.foodText}>{food}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {activeTab === 'sleep' && (
          <View style={styles.section}>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Sleep Schedule</Text>
              <Text style={styles.infoText}>
                Quality sleep is crucial for recovery and muscle growth. Aim
                for 7-9 hours per night for optimal fitness results.
              </Text>
            </View>

            {sleep && (
              <View style={styles.sleepCard}>
                <View style={styles.sleepItem}>
                  <Moon size={24} color="#2563eb" />
                  <View style={styles.sleepContent}>
                    <Text style={styles.sleepLabel}>Bedtime</Text>
                    <Text style={styles.sleepValue}>{sleep.bedtime}</Text>
                  </View>
                </View>

                <View style={styles.sleepDivider} />

                <View style={styles.sleepItem}>
                  <Moon size={24} color="#f59e0b" />
                  <View style={styles.sleepContent}>
                    <Text style={styles.sleepLabel}>Wake Time</Text>
                    <Text style={styles.sleepValue}>{sleep.wake_time}</Text>
                  </View>
                </View>

                <View style={styles.sleepDivider} />

                <View style={styles.sleepItem}>
                  <Clock size={24} color="#10b981" />
                  <View style={styles.sleepContent}>
                    <Text style={styles.sleepLabel}>Target Sleep</Text>
                    <Text style={styles.sleepValue}>
                      {sleep.target_hours} hours
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 6,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  tabTextActive: {
    color: '#2563eb',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#dbeafe',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#1e3a8a',
    lineHeight: 18,
  },
  workoutCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  workoutHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  workoutDay: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  workoutDayText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  workoutTitle: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  workoutMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  workoutDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  equipmentSection: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  equipmentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  equipmentTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  equipmentText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
  },
  instructionsSection: {},
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  instructionNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
    marginRight: 8,
    width: 20,
  },
  instructionText: {
    fontSize: 12,
    color: '#4b5563',
    lineHeight: 18,
    flex: 1,
  },
  mealCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  mealTime: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500',
  },
  caloriesBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  caloriesText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563eb',
  },
  caloriesLabel: {
    fontSize: 10,
    color: '#2563eb',
    fontWeight: '500',
  },
  mealDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
  },
  macros: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  macroLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  foodsSection: {},
  foodItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  foodBullet: {
    fontSize: 14,
    color: '#2563eb',
    marginRight: 8,
    fontWeight: '700',
  },
  foodText: {
    fontSize: 12,
    color: '#4b5563',
    flex: 1,
  },
  sleepCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sleepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sleepContent: {
    marginLeft: 16,
    flex: 1,
  },
  sleepLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  sleepValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  sleepDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
});
