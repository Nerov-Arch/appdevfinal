import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { TrendingDown, TrendingUp, Plus, Target, Calendar } from 'lucide-react-native';

interface WeightLog {
  id: string;
  weight: number;
  log_date: string;
  notes?: string;
}

interface Stats {
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
  currentWeight?: number;
  startWeight?: number;
  weightChange?: number;
  targetWeight?: number;
}

export default function ProgressScreen() {
  const { user } = useAuth();
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [stats, setStats] = useState<Stats>({
    completedTasks: 0,
    totalTasks: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const fetchData = async () => {
    try {
      const { data: logsData } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', user!.id)
        .order('log_date', { ascending: true });

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('target_weight')
        .eq('id', user!.id)
        .maybeSingle();

      const { data: tasksData } = await supabase
        .from('daily_tasks')
        .select('is_completed')
        .eq('user_id', user!.id);

      if (logsData) {
        setWeightLogs(logsData);

        if (logsData.length > 0) {
          const startWeight = logsData[0].weight;
          const currentWeight = logsData[logsData.length - 1].weight;
          const weightChange = currentWeight - startWeight;

          setStats((prev) => ({
            ...prev,
            currentWeight,
            startWeight,
            weightChange,
            targetWeight: profileData?.target_weight,
          }));
        }
      }

      if (tasksData) {
        const completed = tasksData.filter((t) => t.is_completed).length;
        const total = tasksData.length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

        setStats((prev) => ({
          ...prev,
          completedTasks: completed,
          totalTasks: total,
          completionRate: rate,
        }));
      }
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

  const handleAddWeight = async () => {
    if (!newWeight) {
      Alert.alert('Error', 'Please enter your weight');
      return;
    }

    try {
      const { error } = await supabase.from('weight_logs').insert({
        user_id: user!.id,
        weight: parseFloat(newWeight),
        log_date: new Date().toISOString().split('T')[0],
        notes: newNotes || null,
      });

      if (error) throw error;

      await supabase
        .from('user_profiles')
        .update({ current_weight: parseFloat(newWeight) })
        .eq('id', user!.id);

      setNewWeight('');
      setNewNotes('');
      setShowAddWeight(false);
      fetchData();
      Alert.alert('Success', 'Weight logged successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const renderWeightGraph = () => {
    if (weightLogs.length < 2) {
      return (
        <View style={styles.emptyGraph}>
          <Text style={styles.emptyGraphText}>
            Log more weights to see your progress graph
          </Text>
        </View>
      );
    }

    const maxWeight = Math.max(...weightLogs.map((log) => log.weight));
    const minWeight = Math.min(...weightLogs.map((log) => log.weight));
    const range = maxWeight - minWeight || 1;
    const graphWidth = Dimensions.get('window').width - 64;
    const graphHeight = 200;
    const padding = 20;

    return (
      <View style={styles.graph}>
        <View style={[styles.graphContainer, { height: graphHeight }]}>
          <View style={styles.yAxis}>
            <Text style={styles.axisLabel}>{maxWeight.toFixed(1)}</Text>
            <Text style={styles.axisLabel}>
              {((maxWeight + minWeight) / 2).toFixed(1)}
            </Text>
            <Text style={styles.axisLabel}>{minWeight.toFixed(1)}</Text>
          </View>

          <View style={[styles.plotArea, { width: graphWidth - 60 }]}>
            {weightLogs.map((log, index) => {
              if (index === 0) return null;

              const prevLog = weightLogs[index - 1];
              const x1 = ((index - 1) / (weightLogs.length - 1)) * (graphWidth - 80);
              const y1 =
                graphHeight -
                padding -
                ((prevLog.weight - minWeight) / range) * (graphHeight - 2 * padding);
              const x2 = (index / (weightLogs.length - 1)) * (graphWidth - 80);
              const y2 =
                graphHeight -
                padding -
                ((log.weight - minWeight) / range) * (graphHeight - 2 * padding);

              return (
                <View
                  key={log.id}
                  style={{
                    position: 'absolute',
                    left: x1,
                    top: y1,
                    width: Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2),
                    height: 3,
                    backgroundColor: '#2563eb',
                    transform: [
                      {
                        rotate: `${Math.atan2(y2 - y1, x2 - x1)}rad`,
                      },
                    ],
                  }}
                />
              );
            })}

            {weightLogs.map((log, index) => {
              const x = (index / (weightLogs.length - 1)) * (graphWidth - 80);
              const y =
                graphHeight -
                padding -
                ((log.weight - minWeight) / range) * (graphHeight - 2 * padding);

              return (
                <View
                  key={`point-${log.id}`}
                  style={[
                    styles.dataPoint,
                    {
                      left: x - 4,
                      top: y - 4,
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>

        <View style={styles.xAxis}>
          {weightLogs.length > 0 && (
            <>
              <Text style={styles.axisLabel}>
                {new Date(weightLogs[0].log_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
              <Text style={styles.axisLabel}>
                {new Date(
                  weightLogs[weightLogs.length - 1].log_date
                ).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>Track your fitness journey</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddWeight(!showAddWeight)}
        >
          <Plus size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {showAddWeight && (
          <View style={styles.addWeightCard}>
            <Text style={styles.addWeightTitle}>Log Weight</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter weight (kg)"
              value={newWeight}
              onChangeText={setNewWeight}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Notes (optional)"
              value={newNotes}
              onChangeText={setNewNotes}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddWeight(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddWeight}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              {stats.weightChange !== undefined && stats.weightChange < 0 ? (
                <TrendingDown size={24} color="#10b981" />
              ) : (
                <TrendingUp size={24} color="#2563eb" />
              )}
            </View>
            <Text style={styles.statValue}>
              {stats.currentWeight?.toFixed(1) || '0.0'} kg
            </Text>
            <Text style={styles.statLabel}>Current Weight</Text>
            {stats.weightChange !== undefined && (
              <Text
                style={[
                  styles.statChange,
                  {
                    color: stats.weightChange < 0 ? '#10b981' : '#ef4444',
                  },
                ]}
              >
                {stats.weightChange > 0 ? '+' : ''}
                {stats.weightChange.toFixed(1)} kg
              </Text>
            )}
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Target size={24} color="#f59e0b" />
            </View>
            <Text style={styles.statValue}>
              {stats.targetWeight?.toFixed(1) || 'N/A'} kg
            </Text>
            <Text style={styles.statLabel}>Target Weight</Text>
            {stats.currentWeight && stats.targetWeight && (
              <Text style={styles.statChange}>
                {Math.abs(stats.currentWeight - stats.targetWeight).toFixed(1)}{' '}
                kg to go
              </Text>
            )}
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Calendar size={20} color="#2563eb" />
            <Text style={styles.statCardTitle}>Task Completion</Text>
          </View>
          <View style={styles.completionBar}>
            <View
              style={[
                styles.completionFill,
                { width: `${stats.completionRate}%` },
              ]}
            />
          </View>
          <View style={styles.completionStats}>
            <Text style={styles.completionText}>
              {stats.completedTasks} of {stats.totalTasks} tasks completed
            </Text>
            <Text style={styles.completionPercentage}>
              {stats.completionRate}%
            </Text>
          </View>
        </View>

        <View style={styles.graphCard}>
          <Text style={styles.graphTitle}>Weight Progress</Text>
          {renderWeightGraph()}
        </View>

        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>Weight History</Text>
          {weightLogs.length === 0 ? (
            <Text style={styles.emptyText}>
              No weight logs yet. Add your first entry!
            </Text>
          ) : (
            weightLogs
              .slice()
              .reverse()
              .map((log) => (
                <View key={log.id} style={styles.historyItem}>
                  <View>
                    <Text style={styles.historyWeight}>
                      {log.weight.toFixed(1)} kg
                    </Text>
                    <Text style={styles.historyDate}>
                      {new Date(log.log_date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                    {log.notes && (
                      <Text style={styles.historyNotes}>{log.notes}</Text>
                    )}
                  </View>
                </View>
              ))
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  addWeightCard: {
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
  addWeightTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
    color: '#111827',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  statChange: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  completionBar: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  completionFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 6,
  },
  completionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completionText: {
    fontSize: 12,
    color: '#6b7280',
  },
  completionPercentage: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563eb',
  },
  graphCard: {
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
  graphTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  graph: {
    width: '100%',
  },
  graphContainer: {
    flexDirection: 'row',
    position: 'relative',
  },
  yAxis: {
    width: 50,
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  axisLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  plotArea: {
    position: 'relative',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginLeft: 50,
  },
  emptyGraph: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  emptyGraphText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  historyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  historyWeight: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  historyNotes: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 4,
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
