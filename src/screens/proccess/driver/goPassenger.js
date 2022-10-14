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
import Geolocation from '@react-native-community/geolocation';
//burayafont yükle gelecek

export default function DriverGoPassenger() {
    const dispatch = useDispatch();
    const data = useSelector((state) => state);
    const harita = React.useRef(null);

    const [h, setH] = React.useState({
        ust: 4,
        alt: 1,
    });

    const [region, setRegion] = React.useState({
        latitude: 0,
        longitude: 0,
    });
    const [locations, setLocations] = React.useState([]);

    function getRotation(prevPos, curPos) {
        if (!prevPos) {
            return 0;
        }
        const xDiff = curPos.latitude - prevPos.latitude;
        const yDiff = curPos.longitude - prevPos.longitude;
        return (Math.atan2(yDiff, xDiff) * 180.0) / Math.PI;
    }

    const [eski, setEski] = React.useState({});
    const [heding, setHeding] = React.useState(0);

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

    const [heading, setHeading] = React.useState(0);

    useEffect(() => {
        if (region == null && data.app.currentLocation.length > 0) {
            setRegion({
                latitude: data.app.currentLocation[0],
                longitude: data.app.currentLocation[1],
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
                first: false,
            });
        }
        try {
            if (rotate) {
                harita.current?.animateCamera({
                    heading: heading,
                    center: {
                        latitude: data.app.currentLocation[0],
                        longitude: data.app.currentLocation[1],
                    },
                    pitch: 45,
                    zoom: 19,
                });
            }
        } catch (error) {}
        return () => {
            false;
        };
    }, [data.app.currentLocation, heading, rotate]);

    const [rotate, setRotate] = React.useState(false);

    const watchPosition = () => {
        const DriverGoPassengerWP = Geolocation.watchPosition(
            (position) => {
                dispatch({
                    type: 'loc',
                    payload: [position.coords.latitude, position.coords.longitude],
                });
                setHeading(position.coords.heading);

                apiPost('mapSocket', {
                    prc: 'driverLocation',
                    locations: [position.coords.latitude, position.coords.longitude],
                    id: data.trip.trip.passenger_id,
                })
                    .then(() => {})
                    .catch((error) => {
                        console.log('GOPASSENGER.JS ERROR (MAPSOCKET)', error);
                    });
            },
            (error) => {
                // Alert.alert('WatchPosition Error', JSON.stringify(error))
            },
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0,
                distanceFilter: 1,
            },
        );
        setSubscriptionId(DriverGoPassengerWP);
    };

    const clearWatch = () => {
        subscriptionId !== null && Geolocation.clearWatch(subscriptionId);
        setSubscriptionId(null);
    };

    const [subscriptionId, setSubscriptionId] = React.useState(null);
    useEffect(() => {
        watchPosition();
        return () => {
            clearWatch();
        };
    }, []);
    return (
        <>
            <View style={[{flex: 1}, stil('bg', data.app.theme)]}>
                <View style={[tw`h-${h.ust}/5`]}>
                    {data.app.currentLocation.length > 0 && (
                        <MapView
                            ref={harita}
                            provider={PROVIDER_GOOGLE}
                            style={{flex: 1}}
                            region={{
                                latitude: data.app.currentLocation[0],
                                longitude: data.app.currentLocation[1],
                                latitudeDelta: 0.005,
                                longitudeDelta: 0.005,
                            }}
                            initialRegion={{
                                latitude: data.app.currentLocation[0],
                                longitude: data.app.currentLocation[1],
                                latitudeDelta: 0.005,
                                longitudeDelta: 0.005,
                            }}
                            showsUserLocation={false}
                            zoomEnabled={true}
                            enableZoomControl={true}
                            showsMyLocationButton={false}
                            showsTraffic
                            onRegionChange={(ret, sta) => {
                                if (sta.isGesture == true) {
                                    setRotate(false);
                                }
                            }}>
                            <Marker
                                coordinate={{
                                    latitude: data.app.currentLocation[0],
                                    longitude: data.app.currentLocation[1],
                                }}>
                                <Image
                                    source={require('../../../assets/img/compass-ai.png')}
                                    style={[tw`h-10 w-10`]}
                                />
                            </Marker>

                            <Marker coordinate={data.trip.trip.locations[0]}>
                                <Image
                                    source={require('../../../assets/img/marker-2.png')}
                                    style={[tw`w-6 h-12 `]}
                                />
                            </Marker>

                            <MapViewDirections
                                language={data.app.lang == 'gb' ? 'en' : data.app.lang}
                                optimizeWaypoints={true}
                                origin={{
                                    latitude: data.app.currentLocation[0],
                                    longitude: data.app.currentLocation[1],
                                }}
                                destination={data.trip.trip.locations[0]}
                                apikey={config.mapApi}
                                strokeWidth={10}
                                strokeColor="#0f365e"
                                resetOnChange={false}
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
                                }}
                            />
                        </MapView>
                    )}
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
                        <View style={[tw`flex-row items-center mb-1`]}>
                            <MaterialCommunityIcons
                                name="human-greeting-variant"
                                size={24}
                                color={stil('text', data.app.theme).color}
                            />
                            <Text
                                style={[
                                    stil('text', data.app.theme),
                                    tw`font-semibold text-base `,
                                ]}>
                                {' '}
                                :{' '}
                                {data.trip.trip
                                    ? data.trip.trip.passenger.user_name.split(' ')[0]
                                    : null}
                            </Text>
                        </View>

                        <View style={[tw`flex-row mb-2`]}>
                            <TouchableOpacity
                                onPress={() => {
                                    setRotate(true);
                                    harita.current?.animateCamera({
                                        heading: heading,
                                        center: {
                                            latitude: data.app.currentLocation[0],
                                            longitude: data.app.currentLocation[1],
                                        },
                                        pitch: 45,
                                        zoom: 19,
                                    });
                                }}
                                style={[tw`rounded-md p-2 mr-2`, stil('bg2', data.app.theme)]}>
                                <MaterialCommunityIcons
                                    name="arrow-up-bold-hexagon-outline"
                                    size={24}
                                    color={stil('text', data.app.theme).color}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setRotate(false);
                                    harita.current.fitToCoordinates(
                                        [
                                            {
                                                latitude: data.app.currentLocation[0],
                                                longitude: data.app.currentLocation[1],
                                            },
                                            data.trip.trip.locations[0],
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
                                }}
                                style={[tw`rounded-md p-2 `, stil('bg2', data.app.theme)]}>
                                <MaterialCommunityIcons
                                    name="image-filter-center-focus"
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
