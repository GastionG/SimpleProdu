import { INewTask, IStrTask, ITask } from '../models/task';
import notificationService from './notification.service';
import storageService from './storage.service';

const strDateToObj = (strDate: string): Date | null => {
  if (!strDate) return null;
  return new Date(strDate);
};

const storeTasks = async (value: ITask[]) => {
  try {
    await storageService.setData('my-tasks', value);
  } catch (e) {
    console.error('[task.service] storeTasks error:', e);
  }
};

const getTasks = async (): Promise<ITask[]> => {
  try {
    const tasks = (await storageService.getData('my-tasks')) as IStrTask[];

    const formattedTasks: ITask[] = tasks?.map((task) => {
      return {
        ...task,
        notification: {
          ...task.notification,
          date: strDateToObj(task.notification?.date || ''),
        },
      } as ITask;
    });

    return formattedTasks || [];
  } catch (e) {
    console.error('[task.service] getTasks error:', e);
    return [];
  }
};

const getTask = async (taskId: string): Promise<ITask | undefined> => {
  try {
    const tasks = await getTasks();
    const task = tasks?.find((t) => t.id === taskId);
    return task;
  } catch (e) {
    console.error('[task.service] getTask error:', e);
    return undefined;
  }
};

const pushTask = async (newTask: INewTask) => {
  try {
    const tasks = await getTasks();
    const task = {
      ...newTask,
      id: 'task-' + Date.now().toString(36) + Math.random().toString(36).slice(2),
    };

    await notificationService.scheduleTask(task);

    tasks?.push(task);
    storeTasks(tasks);
  } catch (e) {
    console.error('[task.service] pushTask error:', e);
  }
};

const editTask = async (task: ITask) => {
  try {
    const tasks = await getTasks();

    if (task.notification?.id) {
      await notificationService.cancelNoti(task.notification.id);
    }

    await notificationService.scheduleTask(task);
    // replace the old task with the new one
    tasks?.splice(tasks.map((t) => t.id).indexOf(task.id), 1, task);

    await storeTasks(tasks);
  } catch (e) {
    console.error('[task.service] editTask error:', e);
  }
};

const removeTask = async (taskId: string) => {
  try {
    const tasks = await getTasks();
    const removedTask = tasks?.splice(tasks.map((t) => t.id).indexOf(taskId), 1);
    // pushRemovedTask(removedTask[0]); // para guardar la tarea removida en una papelera
    if (removedTask[0].notification?.id) {
      await notificationService.cancelNoti(removedTask[0].notification.id);
    }

    storeTasks(tasks);
  } catch (e) {
    console.error('[task.service] removeTask error:', e);
  }
};

const removeOldTasks = async () => {
  try {
    const tasks = await getTasks();
    const oldTasks = tasks.filter(
      (t) => t.notification && t.notification.date && t.notification.date.getTime() < Date.now(),
    );

    for (let i = 0; i < oldTasks.length; i++) {
      const ot = oldTasks[i];
      if (ot.notification?.id) {
        await notificationService.cancelNoti(ot.notification.id);
      }
      tasks?.splice(tasks.map((t) => t.id).indexOf(ot.id), 1);
    }

    storeTasks(tasks);
  } catch (e) {
    console.error('[task.service] removeOldTasks error:', e);
  }
};

const getRemovedTasks = async (): Promise<ITask[]> => {
  try {
    return (await storageService.getData('my-removed-tasks')) as ITask[];
  } catch (e) {
    // error reading value
    console.error('[task.service] getRemovedTasks error:', e);
    return [];
  }
};

const storeRemovedTasks = async (value: ITask[]) => {
  try {
    await storageService.setData('my-removed-tasks', value);
  } catch (e) {
    console.error('[task.service] storeRemovedTasks error:', e);
  }
};

const pushRemovedTask = async (task: ITask) => {
  try {
    const tasks = await getRemovedTasks();
    tasks?.push(task);
    storeRemovedTasks(tasks);
  } catch (e) {
    console.error('[task.service] pushRemovedTask error:', e);
  }
};

const hardRemoveTask = async (taskId: string) => {
  try {
    const tasks = await getRemovedTasks();
    tasks?.splice(tasks.map((t) => t.id).indexOf(taskId), 1);
    storeRemovedTasks(tasks);
  } catch (e) {
    console.error('[task.service] hardRemoveTask error:', e);
  }
};

const taskService = {
  getTasks,
  getTask,
  pushTask,
  editTask,
  removeTask,
  removeOldTasks,
  getRemovedTasks,
  pushRemovedTask,
  hardRemoveTask,
};

export default taskService;
