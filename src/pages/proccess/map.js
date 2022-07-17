import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import tw from 'twrnc';
import {
    View,
    Text,
    TouchableOpacity,
    Dimensions, Alert,
} from 'react-native';
import {stil} from '../../utils';
import Geolocation from '@react-native-community/geolocation';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import {WebView} from 'react-native-webview';
import StatusBarComponent from '../../components/global/status';
import Pusher from 'pusher-js/react-native';
import {useNavigation} from '@react-navigation/native';


MaterialCommunityIcons.loadFont();

function HomePage() {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const data = useSelector(state => state);
    map = React.createRef();
    const [locations, setLocations] = React.useState([]);
    const [cars, setCars] = React.useState([]);
    const [topHeight, setTopHeight] = React.useState(0);
    const [routeTime, setRouteTime] = React.useState(0);
    const [routeDistance, setRouteDistance] = React.useState('0 ');


    useEffect(() => {
        Geolocation.getCurrentPosition(
            (position) => {
                if (position.coords.latitude != 0 && position.coords.longitude != 0) {
                    setCurrent(position.coords.longitude + ',' + position.coords.latitude);
                }
            },
            (error) => {
                console.log(error.code, error.message);
            },
            {enableHighAccuracy: false, timeout: 30000, maximumAge: 1000},
        );
    }, []);


    Geolocation.watchPosition(
        (position) => {
            setCurrent(position.coords.longitude + ',' + position.coords.latitude);
        },
        (error) => {
            console.log('HATA ====== '+error);
        },
        {
            distanceFilter: 10
        }
    );

    useEffect(() => {
        getCurrentLocation();
    }, []);

    const [current, setCurrent] = React.useState(null);

    const getCurrentLocation = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                if (position.coords.latitude != 0 && position.coords.longitude != 0) {
                    setCurrent(position.coords.longitude + ',' + position.coords.latitude);
                }
            },
            (error) => {
                console.log(error.code, error.message);
            },
            {enableHighAccuracy: false, timeout: 30000, maximumAge: 1000},
        );
    };

    useEffect(() => {
        Pusher.logToConsole = true;
        var pusher = new Pusher('03a866856199003ebcb7', {
            cluster: 'ap2'
        });
        var channel = pusher.subscribe('TripEvents_'+data.auth.userId);
        channel.bind('trip', function(data) {

        });
        return () => {
            pusher?.disconnect();
        }
    },[]);

    const deleteTrip = () => {
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        console.log('https://trendtaxi.uz/event?prc=delete_trip&iptal=1&user=' + data.trip.trip.passenger_id);
        axios.get('https://trendtaxi.uz/event?prc=delete_trip&iptal=1&user=' + data.trip.trip.passenger_id)
        .then(response => {
            try {
                dispatch({type:'tripRemove',payload:{}});
            }catch (e) {
                console.log('EEE = ',e);
            }

            navigation.navigate(data.auth.userType == 'passenger' ? 'Home' : 'HomeDriverPage');
        })
        .catch(error => {
        });
    };

    const [source, setSource] = React.useState({uri: 'https://trendtaxi.uz/maps?me=' + current + '&token=' + data.auth.userToken});

    const debugging = `
    const consoleLog = (type, log) => window.ReactNativeWebView.postMessage(JSON.stringify({'type': 'Console', 'data': {'type': type, 'log': log}}));
    console = {
        log: (log) => consoleLog('log', log),
        debug: (log) => consoleLog('debug', log),
        info: (log) => consoleLog('info', log),
        warn: (log) => consoleLog('warn', log),
        error: (log) => consoleLog('error', log),
      };
  `;
    const [icon,setIcon] = React.useState(null);
    const [rotate,setRotate] = React.useState([]);
    const [tripDetail,setTripDetail] = React.useState([]);
    const [yuzde,setYuzde] = React.useState(0);
    const onMessage = (payload) => {
        let dataPayload;
        try {
            dataPayload = JSON.parse(payload.nativeEvent.data);
        } catch (e) {
        }
        try {
            if (dataPayload) {
                if (dataPayload.type === 'Console') {
                    setRotate(dataPayload.data.log[0].maneuvers[0]);
                    setTripDetail(dataPayload.data.log[0]);

                    switch (dataPayload.data.log[0].maneuvers[0].icon) {
                        case "start" :
                            return setIcon('ray-start-arrow');
                        case "finish" :
                            return setIcon('ray-start-end');
                        case "crossroad_straight" :
                            return setIcon('arrow-up-bold');
                        case "crossroad_slightly_left" :
                            return setIcon('arrow-left-top-bold');
                        case "crossroad_left" :
                            return setIcon('arrow-left-top-bold');
                        case "crossroad_sharply_left" :
                            return setIcon('arrow-left-top-bold');
                        case "crossroad_sharply_right" :
                            return setIcon('arrow-right-top-bold');
                        case "crossroad_right" :
                            return setIcon('arrow-right-top-bold');
                        case "crossroad_slightly_right" :
                            return setIcon('arrow-right-top-bold');
                        case "ringroad_forward" :
                            return setIcon('arrow-up-bold');
                        case "ringroad_left_45" :
                            return setIcon('arrow-left-top-bold');
                        case "ringroad_left_90" :
                            return setIcon('arrow-left-top-bold');
                        case "ringroad_left_135" :
                            return setIcon('arrow-left-top-bold');
                        case "ringroad_left_180" :
                            return setIcon('arrow-u-down-left-bold');
                        case "ringroad_right_45" :
                            return setIcon('arrow-right-top-bold');
                        case "ringroad_right_90" :
                            return setIcon('arrow-right-top-bold');
                        case "ringroad_right_135" :
                            return setIcon('arrow-right-top-bold');
                        case "ringroad_right_180" :
                            return setIcon('arrow-u-down-right-bold');
                        case "turn_over_right_hand" :
                            return setIcon('arrow-u-down-right-bold');
                        case "turn_over_left_hand" :
                            return setIcon('arrow-u-down-right-bold');
                        default :
                            return setIcon('arrow-up-bold');
                    }



                    const dataa = JSON.parse(dataPayload.data.log);


                } else {
                    console.log(dataPayload);
                }
            }
        } catch (e) {
        }
    };

    useEffect(() => {
        if(data.trip.trip.status2 == 2 && data.auth.userType=='driver'){
            let loc = '';
            loc = loc + data.trip.trip.first_location.split('-')[0].split(',')[1] + ',' + data.trip.trip.first_location.split('-')[0].split(',')[0];
            setSource(
                {uri: 'https://trendtaxi.uz/navigation?me=' + current + '&token=' + data.auth.userToken+'&points='+loc}
            )
        }
        else{
            let loc = '';
            data.trip.trip.first_location.split('-').map((location, index) => {
                if(location != ''){
                    loc = loc + location.split(',')[1] + ',' + location.split(',')[0] + (index != data.trip.trip.first_location.split('-').length -2 ? '-' : '');
                }
            });
            setSource({uri: 'https://trendtaxi.uz/navigation?me=' + current + '&token=' + data.auth.userToken+'&points='+loc})
        }

        console.log(source);

    },[current])

    return (
        <>
            <StatusBarComponent/>
            <View style={[tw` w-full flex-1`, ]}>
                <View style={[{position:'absolute',top:50,right:25,zIndex:999999},tw`flex items-center justify-center opacity-85 rounded-md py-2 px-6`,stil('bg',data.app.theme)]}>
                    {icon ? <MaterialCommunityIcons style={[tw``,stil('text',data.app.theme)]} name={icon} size={56}/> : null}
                    <Text style={[tw`my-1 pb-2 font-semibold`,stil('text',data.app.theme)]}>{rotate.outcoming_path_comment}</Text>
                </View>

                <View style={[{position:'absolute',bottom:90,right:0,left:0,zIndex:999999},tw`flex-row justify-between items-center mx-[5%] opacity-85 rounded-md h-16 w-[90%] p-4`,stil('bg',data.app.theme)]}>
                    <Text style={[tw`font-bold`,stil('text',data.app.theme)]}>{data.trip.trip.est_distance}</Text>
                    <Text style={[tw`font-bold`,stil('text',data.app.theme)]}>{data.trip.trip.est_time}</Text>
                    <Text style={[tw`font-bold`,stil('text',data.app.theme)]}>sum</Text>
                    <View style={[{position:'absolute',bottom:0,right:0,left:0,zIndex:1},tw`flex-row justify-between items-center opacity-90 rounded-tr-md w-[${yuzde}%] p-1 bg-green-400`]}>
                    </View>
                </View>



                {current != '' ? <WebView
                    ref={map}
                    source={source}
                    injectedJavaScript={debugging}
                    onMessage={onMessage}

                />
                : null}
                <View style={[tw`flex-row items-center justify-between rounded-t-md`, stil('bg', data.app.theme), {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex:2
                }]}>
                    <TouchableOpacity
                        style={[tw`flex-row items-center justify-center  w-1/2 py-6 rounded-tl-md`, stil('bg2', data.app.theme)]}
                        onPress={() => {
                            Alert.alert(
                                'İşlem iptal edilecek.',
                                '',
                                [
                                    {
                                        text: 'Geri',
                                        onPress: () => console.log('Cancel Pressed'),
                                        style: 'cancel',
                                    },
                                    {
                                        text: 'Evet iptal et',
                                        onPress: () => {
                                            Alert.alert(
                                                'İptal Sebebi Nedir ?',
                                                '',
                                                [
                                                    {
                                                        text: 'Diğer',
                                                        onPress: () => {
                                                            deleteTrip();
                                                        },

                                                    },
                                                    {
                                                        text: data.auth.userType == 'passenger' ? 'Araç Yok' : 'Yolcu Yok',
                                                        onPress: () => {
                                                            deleteTrip();
                                                        },
                                                    },
                                                ],
                                                {cancelable: false},
                                            );
                                        },
                                    },
                                ],
                                {cancelable: false},
                            );
                        }}
                    >
                        <MaterialCommunityIcons name="cancel" size={20} color={stil('text', data.app.theme).color}/>
                        <Text style={[tw`font-medium ml-2`, stil('text', data.app.theme)]}>İptal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {

                        }}
                        style={[tw`flex-row items-center justify-center  w-1/2 py-6 rounded-tr-md`, stil('bg2', data.app.theme)]}
                    >
                        <Text style={[tw`font-semibold mr-2`, stil('text', data.app.theme)]}>{data.auth.userType == 'passenger' ? 'Araca Bindim' : 'Yolcu Bindi'}</Text>
                        <MaterialCommunityIcons name="check" size={20} color={stil('text', data.app.theme).color}/>
                    </TouchableOpacity>
                </View>
            </View>

        </>
    );
};

export default HomePage;