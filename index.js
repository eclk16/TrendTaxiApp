/**
 * @format
 */
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';
import AppWrapper from './App';
import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance, AndroidVisibility} from '@notifee/react-native';

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    await notifee.requestPermission();

    const channelId = await notifee.createChannel({
        id: 'important',
        name: 'Important Notifications',
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
        vibration: true,
        sound: 'ses14',
        vibrationPattern: [300, 500],
    });
    notifee.cancelAllNotifications();
    await notifee.displayNotification({
        title: remoteMessage.notification.title,
        body: remoteMessage.notification.body,
        ios: {critical: true, sound: 'ses-14.caf', criticalVolume: 1},
        android: {
            channelId,
            sound: 'ses14',
            importance: AndroidImportance.HIGH,
            visibility: AndroidVisibility.PUBLIC,
            vibration: true,
            vibrationPattern: [300, 500],
            pressAction: {
                id: 'default',
            },
        },
    });
});

AppRegistry.registerComponent(appName, () => AppWrapper);
