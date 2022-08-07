import React, {useEffect} from 'react';
import {useSelector,useDispatch} from 'react-redux';
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
    const data = useSelector(state => state);
    const [DATA, setDATA] = React.useState([]);
    map = React.createRef();
    const [locations, setLocations] = React.useState([]);
    const [cars, setCars] = React.useState([]);
    const [result, setResult] = React.useState([]);
    const [locationModal, setLocationModal] = React.useState(false);
    const [searchText, setSearchText] = React.useState('');
    const [haritadanSec, setHaritadanSec] = React.useState(false);
    const [haritadanSecilen, setHaritadanSecilen] = React.useState([]);
    const [findVehicle, setFindVehicle] = React.useState(false);
    const [bottomHeight, setBottomHeight] = React.useState(0);
    const [topHeight, setTopHeight] = React.useState(0);
    const [routeTime, setRouteTime] = React.useState(0);
    const [routeDistance, setRouteDistance] = React.useState('0 ');
    const [resultType, setResultType] = React.useState(false);

    if(typeof String.prototype.replaceAll === "undefined") {
        String.prototype.replaceAll = function(match, replace) {
            return this.replace(new RegExp(match, 'g'), () => replace);
        }
    }
    useEffect(() => {
        Geolocation.getCurrentPosition(
            (position) => {
                if (position.coords.latitude != 0 && position.coords.longitude != 0) {
                    setHaritadanSecilen({lat: position.coords.latitude, lon: position.coords.longitude});
                    setCurrent(position.coords.longitude + ',' + position.coords.latitude);
                    mapConfiguration(position.coords.longitude + ',' + position.coords.latitude);
                }
            },
            (error) => {
                console.log(error.code, error.message);
            },
            {enableHighAccuracy: false, timeout: 30000, maximumAge: 1000},
        );
    }, []);

    useEffect(() => {
        mapConfiguration();
    }, [locations, current]);

    useEffect(() => {
       
        getCars();
    }, []);

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



    const mapConfiguration = (me = '') => {

        let param = '';
        locations.forEach((value, index) => {
            param = param + '&marker' + index + '=' + value.lon + ',' + value.lat + ',' + value.title.replaceAll(',', ' ');
        });
        setSource({uri: 'https://trendtaxi.uz/maps?me=' + (me ? me : current) + '&token=' + data.auth.userToken + param});


        if (locations.length > 1 && locations[1].title != 'Belirsiz') {
            let price = [];
            for (let c in cars) {
                let arac = {
                    ...cars[c],
                    totalPrice: ((cars[c].km * routeDistance.split(' ')[0]) - cars[c].km) + cars[c].price,
                };
                price.push(arac);

            }
            setCars(price);
        }
    };

    const getCars = () => {
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        axios.get('https://trendtaxi.uz/api/getCarTypes')
            .then(response => {
                if (!response.data.data.hata) {
                    setDATA(response.data.data);
                } else {
                }
            })
            .catch(error => {
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
        axios.get('https://catalog.api.2gis.com/3.0/items?q=' + text + '&key=runnmp5276&locale=' + lang + '&fields=items.full_name,items.point,items.locale,items.full_address_name')
            // axios.get('https://search-maps.yandex.ru/v1/?text='+text+'&lang='+lang+'&apikey=ae55dcf2-7140-4585-a883-e16d89cc31d2')
            .then(response => {
                console.log(response.data);
                if (response.data.result) {
                    setResult(response.data.result.items);
                    setResultType(true);
                }
            })
            .catch(error => {
                setResult([]);
                setResultType(true);
                console.log('search', error);
            });
    };
    const [current, setCurrent] = React.useState('');
    const getCurrentLocation = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                if (position.coords.latitude != 0 && position.coords.longitude != 0) {
                    setCurrentPosition(position);
                    setCurrent(position.coords.longitude + ',' + position.coords.latitude);
                }
            },
            (error) => {
                console.log(error.code, error.message);
            },
            {enableHighAccuracy: false, timeout: 30000, maximumAge: 1000},
        );
    };

    const setCurrentPosition = async (position) => {
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
        // console.log('https://catalog.api.2gis.com/3.0/items?q='+position.coords.latitude+','+position.coords.longitude+'&key=runnmp5276&locale='+lang+'&fields=items.full_name,items.point,items.locale,items.full_address_name')
        axios.get('https://catalog.api.2gis.com/3.0/items?q=' + position.coords.latitude + ',' + position.coords.longitude + '&key=runnmp5276&locale=' + lang + '&fields=items.full_name,items.point,items.locale,items.full_address_name')
            .then(response => {
                setLocations([...locations, {
                    title: response.data.result.items[0].name,
                    lat: response.data.result.items[0].point.lat,
                    lon: response.data.result.items[0].point.lon,
                    description: (response.data.result.items[0].full_name ? response.data.result.items[0].full_name : '') + (response.data.result.items[0].purpose_name ? '- ' + response.data.result.items[0].purpose_name : ''),
                }]);
            })
            .catch(error => {
                console.log('setCurrentPosition', error);
            });
    };


    const [kabul, setKabul] = React.useState({
        'car0': 0,
        'car1': 0,
        'car2': 0,
        'car3': 0,
    });

    const createTrip = (cari = 0) => {
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        let loc = '';
        locations.map((location, index) => {
            loc = loc + location.lat + ',' + location.lon + ',' + location.title.replaceAll(',', ' ').replaceAll('-', ' ').replaceAll("'", ' ') + ',' + location.description.replaceAll(',', ' ').replaceAll('-', ' ').replaceAll("'", ' ') + '-';
        });
        

        axios.get(
            'https://trendtaxi.uz/event?' +
            'prc=trip_create&' +
            'km_price=' + cars[cari].km + '&' +
            'paid_price=' + cars[cari].paid + '&' +
            'start_price=' + cars[cari].price + '&' +
            'car_id=' + cars[cari].title + '&' +
            'start=' + loc + '&' +
            'car=' + cars[cari].title + '&' +
            'duration=' + routeTime + '&' +
            'distance=' + routeDistance + '&' +
            'price=' + cars[cari].totalPrice + '&' +
            'user=' + data.auth.userId,
        )
            .then(response => {

                const istekler = response.data.drivers;
                let wait = 0;
                istekler.forEach(element => {
                    
                    setTimeout(() => {
                        soforeIstek(response.data.trip.id,element,response.data.start);
                    }, wait);
                    wait = wait + 17000;
                });

            })
            .catch(error => {
                console.log(error);
            });

    };

    useEffect(() => {
            Pusher.logToConsole = true;
            var pusher = new Pusher('03a866856199003ebcb7', {
                cluster: 'ap2'
            });
            var channel = pusher.subscribe('TripEvents_'+data.auth.userId);
            channel.bind('trip', function(data) {
                console.log(data);
                if(data.trip.prc == 'tripOnaylandi'){
                    onaylandi();
                }
            });
        return () => {
            pusher?.disconnect();
        }
    },[]);

    const getTrip = (id,userToken,userType) => {
        const config = {
            headers: { Authorization: `Bearer ${userToken}` }
        };
        axios.defaults.headers.common["Accept"] = "application/json";
        axios.defaults.headers.common["Content-Type"] = "application/json";
        axios.defaults.headers.common["Authorization"] = "Bearer "+userToken;
        axios.post('https://trendtaxi.uz/api/isActiveTrip',{
            id:id,
            lang:data.app.lang,
            type:userType+'_id'
        })
            .then(response => {
                if(!response.data.data.hata) {
                    console.log(response.data.data);
                    dispatch({type:'setTrip',payload:response.data.data});
                    navigation.navigate('Harita');
                }
                else{
                }
            })
            .catch(error => {
                console.log(error);
            });
    }
    const [cagir,setCagir] = React.useState(1);
    const onaylandi = () => {


        getTrip(data.auth.userId,data.auth.userToken,data.auth.userType);
       
        

        

    };

    const [istekCar,setIstekCar] = React.useState(0);
    const soforeIstek = (trip_id,id,start) => {
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        axios.get('https://trendtaxi.uz/event?prc=sofor_istek&driver_id=' + id+'&trip_id='+trip_id+'&start='+start).then(response => {
            console.log(response.data);
        });
    };

    const deleteTrip = () => {
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        axios.get('https://trendtaxi.uz/event?prc=delete_trip&user=' + data.auth.userId)
            .then(response => {

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
    const onMessage = (payload) => {
        let dataPayload;
        try {
            console.log(payload.nativeEvent.data);
            dataPayload = JSON.parse(payload.nativeEvent.data);
        } catch (e) {
        }
        try {
            if (dataPayload) {

                if (dataPayload.type === 'Console' && dataPayload.data.type == 'log') {


                    const dataa = JSON.parse(dataPayload.data.log);
                    if (haritadanSec) {
                        setHaritadanSecilen(dataa);
                    } else if (dataa.distance) {
                        setRouteDistance(dataa.distance);
                        setRouteTime(dataa.duration);
                        if (locations.length > 1 && locations[1].title != 'Belirsiz') {
                            let price = [];
                            for (let c in cars) {
                                let arac = {
                                    ...cars[c],
                                    totalPrice: ((cars[c].km * dataa.distance.split(' ')[0]) - cars[c].km) + cars[c].price,
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
                } else {
                    console.log(dataPayload);
                }
            }
        } catch (e) {
        }
    };
    const [acik, setAcik] = React.useState(1);
    const [modalType, setModalType] = React.useState('adres');
    return (
        <>
            <StatusBarComponent/>
            <View style={[tw` w-full`, {height: topHeight}]}>
                <WebView
                    ref={map}
                    source={{uri: source.uri + (haritadanSec ? '&setSelect=1' : '')}}
                    injectedJavaScript={debugging}
                    onMessage={onMessage}

                />
                {haritadanSec ?
                    <View style={[tw`flex-row items-center justify-between rounded-t-md`, stil('bg', data.app.theme), {
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                    }]}>
                        <TouchableOpacity
                            style={[tw`flex-row items-center justify-center  w-1/2 py-3 rounded-tl-md`, stil('bg2', data.app.theme)]}
                            onPress={() => {
                                setLocationModal(true);
                                setHaritadanSec(false);
                            }}
                        >
                            <MaterialCommunityIcons name="cancel" size={20} color={stil('text', data.app.theme).color}/>
                            <Text style={[tw`font-medium ml-2`, stil('text', data.app.theme)]}>{l[data.app.lang].cancel}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setHaritadanSec(false);
                                setLocationModal(true);
                                setLocations([...locations, haritadanSecilen]);
                            }}
                            style={[tw`flex-row items-center justify-center  w-1/2 py-3 rounded-tr-md`, stil('bg2', data.app.theme)]}
                        >
                            <Text style={[tw`font-semibold mr-2`, stil('text', data.app.theme)]}>{l[data.app.lang].check}</Text>
                            <MaterialCommunityIcons name="check" size={20} color={stil('text', data.app.theme).color}/>
                        </TouchableOpacity>
                    </View>
                    :
                    <View style={[tw`flex-row items-center justify-between rounded-t-md`, stil('bg', data.app.theme), {
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                    }]}>
                        <TouchableOpacity
                            style={[tw`flex items-center justify-center w-1/3 py-3 h-14 rounded-tl-md`, stil(acik == 1 ? 'bg' : 'bg2', data.app.theme)]}
                            onPress={() => {
                                setAcik(1);
                                //setLocationModal(true);
                                //setModalType('adres');
                            }}
                        >
                            <MaterialCommunityIcons name="map" size={20} color={stil('text', data.app.theme).color}/>
                            <Text style={[tw`font-medium `, stil('text', data.app.theme)]}>{l[data.app.lang].addresss}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[tw`flex items-center justify-center w-1/3 py-3 h-14`, stil(acik == 2 ? 'bg' : 'bg2', data.app.theme)]}
                            onPress={() => {
                                setAcik(2);
                                //setLocationModal(true);
                                //setModalType('araç');
                            }}
                        >
                            <MaterialCommunityIcons name="car" size={20} color={stil('text', data.app.theme).color}/>
                            <Text style={[tw`font-medium `, stil('text', data.app.theme)]}>{l[data.app.lang].cars}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                if (locations.length > 1 && cars.length > 0) {
                                    setFindVehicle(true);
                                    createTrip();
                                } else {
                                    Alert.alert('',l[data.app.lang].enaz);
                                }

                            }}
                            style={[tw`flex items-center justify-center w-1/3 py-3 h-14 rounded-tr-md`, stil('bg2', data.app.theme)]}
                        >
                            <MaterialCommunityIcons name="car-connected" size={20} color={stil('text', data.app.theme).color}/>
                            <Text style={[tw`font-medium `, stil('text', data.app.theme)]}>{l[data.app.lang].find_car}</Text>
                        </TouchableOpacity>
                    </View>
                }
            </View>
            <View
                onLayout={(event) => {
                    var {x, y, width, height} = event.nativeEvent.layout;
                    const ScreenHeight = Dimensions.get('window').height;
                    setTopHeight(ScreenHeight - (height));
                    setBottomHeight((height));
                }}
                style={[tw` w-full flex  pt-2`,  stil('bg', data.app.theme)]}>

                {acik == 1 ?
                    <View
                        style={[tw`justify-between flex`, {borderColor: stil('bg2', data.app.theme).backgroundColor}]}>


                        <FlatList
                            data={locations}
                            style={[tw`px-2`]}
                            ListEmptyComponent={() => (
                                <View style={[tw``]}>
                                    <Text style={[tw` text-xs pb-4`, stil('text', data.app.theme)]}>{l[data.app.lang].hsbgb}</Text>
                                </View>
                            )}
                            renderItem={({item, index}) => {
                                return (
                                    <View key={index}
                                          style={[tw`flex-row w-full items-center rounded-md  mb-1 px-2 py-3`, stil('bg2', data.app.theme)]}>
                                        <View style={[tw`items-center`]}>
                                            <MaterialCommunityIcons style={[tw`w-6 text-center`]}
                                                                    name={index == 0 ? 'home' : (index == (locations.length - 1) ? 'flag' : 'map-marker')}
                                                                    size={24}
                                                                    color={stil('text', data.app.theme).color}/>
                                        </View>
                                        <View style={[tw`ml-2`]}>
                                            <Text
                                                style={[tw`text-xs font-medium`, {fontSize: 12}, stil('text', data.app.theme)]}>
                                                {item.title}
                                            </Text>
                                            <Text
                                                style={[tw`text-xs font-light pr-8`, {fontSize: 10}, stil('text', data.app.theme)]}>
                                                {item.description}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            }}
                            keyExtractor={(item, index) => index.toString()}
                        />
                        <TouchableOpacity onPress={() => {
                            setLocationModal(true);
                            setModalType('adres');
                        }} style={[tw`flex-row w-full items-center justify-center pt-2 pb-4`, stil('bg2', data.app.theme)]}>
                            <MaterialCommunityIcons name="pencil" size={24} color={stil('text', data.app.theme).color}/>
                            <Text style={[tw`p-2 font-semibold`, stil('text', data.app.theme)]}>{l[data.app.lang].address} {l[data.app.lang].edit}</Text>
                        </TouchableOpacity>
                    </View>
                    : null}
                {acik == 2 ?
                    <View
                        style={[tw`justify-between flex `, {borderColor: stil('bg2', data.app.theme).backgroundColor}]}>
                        <FlatList
                            data={cars}
                            // horizontal
                            style={[tw`px-2`]}
                            ListEmptyComponent={() => (
                                <View style={[tw``]}>
                                    <Text style={[tw` text-xs pb-4`, stil('text', data.app.theme)]}>{l[data.app.lang].hsbab}</Text>
                                </View>
                            )}
                            renderItem={({item, index}) => {
                                return (
                                    <View key={index}
                                          style={[tw`flex-row items-center justify-between mb-1 px-4 py-1 rounded-md`, stil('bg2', data.app.theme)]}>

                                        <View style={tw`items-center  justify-center flex`}>
                                            <Text style={[tw``, stil('text', data.app.theme)]}>
                                                {item.title}
                                            </Text>
                                            <Image source={{uri: item.image}} style={[tw`h-10 w-15`, {
                                                transform: [{
                                                    rotateY: '180deg',
                                                }],
                                            }]} resizeMode="contain"/>
                                        </View>
                                        <View
                                            style={[tw`flex items-center justify-center `, stil('text', data.app.theme)]}>
                                            <MaterialCommunityIcons name="map-marker-path" size={20}
                                                                    color={stil('text', data.app.theme).color}/>
                                            <Text
                                                style={[tw`text-xs mt-1`, {fontSize: 10}, stil('text', data.app.theme)]}>{routeDistance}</Text>
                                        </View>
                                        <View
                                            style={[tw`flex items-center justify-center`, stil('text', data.app.theme)]}>
                                            <MaterialCommunityIcons name="clock-start" size={20}
                                                                    color={stil('text', data.app.theme).color}/>
                                            <Text
                                                style={[tw`text-xs mt-1`, {fontSize: 10}, stil('text', data.app.theme)]}>{routeTime}</Text>
                                        </View>
                                        <View
                                            style={[tw`flex items-center justify-center`, stil('text', data.app.theme)]}>
                                            <MaterialCommunityIcons name="credit-card" size={20}
                                                                    color={stil('text', data.app.theme).color}/>
                                            <Text
                                                style={[tw`text-xs mt-1`, {fontSize: 10}, stil('text', data.app.theme)]}>{item.totalPrice} sum</Text>
                                        </View>

                                    </View>
                                );
                            }}
                            keyExtractor={(item, index) => index.toString()}
                        />
                        <TouchableOpacity onPress={() => {
                            setLocationModal(true);
                            setModalType('araç');
                        }} style={[tw`flex-row w-full items-center justify-center pt-2 pb-4`, stil('bg2', data.app.theme)]}>
                            <MaterialCommunityIcons name="pencil" size={24} color={stil('text', data.app.theme).color}/>
                            <Text style={[tw`p-2 font-semibold`, stil('text', data.app.theme)]}>{l[data.app.lang].car} {l[data.app.lang].edit}</Text>
                        </TouchableOpacity>
                    </View>
                    : null}



            </View>


            {/* Find Vehicle Modals */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={findVehicle}
                onRequestClose={() => {
                    setFindVehicle(!findVehicle);
                }}
            >
                <View style={[tw`h-full flex items-center justify-center`, {backgroundColor: 'rgba(0,0,0,0.5)'}]}>
                    <View
                        style={[tw` w-[95%] flex items-center justify-end rounded-md p-2`, stil('bg', data.app.theme)]}>
                        <View style={[tw`mb-12  w-full`]}>
                            <Text style={[tw`font-semibold text-center text-base my-2`, stil('text', data.app.theme)]}>{l[data.app.lang].uaa}</Text>
                            <View style={[tw`flex `]}>
                                {cars.map((car, index) => {
                                    return (
                                        <View key={index} style={[tw`flex-row items-center px-2`]}>
                                            <Image source={{uri: car.image}}
                                                   style={[tw`h-16 w-20 mr-4`, {transform: [{rotateY: '180deg'}]}]}
                                                   resizeMode="contain"/>
                                            <Text
                                                style={[stil('text', data.app.theme), tw`font-semibold mr-4`]}>{car.title}</Text>
                                            {!car.load ? <MaterialCommunityIcons name="check" size={16}
                                                                                            color={stil('text', data.app.theme).color}/> :
                                                <ActivityIndicator animating={car.load ? true : true}
                                                                   size="small"
                                                                   color={stil('text', data.app.theme).color}/>}
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                        <TouchableOpacity
                            style={[tw`flex-row items-center justify-center p-4 rounded-md w-full`, {backgroundColor: data.app.theme == 'dark' ? '#255382' : '#f1f1f1'}]}
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
                            }}
                        >
                            <MaterialCommunityIcons name="cancel" size={16} color={stil('text', data.app.theme).color}/>
                            <Text style={[tw`font-semibold ml-2`, stil('text', data.app.theme)]}>{l[data.app.lang].cancel}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>


            {/* Configuration Modals */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={locationModal}
                onRequestClose={() => {
                    setLocationModal(!locationModal);
                }}
            >
                <ScrollView
                    style={[tw`flex p-4 pt-6 h-1/1`,
                        {backgroundColor: data.app.theme == 'dark' ? 'rgba(15, 54, 94,1)' : '#eeeeee'},
                    ]}>
                    {modalType == 'adres' ?
                        <>
                            <View style={tw` mt-4`}>
                                <Text style={[tw` font-semibold text-xl mt-1`, stil('text', data.app.theme)]}>
                                    {l[data.app.lang].setguzergah}
                                </Text>
                            </View>
                            <View style={tw`flex-row items-center mt-2 justify-between`}>
                                <View style={[tw`w-6/6`]}>
                                    <TextInput
                                        placeholderTextColor={stil('text', data.app.theme).color}
                                        placeholder={l[data.app.lang].findguzergah}
                                        style={[tw`h-12 rounded-md p-2 `, stil('text', data.app.theme), stil('bg2', data.app.theme)]}
                                        onChangeText={(text) => {
                                            setSearchText(text);
                                            if (text == '') {
                                                setResult([]);
                                            }
                                        }}
                                        value={searchText}
                                    />
                                </View>
                                <TouchableOpacity
                                    style={{position: 'absolute', right: 0, top: 0, bottom: 0, padding: 8}}
                                    onPress={() => {
                                        setHaritadanSec(true);
                                        setLocationModal(false);

                                    }}
                                >
                                    <MaterialCommunityIcons name="map-search" size={32}
                                                            color={stil('text', data.app.theme).color}></MaterialCommunityIcons>
                                </TouchableOpacity>
                            </View>
                            <View style={tw`flex-row items-center mt-2 justify-between`}>

                                <TouchableOpacity style={[tw`flex-row items-center  justify-end p-2 rounded-md`,stil('bg2',data.app.theme)]}
                                                  onPress={() => {
                                                      if (locations.length > 0) {
                                                          setLocations([...locations, {
                                                              lat: locations[0].lat,
                                                              lon: locations[0].lon,
                                                              title: 'Belirsiz',
                                                              description: 'Belirsiz',
                                                          }]);
                                                      }

                                                  }}
                                >
                                    <Text style={[tw` font-semibold mr-2`, stil('text', data.app.theme)]}>
                                        {l[data.app.lang].aadres}</Text>
                                    <MaterialCommunityIcons name="road-variant" size={24}
                                                            color={stil('text', data.app.theme).color}></MaterialCommunityIcons>
                                </TouchableOpacity>

                                <TouchableOpacity style={[tw`flex-row items-center justify-end p-2 rounded-md`,stil('bg2',data.app.theme)]}
                                                  onPress={() => {
                                                      getCurrentLocation();
                                                  }}
                                >
                                    <MaterialCommunityIcons name="map-marker-account" size={24}
                                                            color={stil('text', data.app.theme).color}></MaterialCommunityIcons>
                                    <Text style={[tw` font-semibold ml-2`, stil('text', data.app.theme)]}>{l[data.app.lang].mylocation}</Text>
                                </TouchableOpacity>

                            </View>
                            <View style={tw`flex-row mt-2`}>
                                <View
                                    style={[tw`w-full`, result.length != 0 ? stil('bg2', data.app.theme) : '', tw`px-2 rounded`]}>
                                    {result.length == 0 && searchText.length > 2 ?
                                        <View
                                            style={[tw`flex-row  items-center justify-center font-semibold p-2`, stil('text', data.app.theme)]}>
                                            {resultType ?
                                                <>
                                                    <Text
                                                        style={[tw`text-center font-semibold ml-2`, stil('text', data.app.theme)]}>{l[data.app.lang].notfind}</Text>
                                                </>
                                                :
                                                <>
                                                    <ActivityIndicator size="small"
                                                                       color={stil('text', data.app.theme).color}/>
                                                    <Text
                                                        style={[tw`text-center font-semibold ml-2`, stil('text', data.app.theme)]}>{l[data.app.lang].finding}</Text>
                                                </>
                                            }
                                        </View>
                                        :
                                        <>
                                            {result.map((item, index) => {
                                                return (
                                                    <View key={index} style={[]}>
                                                        {index < 5 ?
                                                            <>
                                                                {item.point ?
                                                                    <View key={index} style={[tw`flex-row items-center`]}>
                                                                        <View style={tw`flex-row items-center`}>
                                                                            <MaterialCommunityIcons name="map-marker-plus" size={20} color={data.app.theme == 'dark' ? '#f9f9f7' : '#255382'}/>
                                                                            <View style={[tw`flex-row items-start ml-2 py-2`]}>
                                                                                <TouchableOpacity
                                                                                    onPress={() => {
                                                                                        setLocations([...locations, {
                                                                                            title: item.name,
                                                                                            lat: item.point.lat,
                                                                                            lon: item.point.lon,
                                                                                            description: item.full_address_name ? item.full_address_name : '' + (item.purpose_name ? '- ' + item.purpose_name : ''),
                                                                                        }]);
                                                                                        setResult([]);
                                                                                        setSearchText('');
                                                                                    }}
                                                                                >
                                                                                    <View style={tw`flex justify-between`}>
                                                                                        <Text style={[tw` font-semibold`, stil('text', data.app.theme)]}>
                                                                                            {item.name}
                                                                                        </Text>

                                                                                            <Text style={[tw`text-xs`, stil('text', data.app.theme)]}>
                                                                                                {item.full_address_name ?
                                                                                                    <>
                                                                                                        {item.full_address_name}
                                                                                                        {item.purpose_name ? '- ' + item.purpose_name : ''}
                                                                                                    </>
                                                                                                    : ''}
                                                                                            </Text>

                                                                                    </View>
                                                                                </TouchableOpacity>
                                                                            </View>
                                                                        </View>
                                                                    </View>
                                                                    : ''}
                                                            </>
                                                            : null}
                                                    </View>
                                                );
                                            })}
                                        </>
                                    }

                                </View>
                            </View>
                            <View style={tw`flex mt-2 items-start justify-between`}>
                                <Text style={[tw`font-semibold`,stil('text',data.app.theme)]}>{l[data.app.lang].selecteds}</Text>
                                {locations.map((item, index) => {
                                    return (
                                        <View key={index} style={tw`flex-row items-start justify-between`}>
                                            <TouchableOpacity
                                                style={tw`mb-1 py-2 pr-2`}
                                                onPress={() => {
                                                    let remainingItems = locations.filter((item2, index2) => {
                                                        return index2 !== index;
                                                    });
                                                    setLocations(remainingItems);
                                                }}
                                            >
                                                <MaterialCommunityIcons name="delete" size={24}
                                                                        color={data.app.theme == 'dark' ? '#f66' : '#f66'}/>
                                            </TouchableOpacity>
                                            <View style={[tw`flex-row items-start px-2 py-1`]}>
                                                <View style={tw`flex justify-between `}>
                                                    <Text
                                                        style={[tw`text-xs font-semibold`, stil('text', data.app.theme)]}>
                                                        {item.title}
                                                    </Text>
                                                    <Text style={[tw`text-xs pr-8`, stil('text', data.app.theme)]}>
                                                        {item.description}
                                                    </Text>
                                                </View>
                                            </View>

                                        </View>
                                    );
                                })}
                            </View>
                        </>
                        :
                        <>
                            <View
                                style={[tw` mt-4 pt-4  `]}>
                                <Text style={[tw` font-semibold text-xl`, stil('text', data.app.theme)]}>
                                    {l[data.app.lang].setcar}
                                </Text>
                            </View>
                            <View style={tw`flex-row mt-2`}>
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
                                                            setCars([...cars, {
                                                                id: Math.random(1000000,9999999),
                                                                title: item.title,
                                                                description: item.start.description,
                                                                alt: item.alt,
                                                                price: item.start.price,
                                                                paid: item.paid.price,
                                                                km: item.km.price,
                                                                image: item.image,
                                                                totalPrice: ((item.km.price * routeDistance.split(' ')[0]) - item.km.price) + item.start.price,
                                                                load:true,
                                                            }]);
                                                        }

                                                    }}
                                                    key={index} style={[tw`flex  items-center mr-2 my-2 rounded p-2 `, {
                                                    shadowColor: stil('text', data.app.theme).color,
                                                    shadowOffset: {
                                                        width: 1,
                                                        height: 1,
                                                    },
                                                    shadowOpacity: 0.10,
                                                    shadowRadius: 0,
                                                    elevation: 5,
                                                }, stil('bg2', data.app.theme), tw`px-6 rounded`]}>
                                                    <Image source={{uri: item.image}} style={tw`h-20 w-40`}
                                                           resizeMode="contain"/>
                                                    <View style={tw`flex justify-between items-center`}>
                                                        <Text
                                                            style={[tw` font-semibold`, stil('text', data.app.theme)]}>
                                                            {item.title} - {
                                                            (((item.km.price * routeDistance.split(' ')[0]) - item.km.price) + item.start.price) > item.start.price ?
                                                                (((item.km.price * routeDistance.split(' ')[0]) - item.km.price) + item.start.price) : item.start.price

                                                        } sum
                                                        </Text>
                                                        <Text style={[tw`text-xs`, stil('text', data.app.theme)]}>
                                                            {item.alt}
                                                        </Text>
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        }
                                        }
                                    />

                                </View>
                            </View>
                            <View style={tw`flex mt-2 mb-4 w-full items-start justify-between`}>
                                <Text style={[tw`font-semibold`,stil('text',data.app.theme)]}>{l[data.app.lang].selecteds}</Text>
                                {cars.map((item, index) => {
                                    return (
                                        <View key={index} style={tw`flex-row items-center justify-between`}>
                                            <TouchableOpacity
                                                style={tw`mb-1  pt-2 pr-2`}
                                                onPress={() => {
                                                    let remainingItems = cars.filter((item2, index2) => {
                                                        return index2 !== index;
                                                    });
                                                    setCars(remainingItems);
                                                }}
                                            >
                                                <MaterialCommunityIcons name="delete" size={24}
                                                                        color={data.app.theme == 'dark' ? '#f66' : '#f66'}/>
                                            </TouchableOpacity>
                                            <View style={[tw`flex-row items-center px-2 py-1`]}>
                                                <View style={tw`flex justify-between mr-4`}>
                                                    <Image source={{uri: item.image}} style={tw`h-10 w-20`}
                                                           resizeMode="contain"/>
                                                </View>
                                                <View style={tw`flex justify-between `}>
                                                    <Text
                                                        style={[tw`text-xs font-semibold`, stil('text', data.app.theme)]}>
                                                        {item.title}
                                                    </Text>
                                                    <Text style={[tw`text-xs pr-8`, stil('text', data.app.theme)]}>
                                                        {item.totalPrice} sum
                                                    </Text>
                                                </View>
                                            </View>

                                        </View>
                                    );
                                })}
                            </View>
                        </>
                    }


                </ScrollView>
                <TouchableOpacity
                    style={[tw`flex  items-center rounded py-4 mx-4 mb-8  `, {
                        position:'absolute',
                        bottom:0,
                        left:0,
                        right:0
                    }, stil('bg2', data.app.theme), tw` rounded`]}
                    onPress={() => {
                        setLocationModal(!locationModal);
                        setHaritadanSec(false);
                    }}
                >
                    <Text style={[tw`text-base font-semibold`, stil('text', data.app.theme)]}>{l[data.app.lang].check}</Text>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

export default HomePage;

