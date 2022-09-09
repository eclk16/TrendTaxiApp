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
                            dispatch({type: 'isAuth', payload: true});
                            setLoading(false);
                        } else {
                            dispatch({type: 'authRemove'});
                            dispatch({type: 'isAuth', payload: false});
                            removeValue('TrendTaxiUser');
                            setLoading(false);
                        }
                    })
                    .catch((error) => {
                        dispatch({type: 'authRemove'});
                        dispatch({type: 'isAuth', payload: false});
                        removeValue('TrendTaxiUser');
                        setLoading(false);
                    });
            } else {
                dispatch({type: 'authRemove'});
                dispatch({type: 'isAuth', payload: false});
                setLoading(false);
            }
        });
    }, []);

    return <>{loading ? <Loading /> : <>{data.auth.isAuth ? <Router /> : <Welcome />}</>}</>;
};

export default AppWrapper;
