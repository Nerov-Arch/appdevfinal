# Fitness App

A comprehensive, research-based mobile fitness application that generates personalized workout routines, nutrition plans, and daily tasks based on your fitness goals and medical conditions.

## Features

### Core Functionality

#### 1. Personalized Fitness Plans
- Automatically generates workout routines based on your goals
- Adapts exercises for medical conditions (asthma, diabetes, etc.)
- Multiple exercise location support (gym, home, outdoors)
- Research-based approach following ACSM guidelines

#### 2. Nutrition & Diet Planning
- Personalized meal plans with macro tracking
- Meal timing recommendations
- Protein calculations for muscle gain (1.6-2.2g/kg body weight)
- Calorie targets for weight loss (500 cal deficit)

#### 3. Daily Task Management
- Interactive checklist for workouts, meals, and habits
- Progress tracking with completion percentages
- Hydration and sleep reminders
- Task completion history

#### 4. Progress Tracking
- Weight logging and visualization
- Interactive weight progress graph
- Weight change statistics
- Task completion analytics
- Goal tracking and milestones

#### 5. Sleep Optimization
- Personalized sleep schedules
- Target sleep hours based on goals
- Bedtime and wake time recommendations

## App Structure

### Screens

#### Authentication (index.tsx)
- Sign up and sign in functionality
- Email/password authentication via Supabase
- Clean, mobile-first design

#### Onboarding (onboarding.tsx)
- 4-step setup wizard
- Collects user information (age, height, weight, target)
- Fitness goal selection (weight loss, muscle gain, both)
- Medical condition selection
- Multiple exercise location selection
- Automatically generates personalized plans

#### Dashboard (tabs/index.tsx)
- Today's tasks and checklists
- Progress overview
- Task completion tracking
- Quick stats display

#### Plans (tabs/recommendations.tsx)
- Workout plans with detailed instructions
- Nutrition plans with macros and meal timing
- Sleep schedule recommendations
- Research citations and information

#### Progress (tabs/progress.tsx)
- Weight tracking with graph visualization
- Add new weight entries
- View weight history
- Task completion statistics

## Research Foundation

All fitness recommendations are based on peer-reviewed research:

### Exercise Guidelines
- **ACSM**: 150-300 minutes moderate aerobic activity weekly
- **Resistance Training**: 2-3 days per week, major muscle groups
- **Progressive Overload**: Gradual increases in training volume

### Nutrition Science
- **ISSN**: 1.6-2.2g protein/kg body weight for muscle gain
- **CDC**: 500 calorie deficit for safe weight loss (0.5-1kg/week)
- **Macronutrient Distribution**: Evidence-based ratios

### Medical Adaptations
- **Asthma**: Modified intensity, extended warm-ups, breathing focus
- Safe exercise protocols for various conditions
- Appropriate rest periods and intensity adjustments

See `RESEARCH_CITATIONS.md` for complete scientific references.

## Technical Stack

### Frontend
- **Framework**: React Native with Expo
- **Navigation**: Expo Router with tab-based navigation
- **UI Components**: Custom components with React Native
- **Icons**: Lucide React Native

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time Data**: Supabase real-time subscriptions

### Data Models

#### Database Tables
- `user_profiles` - User basic information and physical stats
- `user_goals` - Fitness goals (weight loss, muscle gain, both)
- `user_medical_conditions` - Health conditions affecting workouts
- `user_exercise_locations` - Preferred workout locations
- `workout_plans` - Generated workout routines
- `diet_plans` - Meal plans with nutritional information
- `daily_tasks` - Daily checklist items
- `weight_logs` - Weight tracking history
- `sleep_schedules` - Sleep recommendations

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Expo CLI
- Supabase account (already configured)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open the app in Expo Go or your preferred simulator

### Environment Variables

The app uses Supabase for backend services. Environment variables are pre-configured in `.env`:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Usage Guide

### First Time Setup

1. **Sign Up**: Create an account with email and password
2. **Complete Onboarding**:
   - Enter your age, height, current weight, and target weight
   - Select your fitness goals
   - Choose any medical conditions
   - Pick your exercise locations
3. **Review Your Plans**: Check the generated workouts and meal plans
4. **Start Tracking**: Complete daily tasks and log your weight

### Daily Workflow

1. **Check Dashboard**: View today's tasks and progress
2. **Complete Tasks**: Mark off workouts, meals, and habits as you complete them
3. **Review Plans**: Reference workout instructions and meal suggestions
4. **Log Weight**: Update your weight regularly to track progress
5. **Monitor Progress**: View graphs and statistics

### Updating Goals

To change your fitness goals or update information:
1. Complete current goals
2. Sign out and sign in again
3. Go through onboarding with new information
4. New plans will be generated automatically

## Key Features Explained

### Automatic Plan Generation

The app uses a sophisticated fitness engine (`lib/fitnessEngine.ts`) that:
- Calculates BMR and TDEE for calorie needs
- Generates weekly workout schedules
- Creates meal plans with proper macro distribution
- Adjusts for medical conditions (e.g., asthma requires moderate intensity)
- Combines multiple goals intelligently

### Medical Condition Safety

When asthma is selected:
- Workout intensity reduced to moderate
- Extended warm-up and cool-down periods
- Breathing exercises included
- Longer rest intervals between sets
- No high-intensity interval training

### Multi-Goal Support

When both weight loss and muscle gain are selected:
- Combines cardio and strength training
- Maintains higher protein intake
- Smaller calorie deficit to preserve muscle
- Balanced workout schedule

### Progress Visualization

- Weight graph shows trend over time
- Data points connected with lines
- Y-axis scales automatically
- X-axis shows date range
- Visual feedback on weight changes

## Mobile-First Design

The app features:
- Clean, modern interface
- Touch-friendly buttons and controls
- Smooth scrolling and animations
- Proper spacing and typography
- Readable text on all screens
- Intuitive navigation with bottom tabs

## Development

### File Structure

```
app/
├── (tabs)/           # Tab-based navigation
│   ├── index.tsx     # Dashboard
│   ├── recommendations.tsx  # Plans
│   └── progress.tsx  # Progress tracking
├── index.tsx         # Authentication
├── onboarding.tsx    # Setup wizard
└── _layout.tsx       # Root layout

lib/
├── supabase.ts       # Supabase client
└── fitnessEngine.ts  # Plan generation logic

contexts/
└── AuthContext.tsx   # Authentication state

components/
└── (reusable components)
```

### Running Tests

```bash
npm run typecheck    # TypeScript validation
npm run lint         # Linting
```

## Future Enhancements

Potential features for future versions:
- Social features and community support
- Exercise video demonstrations
- Meal photo logging
- Integration with fitness trackers
- Custom exercise creation
- Workout history and analytics
- Recipe suggestions
- Shopping list generation
- Progress photos
- Achievement badges

## Support

For issues or questions:
1. Check the research citations document
2. Review the database schema
3. Examine the fitness engine logic
4. Check Supabase logs for backend issues

## License

This project is for educational purposes as part of an App Development course.

## Credits

Built with research from:
- American College of Sports Medicine (ACSM)
- International Society of Sports Nutrition (ISSN)
- Centers for Disease Control (CDC)
- National Sleep Foundation
- American Lung Association

---

**Version**: 1.0.0
**Last Updated**: January 2026
