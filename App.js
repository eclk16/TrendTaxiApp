import React, {useEffect} from 'react';
import {LogBox} from 'react-native';
import {Provider, useDispatch, useSelector} from 'react-redux';
import logger from 'redux-logger';
import {createStore, applyMiddleware} from 'redux';
import rootReducer from './src/reducers/index';
import Router from './src/router';
import Welcome from './src/pages/auth/welcome';
import Loading from './src/components/global/loading';
import axios from 'axios';
import TimerPage from './src/pages/auth/timer';
import DriverRegister from './src/pages/auth/driverRegister';
import {setValue, getValue, removeValue} from './src/async';

LogBox.ignoreAllLogs();

const AppWrapper = () => {
    const store = createStore(rootReducer, applyMiddleware(logger));
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

    useEffect(() => {
        getValue('lang').then((lang) => {
            if (lang) dispatch({type: 'lang', payload: lang});
        });
        getValue('theme').then((theme) => {
            if (theme) dispatch({type: 'theme', payload: theme});
        });
        getValue('relogin23').then((cg) => {
            if (!cg) {
                removeValue('userData');
                setLoading(false);
                setValue('relogin23', 'a');
                dispatch({type: 'authRemove'});
                dispatch({type: 'isAuth', payload: false});
            } else {
                getValue('userData').then((res) => {
                    if (res) {
                        dispatch({type: 'setAuth', payload: JSON.parse(res)});
                        dispatch({type: 'isAuth', payload: true});
                        setLoading(false);
                        getUserData(JSON.parse(res).userId, JSON.parse(res).userToken);
                    } else {
                        dispatch({type: 'authRemove'});
                        dispatch({type: 'isAuth', payload: false});
                        setLoading(false);
                    }
                });
            }
        });
    }, []);

    const getUserData = (userId, token) => {
        const config = {headers: {Authorization: `Bearer ${token}`}};
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
        axios.get('https://trendtaxi.uz/api/getUserData/' + userId, config).then((response) => {
            if (!response.data.data.hata) {
                let json = {
                    userId: response.data.data.id,
                    userToken: data.auth.userToken,
                    userType: response.data.data.user_type,
                    user: response.data.data,
                    currentTheme: data.app.theme,
                    lang: data.app.lang,
                };
                json = JSON.stringify(json);
                // setValue('userData',json);
                dispatch({type: 'setUser', payload: response.data.data});
            }
        });
    };

    return (
        <>
            {loading ? (
                <Loading />
            ) : (
                <>
                    {data.auth.isAuth ? (
                        //
                        <>
                            {data.auth.user.passenger.status == 0 &&
                            data.auth.user.user_type == 'driver' ? (
                                <DriverRegister />
                            ) : (
                                <Router />
                            )}
                        </>
                    ) : (
                        <Welcome />
                    )}
                </>
            )}
        </>
    );
};

export default AppWrapper;
