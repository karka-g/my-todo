import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { deleteUser, getMe, getTasks, updateUsername } from './services/api';
import { GetTaskInfo, GetUserInfo } from './services/types'; // ← ИСПРАВЛЕНО

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<GetUserInfo | null>(null);  // ← ИСПРАВЛЕНО
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Загрузка профиля и баллов
  const loadProfile = async () => {
    setLoading(true);
    try {
      // Загружаем пользователя
      const userResponse = await getMe();
      setUser(userResponse.data);
      setNewUsername(userResponse.data.username);
      
      // Загружаем задачи для подсчета баллов
      const tasksResponse = await getTasks();
      const tasks: GetTaskInfo[] = tasksResponse.data;  // ← ИСПРАВЛЕНО
      
      // Подсчет баллов (только выполненные задачи)
      // const points = tasks
      //   .filter(task => task.is_completed)
      //   .reduce((sum, task) => {
      //     // Приоритет: 3=15, 2=10, 1=5 баллов
      //     const taskPoints = task.priority === 3 ? 15 : task.priority === 2 ? 10 : 5;
      //     return sum + taskPoints;
      //   }, 0);
      
      // setTotalPoints(points);
      // ✅ ДОБАВЬ ЭТО (после setUser)
      setTotalPoints(userResponse.data.points || 0);
    } catch (error: any) {
      console.error('Load profile error:', error);
      if (error.response?.status === 401) {
        Alert.alert('Ошибка', 'Сессия истекла, войдите снова');
        router.replace('/login');
      } else {
        Alert.alert('Ошибка', 'Не удалось загрузить профиль');
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  // Обновление имени пользователя
  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      Alert.alert('Ошибка', 'Имя не может быть пустым');
      return;
    }

    if (newUsername.trim() === user?.username) {
      Alert.alert('Инфо', 'Имя не изменилось');
      setEditModalVisible(false);
      return;
    }

    setUpdating(true);
    try {
      await updateUsername(user!.id, newUsername.trim());
      Alert.alert('Успех', 'Имя пользователя обновлено');
      setEditModalVisible(false);
      await loadProfile(); // Обновляем данные
    } catch (error: any) {
      console.error('Update username error:', error);
      Alert.alert('Ошибка', error.response?.data?.detail || 'Не удалось обновить имя');
    } finally {
      setUpdating(false);
    }
  };

  // Удаление аккаунта
  const handleDeleteAccount = async () => {
    Alert.alert(
      'Удаление аккаунта',
      'Вы уверены? Все ваши задачи будут безвозвратно удалены.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteUser(user!.id);
              await AsyncStorage.removeItem('access_token');
              Alert.alert('Аккаунт удален', 'Ваш аккаунт был удален');
              router.replace('/');
            } catch (error: any) {
              console.error('Delete account error:', error);
              Alert.alert('Ошибка', error.response?.data?.detail || 'Не удалось удалить аккаунт');
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  // Выход из аккаунта
  const handleLogout = async () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          onPress: async () => {
            await AsyncStorage.removeItem('access_token');
            router.replace('/');
          }
        }
      ]
    );
  };

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
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person-outline" size={80} color="#fff" />
            </View>
            <TouchableOpacity 
              style={styles.addIcon} 
              onPress={() => setEditModalVisible(true)}
            >
              <Ionicons name="pencil" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.nameContainer} 
            onPress={() => setEditModalVisible(true)}
          >
            <Ionicons name="pencil-outline" size={20} color="#333" />
            <Text style={styles.userName}>{user?.username || 'Пользователь'}</Text>
          </TouchableOpacity>
          <Text style={styles.pointsText}>{totalPoints} баллов</Text>
        </View>

        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => router.push('/archive')}
        >
          <Text style={styles.menuButtonText}>Архив задач</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuButton, { marginTop: 15 }]}
          onPress={handleLogout}
        >
          <Text style={styles.menuButtonText}>Выйти</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuButton, styles.deleteButton, { marginTop: 15 }]}
          onPress={handleDeleteAccount}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator color="#DC5E60" size="small" />
          ) : (
            <Text style={styles.deleteButtonText}>Удалить аккаунт</Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>

      {/* Модальное окно для редактирования имени */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Изменить имя</Text>
            <TextInput
              style={styles.modalInput}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="Введите новое имя"
              placeholderTextColor="#999"
              autoCapitalize="none"
              editable={!updating}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
                disabled={updating}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateUsername}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Сохранить</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Нижняя навигация */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/main')}>
            <Ionicons name="home-outline" size={28} color="#C4A1B0" />
          </TouchableOpacity>
          <View style={{ width: 60 }} />
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => router.push('/archive')}
          >
            <Ionicons name="archive-outline" size={28} color="#C4A1B0" />
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
  content: { flex: 1, alignItems: 'center', paddingTop: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFD7E3' },
  profileCard: {
    width: width * 0.85,
    backgroundColor: '#FFBDD2',
    borderRadius: 45,
    paddingVertical: 45,
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarWrapper: { position: 'relative', marginBottom: 20 },
  avatarCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#FF8DA1',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFBDD2',
  },
  nameContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  userName: { fontSize: 24, color: '#333', fontWeight: '500' },
  pointsText: { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 8 },
  menuButton: {
    width: width * 0.85,
    backgroundColor: '#FFBDD2',
    height: 55,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonText: { fontSize: 18, color: '#333', fontWeight: '500' },
  deleteButton: {
    backgroundColor: '#FFF0F5',
    borderWidth: 1,
    borderColor: '#DC5E60',
  },
  deleteButtonText: { fontSize: 18, color: '#DC5E60', fontWeight: '500' },
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  navItem: { padding: 10 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.8,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  modalInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#FFBDD2',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  modalButton: {
    flex: 1,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  saveButton: {
    backgroundColor: '#FF8DA1',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});