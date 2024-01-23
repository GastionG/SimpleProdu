import { NavigationProp, RouteProp, useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RootStackParams } from '../../models/rootStackParams';
import pomodoroService from '../../services/pomodoro.service';
import { ITime } from '../../models/time';

interface PomodoroForm {
  name: string;
  times?: ITime[];
  main?: boolean;
}
export default function AddPomodoro({
  navigation,
  route,
}: {
  navigation: NavigationProp<RootStackParams>;
  route?: RouteProp<RootStackParams, 'AddPomodoro'>;
}) {
  const [form, setForm] = useState<PomodoroForm>({ name: '', times: [], main: false });
  const nameInput = useRef<TextInput>(null);

  const differentInput = useRef<(TextInput | null)[]>([]);

  const setName = (text: string) => {
    setForm((prev) => ({ ...prev, name: text }));
  };

  const addTime = () => {
    if (form.times && form.times.length >= 3) return;
    setForm((prev) => {
      if (!prev.times) return { ...prev, times: [{ name: '' }] };
      console.log('focus', differentInput.current.length);

      return { ...prev, times: [...prev.times, { name: '' }] };
    });
  };

  const setMain = (state: boolean) => {
    setForm((prev) => ({ ...prev, main: state }));
  };

  const setTimeName = (name: string, index: number) => {
    setForm((prev) => {
      const times = prev.times;
      if (times) {
        times[index].name = name;
      }
      return { ...prev, times };
    });
  };
  const setTimeMinutes = (time: string, index: number) => {
    setForm((prev) => {
      const times = prev.times;
      if (times) {
        times[index].time = Number(time);
      }
      return { ...prev, times };
    });
  };

  const focusInput = (index: number) => {
    console.log('al');

    differentInput.current[index]?.blur();
    differentInput.current[index]?.focus();
  };

  const save = async () => {
    console.log(form);

    if (form.name) {
      if (route?.params?.id) {
        // si hay una id significa que se esta editando
        await pomodoroService.editPomodoro({
          ...form,
          id: route?.params?.id,
          times: form.times?.map((t) => {
            return { ...t, time: t.time * 60 };
          }),
        });
      } else {
        await pomodoroService.pushPomodoro({
          ...form,
          times: form.times?.map((t) => {
            return { ...t, time: t.time * 60 };
          }),
        });
      }
      cleanInputs();
      navigation.navigate('Pomodoros');
    }
  };

  const cancel = () => {
    cleanInputs();

    navigation.navigate('Pomodoros');
  };

  const cleanInputs = () => {
    setForm({
      name: '',
    });
  };

  const loadPomodoro = async (taskId: string) => {
    const pomodoro = await pomodoroService.getPomodoro(taskId);
    if (pomodoro) {
      setForm({
        name: pomodoro.name,
        times: pomodoro.times?.map((t) => {
          return { ...t, time: t.time / 60 };
        }),
        main: pomodoro.main,
      });
    }
  };

  const keyboardDidHideCallback = () => {
    differentInput.current.forEach((input) => {
      if (input?.isFocused()) input?.blur();
    });
  };

  const formattTimeToMinutes = (time?: number): string => {
    // return ((time || 0) / 60).toString();
    return time ? time.toString() : '';
  };

  useEffect(() => {
    const keyboardDidHideSubscription = Keyboard.addListener('keyboardDidHide', keyboardDidHideCallback);
    return () => {
      keyboardDidHideSubscription?.remove();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      const id = route?.params?.id;

      if (id) {
        loadPomodoro(id);
      } else {
        nameInput.current?.focus();
      }
    }, [route?.params]),
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TextInput
          style={[styles.input, { marginBottom: 20 }]}
          placeholder='Nombre'
          value={form.name}
          onChangeText={setName}
          ref={nameInput}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
          <Text style={{ fontSize: 20, flex: 1 }}>Tiempos: </Text>

          <TouchableOpacity
            style={{ backgroundColor: '#444', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 5 }}
            onPress={addTime}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: 20 }}>Agregar</Text>
          </TouchableOpacity>
        </View>
      </View>
      <KeyboardAvoidingView behavior='position'>
        <View style={{ justifyContent: 'flex-start' }}>
          {form.times?.map((time, index) => {
            return (
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
                <TextInput
                  style={[styles.input, { color: 'white', borderColor: 'white', flex: 1, marginRight: 10 }]}
                  placeholder='Nombre'
                  placeholderTextColor={'white'}
                  value={time.name}
                  onChangeText={(text) => setTimeName(text, index)}
                ></TextInput>

                <TouchableOpacity activeOpacity={1} onPress={() => focusInput(index)}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      borderColor: '#fff',
                      borderWidth: 2,
                      borderRadius: 10,
                      padding: 5,
                    }}
                  >
                    <TextInput
                      id={'input' + index}
                      ref={(el) => {
                        differentInput.current[index] = el;
                      }}
                      keyboardType='number-pad'
                      placeholder='0'
                      style={[{ fontSize: 25, color: 'white', textDecorationColor: 'white' }]}
                      value={formattTimeToMinutes(time.time)}
                      placeholderTextColor={'white'}
                      onChangeText={(text) => setTimeMinutes(text, index)}
                    />
                    <Text style={{ fontSize: 25, color: 'white' }}> Minutos</Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </KeyboardAvoidingView>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, flex: 1, alignItems: 'flex-end' }}>
        <TouchableOpacity
          style={[styles.bigButton, { flex: 1, backgroundColor: form.main ? '#333' : '#444' }]}
          onPress={() => setMain(true)}
        >
          <Text style={styles.textButton}>{form.main ? 'Fijado' : 'Fijar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.bigButton, { flex: 1 }]} onPress={save}>
          <Text style={styles.textButton}>Guardar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.bigButton, { flex: 1, backgroundColor: '#555' }]} onPress={cancel}>
          <Text style={styles.textButton}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  content: {},
  input: {
    fontSize: 15,
    padding: 10,
    borderWidth: 2,
    borderRadius: 10,
  },
  button: { backgroundColor: '#444', borderRadius: 10, padding: 10 },
  bigButton: { backgroundColor: '#444', borderRadius: 10, padding: 20 },
  textButton: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
});
