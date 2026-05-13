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
import { archiveTasks, getTasks } from './services/api';
import { GetTaskInfo } from './services/types'; // ← ИСПРАВЛЕНО (было Task)

const { width } = Dimensions.get('window');

export default function ArchiveScreen() {
  const router = useRouter();
  const [completedTasks, setCompletedTasks] = useState<GetTaskInfo[]>([]);  // ← ИСПРАВЛЕНО
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState(false);

  // Загружаем только выполненные задачи
  const loadCompletedTasks = async () => {
    setLoading(true);
    try {
      const response = await getTasks();
      const allTasks = response.data;
      // Фильтруем выполненные задачи
      const completed = allTasks.filter((task: GetTaskInfo) => task.is_completed === true);  // ← ИСПРАВЛЕНО
      setCompletedTasks(completed);
    } catch (error: any) {
      console.error('Load completed tasks error:', error);
      if (error.response?.status === 401) {
        Alert.alert('Ошибка', 'Сессия истекла, войдите снова');
        router.replace('/login');
      } else {
        Alert.alert('Ошибка', 'Не удалось загрузить архив');
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCompletedTasks();
    }, [])
  );

  const handleArchiveAll = async () => {
    if (completedTasks.length === 0) {
      Alert.alert('Архив пуст', 'Нет выполненных задач для архивации');
      return;
    }

    Alert.alert(
      'Архивация',
      `Вы действительно хотите удалить ${completedTasks.length} выполненных задач?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            setArchiving(true);
            try {
              const result = await archiveTasks();
              Alert.alert(
                'Успех', 
                `Удалено ${result.data.deleted_count} задач`
              );
              await loadCompletedTasks();
            } catch (error: any) {
              console.error('Archive error:', error);
              Alert.alert('Ошибка', 'Не удалось архивировать задачи');
            } finally {
              setArchiving(false);
            }
          }
        }
      ]
    );
  };

  const getTaskPoints = (task: GetTaskInfo) => {  // ← ИСПРАВЛЕНО
    switch (task.priority) {
      case 3: return 15;
      case 2: return 10;
      case 1: return 5;
      default: return 10;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Архив задач</Text>
          {completedTasks.length > 0 && (
            <TouchableOpacity 
              onPress={handleArchiveAll} 
              disabled={archiving}
              style={styles.archiveButton}
            >
              {archiving ? (
                <ActivityIndicator color="#DC5E60" size="small" />
              ) : (
                <Text style={styles.archiveButtonText}>Очистить всё</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <ScrollView 
          contentContainerStyle={{ alignItems: 'center', paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#FF8DA1" style={{ marginTop: 50 }} />
          ) : completedTasks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="archive-outline" size={80} color="#C4A1B0" />
              <Text style={styles.emptyText}>Архив пуст</Text>
              <Text style={styles.emptySubtext}>
                Выполненные задачи будут появляться здесь
              </Text>
            </View>
          ) : (
            completedTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskCard}
                onPress={() => router.push({ pathname: '/task', params: { id: task.id } })}
              >
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsBadgeText}>{getTaskPoints(task)}</Text>
                </View>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskSubtitle}>
                    Завершена: {formatDate(task.created_at)}
                  </Text>
                </View>
                <View style={styles.checkCircleDone}>
                  <Ionicons name="checkmark" size={18} color="#FF8DA1" />
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>

      <View style={styles.bottomNavContainer}>
        <View style={styles.navBar}>
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => router.push('/main')}
          >
            <Ionicons name="home-outline" size={28} color="#C4A1B0" />
          </TouchableOpacity>
          <View style={{ width: 60 }} />
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => router.push('/profile')}
          >
            <Ionicons name="person-outline" size={28} color="#C4A1B0" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  archiveButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#FFF0F5',
    borderRadius: 20,
  },
  archiveButtonText: {
    color: '#DC5E60',
    fontSize: 14,
    fontWeight: '500',
  },
  taskCard: {
    width: width * 0.9,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  pointsBadge: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: '#DC5E60',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  pointsBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  taskSubtitle: { fontSize: 12, color: '#A0A0A0', marginTop: 3 },
  checkCircleDone: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFF0F5',
    borderWidth: 2,
    borderColor: '#FFBDD2',
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
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
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
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