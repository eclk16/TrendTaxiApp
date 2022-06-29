import React,{useEffect} from 'react';
import {LogBox} from 'react-native';
import { Provider,useDispatch,useSelector } from 'react-redux';
import logger from 'redux-logger';
import {createStore,applyMiddleware} from 'redux';
import rootReducer from './src/reducers/index';
import { getValue } from './src/async';
import Router from './src/router';
import Welcome from './src/pages/auth/welcome';
import Loading from './src/components/global/loading';

LogBox.ignoreAllLogs();


const AppWrapper = () => {
    const store = createStore(rootReducer, applyMiddleware(logger));
    return (
      <Provider store={store}> 
        <App /> 
      </Provider>
    )
  }

const App = () => {
	const dispatch = useDispatch();
    const data = useSelector(state => state);
    const [loading,setLoading] = React.useState(true);

	useEffect(() => {
        getValue('lang').then(lang => {
            if(lang)
                dispatch({type:'lang',payload:lang});
        });
        getValue('theme').then(theme => {
            if(theme)
                dispatch({type:'theme',payload:theme});
        });
        getValue('userData').then(res => {

            if(res){
                dispatch({type:'setAuth',payload:JSON.parse(res)});
                dispatch({type:'isAuth',payload:true});
                setLoading(false);
            }
            else{
                dispatch({type: 'authRemove'});
                dispatch({type: 'isAuth',payload:false});
                setLoading(false);
            }
        });
    }, []);

	return (
        <>
            {loading ?
                <Loading />
                :
                <>
                    {data.auth.isAuth ?
                        <Router/>
                        :
                        <Welcome />
                    }
                </>
            }
        </>
	);
};

export default AppWrapper;