import * as Notifications from 'expo-notifications';
import React, { useEffect } from 'react';
import { View, Button } from 'react-native';

const Notify = () => {
  useEffect(() => {
    async function requestPermissions() {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          alert('ต้องได้รับอนุญาตการแจ้งเตือน');
        }
      } catch (error) {
        console.error('Error requesting permissions:', error);
      }
    }

    requestPermissions();

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }, []);

  async function scheduleNotification() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "You've got mail!",
          body: 'Here is the notification body',
          data: { data: 'goes here', test: { test1: 'more data' } },
        },
        trigger: { seconds: 2 },
      });
      
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }
  

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Press to Schedule a Notification" onPress={scheduleNotification} />
    </View>
  );
};

export default Notify;
