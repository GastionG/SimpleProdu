import { Override } from './utils';

export type INewTask = Omit<ITask, 'id'>;

export type IStrTask = Override<ITask, { notification?: { id?: string; date?: string } }>;

export interface ITask {
  id: string;
  title: string;
  description?: string;
  notification?: {
    id?: string;
    date?: Date | null;
  };
  status: 'DONE' | 'TODO';
}
