import React, {useEffect} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import MapView, {PROVIDER_GOOGLE, Marker, AnimatedRegion} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {
    TouchableOpacity,
    Text,
    View,
    Modal,
    Image,
    Platform,
    TextInput,
    KeyboardAvoidingView,
} from 'react-native';
import {stil} from '../../../utils';
import tw from 'twrnc';
import l from '../../../languages.json';
import Sound from 'react-native-sound';
import {apiPost} from '../../../axios';
import config from '../../../app.json';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import TTMap from '../map';

export default function DriverWait() {
    const dispatch = useDispatch();
    const data = useSelector((state) => state);
    Sound.setCategory('Playback');
    const harita = React.useRef(null);
    const markerRef = React.useRef(null);
    const [timeoutSn, setTimeoutSn] = React.useState(10);
    let soundFile = 'ses14.mp3';
    if (Platform.OS === 'ios') {
        soundFile = 'ses-14.mp3';
    } else {
        soundFile = 'ses14.mp3';
    }
    const [h, setH] = React.useState({
        ust: 6,
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

            setH({
                ust: 6,
                alt: 1,
            });
            fitContent();
        });
    };

    useEffect(() => {
        apiPost('updateUser', {
            id: data.auth.userId,
            is_active: data.app.isActive ? 'active' : 'inactive',
            token: data.auth.userToken,
        })
            .then((res) => {})
            .catch((error) => {
                console.log('DRİVERWAİT.JS ERROR (USEEFFECT)', error);
            });
        return () => {};
    }, [data.app.isActive]);

    useEffect(() => {
        const abortController = new AbortController();
        if (data.trip.tripRequest === null || data.trip.tripRequest.kalan <= 0) {
            dispatch({type: 'setRequest', payload: null});
            dispatch({type: 'ia', payload: true});
            setH({
                ust: 6,
                alt: 1,
            });
            setTimeoutSn(10);
        } else {
            setTimeoutSn(data.trip.tripRequest.kalan);
            dispatch({
                type: 'setDistance',
                payload: calcDistance(
                    data.app.currentLocation,
                    data.trip.tripRequest.locations[0],
                ).toFixed(2),
            });

            dispatch({type: 'ia', payload: false});

            if (h.ust === 6) {
                setH({
                    ust: 4,
                    alt: 2,
                });
                let sound = new Sound(soundFile, Sound.MAIN_BUNDLE, () => {
                    sound.play(() => {
                        sound.play();
                    });
                });
            }
        }

        return () => {
            abortController.abort();
        };
    }, [data.trip.tripRequest]);

    const fitContent = () => {
        harita.current.fitToCoordinates([data.app.currentLocation], {
            edgePadding: {
                top: 250,
                right: 250,
                bottom: 250,
                left: 250,
            },
            animated: true,
        });
    };

    function degreesToRadians(degrees) {
        var radians = (degrees * Math.PI) / 180;
        return radians;
    }
    function calcDistance(startingCoords, destinationCoords) {
        let startingLat = degreesToRadians(startingCoords.latitude);
        let startingLong = degreesToRadians(startingCoords.longitude);
        let destinationLat = degreesToRadians(destinationCoords.latitude);
        let destinationLong = degreesToRadians(destinationCoords.longitude);

        // Radius of the Earth in kilometers
        let radius = 6571;

        // Haversine equation
        let distanceInKilometers =
            Math.acos(
                Math.sin(startingLat) * Math.sin(destinationLat) +
                    Math.cos(startingLat) *
                        Math.cos(destinationLat) *
                        Math.cos(startingLong - destinationLong),
            ) * radius;

        return distanceInKilometers;
    }

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

    // SAYAÇ

    const [tarih, SetTarih] = React.useState('');

    useEffect(() => {
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
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

    useEffect(() => {
        getLocationName(data.app.currentLocation.latitude, data.app.currentLocation.longitude);
    }, [data.app.currentLocation]);

    const [locationName, setLocationName] = React.useState('');
    const getLocationName = (lat, lon, ekle = false, sifirla = false) => {
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';

        axios
            .get(
                'https://nominatim.openstreetmap.org/reverse.php?lat=' +
                    lat +
                    '&lon=' +
                    lon +
                    '&zoom=18&countrycodes=uz&format=jsonv2',
            )
            .then((response) => {
                if (response.data) {
                    setLocationName(response.data.name);
                }
            })
            .catch((e) => {});
    };

    const [driverConfigModal, setDriverConfigModal] = React.useState(false);
    return (
        <>
            <View style={[{flex: 1}, stil('bg', data.app.theme)]}>
                <View style={[tw`h-${h.ust}/6`]}>
                    <TTMap
                        confisi={{
                            mbot: '20%',
                            type: 'DriverWait',
                        }}
                    />
                </View>
                <View style={[tw`justify-center flex-row`]}>
                    <View
                        style={[
                            tw` pb-6 w-[100%] px-4 pt-2 flex justify-center  rounded-t-md`,
                            stil('bg', data.app.theme),

                            {
                                position: 'absolute',
                                bottom: 0,
                            },
                        ]}>
                        <View style={[tw`flex-row justify-between items-center  `]}>
                            <View
                                style={[tw`flex-row items-center justify-between opacity-70 pb-2`]}>
                                <MaterialCommunityIcons
                                    name="map-marker"
                                    size={20}
                                    color={stil('text', data.app.theme).color}
                                />
                                <Text style={[stil('text', data.app.theme), tw`w-[70%]`]}>
                                    {locationName}
                                </Text>
                                <Text style={[stil('text', data.app.theme), tw`w-[30%]`]}>
                                    {data.app.currentLocation.latitude.toFixed(6)} ,{' '}
                                    {data.app.currentLocation.longitude.toFixed(6)}
                                </Text>
                            </View>
                            {/* <TouchableOpacity
                                onPress={() => {
                                    setDriverConfigModal(true);
                                }}>
                                <MaterialCommunityIcons
                                    name="dots-horizontal"
                                    size={32}
                                    color={stil('text', data.app.theme).color}
                                />
                            </TouchableOpacity> */}
                        </View>

                        <TouchableOpacity
                            disabled={data.trip.tripRequest === null ? false : true}
                            onPress={() => {
                                dispatch({type: 'ia', payload: !data.app.isActive});
                            }}
                            style={[
                                tw`h-12 flex-row items-center justify-center rounded-md ${
                                    data.app.isActive ? 'bg-green-700' : 'bg-gray-700'
                                }`,
                                stil('shadow', data.app.theme),
                            ]}>
                            <Text style={[tw`text-center text-white `]}>
                                {/* {l[data.app.lang].status}:{' '} */}
                                {data.app.isActive
                                    ? l[data.app.lang].active
                                    : l[data.app.lang].inactive}{' '}
                                :
                            </Text>
                            <View style={[tw`flex-row items-center justify-center `]}>
                                <Text style={[tw`mx-1   text-white`, s]}>{hours}</Text>
                                <Text style={[tw`   text-white`]}>{l[data.app.lang].hour}</Text>
                                <Text style={[tw`mx-1  text-white`]}>{minute}</Text>
                                <Text style={[tw`  text-white`]}>{l[data.app.lang].minute}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={driverConfigModal}
                onRequestClose={() => {
                    setDriverConfigModal(false);
                }}>
                <KeyboardAvoidingView
                    style={[tw`w-full items-center justify-end`]}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <View
                        style={[
                            tw`h-1/1  flex justify-end`,
                            {backgroundColor: 'rgba(0,0,0,0.25)'},
                        ]}>
                        <View
                            style={[
                                tw`flex pb-6 pt-6 justify-center items-center px-4 rounded-t-md`,
                                stil('bg', data.app.theme),
                            ]}>
                            <View
                                style={[
                                    tw`w-full flex-row items-center justify-between rounded-md p-2`,
                                    stil('bg2', data.app.theme),
                                    stil('shadow', data.app.theme),
                                ]}>
                                <View style={[tw`w-[70%]`]}>
                                    <Text style={[stil('text', data.app.theme), tw`text-xs`]}>
                                        {l[data.app.lang].yolcumesafe} :{' '}
                                    </Text>
                                </View>
                                <TextInput
                                    type="number"
                                    keyboardType="numeric"
                                    style={[
                                        tw`w-[30%] border border-gray-300 rounded-md p-2 bg-white`,
                                    ]}
                                    value={
                                        data.app.driverConfig.getRadius &&
                                        data.app.driverConfig.getRadius.toString()
                                    }
                                    onChangeText={(text) => {
                                        if (text.length > 0) {
                                            dispatch({
                                                type: 'dc',
                                                payload: {
                                                    ...data.app.driverConfig,
                                                    getRadius: parseInt(text),
                                                },
                                            });
                                        } else {
                                            dispatch({
                                                type: 'dc',
                                                payload: {
                                                    ...data.app.driverConfig,
                                                    getRadius: undefined,
                                                },
                                            });
                                        }
                                    }}
                                    onEndEditing={() => {
                                        console.log('bitti');
                                    }}
                                />
                            </View>

                            <View
                                style={[
                                    tw`w-full flex-row items-center mt-2 justify-between rounded-md p-2`,
                                    stil('bg2', data.app.theme),
                                    stil('shadow', data.app.theme),
                                ]}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setDriverConfigModal(false);
                                    }}
                                    style={[
                                        tw`w-full flex-row items-center justify-center rounded-md p-2`,
                                        stil('bg2', data.app.theme),
                                    ]}>
                                    <Text style={[stil('text', data.app.theme), tw`text-base`]}>
                                        {l[data.app.lang].back}{' '}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={data.trip.tripRequest != null}
                onRequestClose={() => {
                    dispatch({type: 'setRequest', payload: null});
                }}>
                <View style={[tw`h-1/1 flex justify-end`, {backgroundColor: 'rgba(0,0,0,0.05)'}]}>
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
                                            <View style={[tw`mb-2 mx-4 w-full`]}>
                                                <View
                                                    style={[
                                                        tw` rounded-md mb-2`,
                                                        stil('bg2', data.app.theme),
                                                        stil('text', data.app.theme),
                                                    ]}>
                                                    <Text
                                                        style={[
                                                            tw` text-center p-2 text-xs`,
                                                            stil('text', data.app.theme),
                                                        ]}>
                                                        {data.trip.tripRequest.tarife} -{' '}
                                                        {data.trip.tripRequest !== null &&
                                                            data.trip.tripRequest.passenger
                                                                .user_name}
                                                    </Text>
                                                </View>
                                                <View style={[tw`flex`]}>
                                                    <View
                                                        style={[
                                                            stil('bg2', data.app.theme),
                                                            tw`flex-row justify-between items-center p-2 rounded-md`,
                                                        ]}>
                                                        <View
                                                            style={[
                                                                tw`    items-center flex-row`,

                                                                stil('text', data.app.theme),
                                                            ]}>
                                                            <Text
                                                                style={[
                                                                    stil('text', data.app.theme),
                                                                    tw` text-center text-xs`,
                                                                ]}>
                                                                {l[data.app.lang].y_uz}
                                                            </Text>
                                                        </View>

                                                        <View
                                                            style={[
                                                                tw`    items-center flex-row`,

                                                                stil('text', data.app.theme),
                                                            ]}>
                                                            <Text
                                                                style={[
                                                                    stil('text', data.app.theme),
                                                                    tw` text-center text-xs`,
                                                                ]}>
                                                                {data.trip.distance} km
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
                                                                tw`   items-center flex-row`,

                                                                stil('text', data.app.theme),
                                                            ]}>
                                                            <Text
                                                                style={[
                                                                    stil('text', data.app.theme),
                                                                    tw`text-center text-xs`,
                                                                ]}>
                                                                {data.trip.tripRequest
                                                                    .est_distance > 0
                                                                    ? l[data.app.lang].hedefli
                                                                    : l[data.app.lang].hedefsiz}
                                                            </Text>
                                                        </View>
                                                        <View
                                                            style={[
                                                                tw`   items-center flex-row`,

                                                                stil('text', data.app.theme),
                                                            ]}>
                                                            <Text
                                                                style={[
                                                                    stil('text', data.app.theme),
                                                                    tw` text-center text-xs`,
                                                                ]}>
                                                                {data.trip.tripRequest
                                                                    .est_distance > 0 &&
                                                                    data.trip.tripRequest
                                                                        .est_duration + ' min'}
                                                            </Text>
                                                        </View>

                                                        <View
                                                            style={[
                                                                tw`   items-center flex-row`,

                                                                stil('text', data.app.theme),
                                                            ]}>
                                                            <Text
                                                                style={[
                                                                    stil('text', data.app.theme),
                                                                    tw`text-center text-xs`,
                                                                ]}>
                                                                {data.trip.tripRequest
                                                                    .est_distance > 0 &&
                                                                    data.trip.tripRequest
                                                                        .est_distance + ' km'}
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
                                                                                        tw`text-xs `,
                                                                                        stil(
                                                                                            'text',
                                                                                            data.app
                                                                                                .theme,
                                                                                        ),
                                                                                    ]}>
                                                                                    {item.title}
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
                                                            tw` ml-2 py-4 text-white`,
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
