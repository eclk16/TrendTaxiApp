import React, {useEffect} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import MapView, {PROVIDER_GOOGLE, Marker, Polygon} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {TouchableOpacity, Text, View, Modal} from 'react-native';
import {stil} from '../../../utils';
import tw from 'twrnc';
import l from '../../../languages.json';
import Sound from 'react-native-sound';
import {apiPost} from '../../../axios';
import config from '../../../app.json';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
MaterialCommunityIcons.loadFont();

export default function DriverWait() {
    const dispatch = useDispatch();
    const data = useSelector((state) => state);
    Sound.setCategory('Playback');
    const harita = React.useRef(null);
    const [timeoutSn, setTimeoutSn] = React.useState(10);
    const [distance, setDistance] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    let soundFile = 'ses14.mp3';
    if (Platform.OS === 'ios') {
        soundFile = 'ses-14.mp3';
    } else {
        soundFile = 'ses14.mp3';
    }
    const [soundLoaded, setSoundLoaded] = React.useState(false);
    const [locations, setLocations] = React.useState([]);
    const [h, setH] = React.useState({
        ust: 4,
        alt: 1,
    });

    const onaylaFunction = () => {
        apiPost('updateActiveTrip', {
            prc: 'tripCheck',
            lang: data.app.lang,
            token: data.auth.userToken,
            id: data.auth.userId,
            trip_id: data.trip.tripRequest.id,
        }).catch((error) => {
            console.log('YOLCULUK KABUL ETME HATASI = ', error);
        });
    };

    useEffect(() => {
        const abortController = new AbortController();
        apiActive(data.app.isActive ? 'active' : 'inactive');
        let int = setInterval(() => {
            apiActive(data.app.isActive ? 'active' : 'inactive');
        }, 10000);
        return () => {
            abortController.abort();
            clearInterval(int);
        };
    }, [data.app.isActive]);

    const apiActive = (activ = null) => {
        if (data.trip.trip === null && data.trip.tripRequest === null) {
            apiPost('updateUser', {
                id: data.auth.userId,
                is_active: activ == null ? data.app.isActive : activ,
                token: data.auth.userToken,
                last_latitude: data.app.currentLocation[0],
                last_longitude: data.app.currentLocation[1],
            }).catch((error) => {
                console.log('YOLCULUK KABUL ETME HATASI = ', error);
            });
        }
    };

    useEffect(() => {
        const abortController = new AbortController();
        let kalan = 10;
        let interr = setInterval(() => {
            kalan = kalan - 1;
            if (kalan < 0) {
                dispatch({type: 'ia', payload: true});
                dispatch({type: 'setRequest', payload: null});
                setLocations([]);
                setH({
                    ust: 4,
                    alt: 1,
                });
                fitContent();
            }
            setTimeoutSn(kalan);
        }, 1000);
        if (!data.trip.tripRequest) {
            dispatch({type: 'ia', payload: true});
            setH({
                ust: 4,
                alt: 1,
            });
            setTimeoutSn(10);
            setLocations([]);
            fitContent();
            clearInterval(interr);
        } else {
            let sound = new Sound(soundFile, Sound.MAIN_BUNDLE, () => {
                sound.play(() => {
                    sound.play();
                });
            });
            setH({
                ust: 3,
                alt: 1,
            });
            setLocations(data.trip.tripRequest.locations);
            harita.current.fitToCoordinates(
                [
                    {latitude: data.app.currentLocation[0], longitude: data.app.currentLocation[1]},
                    ...data.trip.tripRequest.locations,
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
            dispatch({type: 'ia', payload: true});
            clearInterval(interr);
        };
    }, [data.trip.tripRequest, soundLoaded]);
    const [region, setRegion] = React.useState({
        latitude: data.app.currentLocation[0],
        longitude: data.app.currentLocation[1],
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    });

    const fitContent = () => {
        if (data.app.currentLocation[0]) {
            harita.current.fitToCoordinates(
                [
                    {
                        latitude: data.app.currentLocation[0],
                        longitude: data.app.currentLocation[1],
                        latitudeDelta: 0.015,
                        longitudeDelta: 0.015,
                    },
                    {
                        latitude: parseFloat(data.app.currentLocation[0]) + 0.0005,
                        longitude: parseFloat(data.app.currentLocation[1]) + 0.0005,
                        latitudeDelta: 0.015,
                        longitudeDelta: 0.015,
                    },
                    {
                        latitude: parseFloat(data.app.currentLocation[0]) - 0.0005,
                        longitude: parseFloat(data.app.currentLocation[1]) - 0.0005,
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
    };
    return (
        <>
            <View style={[{flex: 1}, stil('bg', data.app.theme)]}>
                <View style={[tw`h-${h.ust}/5`]}>
                    <MapView
                        ref={harita}
                        provider={PROVIDER_GOOGLE}
                        style={{flex: 1}}
                        region={region}
                        initialRegion={region}
                        showsUserLocation
                        zoomEnabled={true}
                        enableZoomControl={true}
                        // showsMyLocationButton
                        showsTraffic
                        onUserLocationChange={(ret) => {
                            dispatch({
                                type: 'loc',
                                payload: [
                                    ret.nativeEvent.coordinate.latitude,
                                    ret.nativeEvent.coordinate.longitude,
                                ],
                            });
                            setRegion({
                                latitude: ret.nativeEvent.coordinate.latitude,
                                longitude: ret.nativeEvent.coordinate.longitude,
                                latitudeDelta: 0.005,
                                longitudeDelta: 0.005,
                            });
                        }}
                        loadingEnabled>
                        {locations.map((item, index) => {
                            return (
                                <Marker
                                    identifier={'Marker_' + index}
                                    key={index}
                                    coordinate={item}
                                    title={item.title}
                                    description={item.description}
                                />
                            );
                        })}
                        {locations.length >= 2 ? (
                            <MapViewDirections
                                origin={locations[0]}
                                waypoints={
                                    locations.length > 2 ? locations.slice(1, -1) : undefined
                                }
                                destination={locations[locations.length - 1]}
                                apikey={config.mapApi}
                                strokeWidth={5}
                                strokeColor="#0f365e"
                                optimizeWaypoints={true}
                                onReady={(result) => {
                                    // console.log('steps = ', result.legs[0].steps);
                                    // console.log(
                                    //     'traffic_speed_entry = ',
                                    //     result.legs[0].traffic_speed_entry,
                                    // );
                                    // console.log('via_waypoint = ', result.legs[0].via_waypoint);
                                    setDuration(result.legs[0].duration.value);
                                    setDistance(result.legs[0].distance.value);
                                }}
                                onError={(errorMessage) => {
                                    // console.log('GOT AN ERROR');
                                }}
                            />
                        ) : null}
                    </MapView>
                </View>
                <View style={[tw`h-${h.alt}/5 pb-4 px-4 pt-2`]}>
                    <View style={[tw`flex-row items-center justify-between`]}>
                        <Text
                            style={[
                                stil('text', data.app.theme),
                                tw`font-semibold text-base mb-1`,
                            ]}>
                            {l[data.app.lang].daily}
                        </Text>
                        <View style={[tw`flex-row`]}>
                            <TouchableOpacity
                                onPress={() => {
                                    harita.current.getCamera().then((c) => {
                                        harita.current.setCamera({
                                            zoom: c.zoom - 1,
                                        });
                                    });
                                }}
                                style={[tw`rounded-md p-2 mr-2`, stil('bg', data.app.theme)]}>
                                <MaterialCommunityIcons
                                    name="minus"
                                    size={28}
                                    color={stil('text', data.app.theme).color}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    harita.current.getCamera().then((c) => {
                                        harita.current.setCamera({
                                            zoom: c.zoom + 1,
                                        });
                                    });
                                }}
                                style={[tw`rounded-md p-2 mr-2`, stil('bg', data.app.theme)]}>
                                <MaterialCommunityIcons
                                    name="plus"
                                    size={28}
                                    color={stil('text', data.app.theme).color}
                                />
                            </TouchableOpacity>
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
                    <View style={[tw`flex-row items-center justify-between mb-2`]}>
                        <View style={[tw`flex-row items-center justify-between rounded-md `]}>
                            <Text style={[stil('text', data.app.theme), tw``]}>1231 km</Text>
                        </View>
                        <View style={[tw`flex-row items-center justify-between rounded-md `]}>
                            <Text style={[stil('text', data.app.theme), tw``]}>234 min</Text>
                        </View>
                        <View style={[tw`flex-row items-center justify-between rounded-md `]}>
                            <Text style={[stil('text', data.app.theme), tw``]}>123123 sum</Text>
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
                                                        <View
                                                            style={[
                                                                tw`  mb-1 items-center flex-row`,

                                                                stil('text', data.app.theme),
                                                            ]}>
                                                            <Text
                                                                style={[
                                                                    stil('text', data.app.theme),
                                                                    tw`font-bold text-center `,
                                                                ]}>
                                                                {data.trip.tripRequest.est_price}{' '}
                                                                sum
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    {data.trip.tripRequest.locations.map(
                                                        (item, index) => {
                                                            return (
                                                                <View
                                                                    key={index}
                                                                    style={[
                                                                        tw`flex-row items-center mb-2 rounded-md px-2 py-1`,
                                                                        stil('bg2', data.app.theme),
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
                                                                                    data.app.theme,
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
                                                                                    data.app.theme,
                                                                                ),
                                                                            ]}>
                                                                            {item.title}
                                                                        </Text>
                                                                        <Text
                                                                            style={[
                                                                                tw`text-xs`,
                                                                                stil(
                                                                                    'text',
                                                                                    data.app.theme,
                                                                                ),
                                                                            ]}>
                                                                            {item.description}
                                                                        </Text>
                                                                    </View>
                                                                </View>
                                                            );
                                                        },
                                                    )}
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
        </>
    );
}
