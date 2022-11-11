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
import {Alert, BackHandler, Linking, LogBox, Platform} from 'react-native';
import config from './src/app.json';

LogBox.ignoreLogs(['new NativeEventEmitter']);
LogBox.ignoreLogs(['setNativeProps is deprecated and will be removed in next major release']);
LogBox.ignoreAllLogs();
import notifee, {EventType} from '@notifee/react-native';

import BackgroundGeolocation, {Location, Subscription} from 'react-native-background-geolocation';

const AppWrapper = () => {
    const store = createStore(rootReducer);
    const [checkApp, setCheckApp] = React.useState(false);

    getValue('TrendTaxiLang').then((lang) => {
        let la = 'uz';
        if (lang) la = lang;

        fetch('https://application.trendtaxi.uz/api/checkApp')
            .then((res) => res.json())
            .then((res) => {
                if (res.appActive) {
                    if (Platform.OS == 'ios') {
                        if (res.IOSversion == config.iosVersion) {
                            setCheckApp(true);
                        } else {
                            Alert.alert(
                                l[la].guncelleTitle,
                                l[la].guncelleText,
                                [
                                    {
                                        text: l[la].check,
                                        onPress: () => {
                                            Linking.openURL(res.appstore);
                                        },
                                    },
                                ],
                                {cancelable: false},
                            );
                        }
                    } else if (Platform.OS == 'android') {
                        if (res.ANDROIDversion == config.androidVersion) {
                            setCheckApp(true);
                        } else {
                            Alert.alert(
                                l[la].guncelleTitle,
                                l[la].guncelleText,
                                [
                                    {
                                        text: l[la].check,
                                        onPress: () => {
                                            Linking.openURL(res.playstore);
                                        },
                                    },
                                ],
                                {cancelable: false},
                            );
                        }
                    }
                } else {
                    Alert.alert(
                        l[la].appOfflineTitle,
                        l[la].appOfflineText,
                        [
                            {
                                text: l[la].check,
                                onPress: () => {
                                    BackHandler.exitApp();
                                },
                            },
                        ],
                        {cancelable: false},
                    );
                }
            })
            .catch((err) => {});
    });

    return <Provider store={store}>{checkApp ? <App /> : <Loading />}</Provider>;
};

const App = () => {
    const dispatch = useDispatch();
    const data = useSelector((state) => state);
    const [p, setP] = React.useState(null);

    const setLocation = (location) => {
        if (location.error !== 0) {
            let loc = {
                accuracy: 5,
                altitude: 0,
                altitude_accuracy: -1,
                ellipsoidal_altitude: 0,
                floor: 'aaa',
                heading: -1,
                heading_accuracy: -1,
                latitude: 41.299409367279715,
                longitude: 69.23993027755733,
                speed: -1,
                speed_accuracy: -1,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            };
            if (location.location) {
                loc = {
                    ...location.location.coords,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                };
            } else {
                loc = {
                    ...location.coords,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                };
            }
            if (loc.latitude && loc.longitude) {
                dispatch({
                    type: 'loc',
                    payload: loc,
                });
            }
        }
    };

    useEffect(() => {
        const onLocation = BackgroundGeolocation.onLocation(
            (location) => {
                // console.log(Platform.OS, '[onLocation]', location);
                setLocation(location);
            },
            (error) => {
                console.log('[onLocation] ERROR: ', error);
            },
        );

        const onMotionChange = BackgroundGeolocation.onMotionChange(
            (event) => {
                // console.log(Platform.OS, '[onMotionChange]', event);
                setLocation(event);
            },
            (error) => {
                console.log('[onLocation] ERROR: ', error);
            },
        );

        if (data.auth.isAuth) {
            bg();
            bgstart();
        }

        return () => {
            // Remove BackgroundGeolocation event-subscribers when the View is removed or refreshed
            // during development live-reload.  Without this, event-listeners will accumulate with
            // each refresh during live-reload.
            onLocation.remove();
            onMotionChange.remove();
        };
    }, [data.auth.isAuth]);

    // useEffect(() => {
    //     bgstart();
    // }, [data.trip]);

    async function bgstart() {
        await BackgroundGeolocation.stop();
        await BackgroundGeolocation.start();
        await BackgroundGeolocation.changePace(true);
    }

    async function bg() {
        let token = await BackgroundGeolocation.findOrCreateTransistorAuthorizationToken(
            'com.trendtaxiuz',
            'eclk16',
            'https://tracker.transistorsoft.com',
        );
        BackgroundGeolocation.ready({
            // transistorAuthorizationToken: token,
            // locationAuthorizationRequest: 'Always',
            // Geolocation Config
            desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
            distanceFilter: 5,
            foregroundService: true,
            //disabled notification

            // Activity Recognition
            stopTimeout: 5,

            trackingMode: BackgroundGeolocation.TRACKING_MODE_LOCATION,
            AccuracyAuthorization: BackgroundGeolocation.ACCURACY_AUTHORIZATION_FULL,
            AuthorizationStatus: BackgroundGeolocation.AUTHORIZATION_STATUS_ALWAYS,
            ActivityType: BackgroundGeolocation.ACTIVITY_TYPE_AUTOMOTIVE_NAVIGATION,
            // Application config
            debug: false, // <-- enable this hear sounds for background-geolocation life-cycle.
            logLevel: BackgroundGeolocation.LOG_LEVEL_OFF,
            stopOnTerminate: false, // <-- Allow the background-service to continue tracking when user closes the app.
            startOnBoot: true, // <-- Auto start tracking when device is powered-up.
            // HTTP / SQLite config
            url: config.apiBaseUrl + 'setLocation',
            batchSync: true, // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
            autoSync: true, // <-- [Default: true] Set true to sync each location to server as it arrives.
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + data.auth.userToken,
            },
            method: 'POST',
            // accessToken: data.auth.userToken,
            // authorization: {
            //     accessToken: data.auth.userToken,
            // },
            params: {
                // auth_token: data.auth.userToken, // <-- Optional HTTP params
                id: data.auth.userId,
            },
        })
            .then((state) => {
                // console.warn('[ready] SUCCESS: ', state);
            })
            .catch((error) => {
                // console.warn('[ready] ERROR: ', error);
            });
    }

    async function getNToken(arr) {
        // await messaging().registerDeviceForRemoteMessages();
        const token = await messaging().getToken();

        apiPost('updateUser', {...arr, remember_token: token});
        return token;
    }

    useEffect(() => {
        const abortController = new AbortController();
        getValue('TrendTaxiLang').then((lang) => {
            if (lang) dispatch({type: 'lang', payload: lang});
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
                            dispatch({
                                type: 'loc',
                                payload: {
                                    ...data.app.currentLocation,
                                    latitude: parseFloat(response.data.response.last_latitude),
                                    longitude: parseFloat(response.data.response.last_longitude),
                                },
                            });
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
        return () => {};
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
            if (p.message.prc == 'driver_request') {
                // if (data.app.isActive) {
                let t = new Date();
                t = t.getTime();

                dispatch({
                    type: 'setRequest',
                    payload: {
                        ...p.message.trip,
                        time: t,
                        first: data.trip.tripRequest === null ? true : false,
                    },
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

    return <>{data.app.isLoading ? <Loading /> : <Router />}</>;
};

export default AppWrapper;
