import Account from './pageEdit/Account';
import ListUser from './other/ListUser';
import MainPage from './page/MainPage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Fontisto, Ionicons } from '@expo/vector-icons';
import Notify from './other/Notify';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

function Auth() {
  const [user,setUser] = useState({});
  useFocusEffect(
    React.useCallback(() => {
      getToken();
    }, [])
  );

  const getToken = async () => {
    try {
      const tokenString = await AsyncStorage.getItem('user');
      if (tokenString) {
        const tokenObject = JSON.parse(tokenString);
        if (tokenObject) {
          setUser(tokenObject);
        } else {
          console.error('Error parsing token JSON');
        }
      } else {
        console.error('Token not found');
      }
    } catch (error) {
      console.error('Error retrieving the token:', error);
    }
  };
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          initialRouteName: 'MainPage', 
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
  
            if (route.name === 'List User') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'My Account') {
              iconName = focused ? 'person' : 'person-outline';
            } 
            // else if(route.name === 'Group Line'){
            //   return <Fontisto name='line' size={size} color={color} />;
            // }
  
            return <Ionicons name={iconName} size={size} color={color} />;          
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: '#000',
            paddingBottom: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily:'IBMPlexSans-Regular'
          },
        })}
      >
        <Tab.Screen name="Home" component={MainPage} />
        {user.roleID > 2 ? (null):(
          <Tab.Screen name="List User" component={ListUser} />
        )}
        <Tab.Screen name="My Account" component={Account} />
        {/* <Tab.Screen name="Notify" component={Notify} /> */}
      </Tab.Navigator>
    );
  }

export default Auth;