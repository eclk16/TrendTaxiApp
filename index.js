/**
 * @format
 */
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';
import AppWrapper from './App';
import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance, AndroidVisibility, EventType} from '@notifee/react-native';
import {apiPost} from './src/axios';

// onMessageReceived({
//     data: {
//         trip_id: 6903,
//         json: JSON.stringify({
//             body: 'bursa fatih sultan mehmet bulvarı -> bursa şehir hastanesi',
//             title: '23 min - 32 km | biniş uzaklığı : 4 km',

//             android: {
//                 trip_id: 1234,
//                 largeIcon: 'https://cdn-icons-png.flaticon.com/512/3986/3986941.png',
//                 color: 'green',
//                 colorized: true,
//                 progress: {
//                     max: 100,
//                     current: 50,
//                     indeterminate: true,
//                 },
//                 timestamp: Date.now() + 10000,
//                 showTimestamp: true,
//                 showChronometer: true,
//                 chronometerDirection: 'down',
//                 sound: 'ses14',
//                 // category: 'call',
//                 actions: [
//                     {
//                         title: 'ONAYLA - ACCEPT - RUSÇA',
//                         pressAction: {
//                             id: 'tripConfirm',
//                         },
//                     },
//                 ],
//                 pressAction: {
//                     id: 'default',
//                 },
//             },
//             ios: {
//                 critical: true,
//                 sound: 'ses-14.caf',
//                 criticalVolume: 1,
//                 categoryId: 'tripConfirm',
//                 attachments: [
//                     {
//                         url: 'https://cdn-icons-png.flaticon.com/512/3986/3986941.png',
//                     },
//                 ],
//             },
//         }),
//     },
// });
async function onMessageReceived(remoteMessage) {
    await messaging().requestPermission();
    let rm = remoteMessage;
    if (!rm.detail) {
        let bildirim = JSON.parse(rm.data.json);
        await notifee.cancelAllNotifications();
        await messaging().unsubscribeFromTopic('all');

        await notifee.setNotificationCategories([
            {
                id: 'tripConfirm',
                actions: [
                    {
                        id: 'tripConfirm',
                        title: 'Tasdiqlash',
                        foreground: true,
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
        await notifee.displayNotification({
            title: bildirim.title,
            body: bildirim.body,
            subtitle: bildirim.subtitle,
            android: {
                importance: AndroidImportance.HIGH,
                sound: 'ses14',
                category: 'call',
                channelId: 'alarm',
                timestamp: Date.now() + 10000,
                ...bildirim.android,
            },
            ios: {
                ...bildirim.ios,
                critical: true,
                sound: 'ses-14.caf',
                criticalVolume: 1,
                categoryId: 'tripConfirm',
            },
        });

        setTimeout(() => {
            notifee.cancelAllNotifications();
            messaging().unsubscribeFromTopic('all');
        }, 10000);
    }
}
// notifee.onBackgroundEvent();
messaging().onMessage(onMessageReceived);
messaging().setBackgroundMessageHandler(onMessageReceived);
notifee.onBackgroundEvent(async ({type, detail}) => {
    await messaging().requestPermission();
    if (type === EventType.ACTION_PRESS && detail.pressAction.id) {
        apiPost('BildirimleOnay', {
            trip_id: detail.notification.subtitle,
        }).catch((err) => {
            console.log(err);
        });
        await notifee.cancelNotification(detail.notification.id);
    }
});
notifee.onForegroundEvent(async ({type, detail}) => {
    await messaging().requestPermission();
    if (type === EventType.ACTION_PRESS && detail.pressAction.id) {
        apiPost('BildirimleOnay', {
            trip_id: detail.notification.subtitle,
        }).catch((err) => {
            console.log(err);
        });
        await notifee.cancelNotification(detail.notification.id);
    }
});

AppRegistry.registerComponent(appName, () => AppWrapper);
