import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {list} from './components/global/menuList';
import {useSelector, useDispatch} from 'react-redux';
import l from './languages.json';
import Welcome from './screens/auth/welcome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {stil} from './utils';
import {Alert, TouchableOpacity} from 'react-native';
import {apiPost} from './axios';
import {removeValue} from './async';

//burayafont yükle gelecek

const Stack = createStackNavigator();

const Router = () => {
    const dispatch = useDispatch();
    const data = useSelector((state) => state);
    const [initialRoute, setInitialRoute] = React.useState('Home');

    return (
        <>
            {!data.auth.isAuth ? (
                <Welcome />
            ) : (
                <NavigationContainer initialRouteName={initialRoute}>
                    <Stack.Navigator>
                        {list.map((item, index) => {
                            return (
                                <Stack.Screen
                                    key={index}
                                    name={item.navigate}
                                    component={item.component}
                                    options={({navigation}) => ({
                                        headerMode: 'screen',
                                        headerShown: item.header,
                                        title: l[data.app.lang][item.text],
                                        headerTintColor: stil('text', data.app.theme).color,
                                        headerStyle: {
                                            backgroundColor: stil('bg', data.app.theme)
                                                .backgroundColor,
                                        },
                                        headerBackTitleVisible: false,
                                        headerTitleAlign: 'center',
                                        headerRight: ({tintColor}) => (
                                            <>
                                                {item.navigate == 'Profile' &&
                                                data.auth.user.user_status != 0 ? (
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            navigation.navigate('ProfileEdit');
                                                        }}>
                                                        <MaterialCommunityIcons
                                                            name="pencil"
                                                            color={tintColor}
                                                            size={24}
                                                            style={{
                                                                marginHorizontal:
                                                                    Platform.OS === 'ios' ? 8 : 0,
                                                            }}
                                                        />
                                                    </TouchableOpacity>
                                                ) : null}
                                                {item.navigate == 'ProfileEdit' &&
                                                data.auth.user.user_status != 0 ? (
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            Alert.alert(
                                                                l[data.app.lang]
                                                                    .are_you_sure_you_want_to_exit,
                                                                '',
                                                                [
                                                                    {
                                                                        text: l[data.app.lang]
                                                                            .cancel,
                                                                        onPress: () => {},
                                                                        style: 'cancel',
                                                                    },
                                                                    {
                                                                        text: l[data.app.lang]
                                                                            .confirm,
                                                                        onPress: () => {
                                                                            dispatch({
                                                                                type: 'authRemove',
                                                                            });
                                                                            dispatch({
                                                                                type: 'isAuth',
                                                                                payload: false,
                                                                            });
                                                                            dispatch({
                                                                                type: 'setTrip',
                                                                                payload: null,
                                                                            });
                                                                            removeValue(
                                                                                'TrendTaxiUser',
                                                                            );
                                                                        },
                                                                    },
                                                                ],
                                                                {cancelable: false},
                                                            );
                                                        }}>
                                                        <MaterialCommunityIcons
                                                            name="delete"
                                                            color={tintColor}
                                                            size={24}
                                                            style={{
                                                                marginHorizontal:
                                                                    Platform.OS === 'ios' ? 8 : 0,
                                                            }}
                                                        />
                                                    </TouchableOpacity>
                                                ) : null}
                                            </>
                                        ),
                                    })}
                                />
                            );
                        })}
                    </Stack.Navigator>
                </NavigationContainer>
            )}
        </>
    );
};

export default Router;
