import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '@rneui/base';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useCallback, useState } from 'react';
import { ITask } from '../../models/task';
import taskService from '../../services/task.service';
import { RootStackParams } from '../../models/rootStackParams';

type NavProps = NativeStackNavigationProp<RootStackParams>;

export default function TaskManager() {
  const { navigate } = useNavigation<NavProps>();
  const [tasks, setTasks] = useState<ITask[]>([]);

  const handleAddTask = () => {
    navigate('AddTask', { id: '' });
  };

  const handleDeleteOld = async () => {
    await taskService.removeOldTasks();
    await loadTasks();
  };

  const handleTaskDetail = (id: string) => {
    console.log('id', id);
    navigate('TaskDetail', { id });
  };

  const sortTasks = (tasks: ITask[]) => {
    const past: ITask[] = [];
    const future: ITask[] = [];
    tasks.forEach((t) => {
      if (t.notification && t.notification.date && t.notification.date.getTime() < Date.now()) {
        past.push(t);
      } else {
        future.push(t);
      }
    });

    return [...future, ...past];
  };

  const loadTasks = async () => {
    const data = await taskService.getTasks();

    setTasks(sortTasks(data));
    console.log('tareas obtenidas', data);
  };
  useFocusEffect(
    useCallback(() => {
      console.log('cargando tareas');
      loadTasks();
    }, []),
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        {tasks.filter((t) => t.notification && t.notification.date && t.notification.date.getTime() < Date.now())
          .length ? (
          <TouchableOpacity style={styles.bigButton} onPress={handleDeleteOld}>
            <Text style={styles.bigButtonText}>Borrar antiguas</Text>
          </TouchableOpacity>
        ) : (
          ''
        )}
        <TouchableOpacity style={styles.bigButton} onPress={handleAddTask}>
          <Text style={styles.bigButtonText}>Agregar</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        {tasks.length ? (
          tasks.map((task) => (
            <View
              key={task.id}
              style={[
                styles.taskCard,
                {
                  opacity:
                    task.notification && task.notification.date && task.notification.date.getTime() < Date.now()
                      ? 0.5
                      : 1,
                },
              ]}
            >
              <View>
                <Text style={styles.taskCardTitle}>{task.title}</Text>
                <Text style={styles.taskCardDescription}>{task.description}</Text>
              </View>
              <TouchableOpacity style={styles.taskCardButton} onPress={() => handleTaskDetail(task.id)}>
                <Text style={styles.taskCardButtonText}>Detalle</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View>
            <Text style={{ textAlign: 'center', fontSize: 20 }}>No hay tareas</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  content: { flex: 1 },
  bigButton: {
    backgroundColor: '#444',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  bigButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 20,
  },
  taskCard: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  taskCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  taskCardDescription: {
    fontSize: 16,
  },
  taskCardButton: {
    backgroundColor: '#444',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  taskCardButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
