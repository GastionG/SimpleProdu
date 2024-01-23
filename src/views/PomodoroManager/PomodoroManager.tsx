import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParams } from '../../models/rootStackParams';
import { IPomodoro } from '../../models/pomodoro';
import { useCallback, useState } from 'react';
import pomodoroService from '../../services/pomodoro.service';

export default function PomodoroManager({ navigation }: { navigation: NavigationProp<RootStackParams> }) {
  const [pomodoros, setPomodoros] = useState<IPomodoro[]>([]);

  const handleAddPomodoro = () => {
    navigation.navigate('AddPomodoro', { id: '' });
  };

  const loadPomodoros = async () => {
    const data = await pomodoroService.getPomodoros();
    setPomodoros(data);
    console.log('pomodoros obtenidos', data);
  };

  const handleDetail = (id: string) => {
    navigation.navigate('PomodoroDetail', { id });
  };

  useFocusEffect(
    useCallback(() => {
      console.log('cargando pomodoros');
      loadPomodoros();
    }, []),
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.addPomodoroButton} onPress={handleAddPomodoro}>
          <Text style={styles.addPomodoroButtonText}>Agregar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {pomodoros.length ? (
          pomodoros.map((task) => (
            <View key={task.id} style={styles.pomodoroCard}>
              <View>
                <Text style={styles.pomodoroCardTitle}>{task.name}</Text>
              </View>
              <TouchableOpacity style={styles.pomodoroCardButton} onPress={() => handleDetail(task.id)}>
                <Text style={styles.pomodoroCardButtonText}>Detalle</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View>
            <Text style={{ textAlign: 'center', fontSize: 20 }}>No hay pomodoros</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  topBar: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  content: { flex: 1 },
  addPomodoroButton: {
    width: '60%',
    backgroundColor: '#444',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  addPomodoroButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 20,
  },
  pomodoroCard: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  pomodoroCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  pomodoroCardDescription: {
    fontSize: 16,
  },
  pomodoroCardButton: {
    backgroundColor: '#444',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  pomodoroCardButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
