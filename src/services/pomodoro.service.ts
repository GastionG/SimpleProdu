import { INewPomodoro, IStrPomodoro, IPomodoro, IPomodoroState, IStrPomodoroState } from '../models/pomodoro';
import { IStrTime, ITime } from '../models/time';
import notificationService from './notification.service';
import storageService from './storage.service';

const logPomodoroState = (pomodoroState: IPomodoroState) => {
  console.log(
    '\n=======================================\n',
    'pomodoro:',
    pomodoroState.pomodoro,
    '\n=======================================\n',
    'time:',
    pomodoroState.time,
    '\n=======================================\n',
    'timeCount:',
    pomodoroState.timeCount,
    '\n=======================================\n',
    'running:',
    pomodoroState.running,
    '\n=======================================\n',
    'updateDate:',
    pomodoroState.updateDate?.toLocaleString(),
    '\n=======================================\n',
    'finalDate:',
    pomodoroState.finalDate?.toLocaleString(),
    '\n=======================================\n',
    'notificationId:',
    pomodoroState.notificationId,
    '\n=======================================\n',
  );
};
const formatStrTime = (time: IStrTime): ITime => {
  return {
    ...time,
    time: Number(time.time),
  } as ITime;
};

const formatStrPomodoro = (pomodoro: IStrPomodoro): IPomodoro => {
  const formattedTimes: ITime[] = pomodoro.times?.map((time) => {
    return formatStrTime(time);
  });

  return {
    ...pomodoro,
    times: formattedTimes,
  } as IPomodoro;
};

const formatStrPomodoroState = (pomodoro: IStrPomodoroState): IPomodoroState => {
  return {
    pomodoro: pomodoro.pomodoro && formatStrPomodoro(pomodoro.pomodoro),
    time: pomodoro.time && formatStrTime(pomodoro.time),
    timeCount: Number(pomodoro.timeCount),
    running: Boolean(pomodoro.running),
    finalDate: new Date(pomodoro.finalDate),
    updateDate: new Date(pomodoro.updateDate),
    notificationId: pomodoro.notificationId,
  } as IPomodoroState;
};

const storePomodoros = async (value: IPomodoro[]) => {
  try {
    await storageService.setData('my-pomodoros', value);
  } catch (e) {
    console.error('[pomodoro.service] storePomodoros error:', e);
  }
};

const getPomodoros = async (): Promise<IPomodoro[]> => {
  try {
    const pomodoros = (await storageService.getData('my-pomodoros')) as IStrPomodoro[];

    const formattedPomodoros = pomodoros?.map((pomodoro) => formatStrPomodoro(pomodoro));

    return formattedPomodoros || [];
  } catch (e) {
    console.error('[pomodoro.service] getPomodoros error:', e);
    return [];
  }
};

const getPomodoro = async (pomodoroId: string): Promise<IPomodoro | undefined> => {
  try {
    const pomodoros = await getPomodoros();
    const pomodoro = pomodoros?.find((t) => t.id === pomodoroId);
    return pomodoro;
  } catch (e) {
    console.error('[pomodoro.service] getPomodoro error:', e);
    return undefined;
  }
};

const getMainPomodoro = async (): Promise<IPomodoro | undefined> => {
  try {
    const pomodoros = await getPomodoros();
    const pomodoro = pomodoros?.find((t) => t.main);
    return pomodoro;
  } catch (e) {
    console.error('[pomodoro.service] getMainPomodoro error:', e);
    return undefined;
  }
};

const pushPomodoro = async (newPomodoro: INewPomodoro) => {
  try {
    const pomodoros = await getPomodoros();
    const pomodoro: IPomodoro = {
      ...newPomodoro,
      id: 'pomodoro-' + Date.now().toString(36) + Math.random().toString(36).slice(2),
      times: newPomodoro.times?.map((t) => ({
        ...t,
        id: 'time-' + Date.now().toString(36) + Math.random().toString(36).slice(2),
      })),
    };

    if (pomodoro.main) {
      const mainPomodoro = pomodoros?.find((p) => p.main);
      mainPomodoro && (mainPomodoro.main = false);
    }

    pomodoros?.push(pomodoro);
    storePomodoros(pomodoros);
  } catch (e) {
    console.error('[pomodoro.service] pushPomodoro error:', e);
  }
};

