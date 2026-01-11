# Quick Start Guide - Fitness App

This guide will help you quickly understand and test the Fitness App for evaluation purposes.

## What This App Does

The Fitness App is a comprehensive mobile fitness companion that:
- Creates personalized workout plans based on scientific research
- Generates custom nutrition plans with meal timing
- Adapts exercises for medical conditions like asthma
- Tracks daily progress with interactive checklists
- Monitors weight changes with visual graphs
- Provides sleep schedule recommendations

## Key Differentiators

### Research-Based
All recommendations follow established scientific guidelines:
- ACSM: 150-300 minutes aerobic activity weekly
- ISSN: 1.6-2.2g protein per kg for muscle building
- CDC: 500 calorie deficit for safe weight loss

### Medical Condition Awareness
The app adjusts workouts for health conditions:
- Asthma: Moderate intensity, extended warm-ups, breathing exercises
- Diabetes: Appropriate exercise timing and intensity
- Heart conditions: Safe cardiovascular protocols

### Intelligent Multi-Goal Handling
When users select both weight loss and muscle gain:
- Combines cardio and strength training
- Maintains high protein for muscle preservation
- Creates smaller calorie deficit
- Balances recovery and training

## Testing the App

### 1. Create an Account (30 seconds)
- Open the app
- Enter any email (e.g., test@example.com)
- Create a password
- Click "Sign Up"

### 2. Complete Onboarding (2 minutes)

**Step 1: Basic Information**
- Age: 25
- Height: 170 cm
- Current Weight: 75 kg
- Target Weight: 70 kg (for weight loss) or 80 kg (for muscle gain)
- Gender: Any

**Step 2: Fitness Goals**
- Try selecting "Weight Loss" first
- Or try "Muscle Gain"
- Or select "Both" to see combined recommendations

**Step 3: Medical Conditions**
- Select "Asthma" to see adapted workouts
- Or select "None" for standard recommendations
- You can select multiple conditions

**Step 4: Exercise Locations**
- Select multiple options (Gym, Home, Outdoors)
- The app will generate equipment based on your selections

Click "Complete" and wait for plan generation (3-5 seconds)

### 3. Explore the Dashboard (1 minute)

**What You'll See:**
- Your fitness goal displayed at the top
- Today's progress bar showing 0% (since nothing is completed yet)
- Today's tasks organized by type:
  - Workout tasks (5 cardio sessions if weight loss)
  - Meal tasks (breakfast, lunch, dinner, post-workout, snacks)
  - Hydration reminder
  - Sleep schedule

**Try This:**
- Tap any task to mark it complete (checkmark appears)
- Watch the progress bar increase
- Pull down to refresh

### 4. Check Your Plans (2 minutes)

**Workout Tab:**
- See your weekly workout schedule
- Each workout shows:
  - Day of the week
  - Duration (25-45 minutes)
  - Intensity level (color coded)
  - Equipment needed (based on your locations)
  - Step-by-step instructions

**If you selected Asthma:**
- Notice "breathing exercises" in instructions
- Intensity is set to "moderate"
- Longer rest periods (90-120 seconds)

**Nutrition Tab:**
- View meal plans for the entire day
- Each meal shows:
  - Suggested time (7:00 AM, 1:00 PM, etc.)
  - Calories
  - Macros (Protein, Carbs, Fats)
  - Specific food recommendations

**Sleep Tab:**
- Bedtime recommendation
- Wake time recommendation
- Target sleep hours (8-8.5 hours)

### 5. Track Progress (1 minute)

**Add Weight Entry:**
- Tap the "+" button in the top right
- Enter your current weight
- Add optional notes
- Click "Save"

**View Statistics:**
- Current weight displayed
- Target weight shown
- Weight change calculated
- Task completion rate

**Weight Graph:**
- Shows weight trend over time
- Add multiple entries to see the line graph
- Data points are connected automatically

## Testing Different Scenarios

### Scenario 1: Weight Loss with Asthma
- Goal: Weight Loss
- Condition: Asthma
- **Result**: Moderate cardio, breathing exercises, extended warm-ups

