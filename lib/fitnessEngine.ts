export interface UserProfile {
  age?: number;
  height?: number;
  current_weight?: number;
  target_weight?: number;
  gender?: string;
}

export interface FitnessGoal {
  goal_type: 'weight_loss' | 'muscle_gain' | 'both';
}

export interface MedicalCondition {
  condition: string;
}

export interface ExerciseLocation {
  location: 'gym' | 'home' | 'outdoors';
}

export interface WorkoutPlan {
  title: string;
  description: string;
  exercise_type: 'cardio' | 'strength' | 'flexibility' | 'mixed';
  duration_minutes: number;
  intensity: 'low' | 'moderate' | 'high';
  equipment_needed: string[];
  instructions: string[];
  day_of_week: number;
}

export interface DietPlan {
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'post_workout';
  meal_name: string;
  description: string;
  suggested_time: string;
  calories: number;
  protein_grams: number;
  carbs_grams: number;
  fats_grams: number;
  foods: string[];
}

export interface SleepSchedule {
  bedtime: string;
  wake_time: string;
  target_hours: number;
}

export function generateWorkoutPlan(
  profile: UserProfile,
  goals: FitnessGoal[],
  conditions: MedicalCondition[],
  locations: ExerciseLocation[]
): WorkoutPlan[] {
  const hasAsthma = conditions.some((c) => c.condition === 'asthma');
  const goalTypes = goals.map((g) => g.goal_type);
  const needsWeightLoss = goalTypes.includes('weight_loss') || goalTypes.includes('both');
  const needsMuscleGain = goalTypes.includes('muscle_gain') || goalTypes.includes('both');
  const locationTypes = locations.map((l) => l.location);

  const workouts: WorkoutPlan[] = [];

  if (needsWeightLoss) {
    const cardioIntensity = hasAsthma ? 'moderate' : 'moderate';
    const cardioDuration = hasAsthma ? 25 : 30;

    for (let day = 1; day <= 5; day++) {
      const cardioWorkout: WorkoutPlan = {
        title: `Cardio Session - Day ${day}`,
        description: hasAsthma
          ? 'Moderate intensity cardio with breathing focus. Start with 5-minute warm-up.'
          : 'Steady-state cardio for fat burning and cardiovascular health.',
        exercise_type: 'cardio',
        duration_minutes: cardioDuration,
        intensity: cardioIntensity,
        equipment_needed: getCardioEquipment(locationTypes),
        instructions: hasAsthma
          ? [
              '5-minute warm-up with light walking',
              'Deep breathing exercises',
              '15-20 minutes moderate intensity (brisk walking or light cycling)',
              'Take breaks if needed',
              '5-minute cool-down with stretching',
            ]
          : [
              '5-minute warm-up',
              '20-25 minutes steady cardio (running, cycling, or rowing)',
              '5-minute cool-down',
            ],
        day_of_week: day,
      };
      workouts.push(cardioWorkout);
    }
  }

  if (needsMuscleGain) {
    const strengthDays = [1, 3, 5];

    strengthDays.forEach((day, index) => {
      const focusAreas = ['Upper Body', 'Lower Body', 'Full Body'];
      const strengthWorkout: WorkoutPlan = {
        title: `Strength Training - ${focusAreas[index]}`,
        description: hasAsthma
          ? 'Resistance training with extended rest periods. Focus on controlled breathing.'
          : 'Progressive resistance training to build muscle mass and strength.',
        exercise_type: 'strength',
        duration_minutes: 45,
        intensity: hasAsthma ? 'moderate' : 'high',
        equipment_needed: getStrengthEquipment(locationTypes),
        instructions: getStrengthInstructions(focusAreas[index], locationTypes, hasAsthma),
        day_of_week: day,
      };
      workouts.push(strengthWorkout);
    });
  }

  const flexibilityDays = [0, 6];
  flexibilityDays.forEach((day) => {
    const recoveryWorkout: WorkoutPlan = {
      title: 'Active Recovery & Flexibility',
      description: 'Light stretching and mobility work for recovery.',
      exercise_type: 'flexibility',
      duration_minutes: 20,
      intensity: 'low',
      equipment_needed: ['Yoga mat'],
      instructions: [
        '5-minute light walking',
        'Full body stretching routine',
        'Deep breathing exercises',
        'Foam rolling if available',
      ],
      day_of_week: day,
    };
    workouts.push(recoveryWorkout);
  });

  return workouts;
}

