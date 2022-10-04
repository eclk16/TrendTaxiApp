import React, {useEffect} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {TouchableOpacity, Text, View, Linking, Alert, Image} from 'react-native';
import {stil} from '../../../utils';
import tw from 'twrnc';
import l from '../../../languages.json';
import {apiPost} from '../../../axios';
import config from '../../../app.json';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
MaterialCommunityIcons.loadFont();

export default function DriverGoPassenger() {
    const dispatch = useDispatch();
    const data = useSelector((state) => state);
    const harita = React.useRef(null);
    const [distance, setDistance] = React.useState(0);
    const [duration, setDuration] = React.useState(0);

    const [h, setH] = React.useState({
        ust: 4,
        alt: 1,
    });

    const [region, setRegion] = React.useState({
        latitude: data.app.currentLocation[0],
        longitude: data.app.currentLocation[1],
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    });
    const [locations, setLocations] = React.useState([]);
    const fitContent = () => {
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
    };

    function getRotation(prevPos, curPos) {
        if (!prevPos) {
            return 0;
        }
        const xDiff = curPos.latitude - prevPos.latitude;
        const yDiff = curPos.longitude - prevPos.longitude;
        return (Math.atan2(yDiff, xDiff) * 180.0) / Math.PI;
    }

    const [rotateActive, setRotateActive] = React.useState(true);
    const [eski, setEski] = React.useState(false);

    function setRotate(
        cord = {
            latitude: data.app.currentLocation[0],
            longitude: data.app.currentLocation[1],
        },
    ) {
        if (eski) {
            harita.current.animateCamera({
                heading: getRotation(eski ? eski : cord, cord),
                center: cord,
                pitch: 60,
                zoom: 20,
                altitude: 1000,
            });
        } else {
            harita.current.fitToCoordinates(
                [
                    {
                        latitude: data.app.currentLocation[0],
                        longitude: data.app.currentLocation[1],
                    },
                    ...data.trip.trip.locations,
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
        setEski(cord);
    }

    const [step, setStep] = React.useState(null);
    const [step2, setStep2] = React.useState(null);

    function arrow(iicon = null) {
        let icon = iicon;
        if (icon != null) {
            icon = icon.replace('-', '_').replace('-', '_').replace('-', '_');
            icon = icon.toUpperCase();

            switch (icon) {
                case 'TURN_SLIGHT_LEFT':
                    return 'arrow-left-top';
                    break;
                case 'TURN_SHARP_LEFT':
                    return 'arrow-left-top-bold';
                    break;
                case 'UTURN_LEFT':
                    return 'arrow-u-down-left';
                    break;
                case 'TURN_LEFT':
                    return 'arrow-left-top';
                    break;
                case 'TURN_SLIGHT_RIGHT':
                    return 'arrow-right-top';
                    break;
                case 'TURN_SHARP_RIGHT':
                    return 'arrow-right-top-bold';
                    break;
                case 'UTURN_RIGHT':
                    return 'arrow-u-down-right';
                    break;
                case 'TURN_RIGHT':
                    return 'arrow-right-top';
                    break;
                case 'STRAIGHT':
                    return 'arrow-up';
                    break;
                case 'RAMP_LEFT':
                    return 'arrow-left-top';
                    break;
                case 'RAMP_RIGHT':
                    return 'arrow-right-top';
                    break;
                case 'MERGE':
                    return 'arrow-up';
                    break;
                case 'FORK_LEFT':
                    return 'arrow-left-top';
                    break;
                case 'FORK_RIGHT':
                    return 'arrow-right-top';
                    break;
                case 'FERRY':
                    return 'aaaaaa';
                    break;
                case 'FERRY_TRAIN':
                    return 'aaaaaa';
                    break;
                case 'ROUNDABOUT_LEFT':
                    return 'arrow-left-top';
                    break;
                case 'ROUNDABOUT_RIGHT':
                    return 'arrow-right-top';
                    break;
                default:
                    return 'arrow-up';
                    break;
            }
        } else return 'arrow-up';
    }
    return (
        <>
            <View style={[{flex: 1}, stil('bg', data.app.theme)]}>
                <View style={[tw`h-${h.ust}/5`]}>
                    <MapView
                        ref={harita}
                        provider={PROVIDER_GOOGLE}
                        style={{flex: 1}}
                        // region={region}
                        initialRegion={region}
                        showsUserLocation
                        zoomEnabled={true}
                        enableZoomControl={true}
                        rotateEnabled={true}
                        showsTraffic
                        onUserLocationChange={(ret) => {
                            setRegion({
                                latitude: ret.nativeEvent.coordinate.latitude,
                                longitude: ret.nativeEvent.coordinate.longitude,
                                latitudeDelta: 0.005,
                                longitudeDelta: 0.005,
                            });
                            setLocations([
                                {
                                    latitude: ret.nativeEvent.coordinate.latitude,
                                    longitude: ret.nativeEvent.coordinate.longitude,
                                },

                                data.trip.trip.locations[0],
                            ]);
                            setRotate({
                                latitude: ret.nativeEvent.coordinate.latitude,
                                longitude: ret.nativeEvent.coordinate.longitude,
                            });
                            apiPost('mapSocket', {
                                prc: 'driverLocation',
                                locations: [
                                    ret.nativeEvent.coordinate.latitude,
                                    ret.nativeEvent.coordinate.longitude,
                                ],
                                id: data.trip.trip.passenger_id,
                            });
                            dispatch({
                                type: 'setTrip',
                                payload: {
                                    ...data.trip.trip,
                                    driver: {
                                        ...data.trip.trip.driver,
                                        last_latitude: ret.nativeEvent.coordinate.latitude,
                                        last_longitude: ret.nativeEvent.coordinate.longitude,
                                    },
                                },
                            });
                        }}
                        onMapReady={() => {
                            // setRegion({
                            //     latitude: data.app.currentLocation[0],
                            //     longitude: data.app.currentLocation[1],
                            //     latitudeDelta: 0.005,
                            //     longitudeDelta: 0.005,
                            // });
                            // setLocations([
                            //     {
                            //         latitude: data.app.currentLocation[0],
                            //         longitude: data.app.currentLocation[1],
                            //     },
                            //     data.trip.trip.locations[0],
                            // ]);
                            // setRotate();
                        }}
                        loadingEnabled>
                        {locations.map((item, index) => {
                            if (index == 0) {
                                return (
                                    <Marker
                                        identifier={'Marker_' + index}
                                        key={index}
                                        coordinate={item}>
                                        <Image
                                            source={{
                                                uri:
                                                    config.imageBaseUrl +
                                                    data.trip.trip.driver.user_data.car.image.replace(
                                                        '2.png',
                                                        '.png',
                                                    ),
                                            }}
                                            style={[
                                                tw`h-8 w-16`,
                                                {
                                                    // transform: [{rotate: '180deg'}],
                                                },
                                            ]}
                                        />
                                    </Marker>
                                );
                            } else {
                                return (
                                    <Marker
                                        identifier={'Marker_' + index}
                                        key={index}
                                        coordinate={item}
                                    />
                                );
                            }
                        })}
                        {locations.length >= 2 ? (
                            <MapViewDirections
                                lineDashPattern={[0]}
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
                                    if (result.legs[0].steps[0]) {
                                        setStep(result.legs[0].steps[0]);
                                    } else {
                                        setStep(null);
                                    }
                                    if (result.legs[0].steps[1]) {
                                        setStep2(result.legs[0].steps[1]);
                                    } else {
                                        setStep2(null);
                                    }
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
                    <View
                        style={[
                            tw`flex-row items-center justify-between mx-4`,
                            {
                                position: 'absolute',
                                bottom: 10,
                                left: 0,
                                right: 0,
                            },
                        ]}>
                        <TouchableOpacity
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
                                            text: l[data.app.lang].confirm,
                                            onPress: () => {
                                                apiPost('removeActiveTrip', {
                                                    lang: data.app.lang,
                                                    token: data.auth.userToken,
                                                    id: data.trip.trip.passenger_id,
                                                    user_type: data.auth.userType,
                                                });
                                            },
                                        },
                                    ],
                                    {cancelable: false},
                                );
                            }}
                            style={[tw`px-2  py-2 rounded-md bg-red-500`]}>
                            <MaterialCommunityIcons name="cancel" size={24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                apiPost('updateActiveTrip', {
                                    prc: 'tripChange',
                                    lang: data.app.lang,
                                    token: data.auth.userToken,
                                    id: data.auth.userId,
                                    trip_id: data.trip.trip.id,
                                    status: 3,
                                });
                            }}
                            style={[tw`px-4 w-3/5 py-3 rounded-md bg-[#00A300]`]}>
                            <Text style={[tw`text-white text-center font-semibold`]}>
                                {l[data.app.lang].start}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[stil('bg', data.app.theme), tw`p-2 rounded-md`]}
                            onPress={() => {
                                Linking.openURL(
                                    `tel:+${
                                        data.auth.userType == 'driver'
                                            ? data.trip.trip.passenger.user_phone
                                            : data.trip.trip.driver.user_phone
                                    }`,
                                );
                            }}>
                            <MaterialCommunityIcons
                                name="phone"
                                size={24}
                                color={stil('text', data.app.theme).color}
                            />
                        </TouchableOpacity>
                    </View>
                    {step !== null ? (
                        <View
                            style={[
                                {position: 'absolute', top: '10%', right: 0},
                                tw`flex-row items-center rounded-md p-4 mr-4`,
                                stil('bg', data.app.theme),
                            ]}>
                            <MaterialCommunityIcons
                                name={arrow(step2 ? step2.maneuver : step.maneuver)}
                                size={64}
                                color={stil('text', data.app.theme).color}
                            />
                            <View style={[tw`flex items-center justify-between ml-4`]}>
                                <Text
                                    style={[
                                        stil('text', data.app.theme),
                                        tw`text-base font-bold mb-1`,
                                    ]}>
                                    {step.distance.text}
                                </Text>
                                <Text style={[stil('text', data.app.theme), tw`text-xs mb-1`]}>
                                    {step.duration.text}
                                </Text>
                            </View>
                        </View>
                    ) : null}
                </View>
                <View style={[tw`h-${h.alt}/5 pb-4 px-4 pt-2`]}>
                    <View style={[tw`flex-row items-center justify-between`]}>
                        <Text
                            style={[
                                stil('text', data.app.theme),
                                tw`font-semibold text-base mb-1`,
                            ]}>
                            {data.trip.trip
                                ? data.trip.trip.passenger.user_name.split(' ')[0]
                                : null}
                        </Text>
                        <View style={[tw`flex-row`]}>
                            {!rotateActive ? (
                                <TouchableOpacity
                                    onPress={() => {
                                        setRotateActive(true);
                                        setRotate();
                                    }}
                                    style={[tw`rounded-md p-2 mr-2`, stil('bg', data.app.theme)]}>
                                    <MaterialCommunityIcons
                                        name="arch"
                                        size={24}
                                        color={stil('text', data.app.theme).color}
                                    />
                                </TouchableOpacity>
                            ) : null}
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
                                    size={24}
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
                                    size={24}
                                    color={stil('text', data.app.theme).color}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    if (locations.length > 0) {
                                        harita.current.fitToCoordinates(locations, {
                                            edgePadding: {
                                                top: 100,
                                                right: 100,
                                                bottom: 100,
                                                left: 100,
                                            },
                                            animated: true,
                                        });
                                    }
                                    setRotateActive(false);
                                }}
                                style={[tw`rounded-md p-2 mr-2`, stil('bg', data.app.theme)]}>
                                <MaterialCommunityIcons
                                    name="image-filter-center-focus"
                                    size={24}
                                    color={stil('text', data.app.theme).color}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setRotateActive(false);
                                    fitContent();
                                }}
                                style={[tw`rounded-md p-2`, stil('bg', data.app.theme)]}>
                                <MaterialCommunityIcons
                                    name="map-marker-radius"
                                    size={24}
                                    color={stil('text', data.app.theme).color}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {step2 !== null ? (
                        <View style={[tw` rounded-md`, stil('bg', data.app.theme)]}>
                            <View style={[tw`flex-row items-center justify-between opacity-50`]}>
                                <MaterialCommunityIcons
                                    name={arrow(step2.maneuver)}
                                    size={16}
                                    color={stil('text', data.app.theme).color}
                                />
                                <Text style={[stil('text', data.app.theme), tw`text-xs mb-1 mr-2`]}>
                                    {step2.html_instructions.replace(/(<([^>]+)>)/gi, '')}
                                </Text>

                                <View style={[tw`flex-row items-center justify-center`]}>
                                    <Text
                                        style={[
                                            stil('text', data.app.theme),
                                            tw`text-xs mb-1 mr-2`,
                                        ]}>
                                        {step2.duration.text}
                                    </Text>
                                    <Text style={[stil('text', data.app.theme), tw`text-xs mb-1`]}>
                                        {step2.distance.text}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ) : null}
                    {step !== null ? (
                        <View style={[tw`  mt-1`, stil('bg', data.app.theme)]}>
                            <View style={[tw`flex-row items-center justify-between mb-1`]}>
                                <MaterialCommunityIcons
                                    name={arrow(step.maneuver)}
                                    size={20}
                                    color={stil('text', data.app.theme).color}
                                />
                                <Text
                                    style={[
                                        stil('text', data.app.theme),
                                        tw`w-3/5 mb-1 mr-2 ml-2`,
                                    ]}>
                                    {step.html_instructions.replace(/(<([^>]+)>)/gi, '')}
                                </Text>
                                <View style={[tw`items-center justify-center`]}>
                                    <Text
                                        style={[
                                            stil('text', data.app.theme),
                                            tw`text-base mb-1 mr-2`,
                                        ]}>
                                        {step.duration.text}
                                    </Text>
                                    <Text
                                        style={[stil('text', data.app.theme), tw`text-base mb-1`]}>
                                        {step.distance.text}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ) : null}
                </View>
            </View>
        </>
    );
}
