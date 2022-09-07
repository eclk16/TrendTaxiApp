import React, {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import tw from 'twrnc';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Modal,
    TextInput,
    FlatList,
    ActivityIndicator,
    Dimensions,
    Alert,
} from 'react-native';
import {stil} from '../../utils';
import l from '../../languages.json';
import Geolocation from '@react-native-community/geolocation';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import {WebView} from 'react-native-webview';
import Pusher from 'pusher-js/react-native';
import {useNavigation} from '@react-navigation/native';

MaterialCommunityIcons.loadFont();

function Driver() {
    const data = useSelector((state) => state);
    const map = React.createRef();
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [locations, setLocations] = React.useState([]);
    const [cars, setCars] = React.useState([]);
    const [bottomHeight, setBottomHeight] = React.useState(0);
    const [topHeight, setTopHeight] = React.useState(0);
    const [routeTime, setRouteTime] = React.useState(0);
    const [routeDistance, setRouteDistance] = React.useState('0 ');
    const [current, setCurrent] = React.useState('');
    const [source, SetSource] = React.useState(
        'http://92.63.206.162/?user=' + data.auth.userId + '&currentLocation=69.184671,41.204796',
    );
    const [isActive, setIsActive] = React.useState(false);
    const [isWait, setIsWait] = React.useState(false);
    const [reports, setReports] = React.useState([]);
    const [activeCount, setActiveCount] = React.useState(0);
    const [timeoutSn, setTimeoutSn] = React.useState(10);

    const uygunum = (lat, lon) => {
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        axios.get(
            'http://92.63.206.165/event?prc=available&driver_id=' +
                data.auth.user.id +
                '&location=' +
                current,
        );
    };

    useEffect(() => {
        if (typeof String.prototype.replaceAll === 'undefined') {
            String.prototype.replaceAll = function (match, replace) {
                return this.replace(new RegExp(match, 'g'), () => replace);
            };
        }
        getCurrentLocation();
    }, []);

    useEffect(() => {
        getTrips(data.auth.user.id, data.auth.userToken, data.auth.userType);
    }, []);

    const setCurrentLocation = () => {
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        axios
            .get(
                'http://92.63.206.165/event?prc=mapConfig&user=' +
                    data.auth.userId +
                    '&currentLocation=' +
                    current +
                    '&mapPrc=setCurrent',
            )
            .then((response) => {})
            .catch((error) => {
                console.log(error);
            });
    };

    const setCenter = (type = 0) => {
        if (type == 0) getCurrentLocation();
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';

        axios
            .get(
                'http://92.63.206.165/event?prc=mapConfig&user=' +
                    data.auth.userId +
                    '&currentLocation=' +
                    (type != 0 ? type : current) +
                    '&mapPrc=setCenter',
            )
            .then((response) => {})
            .catch((error) => {
                console.log(error);
            });
    };

    const getCurrentLocation = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                console.log('POSITION = ', position);
                setCurrent(position.coords.longitude + ',' + position.coords.latitude);
                setCurrentLocation();
            },
            (error) => {
                console.log(error.code, error.message);
            },
            {enableHighAccuracy: false, timeout: 10000, maximumAge: 3000},
        );
    };

    useEffect(() => {
        mapConfiguration();
    }, [locations, current]);

    const mapConfiguration = (me = '') => {};

    const debugging = `
      const consoleLog = (type, log) => window.ReactNativeWebView.postMessage(JSON.stringify({'type': 'Console', 'data': {'type': type, 'log': log}}));
      console = {
          log: (log) => consoleLog('log', log),
          debug: (log) => consoleLog('debug', log),
          info: (log) => consoleLog('info', log),
          warn: (log) => consoleLog('warn', log),
          error: (log) => consoleLog('error', log),
        };`;

    const onMessage = (payload) => {
        let dataPayload;
        try {
            console.log(payload.nativeEvent.data);
            dataPayload = JSON.parse(payload.nativeEvent.data);
        } catch (e) {}
        try {
            console.log(dataPayload);
            if (dataPayload) {
                if (dataPayload.type === 'Console' && dataPayload.data.type == 'log') {
                    const dataa = JSON.parse(dataPayload.data.log);
                    if (dataa.distance) {
                        setRouteDistance(dataa.distance);
                        setRouteTime(dataa.duration);
                        if (locations.length > 1 && locations[1].title != 'Belirsiz') {
                            let price = [];
                            for (let c in cars) {
                                let arac = {
                                    ...cars[c],
                                    totalPrice:
                                        cars[c].km * dataa.distance.split(' ')[0] -
                                        cars[c].km +
                                        cars[c].price,
                                };

                                price.push(arac);
                            }
                            setCars(price);
                        } else {
                            let price = [];
                            for (let c in cars) {
                                let arac = {
                                    ...cars[c],
                                    totalPrice: 0,
                                };

                                price.push(arac);
                            }
                            setCars(price);
                        }
                        console.info(`[Console] ${JSON.stringify(dataPayload.data.log)}`);
                    }
                    if (dataa.type == 'selectMap') {
                        setHaritadanSecilen(dataa);
                    }
                }
            }
        } catch (e) {}
    };

    const getTrips = (id, userToken, type) => {
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + userToken;

        axios
            .post('http://92.63.206.165/api/getTrips', {
                who: type + '_id',
                id: id,
                lang: data.app.lang,
                getReports: 1,
            })
            .then((response) => {
                console.log('REPORTS =', response.data.data);
                if (!response.data.data.hata) {
                    setReports(response.data.data);
                    console.log('REPORTS =', response.data.data);
                } else {
                }
            })
            .catch((error) => {
                console.log('HATAAAAAA', error);
            });
    };

    useEffect(() => {
        getTrip(data.auth.user.id, data.auth.userToken, data.auth.userType);
        let inter = setInterval(() => {
            setActiveCount(Math.random(0, 12938721983));
        }, 10000);
        return () => {
            clearInterval(inter);
        };
    }, []);

    useEffect(() => {
        if (!isWait && isActive) {
            uygunum();
        }
    }, [isWait, isActive, activeCount]);

    useEffect(() => {
        let kalan = 10;
        let interr = setInterval(() => {
            kalan = kalan - 1;
            if (kalan < 0) {
                setIsWait(false);
            }
            setTimeoutSn(kalan);
        }, 1000);
        if (!isWait) {
            setTimeoutSn(10);
            clearInterval(interr);
        }

        return () => {
            clearInterval(interr);
        };
    }, [isWait]);

    useEffect(() => {
        if (locations.length > 0) {
            axios.defaults.headers.common['Accept'] = 'application/json';
            axios.defaults.headers.common['Content-Type'] = 'application/json';
            var param = '';
            locations.forEach((value, index) => {
                param =
                    param +
                    '&marker' +
                    index +
                    '=' +
                    value.lon +
                    ',' +
                    value.lat +
                    ',' +
                    value.title.replaceAll(',', ' ');
            });
            axios
                .get(
                    'http://92.63.206.165/event?user=' +
                        data.auth.userId +
                        '&currentLocation=' +
                        current +
                        '&prc=mapConfig&mapPrc=setMarker' +
                        param,
                )
                .then((response) => {})
                .catch((error) => {
                    console.log(error);
                });
            setCenter(locations[0].lat + ',' + locations[0].lon);
        }
    }, [locations]);

    useEffect(() => {
        if (isActive) {
            Pusher.logToConsole = true;
            var pusher = new Pusher('03a866856199003ebcb7', {
                cluster: 'ap2',
            });
            var channel = pusher.subscribe('TripEvents_' + data.auth.user.id);
            channel.bind('trip', function (data) {
                if (data.trip.prc == 'sofor_istek') {
                    setGelenTripId(data.trip.trip_id);
                    setGelenTrip(data.trip.trip);
                    setLocations(data.trip.locations);
                    setIsWait(true);
                    setIsActive(false);
                }
            });
        } else {
            pusher?.disconnect();
        }
        return () => {
            pusher?.disconnect();
        };
    }, [isActive]);

    const [gelenTripId, setGelenTripId] = React.useState(null);
    const [gelenTrip, setGelenTrip] = React.useState(null);
    const onaylaFunction = () => {
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        axios
            .get(
                'http://92.63.206.165/event?' +
                    'prc=tripOnaylandi&' +
                    'trip_id=' +
                    gelenTripId +
                    '&' +
                    'sofor_id=' +
                    data.auth.user.id,
            )
            .then((response) => {
                if ((response.data.status = 'OK')) {
                    setIsWait(false);

                    getTrip(data.auth.user.id, data.auth.userToken, data.auth.userType);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };
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
                    try {
                        navigation.navigate('Harita');
                    } catch (e) {
                        console.log('eror', e);
                    }
                } else {
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <>
            <View style={[tw` w-full`, {height: topHeight}]}>
                <WebView
                    ref={map}
                    source={{
                        uri: source,
                    }}
                    injectedJavaScript={debugging}
                    onMessage={onMessage}
                />

                <View
                    style={[
                        tw`flex-row items-center justify-between  px-2  rounded-t-md`,
                        {
                            position: 'absolute',
                            bottom: 10,
                            left: 0,
                            right: 0,
                        },
                    ]}>
                    <TouchableOpacity
                        style={[
                            tw` flex-row items-center justify-center py-3 w-5/6 rounded-md ${
                                isActive ? 'bg-green-700' : 'bg-gray-700'
                            }`,
                        ]}
                        onPress={() => {
                            setIsActive(!isActive);
                            getCurrentLocation();
                        }}>
                        <Text style={[tw`font-medium ml-2 text-white`]}>
                            {l[data.app.lang].status}:{' '}
                            {isActive ? l[data.app.lang].active : l[data.app.lang].inactive}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            stil('bg', data.app.theme),
                            tw`rounded-md  h-10 w-10 items-center justify-center`,
                        ]}
                        onPress={() => {
                            setCenter();
                        }}>
                        <MaterialCommunityIcons
                            name="map-marker-radius"
                            size={36}
                            color={stil('text', data.app.theme).color}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <View
                onLayout={(event) => {
                    var {x, y, width, height} = event.nativeEvent.layout;
                    const ScreenHeight = Dimensions.get('window').height;
                    setTopHeight(ScreenHeight - height);
                    setBottomHeight(height);
                }}
                style={[tw` w-full flex items-center pt-1 px-2 pb-4`, stil('bg', data.app.theme)]}>
                <View style={[tw`flex-row `]}>
                    {reports?.day && (
                        <View style={[tw` w-1/1`]}>
                            <View style={[tw`p-2 flex`]}>
                                <View
                                    style={[
                                        tw`flex-row justify-between items-center border-b-2 p-2`,
                                        {borderColor: stil('bg2', data.app.theme).backgroundColor},
                                    ]}>
                                    <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                                        {l[data.app.lang].count}
                                    </Text>
                                    <Text style={[stil('text', data.app.theme), tw``]}>
                                        {reports.day.count}
                                    </Text>
                                </View>
                                <View
                                    style={[
                                        tw`flex-row justify-between items-center border-b-2 p-2`,
                                        {borderColor: stil('bg2', data.app.theme).backgroundColor},
                                    ]}>
                                    <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                                        {l[data.app.lang].kilometer}
                                    </Text>
                                    <Text style={[stil('text', data.app.theme), tw``]}>
                                        {reports.day.km}
                                    </Text>
                                </View>
                                <View
                                    style={[
                                        tw`flex-row justify-between items-center border-b-2 p-2`,
                                        {borderColor: stil('bg2', data.app.theme).backgroundColor},
                                    ]}>
                                    <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                                        {l[data.app.lang].price}
                                    </Text>
                                    <Text style={[stil('text', data.app.theme), tw``]}>
                                        {reports.day.price}
                                    </Text>
                                </View>
                                <View style={[tw`flex-row justify-between items-center p-2`]}>
                                    <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                                        {l[data.app.lang].fee}
                                    </Text>
                                    <Text style={[stil('text', data.app.theme), tw``]}>
                                        {reports.day.feePrice}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </View>

            <Modal
                animationType="fade"
                transparent={true}
                visible={isWait}
                onRequestClose={() => {
                    setIsWait(!isWait);
                }}>
                {gelenTrip != null ? (
                    <View
                        style={[
                            tw` flex items-center justify-end`,
                            {position: 'absolute', bottom: 0},
                        ]}>
                        <View
                            style={[
                                tw` w-full flex items-end justify-end rounded-md p-4 px-6 pb-8`,
                                stil('bg', data.app.theme),
                            ]}>
                            <View style={[tw`mb-4  w-full`]}>
                                <View
                                    style={[
                                        tw` rounded-md mb-1`,
                                        stil('bg2', data.app.theme),
                                        stil('text', data.app.theme),
                                    ]}>
                                    <Text
                                        style={[
                                            tw`font-semibold text-center p-2`,
                                            stil('text', data.app.theme),
                                        ]}>
                                        {gelenTrip.yolcu.name}
                                    </Text>
                                </View>
                                <View style={[tw`flex`]}>
                                    <View style={[tw`flex-row justify-between items-center my-2`]}>
                                        <View
                                            style={[
                                                tw`w-1/3 rounded-tl-md rounded-bl-md mb-1`,
                                                stil('bg2', data.app.theme),
                                                stil('text', data.app.theme),
                                            ]}>
                                            <Text
                                                style={[
                                                    stil('text', data.app.theme),
                                                    tw`font-bold text-center p-2`,
                                                ]}>
                                                {gelenTrip.est_time}
                                            </Text>
                                        </View>
                                        <View
                                            style={[
                                                tw`w-1/3  mb-1`,
                                                stil('bg2', data.app.theme),
                                                stil('text', data.app.theme),
                                            ]}>
                                            <Text
                                                style={[
                                                    stil('text', data.app.theme),
                                                    tw`font-bold text-center p-2`,
                                                ]}>
                                                {gelenTrip.est_distance}
                                            </Text>
                                        </View>
                                        <View
                                            style={[
                                                tw`w-1/3 rounded-tr-md rounded-br-md mb-1`,
                                                stil('bg2', data.app.theme),
                                                stil('text', data.app.theme),
                                            ]}>
                                            <Text
                                                style={[
                                                    stil('text', data.app.theme),
                                                    tw`font-bold text-center p-2`,
                                                ]}>
                                                {gelenTrip.est_price} sum
                                            </Text>
                                        </View>
                                    </View>
                                    {locations.map((item, index) => {
                                        return (
                                            <View key={index} style={tw`flex mb-2`}>
                                                <Text
                                                    style={[
                                                        tw`text-xs font-semibold`,
                                                        stil('text', data.app.theme),
                                                    ]}>
                                                    {item.title}
                                                </Text>
                                                <Text
                                                    style={[
                                                        tw`text-xs`,
                                                        stil('text', data.app.theme),
                                                    ]}>
                                                    {item.description}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                            <View style={[tw`flex items-center justify-between w-full`]}>
                                <TouchableOpacity
                                    style={[
                                        tw`flex-row items-center justify-center rounded-md  w-full bg-green-600`,
                                    ]}
                                    onPress={() => {
                                        onaylaFunction();
                                    }}>
                                    <View
                                        style={[
                                            tw` h-[100%] w-[${
                                                100 - timeoutSn * 10
                                            }%] rounded-md bg-green-900`,
                                            {
                                                left: 0,
                                                position: 'absolute',
                                                zIndex: 999,
                                            },
                                        ]}></View>
                                    <MaterialCommunityIcons
                                        style={{zIndex: 9999}}
                                        name="check"
                                        size={20}
                                        color="white"
                                    />
                                    <Text
                                        style={[
                                            tw`font-semibold ml-2 py-4 text-white`,
                                            {zIndex: 9999},
                                        ]}>
                                        {l[data.app.lang].check}({timeoutSn} sn)
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ) : (
                    ''
                )}
            </Modal>
        </>
    );
}

export default Driver;
