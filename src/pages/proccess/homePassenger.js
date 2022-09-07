import React, {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import tw from 'twrnc';
import BottomSheet, {BottomSheetTextInput} from '@gorhom/bottom-sheet';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Modal,
    TextInput,
    FlatList,
    ActivityIndicator,
    Alert,
} from 'react-native';
import {stil} from '../../utils';
import Geolocation from '@react-native-community/geolocation';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import {WebView} from 'react-native-webview';
import StatusBarComponent from '../../components/global/status';
import Pusher from 'pusher-js/react-native';
import l from '../../languages.json';
import {useNavigation} from '@react-navigation/native';

MaterialCommunityIcons.loadFont();

function HomePage() {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const data = useSelector((state) => state);
    const [DATA, setDATA] = React.useState([]);
    const map = React.createRef();
    const [locations, setLocations] = React.useState([]);
    const [cars, setCars] = React.useState([]);
    const [result, setResult] = React.useState([]);
    const [locationModal, setLocationModal] = React.useState(false);
    const [searchText, setSearchText] = React.useState('');
    const [haritadanSec, setHaritadanSec] = React.useState(false);
    const [haritadanSecilen, setHaritadanSecilen] = React.useState([]);
    const [findVehicle, setFindVehicle] = React.useState(false);
    const [routeTime, setRouteTime] = React.useState(0);
    const [routeDistance, setRouteDistance] = React.useState('0 ');
    const [resultType, setResultType] = React.useState(false);
    const [source, SetSource] = React.useState('http://92.63.206.162/?user=' + data.auth.user.id);

    const bottomSheetRef = React.useRef(null);

    // variables

    const snapPoints = React.useMemo(() => ['20%', '50%', '70%'], []);
    const topHeight = React.useMemo(() => ['21', '51', '71'], []);
    const [hTop, SetHTop] = React.useState('21');
    const [snap, SetSnap] = React.useState(snapPoints);
    // callbacks
    const handleSheetChanges = React.useCallback((index: number) => {
        console.log('handleSheetChanges', index);
        SetSnap(index);
        SetHTop(topHeight[index]);
    }, []);

    if (typeof String.prototype.replaceAll === 'undefined') {
        String.prototype.replaceAll = function (match, replace) {
            return this.replace(new RegExp(match, 'g'), () => replace);
        };
    }

    useEffect(() => {
        getCurrentLocation('first');
        setTimeout(() => {
            getCurrentLocation();
        }, 1000);
        getCars();
    }, []);

    const mapConfiguration = (me = '') => {
        let param = '';
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

        if (locations.length > 1 && locations[1].title != 'Belirsiz') {
            let price = [];
            for (let c in cars) {
                let arac = {
                    ...cars[c],
                    totalPrice:
                        cars[c].km * routeDistance.split(' ')[0] - cars[c].km + cars[c].price,
                };
                price.push(arac);
            }
            setCars(price);
        }
    };

    const getCars = () => {
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        axios
            .get('http://92.63.206.165/api/getCarTypes')
            .then((response) => {
                if (!response.data.data.hata) {
                    setDATA(response.data.data);
                } else {
                }
            })
            .catch((error) => {
                console.log('getCars', error);
            });
    };

    useEffect(() => {
        const getData = setTimeout(() => {
            if (searchText.length > 2) {
                setResultType(false);
                arama(searchText);
            } else {
                clearTimeout(getData);
            }
        }, 500);

        return () => {
            clearTimeout(getData);
        };
    }, [searchText]);

    const arama = (text) => {
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        let lang = '';
        if (data.app.lang == 'tr') {
            lang = 'uz_UZ';
        }
        if (data.app.lang == 'gb') {
            lang = 'uz_UZ';
        }
        if (data.app.lang == 'ru') {
            lang = 'uz_UZ';
        }
        if (data.app.lang == 'uz') {
            lang = 'uz_UZ';
        }
        axios
            .get(
                'https://catalog.api.2gis.com/3.0/items?q=' +
                    text +
                    '&key=runnmp5276&locale=' +
                    lang +
                    '&fields=items.full_name,items.point,items.locale,items.full_address_name&sort=distance&location=' +
                    current,
            )
            // axios.get('https://search-maps.yandex.ru/v1/?text='+text+'&lang='+lang+'&apikey=ae55dcf2-7140-4585-a883-e16d89cc31d2')
            .then((response) => {
                console.log(response.data);
                if (response.data.result) {
                    setResult(response.data.result.items);
                    setResultType(true);
                }
            })
            .catch((error) => {
                setResult([]);
                setResultType(true);
                console.log('search', error);
            });
    };
    const [current, setCurrent] = React.useState('');
    const getCurrentLocation = (first = null) => {
        Geolocation.getCurrentPosition(
            (position) => {
                setCenter(position.coords.longitude + ',' + position.coords.latitude);
                setCurrent(position.coords.longitude + ',' + position.coords.latitude);
                // setCurrentLocation();
                if (locations.length == 0) {
                    axios.defaults.headers.common['Accept'] = 'application/json';
                    axios.defaults.headers.common['Content-Type'] = 'application/json';
                    let lang = '';
                    if (data.app.lang == 'tr') {
                        lang = 'uz_UZ';
                    }
                    if (data.app.lang == 'gb') {
                        lang = 'uz_UZ';
                    }
                    if (data.app.lang == 'ru') {
                        lang = 'uz_UZ';
                    }
                    if (data.app.lang == 'uz') {
                        lang = 'uz_UZ';
                    }
                    axios
                        .get(
                            'https://catalog.api.2gis.com/3.0/items?q=' +
                                position.coords.latitude +
                                ',' +
                                position.coords.longitude +
                                '&key=runnmp5276&locale=' +
                                lang +
                                '&fields=items.full_name,items.point,items.locale,items.full_address_name&sort=distance&location=' +
                                position.coords.latitude +
                                ',' +
                                position.coords.longitude,
                        )
                        .then((response) => {
                            if (response.data.result) {
                                console.log(response.data.result);
                                setLocations([
                                    ...locations,
                                    {
                                        title: response.data.result.items[0].name ?? '',
                                        description: '',
                                        lat: position.coords.latitude,
                                        lon: position.coords.longitude,
                                    },
                                ]);
                                setCenter(
                                    position.coords.longitude + ',' + position.coords.latitude,
                                );
                            }
                        });
                }
            },
            (error) => {
                console.log(error.code, error.message);
            },
            {enableHighAccuracy: false, timeout: 10000, maximumAge: 3000},
        );
    };

    const [kabul, setKabul] = React.useState({
        car0: 0,
        car1: 0,
        car2: 0,
        car3: 0,
    });

    const setCurrentLocation = () => {
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        axios
            .get(
                'http://92.63.206.165/event?prc=mapConfig&user=' +
                    data.auth.user.id +
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
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';

        axios
            .get(
                'http://92.63.206.165/event?prc=mapConfig&user=' +
                    data.auth.user.id +
                    '&currentLocation=' +
                    (type != 0 ? type : current) +
                    '&mapPrc=setCenter',
            )
            .then((response) => {})
            .catch((error) => {
                console.log(error);
            });
    };

    const mapSelect = (sec) => {
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        axios
            .get(
                'http://92.63.206.165/event?prc=mapConfig&user=' +
                    data.auth.user.id +
                    '&mapSelect=' +
                    sec +
                    '&mapPrc=mapSelect',
            )
            .then((response) => {})
            .catch((error) => {
                console.log(error);
            });
    };

    const createTrip = (cari = 0, sofor = 0) => {
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        let loc = '';
        locations.map((location, index) => {
            loc =
                loc +
                location.lat +
                ',' +
                location.lon +
                ',' +
                location.title.replaceAll(',', ' ').replaceAll('-', ' ').replaceAll("'", ' ') +
                ',' +
                location.description
                    .replaceAll(',', ' ')
                    .replaceAll('-', ' ')
                    .replaceAll("'", ' ') +
                '-';
        });
        console.log(
            'http://92.63.206.165/event?' +
                'prc=trip_create&' +
                'km_price=' +
                cars[cari].km +
                '&' +
                'paid_price=' +
                cars[cari].paid +
                '&' +
                'start_price=' +
                cars[cari].price +
                '&' +
                'car_id=' +
                cars[cari].title +
                '&' +
                'start=' +
                loc +
                '&' +
                'car=' +
                cars[cari].title +
                '&' +
                'duration=' +
                routeTime +
                '&' +
                'distance=' +
                routeDistance +
                '&' +
                'price=' +
                cars[cari].totalPrice +
                '&' +
                'user=' +
                data.auth.user.id,
        );
        axios
            .get(
                'http://92.63.206.165/event?' +
                    'prc=trip_create&' +
                    'km_price=' +
                    cars[cari].km +
                    '&' +
                    'paid_price=' +
                    cars[cari].paid +
                    '&' +
                    'start_price=' +
                    cars[cari].price +
                    '&' +
                    'car_id=' +
                    cars[cari].title +
                    '&' +
                    'start=' +
                    loc +
                    '&' +
                    'car=' +
                    cars[cari].title +
                    '&' +
                    'duration=' +
                    routeTime +
                    '&' +
                    'distance=' +
                    routeDistance +
                    '&' +
                    'price=' +
                    cars[cari].totalPrice +
                    '&' +
                    'user=' +
                    data.auth.user.id,
            )
            .then((response) => {
                const istekler = response.data.drivers;

                soforeIstek(
                    response.data.trip.id,
                    istekler[Object.keys(istekler)[sofor]].id,
                    response.data.start,
                );
                setTimeout(() => {
                    deleteTrip();
                    setFindVehicle(false);
                }, 20000);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    useEffect(() => {
        setCars([]);
    }, [routeDistance]);

    useEffect(() => {
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        var param = '';
        if (locations.length < 2) {
            setRouteDistance('0 min');
            setRouteTime(0);
        }
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
                    data.auth.user.id +
                    '&prc=mapConfig&mapPrc=setMarker' +
                    param,
            )
            .then((response) => {})
            .catch((error) => {
                console.log(error);
            });
    }, [locations]);

    useEffect(() => {
        getTrip();
        Pusher.logToConsole = true;
        var pusher = new Pusher('03a866856199003ebcb7', {
            cluster: 'ap2',
        });
        var channel = pusher.subscribe('TripEvents_' + data.auth.user.id);
        channel.bind('trip', function (data) {
            console.log(data);
            if (data.trip.prc == 'tripOnaylandi') {
                onaylandi();
            }
        });
        return () => {
            pusher?.disconnect();
        };
    }, []);

    const getTrip = (id, userToken, userType) => {
        const config = {
            headers: {Authorization: `Bearer ${data.auth.userToken}`},
        };

        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.auth.userToken;
        axios
            .post('http://92.63.206.165/api/isActiveTrip', {
                id: data.auth.user.id,
                lang: data.app.lang,
                type: data.auth.userType + '_id',
            })
            .then((response) => {
                if (!response.data.data.hata) {
                    dispatch({type: 'setTrip', payload: response.data.data});
                    navigation.navigate('Harita');
                } else {
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };
    const [cagir, setCagir] = React.useState(1);
    const onaylandi = () => {
        getTrip(data.auth.user.id, data.auth.userToken, data.auth.userType);
    };

    const [istekCar, setIstekCar] = React.useState(0);
    const soforeIstek = (trip_id, id, start) => {
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        console.log(
            'http://92.63.206.165/event?prc=sofor_istek&driver_id=' +
                id +
                '&trip_id=' +
                trip_id +
                '&start=' +
                start,
        );
        axios
            .get(
                'http://92.63.206.165/event?prc=sofor_istek&driver_id=' +
                    id +
                    '&trip_id=' +
                    trip_id +
                    '&start=' +
                    start,
            )
            .then((response) => {
                console.log(response.data);
            });
    };

    const deleteTrip = () => {
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        axios
            .get('http://92.63.206.165/event?prc=delete_trip&user=' + data.auth.user.id)
            .then((response) => {})
            .catch((error) => {});
    };

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
                        if (dataa.distance.split(' ')[1] == 'm') {
                            setRouteDistance('1 km');
                        } else {
                            setRouteDistance(dataa.distance);
                        }
                        setRouteTime(dataa.duration);
                        if (locations.length > 1 && locations[1].title != 'Belirsiz') {
                            let price = [];
                            for (let c in cars) {
                                let arac = {
                                    ...cars[c],
                                    totalPrice:
                                        cars[c].km * routeDistance.split(' ')[0] -
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
    const [index, setIndex] = React.useState(1);
    return (
        <>
            <StatusBarComponent />
            <View style={[tw` w-full flex-1`]}>
                <WebView
                    ref={map}
                    source={{
                        uri: source,
                    }}
                    injectedJavaScript={debugging}
                    onMessage={onMessage}
                />
            </View>
            <View
                style={[
                    tw` flex-row justify-between items-center `,
                    // stil('bg2', data.app.theme),
                    {position: 'absolute', bottom: hTop + '%', right: 0, left: 0, zIndex: 0},
                ]}>
                <TouchableOpacity
                    style={[
                        stil('bg', data.app.theme),
                        tw`rounded-md mx-2 h-10 w-10 items-center justify-center`,
                    ]}
                    onPress={() => {
                        setLocations([]);
                        getCurrentLocation();
                    }}>
                    <MaterialCommunityIcons
                        name="refresh"
                        size={36}
                        color={stil('text', data.app.theme).color}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        stil('bg', data.app.theme),
                        tw`rounded-md mx-2 h-10 w-10 items-center justify-center`,
                    ]}
                    onPress={() => {
                        getCurrentLocation();
                    }}>
                    <MaterialCommunityIcons
                        name="map-marker-radius"
                        size={36}
                        color={stil('text', data.app.theme).color}
                    />
                </TouchableOpacity>
                {/* <TouchableOpacity
                    style={[
                        stil('bg', data.app.theme),
                        tw`rounded-md mx-2 h-10 w-10 items-center justify-center`,
                    ]}
                    onPress={() => {
                        setLocations([...locations, haritadanSecilen]);
                    }}>
                    <MaterialCommunityIcons
                        name="map-marker-check"
                        size={36}
                        color={stil('text', data.app.theme).color}
                    />
                </TouchableOpacity> */}
            </View>
            <BottomSheet
                handleIndicatorStyle={[stil('bg2', data.app.theme), tw`w-24`]}
                ref={bottomSheetRef}
                index={index}
                snapPoints={snapPoints}
                keyboardBehavior="extend"
                onChange={handleSheetChanges}
                backgroundStyle={[stil('bg', data.app.theme)]}
                style={[tw`py-2 px-4`, {zIndex: 9999}]}>
                <View>
                    {haritadanSec ? (
                        <View style={[tw`flex-row justify-between item-center`]}>
                            <TouchableOpacity
                                style={[
                                    stil('bg2', data.app.theme),
                                    tw`rounded-md w-1/3 py-2 px-4 flex-row items-center justify-between`,
                                ]}
                                onPress={() => {
                                    setHaritadanSec(false);
                                    mapSelect(false);
                                    bottomSheetRef.current.snapToIndex(1);
                                }}>
                                <Text style={[stil('text', data.app.theme), tw`font-semibold`]}>
                                    {l[data.app.lang].cancel}
                                </Text>
                                <MaterialCommunityIcons
                                    name="cancel"
                                    size={24}
                                    color={stil('text', data.app.theme).color}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    stil('bg2', data.app.theme),
                                    tw`rounded-md w-1/3 py-2 px-4 flex-row items-center justify-between`,
                                ]}
                                onPress={() => {
                                    setLocations([...locations, haritadanSecilen]);
                                    setHaritadanSec(false);
                                    mapSelect(false);
                                    bottomSheetRef.current.snapToIndex(1);
                                }}>
                                <MaterialCommunityIcons
                                    name="map-marker-check"
                                    size={24}
                                    color={stil('text', data.app.theme).color}
                                />
                                <Text style={[stil('text', data.app.theme), tw`font-semibold`]}>
                                    {l[data.app.lang].check}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            {snap > 0 ? (
                                <>
                                    <View key="address" style={tw`mb-2`}>
                                        <Text
                                            style={[
                                                tw`font-medium mb-2`,
                                                stil('text', data.app.theme),
                                            ]}>
                                            {l[data.app.lang].addresss}
                                        </Text>
                                        <FlatList
                                            data={locations}
                                            style={[tw``]}
                                            renderItem={({item, index}) => {
                                                return (
                                                    <>
                                                        <View
                                                            key={index}
                                                            style={[
                                                                tw`flex-row items-center justify-between rounded-md  mb-1 px-2 py-1`,
                                                                stil('bg2', data.app.theme),
                                                            ]}>
                                                            <View
                                                                style={[
                                                                    tw`flex-row items-center justify-start w-5/6`,
                                                                ]}>
                                                                <MaterialCommunityIcons
                                                                    style={[tw`text-center mr-2`]}
                                                                    name="adjust"
                                                                    size={16}
                                                                    color={
                                                                        stil('text', data.app.theme)
                                                                            .color
                                                                    }
                                                                />
                                                                <View>
                                                                    <Text
                                                                        style={[
                                                                            tw`text-xs font-medium`,
                                                                            {fontSize: 12},
                                                                            stil(
                                                                                'text',
                                                                                data.app.theme,
                                                                            ),
                                                                        ]}>
                                                                        {item.title}
                                                                    </Text>
                                                                    <Text
                                                                        style={[
                                                                            tw`text-xs font-light pr-8`,
                                                                            {fontSize: 12},
                                                                            stil(
                                                                                'text',
                                                                                data.app.theme,
                                                                            ),
                                                                        ]}>
                                                                        {item.description}
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                            <TouchableOpacity
                                                                style={tw``}
                                                                onPress={() => {
                                                                    let remainingItems =
                                                                        locations.filter(
                                                                            (item2, index2) => {
                                                                                return (
                                                                                    index2 !== index
                                                                                );
                                                                            },
                                                                        );
                                                                    setLocations(remainingItems);
                                                                }}>
                                                                <MaterialCommunityIcons
                                                                    name="delete"
                                                                    size={24}
                                                                    color={
                                                                        stil('text', data.app.theme)
                                                                            .color
                                                                    }
                                                                />
                                                            </TouchableOpacity>
                                                        </View>
                                                    </>
                                                );
                                            }}
                                            keyExtractor={(item, index) => index.toString()}
                                        />
                                        <>
                                            <View style={[tw`h-12`]}>
                                                <BottomSheetTextInput
                                                    placeholderTextColor={
                                                        stil('text', data.app.theme).color
                                                    }
                                                    placeholder={l[data.app.lang].findguzergah}
                                                    style={[
                                                        tw`h-12 rounded-md p-2 `,
                                                        stil('text', data.app.theme),
                                                        stil('bg2', data.app.theme),
                                                    ]}
                                                    onChangeText={(text) => {
                                                        setSearchText(text);
                                                        if (text == '') {
                                                            setResult([]);
                                                        }
                                                    }}
                                                    value={searchText}
                                                />
                                                <TouchableOpacity
                                                    style={[
                                                        {
                                                            position: 'absolute',
                                                            zIndex: 1,
                                                            top: 0,
                                                            bottom: 0,
                                                            right: 0,
                                                        },
                                                        stil('bg', data.app.theme),
                                                        tw`rounded-md h-10 w-10 mt-1 mr-1 p-1 items-center justify-center`,
                                                    ]}
                                                    onPress={() => {
                                                        setHaritadanSec(true);
                                                        mapSelect(true);
                                                        bottomSheetRef.current.snapToIndex(0);
                                                    }}>
                                                    <MaterialCommunityIcons
                                                        name="map-search"
                                                        size={28}
                                                        color={stil('text', data.app.theme).color}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                            {result.map((item, index) => {
                                                return (
                                                    <View key={index} style={[]}>
                                                        {index < 5 ? (
                                                            <>
                                                                {item.point ? (
                                                                    <View
                                                                        key={index}
                                                                        style={[
                                                                            tw`flex-row items-center`,
                                                                        ]}>
                                                                        <View
                                                                            style={tw`flex-row items-center`}>
                                                                            <MaterialCommunityIcons
                                                                                name="map-marker-plus"
                                                                                size={20}
                                                                                color={
                                                                                    data.app
                                                                                        .theme ==
                                                                                    'dark'
                                                                                        ? '#f9f9f7'
                                                                                        : '#255382'
                                                                                }
                                                                            />
                                                                            <View
                                                                                style={[
                                                                                    tw`flex-row items-start ml-2 py-2`,
                                                                                ]}>
                                                                                <TouchableOpacity
                                                                                    onPress={() => {
                                                                                        setLocations(
                                                                                            [
                                                                                                ...locations,
                                                                                                {
                                                                                                    title: item.name,
                                                                                                    lat: item
                                                                                                        .point
                                                                                                        .lat,
                                                                                                    lon: item
                                                                                                        .point
                                                                                                        .lon,
                                                                                                    description:
                                                                                                        item.full_address_name
                                                                                                            ? item.full_address_name
                                                                                                            : '' +
                                                                                                              (item.purpose_name
                                                                                                                  ? '- ' +
                                                                                                                    item.purpose_name
                                                                                                                  : ''),
                                                                                                },
                                                                                            ],
                                                                                        );
                                                                                        setResult(
                                                                                            [],
                                                                                        );
                                                                                        setSearchText(
                                                                                            '',
                                                                                        );
                                                                                    }}>
                                                                                    <View
                                                                                        style={tw`flex justify-between`}>
                                                                                        <Text
                                                                                            style={[
                                                                                                tw` font-semibold`,
                                                                                                stil(
                                                                                                    'text',
                                                                                                    data
                                                                                                        .app
                                                                                                        .theme,
                                                                                                ),
                                                                                            ]}>
                                                                                            {
                                                                                                item.name
                                                                                            }
                                                                                        </Text>

                                                                                        <Text
                                                                                            style={[
                                                                                                tw`text-xs`,
                                                                                                stil(
                                                                                                    'text',
                                                                                                    data
                                                                                                        .app
                                                                                                        .theme,
                                                                                                ),
                                                                                            ]}>
                                                                                            {item.full_address_name ? (
                                                                                                <>
                                                                                                    {
                                                                                                        item.full_address_name
                                                                                                    }
                                                                                                    {item.purpose_name
                                                                                                        ? '- ' +
                                                                                                          item.purpose_name
                                                                                                        : ''}
                                                                                                </>
                                                                                            ) : (
                                                                                                ''
                                                                                            )}
                                                                                        </Text>
                                                                                    </View>
                                                                                </TouchableOpacity>
                                                                            </View>
                                                                        </View>
                                                                    </View>
                                                                ) : (
                                                                    ''
                                                                )}
                                                            </>
                                                        ) : null}
                                                    </View>
                                                );
                                            })}
                                        </>
                                    </View>
                                </>
                            ) : null}
                            <View key="cars" style={tw``}>
                                {snap > 0 ? (
                                    <>
                                        <Text
                                            style={[
                                                tw`font-medium `,
                                                stil('text', data.app.theme),
                                            ]}>
                                            {l[data.app.lang].cars}
                                        </Text>
                                        <View style={tw`flex-row`}>
                                            <View style={[tw``]}>
                                                <FlatList
                                                    data={DATA}
                                                    keyExtractor={(item, index) => index.toString()}
                                                    horizontal
                                                    renderItem={({item, index}) => {
                                                        return (
                                                            <TouchableOpacity
                                                                onPress={() => {
                                                                    if (cars.length < 4) {
                                                                        setCars([
                                                                            {
                                                                                id: Math.random(
                                                                                    1000000,
                                                                                    9999999,
                                                                                ),
                                                                                title: item.title,
                                                                                description:
                                                                                    item.start
                                                                                        .description,
                                                                                alt: item.alt,
                                                                                price: item.start
                                                                                    .price,
                                                                                paid: item.paid
                                                                                    .price,
                                                                                km: item.km.price,
                                                                                image: item.image,
                                                                                totalPrice:
                                                                                    routeDistance.split(
                                                                                        ' ',
                                                                                    )[0] == 0
                                                                                        ? item.start
                                                                                              .price
                                                                                        : item.km
                                                                                              .price *
                                                                                              routeDistance.split(
                                                                                                  ' ',
                                                                                              )[0] -
                                                                                          item.km
                                                                                              .price +
                                                                                          item.start
                                                                                              .price,
                                                                                load: true,
                                                                            },
                                                                        ]);
                                                                    }
                                                                }}
                                                                key={index}
                                                                style={[
                                                                    tw`flex  items-center mr-2 my-2 rounded p-2 `,
                                                                    {
                                                                        shadowColor: stil(
                                                                            'text',
                                                                            data.app.theme,
                                                                        ).color,
                                                                        shadowOffset: {
                                                                            width: 1,
                                                                            height: 1,
                                                                        },
                                                                        shadowOpacity: 0.1,
                                                                        shadowRadius: 0,
                                                                        elevation: 5,
                                                                    },
                                                                    stil('bg2', data.app.theme),
                                                                    tw` rounded`,
                                                                ]}>
                                                                <Image
                                                                    source={{uri: item.image}}
                                                                    style={tw`h-10 w-20`}
                                                                    resizeMode="contain"
                                                                />
                                                                {cars.length > 0 ? (
                                                                    <>
                                                                        {cars[0].title ==
                                                                        item.title ? (
                                                                            <MaterialCommunityIcons
                                                                                name="check-circle"
                                                                                size={24}
                                                                                style={{
                                                                                    position:
                                                                                        'absolute',
                                                                                    left: 5,
                                                                                    top: 5,
                                                                                }}
                                                                                color={
                                                                                    stil(
                                                                                        'text',
                                                                                        data.app
                                                                                            .theme,
                                                                                    ).color
                                                                                }
                                                                            />
                                                                        ) : null}
                                                                    </>
                                                                ) : null}
                                                                <View
                                                                    style={tw`flex justify-between items-center`}>
                                                                    <Text
                                                                        style={[
                                                                            tw` font-medium`,
                                                                            stil(
                                                                                'text',
                                                                                data.app.theme,
                                                                            ),
                                                                        ]}>
                                                                        {item.title} -{' '}
                                                                        {routeDistance.split(
                                                                            ' ',
                                                                        )[0] == 0
                                                                            ? item.start.price
                                                                            : item.km.price *
                                                                                  routeDistance.split(
                                                                                      ' ',
                                                                                  )[0] -
                                                                                  item.km.price +
                                                                                  item.start.price >
                                                                              item.start.price
                                                                            ? item.km.price *
                                                                                  routeDistance.split(
                                                                                      ' ',
                                                                                  )[0] -
                                                                              item.km.price +
                                                                              item.start.price
                                                                            : item.start.price}{' '}
                                                                        sum
                                                                    </Text>
                                                                    <Text
                                                                        style={[
                                                                            tw` text-xs`,
                                                                            stil(
                                                                                'text',
                                                                                data.app.theme,
                                                                            ),
                                                                        ]}>
                                                                        {item.alt}
                                                                    </Text>
                                                                </View>
                                                            </TouchableOpacity>
                                                        );
                                                    }}
                                                />
                                            </View>
                                        </View>
                                    </>
                                ) : null}
                            </View>
                            <View key="find" style={tw`flex w-full items-center justify-center`}>
                                {cars[0] ? (
                                    <View
                                        style={[
                                            stil('bg2', data.app.theme),
                                            tw`w-full px-4 py-2 my-2 rounded-md flex-row justify-between items-center`,
                                        ]}>
                                        <View style={[tw`items-center justify-center`]}>
                                            <MaterialCommunityIcons
                                                name="av-timer"
                                                size={24}
                                                color={stil('text', data.app.theme).color}
                                            />
                                            <Text
                                                style={[
                                                    stil('text', data.app.theme),
                                                    tw`font-semibold`,
                                                ]}>
                                                {routeTime}
                                            </Text>
                                        </View>
                                        <View style={[tw`items-center justify-center`]}>
                                            <Text
                                                style={[
                                                    stil('text', data.app.theme),
                                                    tw`font-semibold`,
                                                ]}>
                                                {routeDistance.split(' ')[0] == 0
                                                    ? cars[0].price
                                                    : cars[0].totalPrice}{' '}
                                                sum
                                            </Text>
                                        </View>
                                        <View style={[tw`items-center justify-center`]}>
                                            <MaterialCommunityIcons
                                                name="map-marker-distance"
                                                size={24}
                                                color={stil('text', data.app.theme).color}
                                            />
                                            <Text
                                                style={[
                                                    stil('text', data.app.theme),
                                                    tw`font-semibold`,
                                                ]}>
                                                {routeDistance}
                                            </Text>
                                        </View>
                                    </View>
                                ) : null}
                                <TouchableOpacity
                                    onPress={() => {
                                        if (locations.length > 0 && cars.length > 0) {
                                            setFindVehicle(true);
                                            createTrip();
                                        } else {
                                            Alert.alert('', l[data.app.lang].enaz);
                                        }
                                    }}
                                    style={[
                                        tw`flex-row w-full items-center justify-center  p-4 rounded-md`,
                                        stil('bg2', data.app.theme),
                                    ]}>
                                    <MaterialCommunityIcons
                                        name="car-connected"
                                        size={20}
                                        color={stil('text', data.app.theme).color}
                                    />
                                    <Text style={[tw`font-medium `, stil('text', data.app.theme)]}>
                                        {l[data.app.lang].find_car}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </BottomSheet>
            <Modal
                animationType="fade"
                transparent={true}
                visible={findVehicle}
                onRequestClose={() => {
                    setFindVehicle(!findVehicle);
                }}>
                <View
                    style={[
                        tw` flex-1 items-center justify-center`,
                        {backgroundColor: 'rgba(0,0,0,0.55)'},
                    ]}>
                    <View
                        style={[
                            tw` w-[90%] flex items-center justify-end rounded-md p-2`,
                            stil('bg', data.app.theme),
                        ]}>
                        <View style={[tw`mb-12  w-full`]}>
                            <Text
                                style={[
                                    tw`font-semibold text-center text-base my-2`,
                                    stil('text', data.app.theme),
                                ]}>
                                {l[data.app.lang].uaa}
                            </Text>
                            <View style={[tw`flex `]}>
                                {cars.map((car, index) => {
                                    return (
                                        <View key={index} style={[tw`flex-row items-center px-2`]}>
                                            <Image
                                                source={{uri: car.image}}
                                                style={[
                                                    tw`h-16 w-20 mr-4`,
                                                    {transform: [{rotateY: '180deg'}]},
                                                ]}
                                                resizeMode="contain"
                                            />
                                            <Text
                                                style={[
                                                    stil('text', data.app.theme),
                                                    tw`font-semibold mr-4`,
                                                ]}>
                                                {car.title}
                                            </Text>
                                            {!car.load ? (
                                                <MaterialCommunityIcons
                                                    name="check"
                                                    size={16}
                                                    color={stil('text', data.app.theme).color}
                                                />
                                            ) : (
                                                <ActivityIndicator
                                                    animating={car.load ? true : true}
                                                    size="small"
                                                    color={stil('text', data.app.theme).color}
                                                />
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                        <TouchableOpacity
                            style={[
                                tw`flex-row items-center justify-center p-4 rounded-md w-full`,
                                {backgroundColor: data.app.theme == 'dark' ? '#255382' : '#f1f1f1'},
                            ]}
                            onPress={() => {
                                Alert.alert(
                                    '',
                                    l[data.app.lang].iptall,
                                    [
                                        {
                                            text: l[data.app.lang].back,
                                            onPress: () => console.log('Cancel Pressed'),
                                            style: 'cancel',
                                        },
                                        {
                                            text: l[data.app.lang].check,
                                            onPress: () => {
                                                deleteTrip();
                                                setFindVehicle(false);
                                            },
                                        },
                                    ],
                                    {cancelable: false},
                                );
                            }}>
                            <MaterialCommunityIcons
                                name="cancel"
                                size={16}
                                color={stil('text', data.app.theme).color}
                            />
                            <Text style={[tw`font-semibold ml-2`, stil('text', data.app.theme)]}>
                                {l[data.app.lang].cancel}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
}

export default HomePage;
