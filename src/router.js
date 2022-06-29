import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView,DrawerItemList,DrawerItem  } from '@react-navigation/drawer';
import { View,Text,TouchableOpacity,Image,Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import l from './languages.json';
import { stil } from './utils';
import {useDispatch, useSelector} from 'react-redux';
import { removeValue } from './async'
import Passenger from './pages/proccess/homePassenger';
import Driver from './pages/proccess/homeDriver';
import Trips from './pages/other/trips';
import Settings from './pages/other/settings';
import TripDetail from './pages/other/tripDetail';
import Profile from './pages/other/profile';
import Faq from './pages/other/faq';
import Reports from './pages/other/reports';
import StatusBarComponent from './components/global/status';
import ProfileEdit from './pages/other/profileEdit';

MaterialCommunityIcons.loadFont();
const Drawer = createDrawerNavigator();

const Router = () => {
    
    const dispatch = useDispatch();
    const data = useSelector(state => state);
	return (
        <NavigationContainer>
            <StatusBarComponent/>
            <Drawer.Navigator initialRouteName="Home"
                screenOptions={{
                    drawerStyle: {
                        backgroundColor:stil('bg',data.app.theme).backgroundColor,
                        width: 240,
                    },
                    headerStyle: {
                        backgroundColor: stil('bg',data.app.theme).backgroundColor,
                        borderBottomWidth: 0,
                        shadowColor: stil('text',data.app.theme).color,
                        height:Platform.OS == "ios" ? 110 : 70
                    },
                    headerTintColor: stil('text',data.app.theme).color,
                    drawerInactiveTintColor: stil('text',data.app.theme).color,
                    drawerActiveBackgroundColor: stil('bg',data.app.theme).backgroundColor,
                    drawerActiveTintColor: stil('text',data.app.theme).color,
                    backgroundColor: stil('bg',data.app.theme).backgroundColor
                }}
                drawerContent={props => {
                    return (
                        <DrawerContentScrollView {...props}>
                            {data.auth.user.passenger ?
                            <View style={[{marginTop:-100,marginBottom:20,paddingTop:100},stil('bg2',data.app.theme)]}>
                                <DrawerItem label={() => 
                                    <View style={[tw`flex-row justify-start items-center pb-2`]}>
                                        <Image style={[tw`mr-2 rounded-md`,{width: 50, height: 50,resizeMode: 'contain'}]} source={{uri:'https://trendtaxi.uz/'+data.auth.user.passenger.image}} />
                                        <View style={tw`justify-center`}>
                                            <Text style={[tw` text-base`,stil('text',data.app.theme)]}>{data.auth.user.passenger.first_name}</Text>
                                            <Text style={[tw` `,stil('text',data.app.theme)]}>
                                                <MaterialCommunityIcons name="credit-card" size={16} color={stil('text',data.app.theme).color} /> {data.auth.userType == 'passenger' ? data.auth.user.passenger.point : data.auth.user.passenger.balance}
                                            </Text>
                                        </View>
                                    </View>
                                }  onPress={() => { props.navigation.navigate('Profile') } }/>
                            </View>
                            : null}
                            <DrawerItemList {...props} />
                            {data.auth.userType == 'passenger' ?
                                <TouchableOpacity style={[tw` rounded`,{borderColor:stil('text',data.app.theme).color}]} onPress={() => {
                                        props.navigation.navigate('Home');
                                    }}>
                                    <View style={[tw`w-full`]}>
                                        <View style={[tw` py-2 flex-row items-center`,{paddingLeft:20}]}>
                                            <View style={[tw`rounded-md p-1`]}>
                                                <MaterialCommunityIcons name="map-plus" size={24} color={stil('text',data.app.theme).color} />
                                            </View>
                                            <Text style={[stil('text',data.app.theme),tw` text-base`,{paddingLeft:2}]}>  {l[data.app.lang].start}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            :
                                <TouchableOpacity style={[tw` rounded`,{borderColor:stil('text',data.app.theme).color}]} onPress={() => {
                                        props.navigation.navigate('HomeDriverPage');
                                    }}>
                                    <View style={[tw`w-full`]}>
                                        <View style={[tw` py-2 flex-row items-center`,{paddingLeft:20}]}>
                                            <View style={[tw`rounded-md p-1`]}>
                                                <MaterialCommunityIcons name="ray-start-arrow" size={24} color={stil('text',data.app.theme).color} />
                                            </View>
                                            <Text style={[stil('text',data.app.theme),tw` text-base`,{paddingLeft:2}]}>  {l[data.app.lang].start}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            }
                            <TouchableOpacity style={[tw` rounded`,{borderColor:stil('text',data.app.theme).color}]} onPress={() => {
                                    props.navigation.navigate('Trips');
                                }}>
                                <View style={[tw`w-full`]}>
                                    <View style={[tw` py-2 flex-row items-center`,{paddingLeft:20}]}>
                                        <View style={[tw`rounded-md p-1`]}>
                                            <MaterialCommunityIcons name="map-marker-distance" size={24} color={stil('text',data.app.theme).color} />
                                        </View>
                                        <Text style={[stil('text',data.app.theme),tw` text-base`,{paddingLeft:2}]}>  {l[data.app.lang].trips}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        
                            <TouchableOpacity style={[tw` rounded`,{borderColor:stil('text',data.app.theme).color}]} onPress={() => {
                                    props.navigation.navigate('Profile');
                                }}>
                                <View style={[tw`w-full`]}>
                                    <View style={[tw` py-2 flex-row items-center`,{paddingLeft:20}]}>
                                        <View style={[tw`rounded-md p-1`]}>
                                            <MaterialCommunityIcons name="account" size={24} color={stil('text',data.app.theme).color} />
                                        </View>
                                        <Text style={[stil('text',data.app.theme),tw` text-base`,{paddingLeft:2}]}>  {l[data.app.lang].profile}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={[tw` rounded`,{borderColor:stil('text',data.app.theme).color}]} onPress={() => {
                                    props.navigation.navigate('Reports');
                                }}>
                                <View style={[tw`w-full`]}>
                                    <View style={[tw` py-2 flex-row items-center`,{paddingLeft:20}]}>
                                        <View style={[tw`rounded-md p-1`]}>
                                            <MaterialCommunityIcons name="google-analytics" size={24} color={stil('text',data.app.theme).color} />
                                        </View>
                                        <Text style={[stil('text',data.app.theme),tw` text-base`,{paddingLeft:2}]}>  {l[data.app.lang].reports}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={[tw` rounded`,{borderColor:stil('text',data.app.theme).color}]} onPress={() => {
                                    props.navigation.navigate('Settings');
                                }}>
                                <View style={[tw`w-full`]}>
                                    <View style={[tw` py-2 flex-row items-center`,{paddingLeft:20}]}>
                                        <View style={[tw`rounded-md p-1`]}>
                                            <MaterialCommunityIcons name="cog" size={24} color={stil('text',data.app.theme).color} />
                                        </View>
                                        <Text style={[stil('text',data.app.theme),tw` text-base`,{paddingLeft:2}]}>  {l[data.app.lang].settings}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={[tw` rounded`,{borderColor:stil('text',data.app.theme).color}]} onPress={() => {
                                    props.navigation.navigate('Faq');
                                }}>
                                <View style={[tw`w-full border-t mt-5 pt-4`,{borderColor:data.app.theme == 'dark' ? 'rgba(255, 255, 255,.05)' : 'rgba(15, 54, 94,.05)'}]}>
                                    <View style={[tw` py-2 flex-row items-center `,{paddingLeft:20}]}>
                                        <View style={[tw`rounded-md p-1`]}>
                                            <MaterialCommunityIcons name="chat-question" size={24} color={stil('text',data.app.theme).color} />
                                        </View>
                                        <Text style={[stil('text',data.app.theme),tw` text-base`,{paddingLeft:2}]}>  {l[data.app.lang].faq}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={[tw` rounded`,{borderColor:stil('text',data.app.theme).color}]} onPress={() => {
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
                                                    dispatch({type:'isLogin',payload:false});
                                                    removeValue('userData');
                                                }
                                            },
                                        ],
                                        {cancelable: false},
                                    );
                                }}>
                                
                                <View style={[tw`w-full `]}>
                                    <View style={[tw` py-2 flex-row items-center`,{paddingLeft:20}]}>
                                        <View style={[tw`rounded-md p-1`]}>
                                            <MaterialCommunityIcons name="logout" size={24} color={stil('text',data.app.theme).color} />
                                        </View>
                                        <Text style={[stil('text',data.app.theme),tw` text-base`,{paddingLeft:2}]}>  {l[data.app.lang].logout}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </DrawerContentScrollView>
                    )
                }}
            >
                {data.auth.userType == 'passenger' ?
                    <Drawer.Screen name="Home" component={Passenger} 
                        options={{
                            drawerItemStyle:{
                                display:'none'
                            },
                            headerTitleStyle: {
                                color: 'transparent',
                            },
                            headerTransparent: true,
                            headerTintColor: stil('text',data.app.theme).color,
                            headerLeftContainerStyle: {
                                backgroundColor: data.app.theme == 'dark' ? 'rgba(15, 54, 94,1)' : '#f1f1f1',
                                borderTopRightRadius: 10,
                                borderBottomRightRadius: 10,
                                marginRight: '50%',
                                height:50,
                                shadowColor: data.app.theme == 'dark' ? '#f1f1f1' : 'rgba(15, 54, 94,1)',
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
                :
                    <Drawer.Screen name="HomeDriverPage" component={Driver}
                        options={{
                            drawerItemStyle:{
                                display:'none'
                            },
                            headerTitleStyle: {
                                color: 'transparent',
                            },
                            headerTransparent: true,
                            headerTintColor: stil('text',data.app.theme).color,
                            headerLeftContainerStyle: {
                                backgroundColor: data.app.theme == 'dark' ? 'rgba(15, 54, 94,1)' : '#f1f1f1',
                                borderTopRightRadius: 10,
                                borderBottomRightRadius: 10,
                                marginRight: '50%',
                                height:50,
                                shadowColor: data.app.theme == 'dark' ? '#f1f1f1' : 'rgba(15, 54, 94,1)',
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
                }
                <Drawer.Screen name="Trips" component={Trips} options={{
                    drawerItemStyle:{
                        display:'none'
                    },
                    title: l[data.app.lang].trips,
                }}/>
                <Drawer.Screen name="Reports" component={Reports} options={() => ({
                    drawerItemStyle:{
                        display:'none'
                    },
                    title: l[data.app.lang].reports,
                })}/>
                <Drawer.Screen name="Settings" component={Settings} options={() => ({
                    drawerItemStyle:{
                        display:'none'
                    },
                    title: l[data.app.lang].settings,
                })}/>
                <Drawer.Screen name="TripDetail" component={TripDetail} options={() => ({
                    drawerItemStyle:{
                        display:'none'
                    },
                    title: l[data.app.lang].details,
                })}/>
                <Drawer.Screen name="Profile" component={Profile} options={({navigation}) => ({
                    drawerItemStyle:{
                        display:'none'
                    },
                    headerRight: () => (
                            <TouchableOpacity
                                style={[tw`flex-row p-4`]}
                                onPress={()=>{
                                    navigation.navigate('ProfileEdit');
                                }}
                            >
                            <MaterialCommunityIcons name="pencil" size={24} color={stil('text',data.app.theme).color}/>
                        </TouchableOpacity>
                    ),
                    title: l[data.app.lang].profile,  
                })}
                />	
                <Drawer.Screen name="ProfileEdit" component={ProfileEdit} options={() => ({
                    drawerItemStyle:{
                        display:'none'
                    },
                    title: l[data.app.lang].profile,  
                })}
                />	
                <Drawer.Screen name="Faq" component={Faq} options={() => ({
                    drawerItemStyle:{
                        display:'none'
                    },
                    title: l[data.app.lang].faq,  
                })}
                />	
            </Drawer.Navigator>
        </NavigationContainer>
	);
};


export default Router;