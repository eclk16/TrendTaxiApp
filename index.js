/**
 * @format
 */
import 'react-native-gesture-handler';
import {AppRegistry, Platform} from 'react-native';
import {name as appName} from './app.json';
import AppWrapper from './App';
import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance, EventType} from '@notifee/react-native';
import {apiPost} from './src/axios';

async function onMessageReceived(remoteMessage) {
    if (!remoteMessage.detail) {
        notifee.cancelAllNotifications();
        messaging().unsubscribeFromTopic('all');
        await notifee.setNotificationCategories([
            {
                id: 'tripRequest',
                actions: [
                    {
                        id: 'tripConfirm',
                        title: 'Tasdiqlash',
                        launchActivity: 'default',
                        foreground: true,
                    },
                ],
            },
        ]);

        const channelId = await notifee.createChannel({
            id: 'alarm',
            name: 'Important Notifications',
            importance: AndroidImportance.HIGH,
            sound: 'ses14',
        });
        const n = {
            trip: {
                android: {
                    sound: 'alarm',
                    importance: AndroidImportance.HIGH,
                    channelId,
                    largeIcon: 'https://trendtaxi.uz/uploads/RenkliLogo.svg',
                    color: 'green',
                    colorized: true,
                    sound: 'ses14',
                    alert: true,
                    progress: {
                        max: 10,
                        current: 9,
                        indeterminate: false,
                    },
                    timestamp: new Date().getTime() + 15000,
                    showTimestamp: true,
                    showChronometer: true,
                    chronometerDirection: 'down',
                    actions: [
                        {
                            title: 'TASDIQLASH',
                            pressAction: {
                                id: 'tripConfirm',
                                launchActivity: 'default',
                            },
                        },
                    ],
                    pressAction: {
                        id: 'default',
                    },
                },
                ios: {
                    categoryId: 'tripRequest',
                },
            },
            n: {
                android: {
                    sound: 'alarm',
                    importance: AndroidImportance.HIGH,
                    channelId,
                    largeIcon: 'https://trendtaxi.uz/uploads/RenkliLogo.svg',
                    color: 'green',
                    colorized: true,
                },
                ios: {},
            },
        };

        await notifee.displayNotification({
            title: remoteMessage.notification.title,
            body: remoteMessage.notification.body,
            subtitle:
                remoteMessage.data?.type === 'request'
                    ? Math.random().toString(36).substring(7) +
                      '-' +
                      remoteMessage.data.trip_id +
                      '-' +
                      Math.random().toString(36).substring(7) +
                      '-' +
                      remoteMessage.data.user_id
                    : '',
            android: n[remoteMessage.data?.type == 'request' ? 'trip' : 'n'].android,
            ios: n[remoteMessage.data?.type == 'request' ? 'trip' : 'n'].ios,
        });

        setTimeout(() => {
            notifee.cancelAllNotifications();
            messaging().unsubscribeFromTopic('all');
        }, 10000);
    }
}

messaging().onMessage(onMessageReceived);
messaging().setBackgroundMessageHandler(onMessageReceived);
notifee.onBackgroundEvent(async ({type, detail}) => {
    if (type === EventType.ACTION_PRESS) {
        let idler = detail.notification.subtitle.split('-');

        apiPost('BildirimleOnay', {
            trip_id: idler[1],
            user_id: idler[3],
        }).catch((err) => {
            console.log(err);
        });
        await notifee.cancelNotification(detail.notification.id);
    }
});
notifee.onForegroundEvent(async ({type, detail}) => {
    if (type === EventType.ACTION_PRESS) {
        let idler = detail.notification.subtitle.split('-');

        apiPost('BildirimleOnay', {
            trip_id: idler[1],
            user_id: idler[3],
        }).catch((err) => {
            console.log(err);
        });
        await notifee.cancelNotification(detail.notification.id);
    }
});
AppRegistry.registerComponent(appName, () => AppWrapper);
