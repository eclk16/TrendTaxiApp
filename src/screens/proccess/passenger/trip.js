import React, {useEffect} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {TouchableOpacity, Text, View, Linking, Alert, Image, Modal} from 'react-native';
import {stil} from '../../../utils';
import tw from 'twrnc';
import l from '../../../languages.json';
import {apiPost} from '../../../axios';
import config from '../../../app.json';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';
import {getValue, removeValue, setValue} from '../../../async';
//burayafont yükle gelecek

export default function PassengerTrip() {
    const dispatch = useDispatch();
    const data = useSelector((state) => state);
    const harita = React.useRef(null);
    const [distance, setDistance] = React.useState(0);
    const [duration, setDuration] = React.useState(0);

    const [act_distance, setACTDistance] = React.useState(0);
    const [act_duration, setACTDuration] = React.useState(0);

    const [h, setH] = React.useState({
        ust: 4,
        alt: 1,
    });

    const [region, setRegion] = React.useState({
        latitude: data.app.currentLocation[0],
        longitude: data.app.currentLocation[1],
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
        first: false,
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

    const [eski, setEski] = React.useState(null);

    const [step, setStep] = React.useState(null);
    const [step2, setStep2] = React.useState(null);
    const [hesapLocations, setHesapLocations] = React.useState([]);

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
    const [price, setPrice] = React.useState(0);

    const [modalVisible, setModalVisible] = React.useState(false);

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
        Geolocation.getCurrentPosition(
            (position) => {
                dispatch({
                    type: 'loc',
                    payload: [position.coords.latitude, position.coords.longitude],
                });
            },
            (error) => {
                // Alert.alert('WatchPosition Error', JSON.stringify(error))
            },
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0,
            },
        );
        const PassengerTripWP = Geolocation.watchPosition(
            (position) => {
                dispatch({
                    type: 'loc',
                    payload: [position.coords.latitude, position.coords.longitude],
                });
                setHeading(position.coords.heading);
            },
            (error) => {
                // Alert.alert('WatchPosition Error', JSON.stringify(error))
            },
            {
                enableHighAccuracy: true,
                //accuracy
                distanceFilter: 0.1,
                timeout: 20000,
                maximumAge: 0,
            },
        );
        setSubscriptionId(PassengerTripWP);
    };

    const clearWatch = () => {
        subscriptionId !== null && Geolocation.clearWatch(subscriptionId);
        setSubscriptionId(null);
    };
    useEffect(() => {
        watchPosition();
        return () => {
            clearWatch();
        };
    }, []);

    const [subscriptionId, setSubscriptionId] = React.useState(null);
    return (
        <>
            <View style={[{flex: 1}, stil('bg', data.app.theme)]}>
                <View style={[tw`h-4/5`]}>
                    {data.app.currentLocation.length > 0 ? (
                        <MapView
                            ref={harita}
                            provider={PROVIDER_GOOGLE}
                            style={{flex: 1}}
                            region={region}
                            initialRegion={region}
                            showsUserLocation={false}
                            zoomEnabled={true}
                            enableZoomControl={true}
                            showsMyLocationButton={false}
                            rotateEnabled={true}
                            showsTraffic
                            onRegionChange={(ret, sta) => {
                                if (sta.isGesture == true) {
                                    setRotate(false);
                                }
                            }}
                            onMapReady={() => {
                                harita.current.fitToCoordinates(
                                    [
                                        {
                                            latitude: data.app.currentLocation[0]
                                                ? data.app.currentLocation[0]
                                                : data.trip.trip.locations[0].latitude,
                                            longitude: data.app.currentLocation[1]
                                                ? data.app.currentLocation[1]
                                                : data.trip.trip.locations[0].longitude,
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

                            {data.trip.trip.locations.length >= 1 ? (
                                <MapViewDirections
                                    language={data.app.lang == 'gb' ? 'en' : data.app.lang}
                                    optimizeWaypoints={true}
                                    origin={{
                                        latitude: data.app.currentLocation[0],
                                        longitude: data.app.currentLocation[1],
                                    }}
                                    waypoints={
                                        data.trip.trip.locations.length > 2
                                            ? data.trip.trip.locations.slice(1, -1)
                                            : undefined
                                    }
                                    destination={
                                        data.trip.trip.locations.length == 1
                                            ? undefined
                                            : data.trip.trip.locations[
                                                  data.trip.trip.locations.length - 1
                                              ]
                                    }
                                    apikey={config.mapApi}
                                    strokeWidth={10}
                                    mode="DRIVING"
                                    precision={'high'}
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
                                        setDuration(result.legs[0].duration.value);
                                        setDistance(result.legs[0].distance.value);
                                    }}
                                />
                            ) : null}
                        </MapView>
                    ) : null}
                </View>
                <View style={[tw`h-1/5 pb-4 px-4 pt-2`]}>
                    <View style={[tw`flex-row items-center justify-between`]}>
                        <View style={[tw`flex-row items-center mb-1`]}>
                            <MaterialCommunityIcons
                                name="human"
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
                                    harita.current.fitToCoordinates(
                                        [
                                            {
                                                latitude: data.app.currentLocation[0],
                                                longitude: data.app.currentLocation[1],
                                            },
                                            data.trip.trip.locations.length > 0
                                                ? data.trip.trip.locations[
                                                      data.trip.trip.locations.length - 1
                                                  ]
                                                : {
                                                      latitude: data.app.currentLocation[0],
                                                      longitude: data.app.currentLocation[1],
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
                    <View style={[tw`flex-row items-center justify-start`]}>
                        <TouchableOpacity
                            onPress={() => {
                                // setBigImage(true);
                            }}>
                            <Image
                                source={{
                                    uri:
                                        config.imageBaseUrl +
                                        data.trip.trip.driver.user_data.car_image_1,
                                }}
                                style={[tw`w-24 h-24 rounded-md`]}
                            />
                        </TouchableOpacity>
                        <View style={[tw`flex items-start ml-4`]}>
                            <View style={[tw`flex-row items-center`]}>
                                <MaterialCommunityIcons
                                    name="aspect-ratio"
                                    size={24}
                                    color={stil('text', data.app.theme).color}
                                />
                                <Text
                                    style={[
                                        stil('text', data.app.theme),
                                        tw`font-semibold text-base ml-4`,
                                    ]}>
                                    {data.trip.trip.driver.user_data.car_plate.toUpperCase()}
                                </Text>
                            </View>
                            <View style={[tw`flex-row items-center`]}>
                                <MaterialCommunityIcons
                                    name="car"
                                    size={24}
                                    color={stil('text', data.app.theme).color}
                                />
                                <Text
                                    style={[
                                        stil('text', data.app.theme),
                                        tw`font-semibold text-base ml-4`,
                                    ]}>
                                    {data.trip.trip.driver.user_data.car_brand}{' '}
                                    {data.trip.trip.driver.user_data.car_model}
                                </Text>
                            </View>
                            <View style={[tw`flex-row items-center`]}>
                                <MaterialCommunityIcons
                                    name="credit-card"
                                    size={24}
                                    color={stil('text', data.app.theme).color}
                                />
                                <Text
                                    style={[
                                        stil('text', data.app.theme),
                                        tw`font-semibold text-base ml-4`,
                                    ]}>
                                    {data.trip.trip.driver.user_data.car_number}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </>
    );
}
