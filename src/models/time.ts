import { Override } from './utils';

export type INewTime = Omit<ITime, 'id'>;

export type IStrTime = Override<ITime, { time: string }>;

export interface ITime {
  id: string;
  name: string;
  time: number;
  background?: string;
}