const editPomodoro = async (pomodoro: IPomodoro) => {
  try {
    const pomodoros = await getPomodoros();

    pomodoro.times?.forEach((t) => {
      if (!t.id) t.id = 'time-' + Date.now().toString(36) + Math.random().toString(36).slice(2);
    });

    const mainPomodoro = pomodoros?.find((p) => p.main);
    if (pomodoro.main && mainPomodoro && mainPomodoro.id !== pomodoro.id) {
      mainPomodoro && (mainPomodoro.main = false);
    }

    // replace the old pomodoro with the new one
    pomodoros?.splice(pomodoros.map((t) => t.id).indexOf(pomodoro.id), 1, pomodoro);

    await storePomodoros(pomodoros);
  } catch (e) {
    console.error('[pomodoro.service] editPomodoro error:', e);
  }
};

const removePomodoro = async (pomodoroId: string) => {
  try {
    const pomodoros = await getPomodoros();
    pomodoros?.splice(pomodoros.map((t) => t.id).indexOf(pomodoroId), 1);
    // pushRemovedPomodoro(removedPomodoro[0]); // para guardar el pomodoro removido en una papelera
    storePomodoros(pomodoros);
  } catch (e) {
    console.error('[pomodoro.service] removePomodoro error:', e);
  }
};

const getRemovedPomodoros = async (): Promise<IPomodoro[]> => {
  try {
    const pomodoros = (await storageService.getData('my-removed-pomodoros')) as IStrPomodoro[];

    const formattedPomodoros: IPomodoro[] = pomodoros.map((pomodoro) => {
      const formattedTimes: ITime[] = pomodoro.times.map((time) => {
        return {
          ...time,
          time: Number(time.time),
        } as ITime;
      });
      return {
        ...pomodoro,
        times: formattedTimes,
      } as IPomodoro;
    });

    return formattedPomodoros;
  } catch (e) {
    console.log('[pomodoro.service] getRemovedPomodoros error:', e);
    return [];
  }
};

const storeRemovedPomodoros = async (value: IPomodoro[]) => {
  try {
    await storageService.setData('my-removed-pomodoros', value);
  } catch (e) {
    console.error('[pomodoro.service] storeRemovedPomodoros error:', e);
  }
};

const pushRemovedPomodoro = async (pomodoro: IPomodoro) => {
  try {
    const pomodoros = await getRemovedPomodoros();
    pomodoros?.push(pomodoro);
    storeRemovedPomodoros(pomodoros);
  } catch (e) {
    console.error('[pomodoro.service] pushRemovedPomodoro error:', e);
  }
};

const hardRemovePomodoro = async (pomodoroId: string) => {
  try {
    const pomodoros = await getRemovedPomodoros();
    pomodoros?.splice(pomodoros.map((t) => t.id).indexOf(pomodoroId), 1);
    storeRemovedPomodoros(pomodoros);
  } catch (e) {
    console.error('[pomodoro.service] hardRemovePomodoro error:', e);
  }
};

const getPomodoroState = async (): Promise<IPomodoroState | undefined> => {
  try {
    const strPomodoroState = (await storageService.getData('my-pomodoro-state')) as IStrPomodoroState;

    if (!strPomodoroState) return undefined;

    const pomodoroState = formatStrPomodoroState(strPomodoroState);
    console.log('Pomodoro obtenido');
    logPomodoroState(pomodoroState);
    return pomodoroState;
  } catch (e) {
    console.error('[pomodoro.service] getPomodoroState error:', e);
  }
};

const setPomodoroState = async (pomodoroState: IPomodoroState) => {
  try {
    if (pomodoroState.running && pomodoroState.finalDate) {
      if (pomodoroState.notificationId) {
        await notificationService.cancelNoti(pomodoroState.notificationId);
        await notificationService.schedulePomodoro(pomodoroState);
        console.log('Ya existe notificacion, actualizando');
      } else {
        await notificationService.schedulePomodoro(pomodoroState);
        console.log('Pomodoro programado');
      }
    } else if (!pomodoroState.running) {
      if (pomodoroState.notificationId) {
        await notificationService.cancelNoti(pomodoroState.notificationId);
        console.log('notificacion parada');
      }
    }

    await storageService.setData('my-pomodoro-state', pomodoroState);

    console.log('Pomodoro guardado');
    logPomodoroState(pomodoroState);
  } catch (e) {
    console.error('[pomodoro.service] setPomodoroState error:', e);
  }
};

const cleanPomodoroState = async () => {
  try {
    await storageService.cleanData('my-pomodoro-state');
  } catch (e) {
    console.error('[pomodoro.service] cleanPomodoroState error:', e);
  }
};

const pomodoroService = {
  getPomodoros,
  getPomodoro,
  getMainPomodoro,
  pushPomodoro,
  editPomodoro,
  removePomodoro,
  getRemovedPomodoros,
  pushRemovedPomodoro,
  hardRemovePomodoro,
  getPomodoroState,
  setPomodoroState,
  cleanPomodoroState,
};

export default pomodoroService;
