import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Main() {
  const router = useRouter();

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Добро пожаловать в MY-TODO</Text>
      <Text style={styles.title2}>Ставь задачи и получай баллы</Text>

      <Image
        source={require('../assets/images/woman.png')}
        style={styles.woman}
      />
      <Image
        source={require('../assets/images/cup.png')}
        style={styles.cup}
      />
      <Image
        source={require('../assets/images/watch.png')}
        style={styles.watch}
      />
      <Image
        source={require('../assets/images/vase.png')}
        style={styles.vase}
      />
      <Image
        source={require('../assets/images/Ellipse.png')}
        style={styles.Ellipse}
      />
      <Image
        source={require('../assets/images/Ellipse.png')}
        style={styles.Ellipse2}
      />
      <Image
        source={require('../assets/images/circle.png')}
        style={styles.circle}
      />
      <Image
        source={require('../assets/images/calendar.png')}
        style={styles.calendar}
      />

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
  },
  title: {
    position: 'absolute',
    left: 49,
    top: 162,
    fontSize: 20,
    fontWeight: 'bold',
  },
  title2: {
    position: 'absolute',
    left: 80,
    top: 212,
    fontSize: 16,
    fontWeight: 'normal',
  },
  woman: {
    width: 186,
    height: 207,
    position: 'absolute',
    left: 130,
    top: 362,
  },
    cup: {
    width: 18,
    height: 22,
    position: 'absolute',
    left: 270,
    top: 540,
  },
  watch: {
    width: 40,
    height: 50,
    position: 'absolute',
    left: 133,
    top: 260,
  },
  vase: {
    width: 36,
    height: 52,
    position: 'absolute',
    left: 94,
    top: 491,
  },
  
  Ellipse: {
    width: 100,
    height: 100,
    position: 'absolute',
    left: 268,
    top: 228,
  },
  Ellipse2: {
    width: 100,
    height: 100,
    position: 'absolute',
    left: 46,
    top: 516,
  },
  circle: {
    width: 26,
    height: 26,
    position: 'absolute',
    left: 91,
    top: 387,
  },
  calendar: {
    width: 32,
    height: 26,
    position: 'absolute',
    left: 305,
    top: 400,
  },
  button: {
    backgroundColor: '#FFBDD2',
    width: 331,
    height: 52,
    position: 'absolute',
    left: 35,
    top: 677,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});