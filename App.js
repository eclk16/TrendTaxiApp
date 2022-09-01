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
import {setValue, getValue} from './src/async';

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

  const getTrip = (id, userToken, userType) => {
    const config = {
      headers: {Authorization: `Bearer ${userToken}`},
    };
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + userToken;
    axios
      .post('http://92.63.206.165/api/isActiveTrip', {
        id: id,
        lang: data.app.lang,
        type: userType + '_id',
      })
      .then((response) => {
        if (!response.data.data.hata) {
          dispatch({type: 'setTrip', payload: response.data.data});
        } else {
          dispatch({type: 'removeTrip', payload: {}});
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getValue('lang').then((lang) => {
      if (lang) dispatch({type: 'lang', payload: lang});
    });
    getValue('theme').then((theme) => {
      if (theme) dispatch({type: 'theme', payload: theme});
    });
    getValue('userData').then((res) => {
      if (res) {
        dispatch({type: 'setAuth', payload: JSON.parse(res)});
        dispatch({type: 'isAuth', payload: true});
        setLoading(false);
        getTrip(JSON.parse(res).userId, JSON.parse(res).userToken, JSON.parse(res).userType);
        getUserData(JSON.parse(res).userId, JSON.parse(res).userToken);
      } else {
        dispatch({type: 'authRemove'});
        dispatch({type: 'isAuth', payload: false});
        setLoading(false);
      }
    });
  }, []);

  const getUserData = (userId, token) => {
    const config = {headers: {Authorization: `Bearer ${token}`}};
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    axios.get('http://92.63.206.165/api/getUserData/' + userId, config).then((response) => {
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
            <>{data.auth.user.passenger.status == 0 ? <DriverRegister /> : <Router />}</>
          ) : (
            <Welcome />
          )}
        </>
      )}
    </>
  );
};

export default AppWrapper;
