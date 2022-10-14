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
        });
    };

    useEffect(() => {
        var activeInt = setInterval(() => {
            if (data.app.isActive) {
                if (data.trip.trip === null && data.trip.tripRequest === null) {
                    apiPost('updateUser', {
                        id: data.auth.userId,
                        is_active: 'active',
                        token: data.auth.userToken,
                        last_latitude: data.app.currentLocation[0],
                        last_longitude: data.app.currentLocation[1],
                    })
                        .then(() => {})
                        .catch((error) => {
                            console.log('DRİVERWAİT.JS ERROR (UPDATE USER 1)', error);
                        });
                } else {
                    clearInterval(activeInt);
                    apiPost('updateUser', {
                        id: data.auth.userId,
                        is_active: 'inactive',
                        token: data.auth.userToken,
                        last_latitude: data.app.currentLocation[0],
                        last_longitude: data.app.currentLocation[1],
                    })
                        .then(() => {})
                        .catch((error) => {
                            console.log('DRİVERWAİT.JS ERROR (UPDATE USER 2)', error);
                        });
                }
            } else {
                clearInterval(activeInt);
                apiPost('updateUser', {
                    id: data.auth.userId,
                    is_active: 'inactive',
                    token: data.auth.userToken,
                    last_latitude: data.app.currentLocation[0],
                    last_longitude: data.app.currentLocation[1],
                })
                    .then(() => {})
                    .catch((error) => {
                        console.log('DRİVERWAİT.JS ERROR (UPDATE USER 3)', error);
                    });
            }
        }, 15000);

        return () => {
            clearInterval(activeInt);
        };
    }, [data.app.isActive]);

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
        let kalan = 10;
        let interr = setInterval(() => {
            kalan = kalan - 1;
            if (kalan < 0) {
                dispatch({type: 'setRequest', payload: null});
                dispatch({type: 'ia', payload: true});
                setLocations([]);
                setH({
                    ust: 5,
                    alt: 1,
                });
                fitContent();
            }
            setTimeoutSn(kalan);
        }, 1000);
        if (!data.trip.tripRequest) {
            dispatch({type: 'ia', payload: true});
            setH({
                ust: 5,
                alt: 1,
            });
            setTimeoutSn(10);
            setLocations([]);
            fitContent();
            clearInterval(interr);
        } else {
            dispatch({type: 'ia', payload: false});
            let sound = new Sound(soundFile, Sound.MAIN_BUNDLE, () => {
                sound.play(() => {
                    sound.play();
                });
            });
            setH({
                ust: 4,
                alt: 1,
            });
            setLocations([data.trip.tripRequest.locations[0]]);
            harita.current.fitToCoordinates(
                [
                    data.trip.tripRequest.locations[0],
                    {
                        latitude: data.app.currentLocation[0],
                        longitude: data.app.currentLocation[1],
                        latitudeDelta: 0.015,
                        longitudeDelta: 0.015,
                    },
                ],
                {
                    edgePadding: {
                        top: 100,
                        right: 100,
                        bottom: 100,
                        left: 100,
                    },
                    animated: true,
                },
            );
        }

        return () => {
            abortController.abort();
            clearInterval(interr);
        };
    }, [data.trip.tripRequest]);

    const [region, setRegion] = React.useState({
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    });

    const fitContent = () => {
        harita.current.fitToCoordinates([region], {
            edgePadding: {
                top: 250,
                right: 250,
                bottom: 250,
                left: 250,
            },
            animated: true,
        });
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

    return (
        <>
            <View style={[{flex: 1}, stil('bg', data.app.theme)]}>
                <View style={[tw`h-${h.ust}/6`]}>
                    <MapView
                        ref={harita}
                        provider={PROVIDER_GOOGLE}
                        style={{flex: 1}}
                        region={region}
                        initialRegion={region}
                        showsUserLocation
                        zoomEnabled={true}
                        enableZoomControl={true}
                        showsMyLocationButton={false}
                        onUserLocationChange={(e) => {
                            if (region.latitude == 0) {
                                setRegion({
                                    latitude: e.nativeEvent.coordinate.latitude,
                                    longitude: e.nativeEvent.coordinate.longitude,
                                    latitudeDelta: 0.005,
                                    longitudeDelta: 0.005,
                                });
                            }
                        }}
                        showsTraffic>
                        {locations.map((item, index) => {
                            return (
                                <Marker
                                    identifier={'Marker_' + index}
                                    key={index}
                                    coordinate={item}
                                    title={item.title}
                                    description={item.description}>
                                    <Image
                                        source={require('../../../assets/img/people.png')}
                                        style={[tw`h-14 w-7`]}
                                    />
                                </Marker>
                            );
                        })}

                        {locations.length >= 1 ? (
                            <MapViewDirections
                                origin={{
                                    latitude: data.app.currentLocation[0],
                                    longitude: data.app.currentLocation[1],
                                }}
                                destination={locations[0]}
                                apikey={config.mapApi}
                                strokeWidth={5}
                                strokeColor="#0f365e"
                                optimizeWaypoints={true}
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
                                                        {data.trip.tripRequest.passenger.user_name}
                                                    </Text>
                                                </View>
                                                <View style={[tw`flex`]}>
                                                    {data.trip.tripRequest.Gosterzaman ||
                                                    data.trip.tripRequest.Gosterkm ||
                                                    data.trip.tripRequest.Gostertutar ? (
                                                        <View
                                                            style={[
                                                                stil('bg2', data.app.theme),
                                                                tw`flex-row justify-between items-center my-2 p-2 rounded-md`,
                                                            ]}>
                                                            <View
                                                                style={[
                                                                    tw`   mb-1 items-center flex-row`,

                                                                    stil('text', data.app.theme),
                                                                ]}>
                                                                {data.trip.tripRequest
                                                                    .Gosterzaman ? (
                                                                    <Text
                                                                        style={[
                                                                            stil(
                                                                                'text',
                                                                                data.app.theme,
                                                                            ),
                                                                            tw`font-bold text-center `,
                                                                        ]}>
                                                                        {
                                                                            data.trip.tripRequest
                                                                                .est_duration
                                                                        }{' '}
                                                                        min
                                                                    </Text>
                                                                ) : null}
                                                            </View>
                                                            <View
                                                                style={[
                                                                    tw`  mb-1  items-center flex-row`,

                                                                    stil('text', data.app.theme),
                                                                ]}>
                                                                {data.trip.tripRequest.Gosterkm ? (
                                                                    <Text
                                                                        style={[
                                                                            stil(
                                                                                'text',
                                                                                data.app.theme,
                                                                            ),
                                                                            tw`font-bold text-center `,
                                                                        ]}>
                                                                        {
                                                                            data.trip.tripRequest
                                                                                .est_distance
                                                                        }{' '}
                                                                        km
                                                                    </Text>
                                                                ) : null}
                                                            </View>
                                                            <View
                                                                style={[
                                                                    tw`  mb-1 items-center flex-row`,

                                                                    stil('text', data.app.theme),
                                                                ]}>
                                                                {data.trip.tripRequest
                                                                    .Gostertutar ? (
                                                                    <Text
                                                                        style={[
                                                                            stil(
                                                                                'text',
                                                                                data.app.theme,
                                                                            ),
                                                                            tw`font-bold text-center `,
                                                                        ]}>
                                                                        {
                                                                            data.trip.tripRequest
                                                                                .est_price
                                                                        }{' '}
                                                                        sum
                                                                    </Text>
                                                                ) : null}
                                                            </View>
                                                        </View>
                                                    ) : null}
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
                                                console.log({
                                                    id: data.auth.userId,
                                                    active_time: parseInt(time),
                                                    driver_active: 'active',
                                                    dusBalance: data.auth.user.user_data.car.fee,
                                                    token: data.auth.userToken,
                                                });
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
