import AsyncStorage from '@react-native-async-storage/async-storage';
import { IStrTask, ITask } from '../models/task';
import { IPomodoro, IPomodoroState, IStrPomodoro, IStrPomodoroState } from '../models/pomodoro';

type PosibleStorageTypeData = ITask | ITask[] | IPomodoro | IPomodoro[] | IPomodoroState | string | number;
type PosibleReturnedTypeData =
  | IStrTask
  | IStrTask[]
  | IStrPomodoro
  | IStrPomodoro[]
  | IStrPomodoroState
  | string
  | number;

const setData = async (key: string, value: PosibleStorageTypeData) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);

    // console.log('setted data:', value, 'in key:', key);
  } catch (e) {
    console.error('[storage.service] setData error:', e);
  }
};

const getData = async (key: string): Promise<PosibleReturnedTypeData | undefined> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? (JSON.parse(data) as PosibleReturnedTypeData) : undefined;
  } catch (e) {
    // error reading value
    console.error('[storage.service] getData error:', e);
    return [];
  }
};

const cleanData = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error('[storage.service] cleanData error:', e);
  }
};

const storageService = {
  getData,
  setData,
  cleanData,
};

export default storageService;
