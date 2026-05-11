import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions, SafeAreaView, ScrollView,
  StyleSheet, Text, TouchableOpacity, View
} from 'react-native';

const { width } = Dimensions.get('window');

const mockDoneTasks = [
  { id: 1, title: 'Personal Project', points: 15 },
  { id: 2, title: 'Personal Project', points: 15 },
  { id: 3, title: 'Personal Project', points: 15 },
  { id: 4, title: 'Personal Project', points: 15 },
  { id: 5, title: 'Personal Project', points: 15 },
];

export default function ArchiveScreen() {
  const router = useRouter();

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.content}>

        <Text style={styles.title}>Архив задач</Text>

        <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 120 }}>
          {mockDoneTasks.map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsBadgeText}>{task.points}</Text>
              </View>
              <View style={styles.taskInfo}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskSubtitle}>Перейти к задаче</Text>
              </View>
              <View style={styles.checkCircleDone}>
                <Ionicons name="checkmark" size={18} color="#FF8DA1" />
              </View>
            </View>
          ))}
        </ScrollView>

      </SafeAreaView>

      <View style={styles.bottomNavContainer}>
        <View style={styles.navBar}>
<TouchableOpacity testID="home-button" style={styles.navItem} onPress={() => router.push('/main')}>            <Ionicons name="home-outline" size={28} color="#C4A1B0" />
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
  content: { flex: 1, alignItems: 'center' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 20,
  },
  taskCard: {
    width: width * 0.9,
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
    backgroundColor: '#DC5E60',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  pointsBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  taskSubtitle: { fontSize: 13, color: '#A0A0A0', marginTop: 3 },
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
  },
  navItem: { padding: 10 },
});