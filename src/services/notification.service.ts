import { IPomodoroState } from '../models/pomodoro';
import { ITask } from '../models/task';
import * as Notifications from 'expo-notifications';

const scheduleTask = async (task: ITask) => {
  if (task.notification?.date) {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: task.title,
        body: task.description || '',
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: {
        date: task.notification.date,
      },
    });

    task.notification.id = notificationId;
  }
};

const schedulePomodoro = async (pomodoroState: IPomodoroState) => {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Pomodoro ' + pomodoroState.pomodoro.name,
      body: 'El tiempo ' + pomodoroState.time.name + ' ha finalizado',
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: {
      date: pomodoroState.finalDate!,
    },
  });
  pomodoroState.notificationId = notificationId;
};

const cancelNoti = async (id: string) => {
  await Notifications.cancelScheduledNotificationAsync(id);
  id = '';
};

const notificationService = {
  scheduleTask,
  schedulePomodoro,
  cancelNoti,
};

export default notificationService;
