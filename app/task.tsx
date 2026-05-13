import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { completeTask, deleteTask, getTasks } from './services/api';
import { Task } from './services/types';

const { width } = Dimensions.get('window');

export default function TaskScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = parseInt(id);
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Загрузка задачи
  const loadTask = async () => {
    setLoading(true);
    try {
      const response = await getTasks();
      const foundTask = response.data.find((t: Task) => t.id === taskId);
      if (foundTask) {
        setTask(foundTask);
      } else {
        Alert.alert('Ошибка', 'Задача не найдена');
        router.back();
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить задачу');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      loadTask();
    }
  }, [taskId]);

  // Выполнить задачу
  const handleComplete = async () => {
    if (task?.is_completed) {
      Alert.alert('Инфо', 'Задача уже выполнена');
      return;
    }
    
    setUpdating(true);
    try {
      await completeTask(taskId);
      Alert.alert('Успех', 'Задача выполнена!');
      await loadTask();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось выполнить задачу');
    } finally {
      setUpdating(false);
    }
  };

  // Удалить задачу
  const handleDelete = async () => {
    Alert.alert(
      'Удаление',
      'Вы уверены, что хотите удалить задачу?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            setUpdating(true);
            try {
              await deleteTask(taskId);
              Alert.alert('Успех', 'Задача удалена');
              router.back();
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось удалить задачу');
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 3: return 'Очень важно 🔴';
      case 2: return 'Важно 🟡';
      case 1: return 'Не очень важно 🟢';
      default: return 'Важно';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return '#DC5E60';
      case 2: return '#F0C846';
      case 1: return '#93C46C';
      default: return '#F0C846';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8DA1" />
      </View>
    );
  }

  if (!task) {
    return null;
  }

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.content}>
        <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}>
          
          {/* Кнопка назад */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>

          {/* Карточка задачи */}
          <View style={styles.taskCard}>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
              <Text style={styles.priorityText}>{getPriorityText(task.priority)}</Text>
            </View>

            <Text style={styles.title}>{task.title}</Text>
            
            {task.description ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Описание</Text>
                <Text style={styles.description}>{task.description}</Text>
              </View>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Дедлайн</Text>
              <Text style={styles.dateText}>{formatDate(task.deadline)}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Создана</Text>
              <Text style={styles.dateText}>{formatDate(task.created_at)}</Text>
            </View>

            {task.completed_at && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Выполнена</Text>
                <Text style={styles.dateText}>{formatDate(task.completed_at)}</Text>
              </View>
            )}

            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Статус:</Text>
              <Text style={[styles.statusValue, task.is_completed && styles.statusCompleted]}>
                {task.is_completed ? '✅ Выполнена' : '⏳ В процессе'}
              </Text>
            </View>
          </View>

          {/* Кнопки действий */}
          <View style={styles.buttonsContainer}>
            {!task.is_completed && (
              <TouchableOpacity 
                style={[styles.button, styles.completeButton]} 
                onPress={handleComplete}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>✓ Выполнить</Text>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.button, styles.deleteButton]} 
              onPress={handleDelete}
              disabled={updating}
            >
              <Text style={[styles.buttonText, styles.deleteButtonText]}>✗ Удалить</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FFD7E3' },
  content: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFD7E3' },
  backButton: { alignSelf: 'flex-start', marginTop: 20, marginBottom: 20, marginLeft: 20 },
  taskCard: {
    width: width * 0.9,
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  priorityText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  section: { marginBottom: 15 },
  sectionTitle: { fontSize: 14, color: '#A0A0A0', marginBottom: 5 },
  description: { fontSize: 16, color: '#333', lineHeight: 22 },
  dateText: { fontSize: 16, color: '#333' },
  statusContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0'
  },
  statusLabel: { fontSize: 16, color: '#333', marginRight: 10 },
  statusValue: { fontSize: 16, fontWeight: 'bold', color: '#F0C846' },
  statusCompleted: { color: '#93C46C', textDecorationLine: 'line-through' },
  buttonsContainer: { width: width * 0.9, gap: 10 },
  button: {
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButton: { backgroundColor: '#93C46C' },
  deleteButton: { backgroundColor: '#FFF0F5', borderWidth: 1, borderColor: '#DC5E60' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  deleteButtonText: { color: '#DC5E60' },
});