function getCardioEquipment(locations: string[]): string[] {
  const equipment: string[] = [];

  if (locations.includes('gym')) {
    equipment.push('Treadmill', 'Stationary bike', 'Rowing machine');
  }
  if (locations.includes('home')) {
    equipment.push('Jump rope', 'Resistance bands', 'Bodyweight exercises');
  }
  if (locations.includes('outdoors')) {
    equipment.push('Running shoes', 'Bicycle');
  }

  return equipment.length > 0 ? equipment : ['Bodyweight exercises', 'Running shoes'];
}

function getStrengthEquipment(locations: string[]): string[] {
  const equipment: string[] = [];

  if (locations.includes('gym')) {
    equipment.push('Dumbbells', 'Barbells', 'Cable machines', 'Leg press', 'Bench');
  }
  if (locations.includes('home')) {
    equipment.push('Dumbbells', 'Resistance bands', 'Pull-up bar', 'Bodyweight');
  }
  if (locations.includes('outdoors')) {
    equipment.push('Resistance bands', 'Bodyweight exercises');
  }

  return equipment.length > 0 ? equipment : ['Bodyweight exercises', 'Resistance bands'];
}

function getStrengthInstructions(focus: string, locations: string[], hasAsthma: boolean): string[] {
  const restTime = hasAsthma ? '90-120 seconds' : '60-90 seconds';

  if (focus === 'Upper Body') {
    return [
      '5-minute warm-up',
      'Push-ups or Bench Press: 3 sets of 8-12 reps',
      'Rows or Pull-ups: 3 sets of 8-12 reps',
      'Shoulder Press: 3 sets of 8-12 reps',
      'Bicep Curls: 3 sets of 10-15 reps',
      'Tricep Extensions: 3 sets of 10-15 reps',
      `Rest ${restTime} between sets`,
      '5-minute stretching',
    ];
  } else if (focus === 'Lower Body') {
    return [
      '5-minute warm-up',
      'Squats: 3 sets of 10-15 reps',
      'Lunges: 3 sets of 10 reps per leg',
      'Leg Press or Step-ups: 3 sets of 12-15 reps',
      'Calf Raises: 3 sets of 15-20 reps',
      `Rest ${restTime} between sets`,
      '5-minute stretching',
    ];
  } else {
    return [
      '5-minute warm-up',
      'Squats: 3 sets of 10-12 reps',
      'Push-ups: 3 sets of 8-12 reps',
      'Bent-over Rows: 3 sets of 10-12 reps',
      'Plank: 3 sets of 30-60 seconds',
      'Lunges: 2 sets of 10 reps per leg',
      `Rest ${restTime} between sets`,
      '5-minute stretching',
    ];
  }
}

