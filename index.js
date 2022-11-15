/**
 * @format
 */
import 'react-native-gesture-handler';
import {AppRegistry, Platform} from 'react-native';
import {name as appName} from './app.json';
import AppWrapper from './App';
import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance, AndroidVisibility, EventType} from '@notifee/react-native';
import {apiPost} from './src/axios';

onMessageReceived({
    collapseKey: 'com.trendtaxiuz',
    data: {},
    from: '539477539401',
    messageId: '0:1668207935338226%7640cc337640cc33',
    notification: {
        android: {},
        body: 'Fatih sultan mehmet bulvarı >>> Osmangazi Aritmi hastanesi',
        title: '32 min - 23 km',
        data: {
            trip_id: 8113,
            user_id: 53475,
            type: 'request',
        },
    },
    data: {
        trip_id: 8113,
        user_id: 53475,
        type: 'request',
    },
    sentTime: 1668207935229,
    ttl: 2419200,
});
async function onMessageReceived(remoteMessage) {
    await notifee.cancelAllNotifications();
    await messaging().unsubscribeFromTopic('all');

    await notifee.setNotificationCategories([
        {
            id: 'tripConfirm',
            actions: [
                {
                    id: 'tripConfirm',
                    title: 'Tasdiqlash',
                },
            ],
        },
    ]);

    const channelId = await notifee.createChannel({
        id: 'alarm',
        name: 'Important Notifications',
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
        sound: 'ses14',
    });

    const n = {
        trip: {
            android: {
                importance: AndroidImportance.HIGH,
                channelId,
                largeIcon: 'https://trendtaxi.uz/uploads/RenkliLogo.svg',
                color: 'green',
                colorized: true,
                progress: {
                    max: 100,
                    current: 50,
                    indeterminate: true,
                },
                timestamp: new Date().getTime() + 10000,
                showTimestamp: true,
                showChronometer: true,
                chronometerDirection: 'down',
                sound: 'ses14',
                category: 'call',
                importance: 1,
                visibility: 1,
                vibration: true,
                vibrationPattern: [300, 500],
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
                    id: 'tripConfirm',
                },
            },
            ios: {
                sound: 'ses-14.caf',
                categoryId: 'tripConfirm',
            },
        },
        n: {
            android: {
                importance: AndroidImportance.HIGH,
                channelId,
                largeIcon: 'https://trendtaxi.uz/uploads/RenkliLogo.svg',
                color: 'green',
                colorized: true,
                sound: 'ses14',
                category: 'call',
                importance: 1,
                visibility: 1,
                vibration: true,
                vibrationPattern: [300, 500],
            },
            ios: {
                sound: 'ses-14.caf',
            },
        },
    };

    await notifee.displayNotification({
        title: remoteMessage.notification?.title
            ? remoteMessage.notification?.title
            : remoteMessage.data?.title,
        body: remoteMessage.notification?.body
            ? remoteMessage.notification?.body
            : remoteMessage.data?.body,
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
// notifee.onBackgroundEvent();

messaging().onMessage(onMessageReceived);
messaging().setBackgroundMessageHandler(onMessageReceived);
notifee.onBackgroundEvent(onMessageReceived);

// notifee.onBackgroundEvent(async ({type, detail}) => {
//     await messaging().requestPermission();
//     if (type === EventType.ACTION_PRESS && detail.pressAction.id) {
//         let idler = detail.notification.subtitle.split('-');

//         apiPost('BildirimleOnay', {
//             trip_id: idler[1],
//             user_id: idler[3],
//         }).catch((err) => {
//             console.log(err);
//         });
//         await notifee.cancelNotification(detail.notification.id);
//     }
// });
notifee.onForegroundEvent(async ({type, detail}) => {
    await messaging().requestPermission();
    if (type === EventType.ACTION_PRESS && detail.pressAction.id) {
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
