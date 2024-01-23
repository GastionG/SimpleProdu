import { StyleSheet, Text, View } from 'react-native';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple Produ</Text>
      <Text style={styles.description}>Una simple app con herramientas utiles</Text>
      <Text style={[styles.title, { fontSize: 20, marginTop: 20 }]}>(Beta)</Text>
      <Text style={styles.description}>Se esperan errores</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 20,
    textAlign: 'center',
  },
});
