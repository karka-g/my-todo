import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
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
import Svg, { Circle } from 'react-native-svg';
import { completeTask, getMe, getTasks } from './services/api';
import { Task, User } from './services/types';

const { width } = Dimensions.get('window');

// Функция для форматирования даты
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Получение баллов за задачу
const getTaskPoints = (priority: number) => {
  switch (priority) {
    case 3: return 15;
    case 2: return 10;
    case 1: return 5;
    default: return 10;
  }
};

// Цвет бейджа в зависимости от баллов
const getPointsColor = (points: number) => {
  if (points >= 15) return '#DC5E60';
  if (points >= 10) return '#F0C846';
  return '#93C46C';
};

export default function MainScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<number | null>(null);

  // Загрузка пользователя
  const loadUser = async () => {
    try {
      const response = await getMe();
      setUser(response.data);
    } catch (error: any) {
      console.error('Load user error:', error);
      if (error.response?.status === 401) {
        router.replace('/login');
      }
    }
  };

  // Загрузка задач
  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await getTasks();
      setTasks(response.data);
    } catch (error: any) {
      console.error('Load tasks error:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить задачи');
      if (error.response?.status === 401) {
        router.replace('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Обновляем при каждом открытии экрана
  useFocusEffect(
    useCallback(() => {
      loadUser();
      loadTasks();
    }, [])
  );

  // Переключение статуса задачи (выполнить/отменить)
  const handleToggleTask = async (task: Task) => {
    if (!task.is_completed) {
      // Выполняем задачу
      setCompletingId(task.id);
      try {
        await completeTask(task.id);
        await loadTasks(); // обновляем список
      } catch (error: any) {
        console.error('Complete task error:', error);
        Alert.alert('Ошибка', 'Не удалось выполнить задачу');
      } finally {
        setCompletingId(null);
      }
    } else {
      // Отменить выполнение? (если нужно - добавьте API эндпоинт)
      Alert.alert('Инфо', 'Задача уже выполнена');
    }
  };

  // Группировка задач по датам
  const groupedTasks = tasks.reduce((groups: Record<string, Task[]>, task) => {
    const date = formatDate(task.deadline);
    if (!groups[date]) groups[date] = [];
    groups[date].push(task);
    return groups;
  }, {});

  // Сортировка дат (от ближайшей к дальней)
  const sortedDates = Object.keys(groupedTasks).sort((a, b) => {
    const dateA = new Date(a.split('.').reverse().join('-'));
    const dateB = new Date(b.split('.').reverse().join('-'));
    return dateA.getTime() - dateB.getTime();
  });

  // Подсчет баллов
  const totalPoints = tasks
    .filter(t => t.is_completed)
    .reduce((sum, t) => sum + getTaskPoints(t.priority), 0);
  
  const maxPoints = 100; // Максимум баллов для прогресс-бара
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(totalPoints, maxPoints) / maxPoints;
  const strokeDashoffset = circumference * (1 - progress);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8DA1" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.content}>
        <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 120 }}>

          {/* Шапка */}
          <View style={styles.header}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person-outline" size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.greeting}>Привет!</Text>
              <Text style={styles.userName}>{user?.username || 'Пользователь'}</Text>
            </View>
          </View>

          {/* Карточка баллов */}
          <View style={styles.pointsCard}>
            <Text style={styles.pointsLabel}>Ваши баллы</Text>
            <View style={styles.progressContainer}>
              <Svg width={70} height={70}>
                <Circle
                  cx={35} cy={35} r={radius}
                  stroke="#FFD7E3"
                  strokeWidth={6}
                  fill="none"
                />
                <Circle
                  cx={35} cy={35} r={radius}
                  stroke="#FF8DA1"
                  strokeWidth={6}
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  rotation="-90"
                  origin="35, 35"
                />
              </Svg>
              <Text style={styles.pointsNumber}>{totalPoints}</Text>
            </View>
          </View>

          {/* Список задач по датам */}
          {sortedDates.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="checkbox-outline" size={80} color="#C4A1B0" />
              <Text style={styles.emptyText}>Нет задач</Text>
              <Text style={styles.emptySubtext}>
                Нажмите на кнопку + чтобы добавить задачу
              </Text>
            </View>
          ) : (
            sortedDates.map((date) => (
              <View key={date} style={styles.dateGroup}>
                <View style={styles.dateRow}>
                  <Text style={styles.dateText}>{date}</Text>
                  <View style={styles.taskCountBadge}>
                    <Text style={styles.taskCountText}>{groupedTasks[date].length}</Text>
                  </View>
                </View>

                {groupedTasks[date].map((task) => {
                  const points = getTaskPoints(task.priority);
                  return (
                    <TouchableOpacity
                      key={task.id}
                      style={styles.taskCard}
                      onPress={() => router.push({ pathname: '/task', params: { id: task.id } })}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.pointsBadge, { backgroundColor: getPointsColor(points) }]}>
                        <Text style={styles.pointsBadgeText}>{points}</Text>
                      </View>
                      <View style={styles.taskInfo}>
                        <Text style={[styles.taskTitle, task.is_completed && styles.completedText]}>
                          {task.title}
                        </Text>
                        <Text style={styles.taskSubtitle}>Нажмите для деталей</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.checkCircle, task.is_completed && styles.checkCircleDone]}
                        onPress={() => handleToggleTask(task)}
                        disabled={completingId === task.id}
                      >
                        {completingId === task.id ? (
                          <ActivityIndicator size="small" color="#FF8DA1" />
                        ) : task.is_completed ? (
                          <Ionicons name="checkmark" size={18} color="#FF8DA1" />
                        ) : null}
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))
          )}

        </ScrollView>
      </SafeAreaView>

      {/* Навигация */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/archive')}>
            <Ionicons name="archive-outline" size={28} color="#C4A1B0" />
          </TouchableOpacity>
          <View style={{ width: 60 }} />
          <TouchableOpacity 
            testID="profile-button" 
            style={styles.navItem} 
            onPress={() => router.push('/profile')}
          >
            <Ionicons name="person-outline" size={28} color="#C4A1B0" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          testID="add-task-button"
          style={styles.floatingButton}
          onPress={() => router.push('/add-task')}
        >
          <Ionicons name="add" size={35} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FFD7E3' },
  content: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFD7E3' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFBDD2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: { fontSize: 14, color: '#333' },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  pointsCard: {
    width: width * 0.9,
    backgroundColor: '#FFBDD2',
    borderRadius: 25,
    padding: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  pointsLabel: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  progressContainer: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsNumber: {
    position: 'absolute',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF8DA1',
  },
  dateGroup: { width: width * 0.9, marginBottom: 15 },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  dateText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  taskCountBadge: {
    backgroundColor: '#FF8DA1',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  taskCountText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pointsBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  pointsBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  completedText: { textDecorationLine: 'line-through', color: '#A0A0A0' },
  taskSubtitle: { fontSize: 13, color: '#A0A0A0', marginTop: 3 },
  checkCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FFBDD2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleDone: { backgroundColor: '#FFF0F5' },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 110,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  navBar: {
    width: '94%',
    height: 75,
    backgroundColor: '#FFF1F5',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  floatingButton: {
    position: 'absolute',
    top: 5,
    backgroundColor: '#FFBDD2',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  navItem: { padding: 10 },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#C4A1B0',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#C4A1B0',
    marginTop: 8,
    textAlign: 'center',
  },
});