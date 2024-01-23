import { Text } from '@rneui/base';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { RouteProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NavProps } from '../../models/navProps';
import taskService from '../../services/task.service';
import { RootStackParams } from '../../models/rootStackParams';

interface TaskForm {
  title: string;
  description?: string;
  notification?: Date | null;
  notificationId?: string;
}
export default function AddTask({ route }: { route?: RouteProp<RootStackParams, 'AddTask'> }) {
  const [form, setForm] = useState<TaskForm>({ title: '', description: '', notification: null });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const titleInput = useRef<TextInput>(null);

  const { navigate } = useNavigation<NavProps>();

  const setTitle = (text: string) => {
    setForm((prev) => ({ ...prev, title: text }));
  };

  const setDescription = (text: string) => {
    setForm((prev) => ({ ...prev, description: text }));
  };

  const onChangeDate = (event: DateTimePickerEvent, newDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set') {
      newDate?.setSeconds(0, 0);
      if (newDate) {
        setForm((prev) => ({ ...prev, notification: newDate }));
      }
      setShowTimePicker(true);
    } else if (event.type === 'dismissed') {
      setForm((prev) => ({ ...prev, notification: null }));
    }
  };

  const onChangeTime = (event: DateTimePickerEvent, newDate?: Date) => {
    console.log(event);

    setShowTimePicker(false);
    if (event.type === 'set') {
      if (newDate) {
        newDate?.setSeconds(0, 0);

        // codigo para adelanta la hora a un minuto despues de la hora actual la nueva hora es menor.

        // const nowHours = new Date().getHours();
        // const nowMinutes = new Date().getMinutes();
        // const dateHours = newDate.getHours();
        // const dateMinutes = newDate.getMinutes();

        // if (dateHours + dateMinutes <= nowHours + nowMinutes)
        //   newDate.setHours(nowHours), newDate.setMinutes(nowMinutes + 1);

        setForm((prev) => ({ ...prev, notification: newDate }));
      }
    } else if (event.type === 'dismissed') {
      setForm((prev) => ({ ...prev, notification: null }));
    }
  };

  const save = async () => {
    console.log(form);

    if (form.title) {
      if (route?.params?.id) {
        // si hay una id significa que se esta editando
        await taskService.editTask({
          ...form,
          id: route?.params?.id,
          notification: { id: form.notificationId, date: form.notification },
          status: 'TODO',
        });
      } else {
        await taskService.pushTask({
          ...form,
          notification: { date: form.notification },
          status: 'TODO',
        });
      }
      cleanInputs();
      navigate('Tasks');
    }
  };
  const cancel = () => {
    cleanInputs();

    navigate('Tasks');
  };

  const cleanInputs = () => {
    setForm({
      title: '',
      description: '',
      notification: null,
    });
  };

  const loadTask = async (taskId: string) => {
    const task = await taskService.getTask(taskId);
    if (task) {
      setForm({
        title: task.title,
        description: task.description,
        notification: task.notification?.date,
      });
    }
  };

  useFocusEffect(
    useCallback(() => {
      const id = route?.params?.id;

      if (id) {
        loadTask(id);
      } else {
        titleInput.current?.focus();
      }
    }, [route?.params]),
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TextInput
          style={styles.input}
          placeholder='Titulo'
          value={form.title}
          onChangeText={setTitle}
          ref={titleInput}
        />
        <TextInput
          style={styles.input}
          placeholder='Descripcion'
          value={form.description}
          onChangeText={setDescription}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={[styles.button, { flex: 0.4 }]} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.textButton}>Recordatorio</Text>
          </TouchableOpacity>
          <Text
            style={{
              flex: 0.6,
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            {form.notification?.toLocaleString()}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity style={[styles.bigButton, { flex: 0.6 }]} onPress={save}>
          <Text style={styles.textButton}>Guardar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.bigButton, { flex: 0.3, backgroundColor: '#555' }]} onPress={cancel}>
          <Text style={styles.textButton}>Cancelar</Text>
        </TouchableOpacity>
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={form.notification || new Date()}
          mode={'date'}
          minimumDate={new Date()}
          display={'default'}
          onChange={onChangeDate}
          positiveButton={{ label: 'Confirmar', textColor: 'green' }}
          negativeButton={{ label: 'Cancelar', textColor: 'red' }}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={form.notification || new Date()}
          mode={'time'}
          display={'default'}
          onChange={onChangeTime}
          positiveButton={{ label: 'Confirmar', textColor: 'green' }}
          negativeButton={{ label: 'Cancelar', textColor: 'red' }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  content: {
    flex: 1,
  },
  input: {
    fontSize: 15,
    padding: 10,
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 10,
  },
  button: { backgroundColor: '#444', borderRadius: 10, padding: 10 },
  bigButton: { backgroundColor: '#444', borderRadius: 10, padding: 20 },
  textButton: { color: 'white', fontWeight: 'bold', textAlign: 'center' },

  modalContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  modalContent: {
    width: '80%',
    borderColor: 'black',
    borderWidth: 1,
    shadowRadius: 10,
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
    backgroundColor: 'white',
  },
  modalContentNavbar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalContentNavbarButton: {
    flex: 0.5,
    width: '100%',
    padding: 15,
  },
  modalContentNavbarButtonText: {
    textAlign: 'center',
  },
});
