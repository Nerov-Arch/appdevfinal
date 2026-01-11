import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  generateWorkoutPlan,
  generateDietPlan,
  generateSleepSchedule,
  generateDailyTasks,
} from '@/lib/fitnessEngine';

export default function OnboardingScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('other');

  const [goals, setGoals] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  const goalOptions = [
    { value: 'weight_loss', label: 'Weight Loss' },
    { value: 'muscle_gain', label: 'Muscle Gain' },
    { value: 'both', label: 'Both' },
  ];

  const conditionOptions = [
    { value: 'none', label: 'None' },
    { value: 'asthma', label: 'Asthma' },
    { value: 'diabetes', label: 'Diabetes' },
    { value: 'heart_condition', label: 'Heart Condition' },
  ];

  const locationOptions = [
    { value: 'gym', label: 'Gym' },
    { value: 'home', label: 'Home' },
    { value: 'outdoors', label: 'Outdoors' },
  ];

  const toggleSelection = (
    value: string,
    current: string[],
    setter: (val: string[]) => void
  ) => {
    if (current.includes(value)) {
      setter(current.filter((v) => v !== value));
    } else {
      setter([...current, value]);
    }
  };

  const handleComplete = async () => {
    if (
      !age ||
      !height ||
      !weight ||
      !targetWeight ||
      goals.length === 0 ||
      conditions.length === 0 ||
      locations.length === 0
    ) {
      Alert.alert('Error', 'Please complete all fields');
      return;
    }

    setLoading(true);
    try {
      const profile = {
        age: parseInt(age),
        height: parseFloat(height),
        current_weight: parseFloat(weight),
        target_weight: parseFloat(targetWeight),
        gender,
      };

      await supabase
        .from('user_profiles')
        .update(profile)
        .eq('id', user!.id);

      for (const goal of goals) {
        await supabase.from('user_goals').insert({
          user_id: user!.id,
          goal_type: goal,
          is_active: true,
        });
      }

      for (const condition of conditions) {
        await supabase.from('user_medical_conditions').insert({
          user_id: user!.id,
          condition,
        });
      }

      for (const location of locations) {
        await supabase.from('user_exercise_locations').insert({
          user_id: user!.id,
          location,
        });
      }

      const goalsData = goals.map((g) => ({ goal_type: g as any }));
      const conditionsData = conditions.map((c) => ({ condition: c }));
      const locationsData = locations.map((l) => ({ location: l as any }));

      const workouts = generateWorkoutPlan(
        profile,
        goalsData,
        conditionsData,
        locationsData
      );

      for (const workout of workouts) {
        await supabase.from('workout_plans').insert({
          user_id: user!.id,
          ...workout,
        });
      }

      const meals = generateDietPlan(profile, goalsData);

      for (const meal of meals) {
        await supabase.from('diet_plans').insert({
          user_id: user!.id,
          ...meal,
        });
      }

      const sleep = generateSleepSchedule(goalsData);
      await supabase.from('sleep_schedules').insert({
        user_id: user!.id,
        ...sleep,
      });

      const todayTasks = generateDailyTasks(workouts, meals, sleep);
      for (const task of todayTasks) {
        await supabase.from('daily_tasks').insert({
          user_id: user!.id,
          ...task,
        });
      }

      await supabase.from('weight_logs').insert({
        user_id: user!.id,
        weight: parseFloat(weight),
        log_date: new Date().toISOString().split('T')[0],
      });

      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Basic Information</Text>
        <Text style={styles.description}>
          Help us personalize your fitness plan
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your age"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Height (cm)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your height"
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Current Weight (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your current weight"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Target Weight (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your target weight"
            value={targetWeight}
            onChangeText={setTargetWeight}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Gender</Text>
          <View style={styles.optionsRow}>
            {['male', 'female', 'other'].map((g) => (
              <TouchableOpacity
                key={g}
                style={[
                  styles.optionButton,
                  gender === g && styles.optionButtonSelected,
                ]}
                onPress={() => setGender(g as any)}
              >
                <Text
                  style={[
                    styles.optionText,
                    gender === g && styles.optionTextSelected,
                  ]}
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => setStep(2)}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (step === 2) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Fitness Goals</Text>
        <Text style={styles.description}>
          Select your fitness objectives
        </Text>

        <View style={styles.section}>
          {goalOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.card,
                goals.includes(option.value) && styles.cardSelected,
              ]}
              onPress={() => {
                if (option.value === 'both') {
                  setGoals(['both']);
                } else {
                  const filtered = goals.filter((g) => g !== 'both');
                  toggleSelection(option.value, filtered, setGoals);
                }
              }}
            >
              <Text
                style={[
                  styles.cardText,
                  goals.includes(option.value) && styles.cardTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={() => setStep(1)}
          >
            <Text style={styles.buttonSecondaryText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setStep(3)}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (step === 3) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Medical Conditions</Text>
        <Text style={styles.description}>
          Help us create safe workouts for you
        </Text>

        <View style={styles.section}>
          {conditionOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.card,
                conditions.includes(option.value) && styles.cardSelected,
              ]}
              onPress={() =>
                toggleSelection(option.value, conditions, setConditions)
              }
            >
              <Text
                style={[
                  styles.cardText,
                  conditions.includes(option.value) && styles.cardTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={() => setStep(2)}
          >
            <Text style={styles.buttonSecondaryText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setStep(4)}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Exercise Locations</Text>
      <Text style={styles.description}>
        Select where you prefer to workout (multiple allowed)
      </Text>

      <View style={styles.section}>
        {locationOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.card,
              locations.includes(option.value) && styles.cardSelected,
            ]}
            onPress={() =>
              toggleSelection(option.value, locations, setLocations)
            }
          >
            <Text
              style={[
                styles.cardText,
                locations.includes(option.value) && styles.cardTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => setStep(3)}
        >
          <Text style={styles.buttonSecondaryText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleComplete}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Setting up...' : 'Complete'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 8,
    color: '#111827',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  optionTextSelected: {
    color: '#ffffff',
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  cardSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  cardTextSelected: {
    color: '#2563eb',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
  },
  buttonSecondaryText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
