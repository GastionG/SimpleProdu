import { StyleSheet, Text } from 'react-native';

export default function Timer({ time, blink }: { time: number; blink: boolean }) {
  const formattedTime = `${Math.floor(time / 60)
    .toString()
    .padStart(2, '0')}:${(time % 60).toString().padStart(2, '0')}`;

  return <Text style={[styles.time, { opacity: blink ? 0.1 : 1.0 }]}>{formattedTime}</Text>;
}

const styles = StyleSheet.create({
  time: {
    fontSize: 70,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
