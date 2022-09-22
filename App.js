import React, {useEffect} from 'react';
import {LogBox} from 'react-native';
import {Provider, useDispatch, useSelector} from 'react-redux';
import logger from 'redux-logger';
import {createStore, applyMiddleware} from 'redux';
import rootReducer from './src/reducers/index';
import Loading from './src/components/global/loading';
import {getValue, removeValue} from './src/async';
import {apiPost} from './src/axios';
import Router from './src/router';
import Welcome from './src/screens/auth/welcome';
import Pusher from 'pusher-js/react-native';
import l from './src/languages.json';
import KeepAwake from 'react-native-keep-awake';
import notifee from '@notifee/react-native';

LogBox.ignoreLogs(['new NativeEventEmitter']);
LogBox.ignoreAllLogs();

const AppWrapper = () => {
    const store = createStore(rootReducer);

    return (
        <Provider store={store}>
            <App />
        </Provider>
    );
};

const App = () => {
    const dispatch = useDispatch();
    const data = useSelector((state) => state);
    const [loading, setLoading] = React.useState(true);

    async function onDisplayNotification(title, body) {
        // Request permissions (required for iOS)
        await notifee.requestPermission();

        // Create a channel (required for Android)
        const channelId = await notifee.createChannel({
            id: 'default',
            name: 'Default Channel',
        });

        // Display a notification
        await notifee.displayNotification({
            title: title,
            body: body,
            android: {
                channelId,
                pressAction: {
                    id: 'default',
                },
            },
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
        getValue('TrendTaxiMapTheme').then((theme) => {
            if (theme) dispatch({type: 'mapTheme', payload: theme});
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
                            dispatch({type: 'isAuth', payload: true});
                            if (response.data.response.trip) {
                                dispatch({type: 'setTrip', payload: response.data.response.trip});
                            }
                            dispatch({type: 'isLoading', payload: false});
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
                        removeValue('TrendTaxiUser');
                        dispatch({type: 'isLoading', payload: false});
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
            dispatch({type: 'authRemove'});
            dispatch({type: 'isAuth', payload: false});
            dispatch({type: 'setTrip', payload: null});

            dispatch({type: 'isLoading', payload: false});
        };
    }, []);

    useEffect(() => {
        notifee.cancelAllNotifications();
        const abortController = new AbortController();
        if (data.app.isActive || data.trip.trip != null) {
            KeepAwake.activate();
        } else {
            KeepAwake.deactivate();
        }
        if (data.auth.userId > 0) {
            Pusher.logToConsole = false;
            var pusher = new Pusher('56fc65fe2a3519f82046', {
                cluster: 'ap2',
            });
            var channel = pusher.subscribe('tripevent-' + data.auth.userId);
            channel.bind('trip', function (socket) {
                if (socket.message.prc == 'bildirim') {
                    onDisplayNotification(socket.message.title, socket.message.body);
                }
                if (socket.message.prc == 'driver_request') {
                    if (data.app.isActive) {
                        onDisplayNotification(
                            l[data.app.lang].yenitripTitle,
                            socket.message.trip.passenger.user_name,
                        );

                        dispatch({type: 'ia', payload: false});
                        dispatch({type: 'setRequest', payload: socket.message.trip});
                    }
                }
                if (socket.message.prc == 'driver_not_found') {
                    dispatch({type: 'ia', payload: true});
                    dispatch({type: 'setRequest', payload: null});
                    dispatch({type: 'setTrip', payload: null});
                    dispatch({type: 'setTripFind', payload: false});
                    alert(l[data.app.lang].carnotfound);
                }

                if (socket.message.prc == 'trip_check') {
                    dispatch({type: 'setRequest', payload: null});
                    dispatch({type: 'setTrip', payload: socket.message.trip});
                    if (socket.message.trip == null) {
                        dispatch({type: 'ia', payload: true});
                    } else {
                        dispatch({type: 'ia', payload: false});
                    }
                    dispatch({type: 'setTripFind', payload: false});
                    dispatch({type: 'isLoading', payload: false});
                }
                if (socket.message.prc == 'driverLocation') {
                    if (socket.message.price) {
                        dispatch({
                            type: 'setTrip',
                            payload: {
                                ...data.trip.trip,
                                act_price: socket.message.price,
                                act_distance: socket.message.km,
                            },
                        });
                    } else {
                        dispatch({
                            type: 'setTrip',
                            payload: {
                                ...data.trip.trip,
                                driver: {
                                    ...data.trip.trip.driver,
                                    last_latitude: socket.message.locations[0],
                                    last_longitude: socket.message.locations[1],
                                },
                            },
                        });
                    }
                }
            });
        } else {
            pusher?.disconnect();
        }

        return () => {
            abortController.abort();
            pusher?.disconnect();
        };
    }, [data.app.isActive, data.auth.userId, data.trip.trip]);

    return (
        <>{data.app.isLoading ? <Loading /> : <>{data.auth.isAuth ? <Router /> : <Welcome />}</>}</>
    );
};

export default AppWrapper;