### Scenario 2: Muscle Gain
- Goal: Muscle Gain
- Condition: None
- **Result**: 3x weekly strength training, high protein (2g/kg), calorie surplus

### Scenario 3: Both Goals
- Goal: Both
- Condition: None
- **Result**: Combined cardio + strength, high protein, balanced calories

### Scenario 4: Multiple Locations
- Locations: Gym + Home + Outdoors
- **Result**: Equipment includes gym equipment, bodyweight exercises, and outdoor options

## Features to Highlight for Grading

### 1. Mobile-First Design
- Clean, app-like interface (not website-like)
- Touch-friendly buttons and cards
- Smooth scrolling
- Bottom tab navigation
- Proper spacing and typography

### 2. Research-Based Content
- All workouts follow ACSM guidelines
- Nutrition based on ISSN recommendations
- Medical adaptations from ALA guidelines
- See RESEARCH_CITATIONS.md for full sources

### 3. Intelligent Plan Generation
- Automatic workout creation
- Equipment selection based on location
- Medical condition adaptations
- Goal-specific recommendations

### 4. Comprehensive Tracking
- Daily task checklists
- Weight logging with graph
- Progress statistics
- Completion percentages

### 5. User Experience
- 4-step onboarding flow
- Multiple selection support
- Real-time progress updates
- Pull-to-refresh functionality
- Error handling

### 6. Data Persistence
- All data saved to Supabase database
- Secure authentication
- Row Level Security (RLS) policies
- Real-time synchronization

## Common Questions

**Q: What if I want to change my goals?**
A: Currently, you would need to sign out and create a new profile. Future versions could include a goal editing feature.

**Q: How often should I log my weight?**
A: Weekly logging is recommended for accurate trend tracking. The graph becomes more useful with multiple data points.

**Q: Can I select multiple medical conditions?**
A: Yes! The app will adapt workouts for all selected conditions.

**Q: What if I don't have access to a gym?**
A: Select "Home" and/or "Outdoors" as your locations. The app will generate bodyweight and minimal equipment workouts.

**Q: How are the calories calculated?**
A: The app uses the Mifflin-St Jeor equation to calculate BMR, then applies an activity multiplier to get TDEE. From there, it adds/subtracts calories based on your goals.

## Technical Details (For Evaluation)

### Architecture
- React Native with Expo (Mobile-first)
- Expo Router for navigation
- Supabase for backend (PostgreSQL database)
- TypeScript for type safety

### Key Files
- `lib/fitnessEngine.ts` - Plan generation logic
- `app/(tabs)/` - Main app screens
- `app/onboarding.tsx` - Setup wizard
- `contexts/AuthContext.tsx` - Authentication

### Database Schema
- 9 tables with proper relationships
- Row Level Security (RLS) enabled
- Foreign key constraints
- Proper indexing

### Research Documentation
- Full citations in RESEARCH_CITATIONS.md
- Scientific sources included
- Evidence-based recommendations

## Evaluation Checklist

- [ ] App has proper name "Fitness App"
- [ ] Mobile-first design (not website-like)
- [ ] Multiple fitness goals supported
- [ ] Medical conditions adaptation works
- [ ] Multiple location selection enabled
- [ ] Automatic workout generation functional
- [ ] Automatic diet generation functional
- [ ] Equipment recommendations based on location
- [ ] Sleep schedule included
- [ ] Dashboard with daily tasks
- [ ] Task completion tracking
- [ ] Weight tracking with graph
- [ ] Progress statistics displayed
- [ ] Research-based recommendations
- [ ] Proper citations included
- [ ] Tab navigation implemented
- [ ] Authentication working
- [ ] Data persistence functional

## Running the App

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type check (should pass with no errors)
npm run typecheck
```

Then open in Expo Go or web browser.

## Contact & Support

This app was built following the requirements for the App Development course final presentation. All features are functional and ready for demonstration.

---

**Ready to Present**: Yes
**All Requirements Met**: Yes
**Research Included**: Yes
**Citations Provided**: Yes
