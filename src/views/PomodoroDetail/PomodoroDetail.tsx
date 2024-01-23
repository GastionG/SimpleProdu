import { NavigationProp, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParams } from '../../models/rootStackParams';
import { useCallback, useState } from 'react';
import { IPomodoro } from '../../models/pomodoro';
import pomodoroService from '../../services/pomodoro.service';

export default function PomodoroDetail({
  navigation,
  route,
}: {
  navigation: NavigationProp<RootStackParams>;
  route: RouteProp<RootStackParams, 'PomodoroDetail'>;
}) {
  const [pomodoro, setPomodoro] = useState<IPomodoro>();
  const [loading, setLoading] = useState(false);

  const loadPomodoro = async (pomodoroId: string) => {
    const p = await pomodoroService.getPomodoro(pomodoroId);
    // transformamos los segundos en minutos
    p?.times?.forEach((t) => {
      t.time = t.time / 60;
    });
    if (p) {
      setPomodoro(p);
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  const edit = (pomodoroId: string) => {
    navigation.navigate('AddPomodoro', { id: pomodoroId });
  };

  const remove = async (pomodoroId: string) => {
    await pomodoroService.removePomodoro(pomodoroId);
    navigation.navigate('Pomodoros');
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      if (route.params) loadPomodoro(route.params.id);

      return () => {
        setPomodoro(undefined);
      };
    }, [route.params]),
  );

  const NothingView = () => {
    return <View style={styles.nothingContainer}>{/* <Text>Tareas no encontrada</Text> */}</View>;
  };

  const LoadingView = () => {
    return <View style={styles.loadingContainer}>{/* <Text>Cargando...</Text> */}</View>;
  };

  return (
    <>
      {loading ? (
        <LoadingView />
      ) : pomodoro === undefined ? (
        <NothingView />
      ) : (
        <View style={styles.container}>
          <View>
            <Text style={[styles.title, { marginBottom: 20 }]}>
              {pomodoro.name + (pomodoro.main ? '(Fijado)' : '')}
            </Text>

            <Text style={[{ fontSize: 20, marginBottom: 5 }]}>Tiempos:</Text>
            {pomodoro.times?.map((time, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderRadius: 10,
                  backgroundColor: '#444',
                  padding: 10,
                  marginBottom: 10,
                }}
              >
                <Text style={[{ color: '#fff', fontSize: 21, flex: 1 }]}>{time.name}</Text>
                <Text style={[{ color: '#fff', fontSize: 21 }]}>{time.time + ' Minutos'}</Text>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity style={[styles.bigButton, { flex: 0.6 }]} onPress={() => edit(pomodoro.id)}>
              <Text style={styles.textButton}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.bigButton, { flex: 0.3 }]} onPress={() => remove(pomodoro.id)}>
              <Text style={styles.textButton}>Borrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nothingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 20,
  },
  bigButton: { backgroundColor: '#444', borderRadius: 10, padding: 20 },
  textButton: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
});
