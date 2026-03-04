import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.content}>
        
        {/* Верхнее окно профиля */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person-outline" size={80} color="#fff" />
            </View>
            <TouchableOpacity style={styles.addIcon}>
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.nameContainer}>
            <Ionicons name="pencil-outline" size={20} color="#333" />
            <Text style={styles.userName}>Фамилия Имя</Text>
          </View>

          <Text style={styles.pointsText}>85 баллов</Text>
        </View>

        {/* Кнопки действий */}
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuButtonText}>Архив задач</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuButton, { marginTop: 20 }]}>
          <Text style={styles.menuButtonText}>Удалить аккаунт</Text>
        </TouchableOpacity>

      </SafeAreaView>

      {/* Нижняя панель навигации */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navItem}>
             <Ionicons name="home-outline" size={28} color="#C4A1B0" />
          </TouchableOpacity>
          
          <View style={{ width: 60 }} /> {/* Место под плюс */}

          <TouchableOpacity style={styles.navItem}>
             <Ionicons name="person" size={28} color="#FF8DA1" />
          </TouchableOpacity>
        </View>

        {/* Центральный плюс */}
        <TouchableOpacity style={styles.floatingButton}>
          <Ionicons name="add" size={35} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFD7E3', // Нежно-розовый фон
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  profileCard: {
    width: width * 0.85,
    backgroundColor: '#FFBDD2', // Цвет окон
    borderRadius: 45,
    paddingVertical: 45,
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
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
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userName: {
    fontSize: 24,
    color: '#333',
    fontWeight: '500',
  },
  pointsText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  menuButton: {
    width: width * 0.85,
    backgroundColor: '#FFBDD2',
    height: 65,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: 20,
    color: '#333',
    fontWeight: '500',
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  navItem: {
    padding: 10,
  }
});