import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';

const { width } = Dimensions.get('window'); // Получаем ширину экрана пользователя

export default function Main() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Группируем тексты для легкой центровки */}
      <View style={styles.textGroup}>
        <Text style={styles.title}>Добро пожаловать в MY-TODO</Text>
        <Text style={styles.title2}>Ставь задачи и получай баллы</Text>
      </View>

      <Image source={require('../assets/images/woman.png')} style={styles.woman} />
      <Image source={require('../assets/images/cup.png')} style={styles.cup} />
      <Image source={require('../assets/images/watch.png')} style={styles.watch} />
      <Image source={require('../assets/images/vase.png')} style={styles.vase} />
      <Image source={require('../assets/images/Ellipse.png')} style={styles.Ellipse} />
      <Image source={require('../assets/images/Ellipse.png')} style={styles.Ellipse2} />
      <Image source={require('../assets/images/circle.png')} style={styles.circle} />
      <Image source={require('../assets/images/calendar.png')} style={styles.calendar} />

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/profile')}
      >
        <Text style={styles.buttonText}>Начать</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFD7E4',
    alignItems: 'center', // Центрирует всё содержимое по горизонтали
  },
  textGroup: {
    marginTop: 160,
    alignItems: 'center', // Центрирует тексты друг относительно друга
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  title2: {
    fontSize: 16,
    fontWeight: 'normal',
    marginTop: 10,
    textAlign: 'center',
  },
  woman: {
    width: 186,
    height: 207,
    position: 'absolute',
    top: 362,
    alignSelf: 'center', // Сама картинка встанет по центру экрана
  },
  // Эти элементы оставляем с position: absolute, так как они "летают" вокруг
  cup: { width: 18, height: 22, position: 'absolute', left: width * 0.7, top: 540 },
  watch: { width: 40, height: 50, position: 'absolute', left: width * 0.3, top: 260 },
  vase: { width: 36, height: 52, position: 'absolute', left: width * 0.2, top: 491 },
  Ellipse: { width: 100, height: 100, position: 'absolute', right: 20, top: 228 },
  Ellipse2: { width: 100, height: 100, position: 'absolute', left: 20, top: 516 },
  circle: { width: 26, height: 26, position: 'absolute', left: 91, top: 387 },
  calendar: { width: 32, height: 26, position: 'absolute', right: 40, top: 400 },
  
  button: {
    backgroundColor: '#FFBDD2',
    width: width * 0.85, // Кнопка будет занимать 85% ширины любого экрана
    height: 52,
    position: 'absolute',
    bottom: 80, // Привязываем к низу экрана, а не к верху
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
  },
});