import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, Circle, LogOut, Calendar, Target } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface DailyTask {
  id: string;
  task_type: string;
  title: string;
  description: string;
  target_value: string;
  is_completed: boolean;
}

interface UserGoal {
  goal_type: string;
}

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: tasksData } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_id', user!.id)
        .eq('task_date', today)
        .order('created_at');

      const { data: goalsData } = await supabase
        .from('user_goals')
        .select('goal_type')
        .eq('user_id', user!.id)
        .eq('is_active', true);

      if (tasksData) setTasks(tasksData);
      if (goalsData) setGoals(goalsData);
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

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('daily_tasks')
        .update({
          is_completed: !currentStatus,
          completed_at: !currentStatus ? new Date().toISOString() : null,
        })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(
        tasks.map((task) =>
          task.id === taskId
            ? { ...task, is_completed: !currentStatus }
            : task
        )
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const completedCount = tasks.filter((t) => t.is_completed).length;
  const totalCount = tasks.length;
  const progressPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.task_type]) {
      acc[task.task_type] = [];
    }
    acc[task.task_type].push(task);
    return acc;
  }, {} as Record<string, DailyTask[]>);

  const getGoalText = () => {
    if (goals.length === 0) return 'No goals set';
    return goals.map((g) => {
      if (g.goal_type === 'weight_loss') return 'Weight Loss';
      if (g.goal_type === 'muscle_gain') return 'Muscle Gain';
      return 'Weight Loss & Muscle Gain';
    }).join(', ');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello!</Text>
          <Text style={styles.subGreeting}>Let's crush your goals today</Text>
        </View>
        <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
          <LogOut size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Target size={24} color="#2563eb" />
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Your Goal</Text>
              <Text style={styles.statValue}>{getGoalText()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Today's Progress</Text>
            <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${progressPercentage}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {completedCount} of {totalCount} tasks completed
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color="#374151" />
            <Text style={styles.sectionTitle}>Today's Tasks</Text>
          </View>

          {Object.entries(groupedTasks).map(([type, typeTasks]) => (
            <View key={type} style={styles.taskGroup}>
              <Text style={styles.taskGroupTitle}>
                {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
              </Text>
              {typeTasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={styles.taskCard}
                  onPress={() => toggleTask(task.id, task.is_completed)}
                >
                  <View style={styles.taskIcon}>
                    {task.is_completed ? (
                      <CheckCircle2 size={24} color="#10b981" />
                    ) : (
                      <Circle size={24} color="#d1d5db" />
                    )}
                  </View>
                  <View style={styles.taskContent}>
                    <Text
                      style={[
                        styles.taskTitle,
                        task.is_completed && styles.taskTitleCompleted,
                      ]}
                    >
                      {task.title}
                    </Text>
                    <Text style={styles.taskDescription}>
                      {task.description}
                    </Text>
                    {task.target_value && (
                      <Text style={styles.taskTarget}>
                        Target: {task.target_value}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {totalCount === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No tasks for today. Check back tomorrow!
              </Text>
            </View>
          )}
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subGreeting: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  statsCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statContent: {
    marginLeft: 12,
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  progressCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563eb',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  taskGroup: {
    marginBottom: 20,
  },
  taskGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  taskCard: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  taskIcon: {
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  taskDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  taskTarget: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
