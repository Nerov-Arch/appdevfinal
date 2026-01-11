/*
  # Fitness App Database Schema
  
  ## Overview
  This migration creates the complete database structure for a personalized fitness application
  that generates workout routines, diet plans, and daily tasks based on user goals and medical conditions.
  
  ## New Tables
  
  ### 1. user_profiles
  Stores basic user information and physical data
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text) - User email
  - `age` (integer) - User age
  - `height` (numeric) - Height in cm
  - `current_weight` (numeric) - Current weight in kg
  - `target_weight` (numeric) - Target weight in kg
  - `gender` (text) - Gender for calorie calculations
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 2. user_goals
  Stores fitness goals for each user
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - References user_profiles
  - `goal_type` (text) - 'weight_loss', 'muscle_gain', or 'both'
  - `is_active` (boolean) - Whether this is the current active goal
  - `created_at` (timestamptz)
  
  ### 3. user_medical_conditions
  Stores medical conditions that affect workout recommendations
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - References user_profiles
  - `condition` (text) - 'asthma', 'diabetes', 'heart_condition', 'none', etc.
  - `created_at` (timestamptz)
  
  ### 4. user_exercise_locations
  Stores multiple exercise location preferences
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - References user_profiles
  - `location` (text) - 'gym', 'home', 'outdoors'
  - `created_at` (timestamptz)
  
  ### 5. workout_plans
  Generated workout plans based on goals and conditions
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - References user_profiles
  - `title` (text) - Workout title
  - `description` (text) - Detailed workout description
  - `exercise_type` (text) - 'cardio', 'strength', 'flexibility'
  - `duration_minutes` (integer) - Workout duration
  - `intensity` (text) - 'low', 'moderate', 'high'
  - `equipment_needed` (jsonb) - Array of equipment needed
  - `instructions` (jsonb) - Array of step-by-step instructions
  - `day_of_week` (integer) - 0-6 for Sunday-Saturday
  - `created_at` (timestamptz)
  
  ### 6. diet_plans
  Generated meal plans with timestamps and nutritional info
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - References user_profiles
  - `meal_type` (text) - 'breakfast', 'lunch', 'dinner', 'snack', 'post_workout'
  - `meal_name` (text) - Name of the meal
  - `description` (text) - Meal description
  - `suggested_time` (text) - Recommended time (e.g., "7:00 AM")
  - `calories` (integer) - Calorie content
  - `protein_grams` (numeric) - Protein content
  - `carbs_grams` (numeric) - Carbohydrate content
  - `fats_grams` (numeric) - Fat content
  - `foods` (jsonb) - Array of food items
  - `created_at` (timestamptz)
  
  ### 7. daily_tasks
  Daily checklists and tasks generated for users
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - References user_profiles
  - `task_date` (date) - Date for this task
  - `task_type` (text) - 'workout', 'meal', 'hydration', 'sleep'
  - `title` (text) - Task title
  - `description` (text) - Task description
  - `target_value` (text) - Target (e.g., "8 hours", "2 liters")
  - `is_completed` (boolean) - Completion status
  - `completed_at` (timestamptz) - When task was completed
  - `created_at` (timestamptz)
  
  ### 8. weight_logs
  Weight tracking over time for progress graphs
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - References user_profiles
  - `weight` (numeric) - Weight in kg
  - `log_date` (date) - Date of weight measurement
  - `notes` (text) - Optional notes
  - `created_at` (timestamptz)
  
  ### 9. sleep_schedules
  Recommended sleep schedules based on fitness goals
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - References user_profiles
  - `bedtime` (text) - Recommended bedtime
  - `wake_time` (text) - Recommended wake time
  - `target_hours` (numeric) - Target sleep hours
  - `created_at` (timestamptz)
  
  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Users can only access their own data
  - Authenticated users can read and write their own records
  
  ## Research Citations
  Based on established fitness and nutrition guidelines:
  - American College of Sports Medicine (ACSM) - 150-300 minutes weekly aerobic activity
  - International Society of Sports Nutrition - 1.6-2.2g protein/kg body weight for muscle gain
  - Centers for Disease Control (CDC) - 500 calorie deficit for safe weight loss
  - Asthma and Exercise Guidelines - Warm-ups, moderate intensity, proper breathing techniques
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  age integer,
  height numeric,
  current_weight numeric,
  target_weight numeric,
  gender text DEFAULT 'other',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create user_goals table
CREATE TABLE IF NOT EXISTS user_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  goal_type text NOT NULL CHECK (goal_type IN ('weight_loss', 'muscle_gain', 'both')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals"
  ON user_goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON user_goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON user_goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON user_goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create user_medical_conditions table
CREATE TABLE IF NOT EXISTS user_medical_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  condition text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_medical_conditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own medical conditions"
  ON user_medical_conditions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medical conditions"
  ON user_medical_conditions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medical conditions"
  ON user_medical_conditions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own medical conditions"
  ON user_medical_conditions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create user_exercise_locations table
CREATE TABLE IF NOT EXISTS user_exercise_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  location text NOT NULL CHECK (location IN ('gym', 'home', 'outdoors')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_exercise_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exercise locations"
  ON user_exercise_locations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercise locations"
  ON user_exercise_locations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercise locations"
  ON user_exercise_locations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercise locations"
  ON user_exercise_locations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create workout_plans table
CREATE TABLE IF NOT EXISTS workout_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  exercise_type text NOT NULL CHECK (exercise_type IN ('cardio', 'strength', 'flexibility', 'mixed')),
  duration_minutes integer NOT NULL,
  intensity text NOT NULL CHECK (intensity IN ('low', 'moderate', 'high')),
  equipment_needed jsonb DEFAULT '[]'::jsonb,
  instructions jsonb DEFAULT '[]'::jsonb,
  day_of_week integer CHECK (day_of_week >= 0 AND day_of_week <= 6),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workout plans"
  ON workout_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout plans"
  ON workout_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout plans"
  ON workout_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout plans"
  ON workout_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create diet_plans table
CREATE TABLE IF NOT EXISTS diet_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'post_workout')),
  meal_name text NOT NULL,
  description text,
  suggested_time text,
  calories integer,
  protein_grams numeric,
  carbs_grams numeric,
  fats_grams numeric,
  foods jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own diet plans"
  ON diet_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diet plans"
  ON diet_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diet plans"
  ON diet_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own diet plans"
  ON diet_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create daily_tasks table
CREATE TABLE IF NOT EXISTS daily_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  task_date date NOT NULL DEFAULT CURRENT_DATE,
  task_type text NOT NULL CHECK (task_type IN ('workout', 'meal', 'hydration', 'sleep', 'habit')),
  title text NOT NULL,
  description text,
  target_value text,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily tasks"
  ON daily_tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily tasks"
  ON daily_tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily tasks"
  ON daily_tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily tasks"
  ON daily_tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create weight_logs table
CREATE TABLE IF NOT EXISTS weight_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  weight numeric NOT NULL,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weight logs"
  ON weight_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight logs"
  ON weight_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight logs"
  ON weight_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight logs"
  ON weight_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create sleep_schedules table
CREATE TABLE IF NOT EXISTS sleep_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  bedtime text NOT NULL,
  wake_time text NOT NULL,
  target_hours numeric NOT NULL DEFAULT 8,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sleep_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sleep schedules"
  ON sleep_schedules FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sleep schedules"
  ON sleep_schedules FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sleep schedules"
  ON sleep_schedules FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sleep schedules"
  ON sleep_schedules FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_active ON user_goals(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_medical_conditions_user_id ON user_medical_conditions(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_locations_user_id ON user_exercise_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_plans_user_id ON workout_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_diet_plans_user_id ON diet_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_date ON daily_tasks(user_id, task_date);
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date ON weight_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_sleep_schedules_user_id ON sleep_schedules(user_id);