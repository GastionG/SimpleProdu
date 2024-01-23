import { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ITask } from '../../models/task';
import { NavigationProp, RouteProp, useFocusEffect } from '@react-navigation/native';
import taskService from '../../services/task.service';
import { RootStackParams } from '../../models/rootStackParams';

export default function TaskDetail({
  navigation,
  route,
}: {
  navigation: NavigationProp<RootStackParams>;
  route: RouteProp<RootStackParams, 'TaskDetail'>;
}) {
  const [task, setTask] = useState<ITask>();
  const [loading, setLoading] = useState(false);

  const loadTask = async (taskId: string) => {
    console.log('taskId', taskId);

    const t = await taskService.getTask(taskId);
    console.log('tarea detallada', t);
    if (t) {
      setTask(t);
      setLoading(false);
    } else {
      console.log('tarea no encontrada');
      setLoading(false);
    }
  };

  const editTask = (taskId: string) => {
    console.log('editTask', taskId);

    navigation.navigate('AddTask', { id: taskId });
  };

  const removeTask = async (taskId: string) => {
    await taskService.removeTask(taskId);
    navigation.navigate('Tasks');
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      if (route.params) loadTask(route.params.id);

      return () => {
        setTask(undefined);
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
      ) : task === undefined ? (
        <NothingView />
      ) : (
        <View style={styles.container}>
          <View>
            <Text style={styles.title}>{task.title}</Text>
            <Text style={styles.description}>{task.description}</Text>
            <Text style={[styles.description, { fontWeight: 'bold', marginTop: 20 }]}>Recordatorio:</Text>
            <Text style={styles.description}>{task.notification?.date?.toLocaleString()}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity style={[styles.bigButton, { flex: 0.6 }]} onPress={() => editTask(task.id)}>
              <Text style={styles.textButton}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.bigButton, { flex: 0.3 }]} onPress={() => removeTask(task.id)}>
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
    backgroundColor: '#fff',
  },
  nothingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
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
