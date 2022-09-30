import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {
    createDrawerNavigator,
    DrawerContentScrollView,
    DrawerItemList,
    DrawerItem,
} from '@react-navigation/drawer';
import {View, Text, TouchableOpacity, Image, Alert} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import l from './languages.json';
import {stil} from './utils';
import {useDispatch, useSelector} from 'react-redux';
import {removeValue} from './async';
import Harita from './screens/proccess/map';
import Trips from './screens/other/trips';
import Settings from './screens/other/settings';
import TripDetail from './screens/other/tripDetail';
import Profile from './screens/other/profile';
import Faq from './screens/other/faq';
import Reports from './screens/other/reports';
import StatusBarComponent from './components/global/status';
import ProfileEdit from './screens/other/profileEdit';
import config from './app.json';
import MapPage from './screens/proccess/map';
import MapPage2 from './screens/proccess/map2';
import Home from './screens/proccess';

MaterialCommunityIcons.loadFont();
const Drawer = createDrawerNavigator();

const Router = () => {
    const deleteAccount = () => {
        // const config = {
        //     headers: {Authorization: `Bearer ${data.auth.userToken}`},
        // };
        // axios.defaults.headers.common['Accept'] = 'application/json';
        // axios.defaults.headers.common['Content-Type'] = 'application/json';
        // axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.auth.userToken;
        // axios
        //     .post('https://trendtaxi.uz/api/updateUserData', {
        //         id: data.auth.userId,
        //     })
        //     .then((response) => {
        //         alert('your account has been deleted');
        //         dispatch({type: 'authRemove'});
        //         dispatch({type: 'isLogin', payload: false});
        //         removeValue('userData');
        //     })
        //     .catch((error) => {});
    };
    const dispatch = useDispatch();
    const data = useSelector((state) => state);

    const list = [
        {
            icon: 'home',
            text: l[data.app.lang].home,
            navigate: 'Home',
        },
        {
            icon: 'map-marker-distance',
            text: l[data.app.lang].trips,
            navigate: 'Trips',
        },
        {
            icon: 'account',
            text: l[data.app.lang].profile,
            navigate: 'Profile',
        },
        // {
        //     icon: 'google-analytics',
        //     text: l[data.app.lang].reports,
        //     navigate: 'Reports',
        // },
        {
            icon: 'cog',
            text: l[data.app.lang].settings,
            navigate: 'Settings',
        },
        {
            type: 'separator',
        },
        {
            icon: 'chat-question',
            text: l[data.app.lang].faq,
            navigate: 'Faq',
        },
        {
            icon: 'logout',
            text: l[data.app.lang].logout,
            navigate: '',
        },
    ];

    // list.unshift(
    //     data.auth.userType == 'passenger'
    //         ? {icon: 'arch', text: l[data.app.lang].start, navigate: 'Home'}
    //         : {icon: 'arch', text: l[data.app.lang].start, navigate: 'HomeDriverPage'},
    // );

    const menuButton = ({icon, text, navigate, index, props}) => {
        return (
            <TouchableOpacity
                key={index}
                style={[tw` rounded`, {borderColor: stil('text', data.app.theme).color}]}
                onPress={() => {
                    if (icon == 'logout') {
                        Alert.alert(
                            l[data.app.lang].logout,
                            l[data.app.lang].areyouokayLogout,
                            [
                                {
                                    text: l[data.app.lang].cancel,
                                    onPress: () => console.log('Cancel Pressed'),
                                    style: 'cancel',
                                },
                                {
                                    text: l[data.app.lang].confirm,
                                    onPress: () => {
                                        dispatch({type: 'authRemove'});
                                        dispatch({type: 'isAuth', payload: false});
                                        dispatch({type: 'setTrip', payload: null});
                                        removeValue('TrendTaxiUser');
                                    },
                                },
                            ],
                            {cancelable: false},
                        );
                    } else {
                        props.navigation.navigate(navigate);
                    }
                }}>
                <View style={[tw`w-full`]}>
                    <View style={[tw` py-2 flex-row items-center`, {paddingLeft: 20}]}>
                        <View style={[tw`rounded-md p-1`]}>
                            <MaterialCommunityIcons
                                name={icon}
                                size={24}
                                color={stil('text', data.app.theme).color}
                            />
                        </View>
                        <Text
                            style={[
                                stil('text', data.app.theme),
                                tw` text-base`,
                                {paddingLeft: 2},
                            ]}>
                            {' '}
                            {text}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <NavigationContainer>
            <StatusBarComponent />
            <Drawer.Navigator
                initialRouteName={'Home'}
                screenOptions={{
                    drawerStyle: {
                        backgroundColor: stil('bg', data.app.theme).backgroundColor,
                        width: 240,
                    },
                    headerStyle: {
                        backgroundColor: stil('bg', data.app.theme).backgroundColor,
                        borderBottomWidth: 0,
                        shadowColor: stil('text', data.app.theme).color,
                    },
                    headerTintColor: stil('text', data.app.theme).color,
                    drawerInactiveTintColor: stil('text', data.app.theme).color,
                    drawerActiveBackgroundColor: stil('bg', data.app.theme).backgroundColor,
                    drawerActiveTintColor: stil('text', data.app.theme).color,
                    backgroundColor: stil('bg', data.app.theme).backgroundColor,
                }}
                drawerContent={(props) => {
                    return (
                        <DrawerContentScrollView {...props}>
                            {data.auth.user ? (
                                <View
                                    style={[
                                        {marginTop: -100, marginBottom: 20, paddingTop: 100},
                                        stil('bg2', data.app.theme),
                                    ]}>
                                    <DrawerItem
                                        label={() => (
                                            <View
                                                style={[
                                                    tw`flex-row justify-start items-center pb-2`,
                                                ]}>
                                                <Image
                                                    style={[
                                                        tw`mr-2 rounded-md`,
                                                        {
                                                            width: 50,
                                                            height: 50,
                                                            // resizeMode: 'contain',
                                                        },
                                                    ]}
                                                    source={{
                                                        uri:
                                                            config.imageBaseUrl +
                                                            data.auth.user.user_data.user_image,
                                                    }}
                                                />
                                                <View style={tw`justify-center`}>
                                                    <Text
                                                        style={[
                                                            tw` text-base`,
                                                            stil('text', data.app.theme),
                                                        ]}>
                                                        {data.auth.user.user_name}
                                                    </Text>
                                                    <Text
                                                        style={[
                                                            tw` `,
                                                            stil('text', data.app.theme),
                                                        ]}>
                                                        <MaterialCommunityIcons
                                                            name="credit-card"
                                                            size={16}
                                                            color={
                                                                stil('text', data.app.theme).color
                                                            }
                                                        />{' '}
                                                        {data.auth.user.user_balance}
                                                    </Text>
                                                </View>
                                            </View>
                                        )}
                                        onPress={() => {
                                            props.navigation.navigate('Profile');
                                        }}
                                    />
                                </View>
                            ) : null}
                            {list.map((item, index) => {
                                return item?.type === 'separator' ? (
                                    <View
                                        key={index}
                                        style={[
                                            {
                                                height: 1,
                                                width: '100%',
                                                backgroundColor: stil('bg2', data.app.theme)
                                                    .backgroundColor,
                                            },
                                            tw`my-4`,
                                        ]}></View>
                                ) : (
                                    menuButton({...item, index, props})
                                );
                            })}
                            <DrawerItemList {...props} />
                        </DrawerContentScrollView>
                    );
                }}>
                <Drawer.Screen
                    name="Home"
                    component={Home}
                    options={{
                        drawerItemStyle: {
                            display: 'none',
                        },
                        headerTitleStyle: {
                            color: 'transparent',
                        },
                        headerTransparent: true,
                        headerTintColor: stil('text', data.app.theme).color,
                        headerLeftContainerStyle: {
                            backgroundColor:
                                data.app.theme == 'dark' ? 'rgba(15, 54, 94,1)' : '#f1f1f1',
                            borderTopRightRadius: 10,
                            borderBottomRightRadius: 10,
                            marginRight: '50%',
                            height: 50,
                            shadowColor:
                                data.app.theme == 'dark' ? '#f1f1f1' : 'rgba(15, 54, 94,1)',
                            shadowOffset: {
                                width: 1,
                                height: 1,
                            },
                            shadowOpacity: 0.7,
                            shadowRadius: 1,
                            elevation: 5,
                        },
                    }}
                />

                <Drawer.Screen
                    name="Trips"
                    component={Trips}
                    options={{
                        drawerItemStyle: {
                            display: 'none',
                        },
                        title: l[data.app.lang].trips,
                    }}
                />
                <Drawer.Screen
                    name="Reports"
                    component={Reports}
                    options={() => ({
                        drawerItemStyle: {
                            display: 'none',
                        },
                        title: l[data.app.lang].reports,
                    })}
                />
                <Drawer.Screen
                    name="Settings"
                    component={Settings}
                    options={() => ({
                        drawerItemStyle: {
                            display: 'none',
                        },
                        title: l[data.app.lang].settings,
                    })}
                />
                <Drawer.Screen
                    name="TripDetail"
                    component={TripDetail}
                    options={() => ({
                        drawerItemStyle: {
                            display: 'none',
                        },
                        title: l[data.app.lang].details,
                    })}
                />
                <Drawer.Screen
                    name="Profile"
                    component={Profile}
                    options={({navigation}) => ({
                        drawerItemStyle: {
                            display: 'none',
                        },
                        headerRight: () => (
                            <TouchableOpacity
                                style={[tw`flex-row px-4`]}
                                onPress={() => {
                                    navigation.navigate('ProfileEdit');
                                }}>
                                <MaterialCommunityIcons
                                    name="pencil"
                                    size={24}
                                    color={stil('text', data.app.theme).color}
                                />
                            </TouchableOpacity>
                        ),
                        title: l[data.app.lang].profile,
                    })}
                />
                <Drawer.Screen
                    name="ProfileEdit"
                    component={ProfileEdit}
                    options={() => ({
                        drawerItemStyle: {
                            display: 'none',
                        },
                        headerRight: () => (
                            <TouchableOpacity
                                style={[tw`flex-row px-4 items-center `]}
                                onPress={() => {
                                    Alert.alert(
                                        'You want to delete your account',
                                        'Since deleting your account requires you to re-open, all your current information will be lost.',
                                        [
                                            {
                                                text: l[data.app.lang].cancel,
                                                onPress: () => console.log('Cancel Pressed'),
                                                style: 'cancel',
                                            },
                                            {
                                                text: 'Yes ,Delete',
                                                onPress: () => {
                                                    deleteAccount();
                                                },
                                            },
                                        ],
                                        {cancelable: false},
                                    );
                                }}>
                                <MaterialCommunityIcons
                                    name="delete"
                                    size={12}
                                    color={stil('text', data.app.theme).color}
                                />
                                <Text style={[stil('text', data.app.theme), tw`ml-1 text-xs`]}>
                                    Delete Account
                                </Text>
                            </TouchableOpacity>
                        ),
                        title: l[data.app.lang].profile,
                    })}
                />
                <Drawer.Screen
                    name="Faq"
                    component={Faq}
                    options={() => ({
                        drawerItemStyle: {
                            display: 'none',
                        },
                        title: l[data.app.lang].faq,
                    })}
                />
            </Drawer.Navigator>
        </NavigationContainer>
    );
};

export default Router;
