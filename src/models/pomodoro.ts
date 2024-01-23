import { IStrTime, ITime } from './time';
import { Override } from './utils';

export type INewPomodoro = Omit<IPomodoro, 'id'>;

export type IStrPomodoro = Override<IPomodoro, { times: IStrTime[] }>;

export interface IPomodoro {
  id: string;
  name: string;
  times?: ITime[];
  main?: boolean;
}

export type IStrPomodoroState = Override<
  IPomodoroState,
  { pomodoro: IStrPomodoro; time: IStrTime; timeCount: string; running: string; updateDate: string; finalDate: string }
>;

export interface IPomodoroState {
  pomodoro: IPomodoro;
  time: ITime;
  timeCount: number;
  running: boolean;
  updateDate?: Date;
  finalDate?: Date;
  notificationId?: string;
}
