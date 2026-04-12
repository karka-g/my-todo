import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions, SafeAreaView, ScrollView,
    StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

const mockTasks = [
  { id: 1, title: 'Personal Project', points: 15, date: '24.02.2026', done: true },
  { id: 2, title: 'Personal Project', points: 10, date: '24.02.2026', done: false },
  { id: 3, title: 'Personal Project', points: 5, date: '24.02.2026', done: false },
  { id: 4, title: 'Personal Project', points: 15, date: '25.02.2026', done: false },
  { id: 5, title: 'Personal Project', points: 15, date: '25.02.2026', done: false },
];

const getPointsColor = (points: number) => {
  if (points >= 15) return '#DC5E60';
  if (points >= 10) return '#F0C846';
  return '#93C46C';
};

export default function MainScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState(mockTasks);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const groupedTasks = tasks.reduce((groups: any, task) => {
    if (!groups[task.date]) groups[task.date] = [];
    groups[task.date].push(task);
    return groups;
  }, {});

  const totalPoints = tasks.filter(t => t.done).reduce((sum, t) => sum + t.points, 0);
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(totalPoints, 100) / 100;
  const strokeDashoffset = circumference * (1 - progress);

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
              <Text style={styles.userName}>Иван Иванов</Text>
            </View>
          </View>

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
          {Object.keys(groupedTasks).map((date) => (
            <View key={date} style={styles.dateGroup}>
              <View style={styles.dateRow}>
                <Text style={styles.dateText}>{date}</Text>
                <View style={styles.taskCountBadge}>
                  <Text style={styles.taskCountText}>{groupedTasks[date].length}</Text>
                </View>
              </View>

              {groupedTasks[date].map((task: any) => (
                <View key={task.id} style={styles.taskCard}>
                  <View style={[styles.pointsBadge, { backgroundColor: getPointsColor(task.points) }]}>
                    <Text style={styles.pointsBadgeText}>{task.points}</Text>
                  </View>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskSubtitle}>Перейти к задаче</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.checkCircle, task.done && styles.checkCircleDone]}
                    onPress={() => toggleTask(task.id)}
                  >
                    {task.done && <Ionicons name="checkmark" size={18} color="#FF8DA1" />}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))}

        </ScrollView>
      </SafeAreaView>

      <View style={styles.bottomNavContainer}>
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/main')}>
            <Ionicons name="home" size={28} color="#FF8DA1" />
          </TouchableOpacity>
          <View style={{ width: 60 }} />
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
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
});