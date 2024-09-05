import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Welcome from './screens/Welcome';
import Login from './screens/Login';
import Signup from './screens/Signup';
import MEdit from './screens/pageEdit/MEdit';
import UEdit from './screens/pageEdit/UEdit';
import { AppRegistry, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Auth from './screens/Auth';
import LoadingPage from './screens/page/LoadingPage';
import LogPage from './screens/page/LogPage';
import PortPage from './screens/page/PortPage';
import Notify from './screens/other/Notify';
import { name as appName } from './app.json'; // ตรวจสอบว่าชื่อตรงกับที่กำหนดใน app.json
import PermissionPage from './screens/page/PermissionPage';
import LineGroupPage from './screens/page/LineGroupPage';

AppRegistry.registerComponent(appName, () => App);

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName='Welcome'>
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Auth" component={Auth} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="MEdit" component={MEdit} />
        <Stack.Screen name="UEdit" component={UEdit} />
        <Stack.Screen name="LogPage" component={LogPage} />
        <Stack.Screen name="LoadingPage" component={LoadingPage} />
        <Stack.Screen name="PortPage" component={PortPage} />
        <Stack.Screen name="Notify" component={Notify} />
        <Stack.Screen name="PermissionPage" component={PermissionPage} />
        <Stack.Screen name="GroupLine" component={LineGroupPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
