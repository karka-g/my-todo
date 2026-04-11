import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    LayoutAnimation, Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet, Text,
    TextInput, TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function AddTaskScreen() {
  const router = useRouter();
  
  const [importance, setImportance] = useState('Важно');
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const animate = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const togglePicker = () => {
    animate();
    setPickerVisible(!isPickerVisible);
  };

  const toggleDatePicker = () => {
    animate();
    setShowDatePicker(!showDatePicker);
  };

  const selectImportance = (level: string) => {
    animate();
    setImportance(level);
    setPickerVisible(false);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      animate();
      setDate(selectedDate);
    }
    if (Platform.OS === 'android') {
        setShowDatePicker(false);
    }
  };

  const getImportanceColor = (level: string) => {
    switch (level) {
      case 'Очень важно': return '#DC5E60';
      case 'Важно': return '#F0C846';
      case 'Не очень важно': return '#93C46C';
      default: return '#F0C846';
    }
  };

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.content}>
        <ScrollView contentContainerStyle={{ alignItems: 'center', width: width }}>
          
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.inputCard} 
            onPress={togglePicker}
            activeOpacity={0.7}
          >
            <View style={[styles.colorSquare, { backgroundColor: getImportanceColor(importance) }]} />
            <View style={styles.textContainer}>
              <Text style={styles.label}>Уровень важности</Text>
              <Text style={styles.valueText}>{importance}</Text>
            </View>
            <Ionicons name={isPickerVisible ? "caret-up" : "caret-down"} size={20} color="#333" />
          </TouchableOpacity>

          {isPickerVisible && (
            <View style={styles.pickerContainer}>
              {['Очень важно', 'Важно', 'Не очень важно'].map((item) => (
                <TouchableOpacity 
                  key={item} 
                  style={styles.pickerItem} 
                  onPress={() => selectImportance(item)}
                >
                  <View style={[styles.miniSquare, { backgroundColor: getImportanceColor(item) }]} />
                  <Text style={styles.pickerText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.inputCard}>
            <View style={styles.textContainer}>
              <Text style={styles.label}>Название</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Название проекта или задачи" 
                placeholderTextColor="#707070" 
                value={title}
                onChangeText={setTitle}
              />
            </View>
          </View>

          <View style={[styles.inputCard, styles.descriptionCard]}>
            <View style={styles.textContainer}>
              <Text style={styles.label}>Описание</Text>
              <TextInput 
                style={[styles.input, { textAlignVertical: 'top' }]} 
                placeholder="Что нужно сделать?" 
                placeholderTextColor="#707070" 
                multiline
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.inputCard} 
            onPress={toggleDatePicker}
            activeOpacity={0.7}
          >
             <Ionicons name="calendar-outline" size={24} color="#FF8DA1" style={{ marginRight: 15 }} />
            <View style={styles.textContainer}>
              <Text style={styles.label}>Дата</Text>
              <Text style={styles.valueText}>{date.toLocaleDateString('ru-RU')}</Text>
            </View>
            <Ionicons name={showDatePicker ? "caret-up" : "caret-down"} size={20} color="#333" />
          </TouchableOpacity>

          {showDatePicker && (
            <View style={styles.datePickerWrapper}>
              <DateTimePicker
                value={date}
                mode="date"
                display="inline" 
                onChange={onDateChange}
                accentColor="#FF8DA1" 
                locale="ru-RU"
                textColor="#333"
                themeVariant="light"
                minimumDate={new Date()} 
              />
            </View>
          )}

        </ScrollView>

        <TouchableOpacity style={styles.addButton} onPress={() => router.back()}>
          <Text style={styles.addButtonText}>Добавить дело</Text>
        </TouchableOpacity>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F8E0E8' },
  content: { flex: 1 },
  backButton: { alignSelf: 'flex-start', marginTop: 20, marginBottom: 10, marginLeft: 20 },
  inputCard: {
    width: width * 0.9,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    minHeight: 85,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  descriptionCard: { minHeight: 140, alignItems: 'flex-start' },
  colorSquare: { width: 24, height: 24, borderRadius: 6, marginRight: 15 },
  textContainer: { flex: 1 },
  label: { fontSize: 12, color: '#A0A0A0', marginBottom: 4 },
  valueText: { fontSize: 18, color: '#333', fontWeight: '500' },
  input: { fontSize: 18, color: '#333', padding: 0 },
  pickerContainer: {
    width: width * 0.9,
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginTop: -10,
    marginBottom: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  miniSquare: { width: 14, height: 14, borderRadius: 4, marginRight: 10 },
  pickerText: { fontSize: 16, color: '#333' },
  datePickerWrapper: {
    width: width * 0.9,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 10,
    marginTop: -10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  addButton: {
    width: width * 0.9,
    backgroundColor: '#FFBDD2',
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 30,
  },
  addButtonText: { fontSize: 20, color: '#000', fontWeight: 'bold' },
});
