import React, {useEffect} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import MapView, {PROVIDER_GOOGLE, Marker, Polygon} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {TouchableOpacity, Text, View, Modal, Image} from 'react-native';
import {stil} from '../../../utils';
import tw from 'twrnc';
import l from '../../../languages.json';
import Sound from 'react-native-sound';
import {apiPost} from '../../../axios';
import config from '../../../app.json';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';

//burayafont yükle gelecek

export default function DriverWait() {
    const dispatch = useDispatch();
    const data = useSelector((state) => state);
    Sound.setCategory('Playback');
    const harita = React.useRef(null);
    const [timeoutSn, setTimeoutSn] = React.useState(10);
    let soundFile = 'ses14.mp3';
    if (Platform.OS === 'ios') {
        soundFile = 'ses-14.mp3';
    } else {
        soundFile = 'ses14.mp3';
    }
    const [locations, setLocations] = React.useState([]);
    const [h, setH] = React.useState({
        ust: 5,
        alt: 1,
    });
    const [bakiyeModal, setBakiyeModal] = React.useState(false);

    const onaylaFunction = () => {
        apiPost('updateActiveTrip', {
            prc: 'tripCheck',
            lang: data.app.lang,
            token: data.auth.userToken,
            id: data.auth.userId,
            trip_id: data.trip.tripRequest.id,
        }).catch((error) => {
            console.log('DRİVERWAİT.JS ERROR (ONAYLA)', error);
            dispatch({type: 'setRequest', payload: null});
            dispatch({type: 'ia', payload: true});
            setLocations([]);

            setH({
                ust: 5,
                alt: 1,
            });
            fitContent();
        });
    };

    const [timer, setTimer] = React.useState(0);
    useEffect(() => {
        setInterval(() => {
            setTimer(timer + 1);
        }, 15000);
    }, []);

    useEffect(() => {
        if (data.app.isActive) {
            if (data.trip.trip === null && data.trip.tripRequest === null) {
                apiPost('updateUser', {
                    id: data.auth.userId,
                    is_active: 'active',
                    token: data.auth.userToken,
                    last_latitude: cl.latitude,
                    last_longitude: cl.longitude,
                })
                    .then(() => {})
                    .catch((error) => {
                        console.log('DRİVERWAİT.JS ERROR (UPDATE USER 1)', error);
                    });
            } else {
                apiPost('updateUser', {
                    id: data.auth.userId,
                    is_active: 'inactive',
                    token: data.auth.userToken,
                    last_latitude: cl.latitude,
                    last_longitude: cl.longitude,
                })
                    .then(() => {})
                    .catch((error) => {
                        console.log('DRİVERWAİT.JS ERROR (UPDATE USER 2)', error);
                    });
            }
        } else {
            apiPost('updateUser', {
                id: data.auth.userId,
                is_active: 'inactive',
                token: data.auth.userToken,
                last_latitude: cl.latitude,
                last_longitude: cl.longitude,
            })
                .then(() => {})
                .catch((error) => {
                    console.log('DRİVERWAİT.JS ERROR (UPDATE USER 3)', error);
                });
        }

        return () => {
            false;
        };
    }, [data.app.isActive, timer]);

    useEffect(() => {
        let pint = setInterval(() => {
            if (data.app.peoples.length > 0) {
                let p = data.app.peoples;
                p.shift();
                dispatch({type: 'setPeoples', payload: p});
            }
        }, 15000);

        return () => {
            clearInterval(pint);
        };
    }, [data.app.peoples]);

    useEffect(() => {
        const abortController = new AbortController();

        // let kalan = 10;
        // let interr = setInterval(() => {
        //     kalan = kalan - 1;
        //     if (kalan < 0) {
        //         dispatch({type: 'setRequest', payload: null});
        //         dispatch({type: 'ia', payload: true});
        //         setLocations([]);
        //         setH({
        //             ust: 5,
        //             alt: 1,
        //         });
        //         fitContent();
        //     }
        //     setTimeoutSn(kalan);
        // }, 1000);
        if (data.trip.tripRequest === null || data.trip.tripRequest.kalan <= 0) {
            dispatch({type: 'setRequest', payload: null});
            dispatch({type: 'ia', payload: true});
            setH({
                ust: 5,
                alt: 1,
            });
            setTimeoutSn(10);
            setLocations([]);
            fitContent();
            // clearInterval(interr);
        } else {
            setTimeoutSn(data.trip.tripRequest.kalan);

            dispatch({type: 'ia', payload: false});

            // if (data.trip.tripRequest.kalan <= 0) {
            //     dispatch({type: 'setRequest', payload: null});
            //     dispatch({type: 'ia', payload: true});
            //     setLocations([]);
            //     setH({
            //         ust: 5,
            //         alt: 1,
            //     });
            //     fitContent();
            // } else {
            if (h.ust === 5) {
                setH({
                    ust: 4,
                    alt: 2,
                });
                let sound = new Sound(soundFile, Sound.MAIN_BUNDLE, () => {
                    sound.play(() => {
                        sound.play();
                    });
                });

                setLocations([data.trip.tripRequest.locations[0]]);
                harita.current.fitToCoordinates([cl, data.trip.tripRequest.locations[0]], {
                    edgePadding: {
                        top: 150,
                        right: 100,
                        bottom: 150,
                        left: 100,
                    },
                    animated: true,
                });
            }
            // }
        }

        return () => {
            abortController.abort();
            // clearInterval(interr);
        };
    }, [data.trip.tripRequest]);

    const [region, setRegion] = React.useState({
        latitude: 41.32195,
        longitude: 69.26926,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    });

    const fitContent = () => {
        if (cl.latitude != 0 && cl.longitude != 0) {
            harita.current.fitToCoordinates([cl], {
                edgePadding: {
                    top: 250,
                    right: 250,
                    bottom: 250,
                    left: 250,
                },
                animated: true,
            });
        }
    };

    useEffect(() => {
        var x = setInterval(function () {
            var tarih = data.auth.user.active_time;
            var now = new Date().getTime();
            tarih = tarih * 1000;
            var distance = tarih - now;
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            distance = parseInt(distance);
            if (distance < 1) {
                clearInterval(x);
                setHours(0);
                setMinute(0);
                dispatch({type: 'ia', payload: false});
                // alert('bakiyeniz bitmiştir');
                setBakiyeModal(true);
            } else {
                setHours(hours);
                setMinute(minutes);
            }
        }, 1000);
        return () => {
            clearInterval(x);
        };
    }, [data.app.isActive]);

    const [hours, setHours] = React.useState([]);
    const [minute, setMinute] = React.useState([]);
    const [cl, setCl] = React.useState({
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    });

    // SAYAÇ

    const [tarih, SetTarih] = React.useState('');

    useEffect(() => {
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        var param = '';

        axios
            .get('http://92.63.206.162/sayac.html')
            .then((response) => {
                SetTarih(new Date(response.request._response).getTime());
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    useEffect(() => {
        var x = setInterval(function () {
            var now = new Date().getTime();
            var distance = tarih - now;
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);
            setD(days);
            setHO(hours);
            setM(minutes);
            setS(seconds);
        }, 1000);
        return () => {
            clearInterval(x);
        };
    }, [tarih]);

    const [d, setD] = React.useState([]);
    const [ho, setHO] = React.useState([]);
    const [m, setM] = React.useState([]);
    const [s, setS] = React.useState([]);

    const [distance, setDistance] = React.useState(0);
    const [duration, setDuration] = React.useState(0);

    return (
        <>
            <View style={[{flex: 1}, stil('bg', data.app.theme)]}>
                <View style={[tw`h-${h.ust}/6`]}>
                    <MapView
                        loadingEnabled={true}
                        key={data.trip.trip}
                        ref={harita}
                        provider={PROVIDER_GOOGLE}
                        style={{flex: 1}}
                        region={region}
                        initialRegion={region}
                        userLocationPriority={'high'}
                        userLocationUpdateInterval={1000}
                        userLocationFastestInterval={1000}
                        showsUserLocation
                        zoomEnabled={true}
                        showsCompass={false}
                        // followsUserLocation={true}
                        enableZoomControl={true}
                        showsMyLocationButton={false}
                        onUserLocationChange={(e) => {
                            setRegion({
                                latitude: e.nativeEvent.coordinate.latitude,
                                longitude: e.nativeEvent.coordinate.longitude,
                                latitudeDelta: 0.005,
                                longitudeDelta: 0.005,
                            });

                            setCl({
                                latitude: e.nativeEvent.coordinate.latitude,
                                longitude: e.nativeEvent.coordinate.longitude,
                                latitudeDelta: 0.005,
                                longitudeDelta: 0.005,
                            });
                        }}
                        showsTraffic>
                        {data.trip.tripRequest !== null ? (
                            <Marker coordinate={data.trip.tripRequest.locations[0]}>
                                <Image
                                    source={require('../../../assets/img/marker-people.png')}
                                    style={[tw`h-10 w-10`]}
                                />
                            </Marker>
                        ) : null}

                        {data.trip.tripRequest !== null ? (
                            <MapViewDirections
                                origin={cl}
                                destination={data.trip.tripRequest.locations[0]}
                                apikey={config.mapApi}
                                strokeWidth={5}
                                strokeColor="#0f365e"
                                optimizeWaypoints={true}
                                onReady={(result) => {
                                    let dis = 0;
                                    let dur = 0;
                                    result.legs.map((item, index) => {
                                        dis = dis + item.distance.value;
                                        dur = dur + item.duration.value;
                                    });
                                    setDistance(dis);
                                    setDuration(dur);
                                }}
                            />
                        ) : null}
                    </MapView>

                    <View style={[tw`flex-row justify-end items-center absolute right-4 bottom-4`]}>
                        <TouchableOpacity
                            onPress={() => {
                                fitContent();
                            }}
                            style={[tw`rounded-md p-2`, stil('bg', data.app.theme)]}>
                            <MaterialCommunityIcons
                                name="map-marker-radius"
                                size={28}
                                color={stil('text', data.app.theme).color}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={[tw`h-${h.alt}/6 pb-4 px-4 pt-2 flex justify-center`]}>
                    {data.auth.user.tester == 1 && (
                        <View
                            style={[
                                tw`w-full h-full mx-4 flex flex-row items-center justify-center rounded-md`,
                                {
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    zIndex: 9999,
                                    position: 'absolute',
                                },
                            ]}>
                            <View style={[tw`flex-row items-center justify-center`]}>
                                <MaterialCommunityIcons
                                    name="lock-outline"
                                    size={24}
                                    color="white"
                                />
                                <Text style={[tw`mx-1 text-xl text-center`, {color: 'white'}]}>
                                    {d}
                                </Text>
                                <Text style={[tw` text-xs text-center`, {color: 'white'}]}>
                                    {l[data.app.lang].day}
                                </Text>
                                <Text style={[tw`mx-1 text-xl text-center`, {color: 'white'}]}>
                                    {ho}
                                </Text>
                                <Text style={[tw` text-xs text-center`, {color: 'white'}]}>
                                    {l[data.app.lang].hour}
                                </Text>
                                <Text style={[tw`mx-1 text-xl text-center`, {color: 'white'}]}>
                                    {m}
                                </Text>
                                <Text style={[tw` text-xs text-center`, {color: 'white'}]}>
                                    {l[data.app.lang].minute}
                                </Text>
                                <Text style={[tw`mx-1 text-xl text-center`, {color: 'white'}]}>
                                    {s}
                                </Text>
                                <Text style={[tw`text-xs text-center`, {color: 'white'}]}>
                                    {l[data.app.lang].second}
                                </Text>
                            </View>
                        </View>
                    )}
                    <View style={[tw`flex-row items-center justify-between  mb-4`]}>
                        <Text style={[stil('text', data.app.theme), tw`text-base`]}>
                            {l[data.app.lang].kalansure} :
                        </Text>
                        <View style={[tw`flex-row items-center justify-center `]}>
                            <Text style={[tw`mx-1  text-base`, stil('text', data.app.theme)]}>
                                {hours}
                            </Text>
                            <Text style={[tw`  text-base`, stil('text', data.app.theme)]}>
                                {l[data.app.lang].hour}
                            </Text>
                            <Text style={[tw`mx-1 text-base`, stil('text', data.app.theme)]}>
                                {minute}
                            </Text>
                            <Text style={[tw` text-base`, stil('text', data.app.theme)]}>
                                {l[data.app.lang].minute}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        disabled={data.trip.tripRequest === null ? false : true}
                        onPress={() => {
                            dispatch({type: 'ia', payload: !data.app.isActive});
                        }}
                        style={[
                            tw`h-12 w-full items-center justify-center rounded-md ${
                                data.app.isActive ? 'bg-green-700' : 'bg-gray-700'
                            }`,
                        ]}>
                        <Text style={[tw`text-center text-white font-medium`]}>
                            {l[data.app.lang].status}:{' '}
                            {data.app.isActive
                                ? l[data.app.lang].active
                                : l[data.app.lang].inactive}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={data.trip.tripRequest != null}
                onRequestClose={() => {
                    dispatch({type: 'setRequest', payload: null});
                }}>
                <View style={[tw`h-1/1 flex justify-end`, {backgroundColor: 'rgba(0,0,0,0.25)'}]}>
                    <View style={[tw`flex pb-6 pt-2 justify-end px-4`, stil('bg', data.app.theme)]}>
                        <View style={[tw`  items-center justify-center`, ,]}>
                            <View
                                style={[
                                    tw`w-full flex items-center justify-end  p-2`,
                                    stil('bg', data.app.theme),
                                ]}>
                                <View style={[tw`  w-full`]}>
                                    {data.trip.tripRequest != null ? (
                                        <View style={[tw`flex mx-4 items-center justify-center`]}>
                                            <View style={[tw`mb-4 mx-4 w-full`]}>
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
                                                        {data.trip.tripRequest !== null &&
                                                            data.trip.tripRequest.passenger
                                                                .user_name}
                                                    </Text>
                                                </View>
                                                <View style={[tw`flex`]}>
                                                    <View
                                                        style={[
                                                            stil('bg2', data.app.theme),
                                                            tw`flex-row justify-between items-center my-2 p-2 rounded-md`,
                                                        ]}>
                                                        <View
                                                            style={[
                                                                tw`  mb-1  items-center flex-row`,

                                                                stil('text', data.app.theme),
                                                            ]}>
                                                            <Text
                                                                style={[
                                                                    stil('text', data.app.theme),
                                                                    tw`font-bold text-center `,
                                                                ]}>
                                                                {l[data.app.lang].y_uz}
                                                            </Text>
                                                        </View>

                                                        <View
                                                            style={[
                                                                tw`  mb-1  items-center flex-row`,

                                                                stil('text', data.app.theme),
                                                            ]}>
                                                            <Text
                                                                style={[
                                                                    stil('text', data.app.theme),
                                                                    tw`font-bold text-center `,
                                                                ]}>
                                                                {(distance / 1000).toFixed(2)} km
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <View
                                                        style={[
                                                            stil('bg2', data.app.theme),
                                                            tw`flex-row justify-between items-center my-2 p-2 rounded-md`,
                                                        ]}>
                                                        <View
                                                            style={[
                                                                tw`  mb-1  items-center flex-row`,

                                                                stil('text', data.app.theme),
                                                            ]}>
                                                            <Text
                                                                style={[
                                                                    stil('text', data.app.theme),
                                                                    tw`font-bold text-center `,
                                                                ]}>
                                                                {data.trip.tripRequest
                                                                    .est_distance > 0
                                                                    ? l[data.app.lang].hedefli
                                                                    : l[data.app.lang].hedefsiz}
                                                            </Text>
                                                        </View>
                                                        <View
                                                            style={[
                                                                tw`   mb-1 items-center flex-row`,

                                                                stil('text', data.app.theme),
                                                            ]}>
                                                            <Text
                                                                style={[
                                                                    stil('text', data.app.theme),
                                                                    tw`font-bold text-center `,
                                                                ]}>
                                                                {data.trip.tripRequest.est_duration}{' '}
                                                                min
                                                            </Text>
                                                        </View>

                                                        <View
                                                            style={[
                                                                tw`  mb-1  items-center flex-row`,

                                                                stil('text', data.app.theme),
                                                            ]}>
                                                            <Text
                                                                style={[
                                                                    stil('text', data.app.theme),
                                                                    tw`font-bold text-center `,
                                                                ]}>
                                                                {data.trip.tripRequest.est_distance}{' '}
                                                                km
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    {data.trip.tripRequest.Gosterlokasyonlar ? (
                                                        <>
                                                            {data.trip.tripRequest.locations.map(
                                                                (item, index) => {
                                                                    return (
                                                                        <View
                                                                            key={index}
                                                                            style={[
                                                                                tw`flex-row items-center mb-2 rounded-md px-2 py-1`,
                                                                                stil(
                                                                                    'bg2',
                                                                                    data.app.theme,
                                                                                ),
                                                                            ]}>
                                                                            <View>
                                                                                <MaterialCommunityIcons
                                                                                    style={[
                                                                                        tw`text-center mr-2`,
                                                                                    ]}
                                                                                    name="adjust"
                                                                                    size={16}
                                                                                    color={
                                                                                        stil(
                                                                                            'text',
                                                                                            data.app
                                                                                                .theme,
                                                                                        ).color
                                                                                    }
                                                                                />
                                                                            </View>
                                                                            <View>
                                                                                <Text
                                                                                    style={[
                                                                                        tw`text-xs font-semibold`,
                                                                                        stil(
                                                                                            'text',
                                                                                            data.app
                                                                                                .theme,
                                                                                        ),
                                                                                    ]}>
                                                                                    {item.title}
                                                                                </Text>
                                                                                <Text
                                                                                    style={[
                                                                                        tw`text-xs`,
                                                                                        stil(
                                                                                            'text',
                                                                                            data.app
                                                                                                .theme,
                                                                                        ),
                                                                                    ]}>
                                                                                    {
                                                                                        item.description
                                                                                    }
                                                                                </Text>
                                                                            </View>
                                                                        </View>
                                                                    );
                                                                },
                                                            )}
                                                        </>
                                                    ) : null}
                                                </View>
                                            </View>
                                            <View style={[tw`flex items-center justify-center`]}>
                                                <TouchableOpacity
                                                    style={[
                                                        tw`flex-row items-center justify-center rounded-md px-4 w-50 bg-green-600`,
                                                    ]}
                                                    onPress={() => {
                                                        onaylaFunction();
                                                    }}>
                                                    <View
                                                        style={[
                                                            tw` h-[100%] w-[${
                                                                50 - parseInt(timeoutSn * 5)
                                                            }] rounded-md bg-green-900`,
                                                            {
                                                                borderTopRightRadius: 1000,

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
                                                        {l[data.app.lang].check} ({timeoutSn})
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ) : null}
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={bakiyeModal}
                onRequestClose={() => {
                    setBakiyeModal(false);
                }}>
                <View style={[tw`h-1/1 flex justify-end`, {backgroundColor: 'rgba(0,0,0,0.25)'}]}>
                    <View style={[tw`flex pb-6 pt-2 justify-end px-4`, stil('bg', data.app.theme)]}>
                        <View style={[tw`  items-center justify-center`, ,]}>
                            <View
                                style={[
                                    tw`w-full flex items-center justify-end  p-2`,
                                    stil('bg', data.app.theme),
                                ]}>
                                <View style={[tw`  w-full`]}>
                                    <View style={[tw`flex-row items-center justify-between`]}>
                                        <View>
                                            <Text
                                                style={[
                                                    tw`font-bold text-lg`,
                                                    stil('text', data.app.theme),
                                                ]}>
                                                {l[data.app.lang].balance} :{' '}
                                                {data.auth.user.user_balance} sum
                                            </Text>
                                            <View
                                                style={[
                                                    tw`flex-row items-center justify-between  mb-1`,
                                                ]}>
                                                <Text
                                                    style={[
                                                        stil('text', data.app.theme),
                                                        tw`text-base`,
                                                    ]}>
                                                    {l[data.app.lang].kalansure} :
                                                </Text>
                                                <View
                                                    style={[
                                                        tw`flex-row items-center justify-center `,
                                                    ]}>
                                                    <Text
                                                        style={[
                                                            tw`mx-1  text-base`,
                                                            stil('text', data.app.theme),
                                                        ]}>
                                                        {hours}
                                                    </Text>
                                                    <Text
                                                        style={[
                                                            tw`  text-base`,
                                                            stil('text', data.app.theme),
                                                        ]}>
                                                        {l[data.app.lang].hour}
                                                    </Text>
                                                    <Text
                                                        style={[
                                                            tw`mx-1 text-base`,
                                                            stil('text', data.app.theme),
                                                        ]}>
                                                        {minute}
                                                    </Text>
                                                    <Text
                                                        style={[
                                                            tw` text-base`,
                                                            stil('text', data.app.theme),
                                                        ]}>
                                                        {l[data.app.lang].minute}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={[tw`flex-row items-center justify-between mt-4`]}>
                                        <TouchableOpacity
                                            style={[
                                                tw`flex-row items-center justify-center rounded-md p-4 px-4 bg-red-700`,
                                            ]}
                                            onPress={() => {
                                                setBakiyeModal(false);
                                            }}>
                                            <Text style={[tw`font-semibold text-white`]}>
                                                {l[data.app.lang].cancel}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            disabled={
                                                data.auth.user.user_balance <
                                                data.auth.user.user_data.car.fee
                                                    ? true
                                                    : false
                                            }
                                            style={[
                                                tw`flex-row items-center justify-center rounded-md p-4 px-4 bg-green-700`,
                                            ]}
                                            onPress={() => {
                                                let time = new Date().getTime() / 1000;
                                                time = time + 86400;

                                                apiPost('updateUser', {
                                                    id: data.auth.userId,
                                                    active_time: parseInt(time),
                                                    driver_active: 'active',
                                                    dusBalance: data.auth.user.user_data.car.fee,
                                                    token: data.auth.userToken,
                                                })
                                                    .then((r) => {
                                                        apiPost('getUser', {
                                                            token: data.auth.userToken,
                                                            id: data.auth.userId,
                                                        })
                                                            .then((response) => {
                                                                if (response != false) {
                                                                    dispatch({
                                                                        type: 'setUser',
                                                                        payload:
                                                                            response.data.response,
                                                                    });
                                                                    dispatch({
                                                                        type: 'ia',
                                                                        payload: true,
                                                                    });
                                                                }
                                                            })
                                                            .catch((error) => {
                                                                console.log(
                                                                    'DRİVERWAİT.JS ERROR (GET USER)',
                                                                    error,
                                                                );
                                                            });
                                                    })
                                                    .catch((error) => {
                                                        console.log(
                                                            'DRİVERWAİT.JS ERROR (UPDATE USER 4)',
                                                            error,
                                                        );
                                                    });
                                                setBakiyeModal(false);
                                            }}>
                                            <Text style={[tw`font-semibold text-white`]}>
                                                {data.auth.user.user_data.car.fee} sum{' '}
                                                {l[data.app.lang].check}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}
