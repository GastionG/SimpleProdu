import { NavigationContainer } from '@react-navigation/native';
import Home from '../views/Home';
import Pomodoro from '../views/Pomodoro';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import TaskManager from '../views/TaskManager';
import AddTask from '../views/AddTask';
import { BottomTabBarProps, BottomTabHeaderProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TaskDetail from '../views/TaskDetail';
import { RootStackParams } from '../models/rootStackParams';
import PomodoroManager from '../views/PomodoroManager';
import AddPomodoro from '../views/AddPomodoro';
import PomodoroDetail from '../views/PomodoroDetail';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator<RootStackParams>();

export default function Routes() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        backBehavior='history'
        initialRouteName='Home'
        tabBar={(props) => <TabBar {...props}></TabBar>}
        screenOptions={{ lazy: true, header: (props) => <Header {...props} /> }}
      >
        <Tab.Screen name='Home' options={{ title: 'Home' }} component={Home} />
        <Tab.Screen name='Pomodoro' options={{ title: 'Pomodoro' }} component={Pomodoro} />
        <Tab.Screen name='Pomodoros' options={{ title: 'Pomodoros' }} component={PomodoroManager} />
        <Tab.Screen name='AddPomodoro' options={{ title: 'Agregar pomodoro' }} component={AddPomodoro} />
        <Tab.Screen name='PomodoroDetail' options={{ title: 'Pomodoro detalle' }} component={PomodoroDetail} />
        <Tab.Screen name='Tasks' options={{ title: 'Tareas' }} component={TaskManager} />
        <Tab.Screen name='AddTask' options={{ title: 'Agregar tarea' }} component={AddTask} />
        <Tab.Screen name='TaskDetail' options={{ title: 'Tarea detalle' }} component={TaskDetail} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const Header = ({ options, route, navigation }: BottomTabHeaderProps) => {
  const insets = useSafeAreaInsets();
  const isDeepRoute = ['TaskDetail', 'AddTask', 'Pomodoros', 'AddPomodoro', 'PomodoroDetail'].includes(route.name);
  return (
    <View
      style={{
        backgroundColor: '#fff',
        marginTop: insets.top,
        flexDirection: 'row',
        paddingBottom: 5,
        paddingTop: 11,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderColor: '#444',
        justifyContent: isDeepRoute ? 'space-between' : 'center',
        alignItems: 'center',
      }}
    >
      {isDeepRoute && (
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Text style={styles.textHeaderButton}>Volver</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.headerTitle}>{options.title}</Text>
      {/* <View style={{ width: '30%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}></View>
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}></View>
      <View style={{ width: '20%', flexDirection: 'row', justifyContent: 'flex-end' }}></View> */}
    </View>
  );
};

const TabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  return (
    <View style={styles.bar}>
      {state.routes
        .filter(
          (route) =>
            route.name !== 'AddTask' &&
            route.name !== 'TaskDetail' &&
            route.name !== 'Pomodoros' &&
            route.name !== 'AddPomodoro' &&
            route.name !== 'PomodoroDetail',
        )
        .map((route, index) => {
          const { options } = descriptors[route.key];

          const label = options.title !== undefined ? options.title : route.name;

          const isFocused = state.routeNames.map((routeName) => routeName).indexOf(route.name) === state.index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole='button'
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.button}
            >
              <Text style={[styles.textButton, { color: isFocused ? '#222' : '#666' }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
    </View>
  );
};

const styles = StyleSheet.create({
  headerButton: { backgroundColor: '#444', borderRadius: 10, padding: 10, justifyContent: 'center' },
  textHeaderButton: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#444',
    margin: 'auto',
    padding: 10,
    flex: 1,
    textAlign: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  button: {
    flex: 1,
    paddingVertical: 20,
  },
  textButton: {
    fontWeight: '800',
    textAlign: 'center',
  },
});
