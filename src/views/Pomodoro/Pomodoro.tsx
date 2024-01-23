import { useEffect, useRef, useState } from 'react';
import {
  AppState,
  AppStateStatus,
  NativeEventSubscription,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { IPomodoro, IPomodoroState } from '../../models/pomodoro';
import Timer from '../../components/Timer';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParams } from '../../models/rootStackParams';
import pomodoroService from '../../services/pomodoro.service';
import { ITime } from '../../models/time';

export default function Pomodoro({ navigation }: { navigation: NavigationProp<RootStackParams> }) {
  // states
  const [pomodoroState, setPomodoroState] = useState<IPomodoroState>();

  const [pomodoro, setPomodoro] = useState<IPomodoro>();
  const [time, setTime] = useState<ITime>();
  const [running, setRunning] = useState(false);
  const [timeCount, setTimeCount] = useState(0);

  const [blink, setBlink] = useState(false);

  // refs
  const timer = useRef<NodeJS.Timeout | null>(null);
  const blinkTimer = useRef<NodeJS.Timeout | null>(null);
  const backgroundListener = useRef<NativeEventSubscription | null>(null);
  const focusListener = useRef<(() => void) | null>(null);
  const blurListener = useRef<(() => void) | null>(null);

  const handleOption = async (time: ITime) => {
    if (running) {
      handleRun(false);

      await uploadPomodoroState({ running: false });
      await loadPomodoroState();
    }

    setTime(time);

    if (pomodoroState?.time.id === time.id) {
      setTimeCount(pomodoroState.timeCount);
    } else {
      setTimeCount(time.time);
    }
  };

  const handleManager = () => {
    navigation.navigate('Pomodoros');
  };

  const handleStart = async () => {
    // handleRun(!running);

    await uploadPomodoroState({ running: !running });
    await loadPomodoroState();
  };
  const handleRestart = async () => {
    // setTimeCount(time!.time);
    // handleRun(false);

    await uploadPomodoroState({ timeCount: time!.time, running: false });
    await loadPomodoroState();
  };

  const handleRun = (state: boolean) => {
    console.log('[handleRun]', state);

    setRunning(state);
    if (state) {
      if (timer.current) clearInterval(timer.current);
      timer.current = setInterval(() => {
        setTimeCount((prev) => prev - 1);
      }, 1000);
    } else if (timer.current) {
      clearInterval(timer.current);
    }
  };

  const uploadPomodoroState = async (ps?: Partial<IPomodoroState>) => {
    console.log('[UploadPomodoroState]');

    const actualTime = new Date();
    actualTime.setMilliseconds(0);
    const finalTime = new Date(actualTime.getTime() + timeCount * 1000);
    finalTime.setMilliseconds(0);
    const updatedPomodoroState = {
      ...pomodoroState,
      pomodoro: ps?.pomodoro || pomodoro!,
      time: ps?.time || time!,
      timeCount: ps?.timeCount || timeCount,
      running: ps?.running === undefined ? running : ps.running,
      updateDate: actualTime,
      finalDate: finalTime,
    };
    await pomodoroService.setPomodoroState(updatedPomodoroState);
  };

  const loadPomodoroState = async () => {
    console.log('[loadPomodoroState]');

    const mPomodoro = await pomodoroService.getMainPomodoro();
    const pState = await pomodoroService.getPomodoroState();

    if (pState && pState.pomodoro && pState.pomodoro.id === mPomodoro?.id) {
      console.log('pomodoroState existe, se seteara el pomodoroState y el pomodoro principal');

      setPomodoroState(pState);
      console.log('pomodoroState:', pState.finalDate?.toLocaleString());

      setPomodoro(mPomodoro);
      setTime(pState.time);
      setTimeCount(pState.timeCount);
      setRunning(pState.running);
      handleRun(pState.running);

      if (pState.running) {
        const actual = new Date();
        actual.setMilliseconds(0);
        const tiempoQueSeria = Math.floor(((pState.finalDate?.getTime() || 0) - actual.getTime()) / 1000);
        if (tiempoQueSeria > 0) {
          setTimeCount(tiempoQueSeria);
        } else {
          setTimeCount(0);
        }
      }
    } else if (mPomodoro && mPomodoro.times?.length) {
      console.log('no existe el pomodoroState, se creara en base al pomodoro principal');
      setPomodoro(mPomodoro);
      setTime(mPomodoro?.times?.[0]);
      if (mPomodoro?.times?.[0]) setTimeCount(mPomodoro?.times[0].time);

      await uploadPomodoroState({
        pomodoro: mPomodoro,
        time: mPomodoro?.times[0],
        timeCount: mPomodoro?.times[0].time,
        running: false,
      });
      await loadPomodoroState();
    } else {
      console.log('No existe ningun pomodoro disponible');
      if (pomodoroState || pomodoro) {
        console.log('Quedaron datos antiguos, se borraran');
        await pomodoroService.cleanPomodoroState();
        setPomodoroState(undefined);
        setPomodoro(undefined);
        setTime(undefined);
        setRunning(false);
        setTimeCount(0);
      }
    }
  };

  useEffect(() => {
    console.log('timeCount', timeCount);

    if (backgroundListener.current) backgroundListener.current.remove();
    if (focusListener.current) focusListener.current();
    if (blurListener.current) blurListener.current();

    focusListener.current = navigation.addListener('focus', () => {
      console.log('FOCUS');
      loadPomodoroState();
    });
    blurListener.current = navigation.addListener('blur', () => {
      console.log('BLUR');
      if (pomodoroState && pomodoroState.running) {
        uploadPomodoroState();
      }
    });

    backgroundListener.current = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      console.log('nextAppState', nextAppState);

      if (nextAppState === 'background') {
        uploadPomodoroState();
      } else if (nextAppState === 'active') {
        loadPomodoroState();
      }
    });

    if (timeCount <= 0 && running) {
      handleRun(false);
      uploadPomodoroState({ running: false });
    }
    if (timeCount <= 0) {
      if (blinkTimer.current) clearInterval(blinkTimer.current);
      blinkTimer.current = setInterval(() => {
        setBlink((prev) => !prev);
      }, 500);
    } else {
      if (blinkTimer.current) clearInterval(blinkTimer.current);
      setBlink(false);
    }
  }, [timeCount, pomodoroState, running]);

  useEffect(() => {
    return () => {
      backgroundListener.current!.remove();
      if (blinkTimer.current) clearInterval(blinkTimer.current);
      if (focusListener.current) focusListener.current();
      if (blurListener.current) blurListener.current();
    };
  }, []);

  return (
    <View style={styles.container}>
      {pomodoro && (
        <>
          <View style={styles.topBar}>
            {pomodoro &&
              pomodoro.times?.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.optionTouch, t.id !== time?.id && { borderColor: 'transparent' }]}
                  onPress={() => handleOption(t)}
                >
                  <Text style={styles.option}>{t.name}</Text>
                </TouchableOpacity>
              ))}
          </View>

          <View style={styles.timeContainer}>
            <Timer time={timeCount} blink={blink} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.timerButton} onPress={handleStart}>
                <Text style={styles.timerButtonText}>{running ? 'Stop' : 'Start'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.timerButton, { borderRadius: 35, paddingHorizontal: 20 }]}
                onPress={handleRestart}
              >
                <Text style={styles.timerButtonText}>Re</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      <View style={[styles.bottomBar, !pomodoro && { flex: 1, justifyContent: 'center' }]}>
        <TouchableOpacity
          style={[styles.managerButton, !pomodoro && { paddingVertical: 30, paddingHorizontal: 30 }]}
          onPress={handleManager}
        >
          <Text style={styles.managerButtonText}>Administrar</Text>
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
  topBar: { flexDirection: 'row', justifyContent: 'space-evenly', marginBottom: 10 },
  option: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  optionTouch: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 10,
    width: '33%',
  },
  timeContainer: {
    flex: 1,
    marginBottom: 15,
    alignItems: 'center',
  },
  timerButton: {
    backgroundColor: '#444',
    borderRadius: 10,
    paddingHorizontal: 40,
    paddingVertical: 20,
    marginTop: 10,
  },
  timerButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  bottomBar: { marginBottom: 10, alignItems: 'center' },
  managerButton: {
    color: '#fff',
    backgroundColor: '#444',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  managerButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
});