export function generateDietPlan(
  profile: UserProfile,
  goals: FitnessGoal[]
): DietPlan[] {
  const goalTypes = goals.map((g) => g.goal_type);
  const needsWeightLoss = goalTypes.includes('weight_loss') || goalTypes.includes('both');
  const needsMuscleGain = goalTypes.includes('muscle_gain') || goalTypes.includes('both');

  const baseCalories = calculateBaseCalories(profile);
  let dailyCalories = baseCalories;

  if (needsWeightLoss && !needsMuscleGain) {
    dailyCalories = baseCalories - 500;
  } else if (needsMuscleGain && !needsWeightLoss) {
    dailyCalories = baseCalories + 300;
  }

  const proteinGrams = (profile.current_weight || 70) * (needsMuscleGain ? 2.0 : 1.6);
  const proteinCalories = proteinGrams * 4;
  const fatsCalories = dailyCalories * 0.25;
  const fatsGrams = fatsCalories / 9;
  const carbsCalories = dailyCalories - proteinCalories - fatsCalories;
  const carbsGrams = carbsCalories / 4;

  const meals: DietPlan[] = [
    {
      meal_type: 'breakfast',
      meal_name: 'High-Protein Breakfast',
      description: 'Balanced meal to start your day with energy',
      suggested_time: '7:00 AM',
      calories: Math.round(dailyCalories * 0.25),
      protein_grams: Math.round(proteinGrams * 0.25),
      carbs_grams: Math.round(carbsGrams * 0.3),
      fats_grams: Math.round(fatsGrams * 0.25),
      foods: [
        '3 whole eggs or egg whites',
        'Oatmeal with berries',
        'Greek yogurt',
        'Green tea or black coffee',
      ],
    },
    {
      meal_type: 'snack',
      meal_name: 'Mid-Morning Snack',
      description: 'Light snack to maintain energy',
      suggested_time: '10:00 AM',
      calories: Math.round(dailyCalories * 0.1),
      protein_grams: Math.round(proteinGrams * 0.15),
      carbs_grams: Math.round(carbsGrams * 0.1),
      fats_grams: Math.round(fatsGrams * 0.15),
      foods: ['Protein shake or bar', 'Apple or banana', 'Handful of almonds'],
    },
    {
      meal_type: 'lunch',
      meal_name: 'Balanced Lunch',
      description: 'Nutrient-dense meal for sustained energy',
      suggested_time: '1:00 PM',
      calories: Math.round(dailyCalories * 0.3),
      protein_grams: Math.round(proteinGrams * 0.3),
      carbs_grams: Math.round(carbsGrams * 0.35),
      fats_grams: Math.round(fatsGrams * 0.3),
      foods: [
        'Grilled chicken breast (150g)',
        'Brown rice or quinoa (1 cup)',
        'Mixed vegetables',
        'Olive oil dressing',
      ],
    },
    {
      meal_type: 'post_workout',
      meal_name: 'Post-Workout Nutrition',
      description: 'Recovery meal after training',
      suggested_time: '30 minutes after workout',
      calories: Math.round(dailyCalories * 0.15),
      protein_grams: Math.round(proteinGrams * 0.2),
      carbs_grams: Math.round(carbsGrams * 0.15),
      fats_grams: Math.round(fatsGrams * 0.1),
      foods: ['Protein shake', 'Banana', 'Rice cakes with peanut butter'],
    },
    {
      meal_type: 'dinner',
      meal_name: 'Light Dinner',
      description: 'Protein-rich dinner with vegetables',
      suggested_time: '7:00 PM',
      calories: Math.round(dailyCalories * 0.2),
      protein_grams: Math.round(proteinGrams * 0.25),
      carbs_grams: Math.round(carbsGrams * 0.2),
      fats_grams: Math.round(fatsGrams * 0.25),
      foods: [
        'Salmon or lean beef (150g)',
        'Sweet potato or whole grain pasta',
        'Steamed broccoli and spinach',
        'Avocado',
      ],
    },
  ];

  return meals;
}

function calculateBaseCalories(profile: UserProfile): number {
  const weight = profile.current_weight || 70;
  const height = profile.height || 170;
  const age = profile.age || 25;
  const gender = profile.gender || 'other';

  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else if (gender === 'female') {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 78;
  }

  const tdee = bmr * 1.55;
  return Math.round(tdee);
}

export function generateSleepSchedule(goals: FitnessGoal[]): SleepSchedule {
  const goalTypes = goals.map((g) => g.goal_type);
  const needsMuscleGain = goalTypes.includes('muscle_gain') || goalTypes.includes('both');

  if (needsMuscleGain) {
    return {
      bedtime: '10:00 PM',
      wake_time: '6:30 AM',
      target_hours: 8.5,
    };
  }

  return {
    bedtime: '10:30 PM',
    wake_time: '6:30 AM',
    target_hours: 8,
  };
}

export function generateDailyTasks(
  workouts: WorkoutPlan[],
  meals: DietPlan[],
  sleep: SleepSchedule
) {
  const today = new Date().getDay();
  const todayWorkouts = workouts.filter((w) => w.day_of_week === today);

  const tasks = [];

  todayWorkouts.forEach((workout) => {
    tasks.push({
      task_type: 'workout',
      title: workout.title,
      description: workout.description,
      target_value: `${workout.duration_minutes} minutes`,
      is_completed: false,
    });
  });

  meals.forEach((meal) => {
    tasks.push({
      task_type: 'meal',
      title: meal.meal_name,
      description: `${meal.meal_type} - ${meal.suggested_time}`,
      target_value: `${meal.calories} calories`,
      is_completed: false,
    });
  });

  tasks.push({
    task_type: 'hydration',
    title: 'Daily Water Intake',
    description: 'Stay hydrated throughout the day',
    target_value: '2-3 liters',
    is_completed: false,
  });

  tasks.push({
    task_type: 'sleep',
    title: 'Sleep Schedule',
    description: `Bedtime: ${sleep.bedtime}, Wake: ${sleep.wake_time}`,
    target_value: `${sleep.target_hours} hours`,
    is_completed: false,
  });

  return tasks;
}
