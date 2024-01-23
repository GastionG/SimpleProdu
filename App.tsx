import 'react-native-gesture-handler';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Routes from './src/routes';

import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Notifications.setNotificationCategoryAsync('recordatorio', [
//   {
//     identifier: 'READ',
//     buttonTitle: 'Marcar como leido',
//     options: {
//       opensAppToForeground: false,
//     },
//   },
// ]);

// Notifications.addNotificationResponseReceivedListener(async (response) => {
//   if (response.notification.request.content.data) {
//     const { taskId, category } = response.notification.request.content.data;
//     if (category === 'recordatorio' && response.actionIdentifier === 'READ') {
//       const task = await taskService.getTask(taskId);
//       await Notifications.dismissNotificationAsync(response.notification.request.identifier);
//       if (task) {
//         await taskService.editTask({
//           ...task,
//           status: 'DONE',
//         });
//       }
//     }
//   }
// });

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Routes></Routes>
        <StatusBar style='auto' />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
