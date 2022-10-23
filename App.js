import React, {useEffect} from 'react';

import {Provider, useDispatch, useSelector} from 'react-redux';
import {createStore} from 'redux';
import rootReducer from './src/reducers/index';
import Loading from './src/components/global/loading';
import {getValue, removeValue} from './src/async';
import {apiPost} from './src/axios';
import Router from './src/router';
import Pusher from 'pusher-js/react-native';
import l from './src/languages.json';
import KeepAwake from 'react-native-keep-awake';
import messaging from '@react-native-firebase/messaging';
import {Alert, LogBox} from 'react-native';
import notifee, {AndroidImportance, AndroidVisibility} from '@notifee/react-native';
import Sound from 'react-native-sound';

import {useNetInfo} from '@react-native-community/netinfo';

LogBox.ignoreLogs(['new NativeEventEmitter']);
LogBox.ignoreAllLogs();

const AppWrapper = () => {
    const store = createStore(rootReducer);
    Sound.setCategory('Playback');
    let soundFile = 'ses14.mp3';
    if (Platform.OS === 'ios') {
        soundFile = 'ses-14.mp3';
    } else {
        soundFile = 'ses14.mp3';
    }

    async function requestUserPermission() {
        const authStatus = await messaging().requestPermission({
            alert: true,
            criticalAlert: true,
            announcement: true,
            provisional: false,
            sound: true,
        });
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            // console.log('Authorization status:', enabled);
        }
    }

    async function messagingListener() {
        messaging().onNotificationOpenedApp((remoteMessage) => {
            console.log(
                'Notification caused app to open from background state:',
                remoteMessage.notification,
            );
        });

        // Check whether an initial notification is available
        messaging()
            .getInitialNotification()
            .then((remoteMessage) => {
                if (remoteMessage) {
                    console.log(
                        'Notification caused app to open from quit state:',
                        remoteMessage.notification,
                    );
                }
            });

        messaging().onMessage(async (remoteMessage) => {
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
    }

    useEffect(() => {
        requestUserPermission();

        messagingListener();
    }, []);
    useEffect(() => {
        notifee.cancelAllNotifications();
    });

    return (
        <Provider store={store}>
            <App />
        </Provider>
    );
};

const App = () => {
    const dispatch = useDispatch();
    const data = useSelector((state) => state);
    const netInfo = useNetInfo();

    const [p, setP] = React.useState(null);

    async function getNToken(arr) {
        // await messaging().registerDeviceForRemoteMessages();
        const token = await messaging().getToken();

        apiPost('updateUser', {...arr, remember_token: token})
            .then((res) => {})
            .catch((err) => {
                console.log({...arr, remember_token: token});
                console.log('APP.JS token', err);
            });
        return token;
    }

    function sendNotification(to, body, title, subtitle) {
        var myHeaders = new Headers();
        myHeaders.append(
            'Authorization',
            'key=AAAAfZtd-kk:APA91bEkNRkI3IZYdHyu9cjRBsXZlpYupj4u-HboijWEb754fHhGs9hFrYvISxmKHLNQFkU4ChNNsKhOSvVI3bymJ1DjpFHrk5klX29BAtXoL8ISakbD_cEGSkLTkHnSUezBt6U3IJ-a',
        );
        myHeaders.append('Content-Type', 'application/json');

        var raw = JSON.stringify({
            to: to,
            notification: {
                title: title,
                body: body,
                subtitle: subtitle,
            },
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow',
        };

        fetch('https://fcm.googleapis.com/fcm/send', requestOptions)
            .then((response) => response.text())
            .then((result) => console.log(result))
            .catch((err) => {
                console.log(err);
            });
    }

    useEffect(() => {
        const abortController = new AbortController();
        getValue('TrendTaxiLang').then((lang) => {
            if (lang) dispatch({type: 'lang', payload: lang});
        });
        getValue('TrendTaxiTheme').then((theme) => {
            if (theme) dispatch({type: 'theme', payload: theme});
        });
        getValue('TrendTaxiUser').then((user) => {
            if (user) {
                user = JSON.parse(user);
                apiPost('getUser', {
                    token: user.token,
                    id: user.id,
                })
                    .then((response) => {
                        if (response != false) {
                            dispatch({type: 'setId', payload: user.id});
                            dispatch({type: 'setToken', payload: user.token});
                            dispatch({type: 'setType', payload: response.data.response.user_type});
                            dispatch({type: 'setUser', payload: response.data.response});
                            if (response.data.response.trip) {
                                dispatch({type: 'setTrip', payload: response.data.response.trip});
                            }
                            dispatch({type: 'isLoading', payload: false});
                            dispatch({type: 'isAuth', payload: true});
                        } else {
                            dispatch({type: 'authRemove'});
                            dispatch({type: 'isAuth', payload: false});
                            dispatch({type: 'setTrip', payload: null});
                            removeValue('TrendTaxiUser');
                            dispatch({type: 'isLoading', payload: false});
                        }
                    })
                    .catch((error) => {
                        dispatch({type: 'authRemove'});
                        dispatch({type: 'isAuth', payload: false});
                        dispatch({type: 'setTrip', payload: null});
                        dispatch({type: 'isLoading', payload: false});
                        console.log('APP.JS ERROR (GET USER)', error);
                    });
            } else {
                dispatch({type: 'authRemove'});
                dispatch({type: 'isAuth', payload: false});
                dispatch({type: 'setTrip', payload: null});
                dispatch({type: 'isLoading', payload: false});
            }
        });
        return () => {
            abortController.abort();
        };
    }, []);

    useEffect(() => {
        if (data.auth.isAuth == true) {
            apiPost('getUser', {
                token: data.auth.userToken,
                id: data.auth.userId,
            })
                .then((response) => {
                    if (response != false) {
                        dispatch({type: 'setId', payload: data.auth.userId});
                        dispatch({type: 'setToken', payload: data.auth.userToken});
                        dispatch({type: 'setType', payload: response.data.response.user_type});
                        dispatch({type: 'setUser', payload: response.data.response});

                        if (response.data.response.trip) {
                            if (data.trip.trip == null) {
                                dispatch({type: 'setTrip', payload: response.data.response.trip});
                            }
                        }
                        dispatch({type: 'isLoading', payload: false});
                        dispatch({type: 'isAuth', payload: true});
                    }
                })
                .catch((error) => {
                    console.log('APP.JS ERROR (GET USER2)', error);
                });
        }
        return () => {
            false;
        };
    }, [data.auth.isAuth]);

    useEffect(() => {
        if (data.auth.isAuth == true) {
            apiPost('getUser', {
                token: data.auth.userToken,
                id: data.auth.userId,
            })
                .then((response) => {
                    if (response != false) {
                        dispatch({type: 'setUser', payload: response.data.response});
                    }
                })
                .catch((error) => {
                    console.log('APP.JS ERROR (GET USER2)', error);
                });
        }
        return () => {
            false;
        };
    }, [data.auth.isAuth]);

    useEffect(() => {
        if (p != null) {
            if (p.message.prc == 'bildirim') {
                sendNotification(
                    data.auth.user.remember_token,
                    p.message.body,
                    p.message.title,
                    '',
                );
            }

            if (p.message.prc == 'driver_request') {
                // if (data.app.isActive) {
                let t = new Date();
                t = t.getTime();

                dispatch({
                    type: 'setRequest',
                    payload: {...p.message.trip, time: t},
                });
                // }
            }
            if (p.message.prc == 'driver_not_found') {
                dispatch({type: 'setRequest', payload: null});
                dispatch({type: 'setTrip', payload: null});
                dispatch({type: 'setTripFind', payload: false});
                Alert.alert(
                    '',
                    l[data.app.lang].carnotfound,
                    [
                        {
                            text: l[data.app.lang].check,
                            onPress: () => console.log('Cancel Pressed'),
                            style: 'cancel',
                        },
                    ],
                    {cancelable: false},
                );
            }

            if (p.message.prc == 'trip_check') {
                dispatch({type: 'isLoading', payload: true});
                dispatch({type: 'setRequest', payload: null});

                dispatch({type: 'setTrip', payload: p.message.trip});

                dispatch({type: 'setTripFind', payload: false});

                dispatch({type: 'isLoading', payload: false});
                apiPost('getUser', {
                    token: data.auth.userToken,
                    id: data.auth.userId,
                })
                    .then((response) => {
                        if (response != false) {
                            dispatch({type: 'setUser', payload: response.data.response});
                        }
                    })
                    .catch((error) => {
                        console.log('APP.JS ERROR (GET USER2)', error);
                    });
            }
            if (p.message.prc == 'driverLocation') {
                if (data.trip.trip !== null) {
                    dispatch({
                        type: 'setTrip',
                        payload: {
                            ...data.trip.trip,
                            driver: {
                                ...data.trip.trip.driver,
                                last_latitude: p.message.locations[0],
                                last_longitude: p.message.locations[1],
                            },
                        },
                    });
                }
            }
        }
        return () => {
            setP(null);
        };
    }, [p]);

    useEffect(() => {
        if (data.auth.userId > 0 && data.auth.userToken != null) {
            getNToken({
                id: data.auth.userId,
                token: data.auth.userToken,
            });
        }
        return () => {
            false;
        };
    }, [data.auth.userId, data.auth.userToken]);

    useEffect(() => {
        KeepAwake.activate();
        if (data.auth.userId > 0) {
            Pusher.logToConsole = false;
            var pusher = new Pusher('56fc65fe2a3519f82046', {
                cluster: 'ap2',
            });
            var channel = pusher.subscribe('tripevent-' + data.auth.userId);
            channel.bind('trip', function (socket) {
                setP(socket);
            });
        } else {
            pusher?.disconnect();
        }
        return () => {
            KeepAwake.deactivate();
            pusher?.disconnect();
        };
    }, [data.auth.userId]);

    return <>{data.app.isLoading || !netInfo.isConnected.toString() ? <Loading /> : <Router />}</>;
};

export default AppWrapper;
