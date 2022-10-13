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

export default function DriverTrip() {
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

    const [region, setRegion] = React.useState(null);
    const [locations, setLocations] = React.useState([]);

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

    function hesapla(l) {
        getValue('TTLocation').then((ttl) => {
            if (ttl) {
                let d = calcDistance(JSON.parse(ttl), l);
                if (d !== undefined) {
                    let p = 0;
                    getValue('TTDistance').then((tt) => {
                        if (tt) {
                            p =
                                parseFloat(data.trip.trip.driver.user_data.car.start) -
                                parseFloat(data.trip.trip.driver.user_data.car.km);
                            p =
                                p +
                                (d + parseFloat(tt)) *
                                    parseFloat(data.trip.trip.driver.user_data.car.km);
                            p = Math.ceil(p / 500) * 500;
                            if (p < parseFloat(data.trip.trip.driver.user_data.car.start)) {
                                p = parseFloat(data.trip.trip.driver.user_data.car.start);
                            }
                            if (parseFloat(d) > 0) {
                                if (p < parseFloat(data.trip.trip.driver.user_data.car.start)) {
                                    p = parseFloat(data.trip.trip.driver.user_data.car.start);
                                }
                                setPrice(p.toFixed(2));
                                setValue('TTDistance', (parseFloat(d) + parseFloat(tt)).toString());
                                setACTDistance((parseFloat(d) + parseFloat(tt)).toFixed(2));
                            }
                        } else {
                            if (parseFloat(d) > 0) {
                                setValue('TTDistance', d.toString());
                                setACTDistance(d.toFixed(2));
                            }
                        }
                    });
                }
            }
            setValue('TTLocation', JSON.stringify(l));
            let t = parseInt(data.trip.trip.start_time) * 1000;
            t = new Date().getTime() - t;
            t = t / 1000 / 60;

            setACTDuration(t.toFixed(2));
        });
    }
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

        let remainingItems = [];
        let gecilen = 0;
        data.trip.trip.locations.map((item, index) => {
            if (item.check) {
                gecilen = gecilen + 1;
                console.log('arttı');
                remainingItems.push(item);
            } else {
                let mesafe = calcDistance(item, {
                    latitude: data.app.currentLocation[0],
                    longitude: data.app.currentLocation[1],
                });
                if (mesafe < 0.04) {
                    gecilen = gecilen + 1;
                    remainingItems.push({...item, check: 1});
                } else {
                    remainingItems.push(item);
                }
            }
        });
        let re = [];
        remainingItems.forEach((item, index) => {
            if (!item.check) {
                re.push(item);
            }
        });
        setDirections(re);
        dispatch({
            type: 'setTrip',
            payload: {
                ...data.trip.trip,
                locations: remainingItems,
            },
        });
        let y = 100 / data.trip.trip.locations.length;
        let x = y * gecilen;
        console.log(y, x, gecilen, data.trip.trip.locations);
        setYuzde(x);

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

    const [directions, setDirections] = React.useState([]);

    const [rotate, setRotate] = React.useState(false);

    const watchPosition = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                dispatch({
                    type: 'loc',
                    payload: [position.coords.latitude, position.coords.longitude],
                });
                hesapla({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
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
        const DriverTripWP = Geolocation.watchPosition(
            (position) => {
                dispatch({
                    type: 'loc',
                    payload: [position.coords.latitude, position.coords.longitude],
                });

                setHeading(position.coords.heading);

                hesapla({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
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
        setSubscriptionId(DriverTripWP);
    };

    const clearWatch = () => {
        subscriptionId !== null && Geolocation.clearWatch(subscriptionId);
        setSubscriptionId(null);
    };

    const [yuzde, setYuzde] = React.useState(0);
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
                <View style={[tw`h-${h.ust}/5`]}>
                    {data.app.currentLocation.length > 0 && data.trip.trip.locations.length > 0 ? (
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
                                // harita.current.fitToCoordinates(
                                //     [
                                //         {
                                //             latitude: data.app.currentLocation[0]
                                //                 ? data.app.currentLocation[0]
                                //                 : data.trip.trip.locations[0].latitude,
                                //             longitude: data.app.currentLocation[1]
                                //                 ? data.app.currentLocation[1]
                                //                 : data.trip.trip.locations[0].longitude,
                                //         },
                                //         ...data.trip.trip.locations,
                                //     ],
                                //     {
                                //         edgePadding: {
                                //             top: 100,
                                //             right: 100,
                                //             bottom: 100,
                                //             left: 100,
                                //         },
                                //         animated: true,
                                //     },
                                // );
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
                            {/* {data.trip.trip.locations.map((item, index) => {
                                return (
                                    <Marker
                                        identifier={'Marker_' + index}
                                        key={index}
                                        coordinate={item}
                                    />
                                );
                            })} */}
                            {directions.length > 1 ? (
                                <MapViewDirections
                                    language={data.app.lang == 'gb' ? 'en' : data.app.lang}
                                    optimizeWaypoints={true}
                                    origin={{
                                        latitude: data.app.currentLocation[0],
                                        longitude: data.app.currentLocation[1],
                                    }}
                                    waypoints={
                                        directions.length > 2 ? directions.slice(1, -1) : undefined
                                    }
                                    destination={
                                        directions.length == 1
                                            ? undefined
                                            : directions[directions.length - 1]
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
                        <View
                            style={[
                                tw`flex-row items-center justify-between rounded-md px-3 py-1 `,

                                {
                                    backgroundColor: stil('bg2', data.app.theme).backgroundColor,
                                    position: 'absolute',
                                    top: -40,
                                    left: 0,
                                    right: 0,
                                },
                            ]}>
                            <View
                                style={[
                                    tw`bg-green-700 rounded-md mx-3`,
                                    {
                                        width: yuzde + '%',
                                        top: 0,
                                        position: 'absolute',
                                        height: 5,
                                    },
                                ]}></View>
                            <MaterialCommunityIcons name="car" size={24} color="orange" />
                            {data.trip.trip.locations.map((item, index) => {
                                if (index > 0) {
                                    return (
                                        <MaterialCommunityIcons
                                            key={index}
                                            name="map-marker"
                                            size={24}
                                            color={
                                                item.check
                                                    ? 'orange'
                                                    : stil('text', data.app.theme).color
                                            }
                                        />
                                    );
                                }
                            })}
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                setModalVisible(true);
                            }}
                            style={[tw`w-[40%] py-3 rounded-md bg-[#00A300]`]}>
                            <Text style={[tw`text-white text-center font-semibold`]}>
                                {l[data.app.lang].end}
                            </Text>
                        </TouchableOpacity>
                        <View
                            style={[
                                stil('bg', data.app.theme),
                                tw`rounded-md items-center justify-center flex-row py-3 w-[27%]`,
                            ]}>
                            <Text style={[stil('text', data.app.theme), tw` font-semibold `]}>
                                {act_distance} {l[data.app.lang].km}
                            </Text>
                        </View>
                        <View
                            style={[
                                stil('bg', data.app.theme),
                                tw`rounded-md items-center justify-center flex-row py-3 w-[27%]`,
                            ]}>
                            <Text style={[stil('text', data.app.theme), tw`  font-semibold`]}>
                                {act_duration} {l[data.app.lang].min}
                            </Text>
                        </View>
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
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}>
                <View
                    style={[
                        tw`flex-1 w-full items-center justify-end pb-24`,
                        stil('bg', data.app.theme),
                    ]}>
                    <View style={[tw` flex items-center justify-center w-full m-2  px-8`]}>
                        <View
                            style={[
                                tw`flex rounded-md items-center justify-between w-full py-4 px-4`,
                                stil('bg2', data.app.theme),
                            ]}>
                            <Text style={[tw`font-bold text-lg`, stil('text', data.app.theme)]}>
                                {data.trip.trip.passenger.user_name}
                            </Text>
                        </View>
                    </View>

                    <View style={[tw` flex items-center justify-center w-full m-2  px-8`]}>
                        <View
                            style={[
                                tw`flex-row rounded-md items-center justify-between w-full py-4 px-4`,
                                stil('bg2', data.app.theme),
                            ]}>
                            <Text style={[tw`font-bold text-lg`, stil('text', data.app.theme)]}>
                                {act_distance} {l[data.app.lang].km}
                            </Text>
                            <Text style={[tw`font-bold text-lg`, stil('text', data.app.theme)]}>
                                {act_duration} {l[data.app.lang].min}
                            </Text>
                        </View>
                    </View>
                    <View style={[tw` flex items-center justify-center w-full m-2  px-8`]}>
                        <View
                            style={[
                                tw`flex rounded-md items-center justify-between w-full py-4 px-4`,
                                stil('bg2', data.app.theme),
                            ]}>
                            <Text style={[tw`font-bold text-2xl`, stil('text', data.app.theme)]}>
                                {l[data.app.lang].price}
                            </Text>
                            <Text
                                style={[tw`font-bold text-4xl mt-3`, stil('text', data.app.theme)]}>
                                {price} sum
                            </Text>
                        </View>
                    </View>
                    <View style={[tw` mt-4 flex-row items-center justify-between w-full px-8`]}>
                        <TouchableOpacity
                            style={[tw`rounded-md flex-row items-center p-4`]}
                            onPress={() => {
                                setModalVisible(!modalVisible);
                            }}>
                            <MaterialCommunityIcons
                                name="arrow-left"
                                size={24}
                                color={stil('text', data.app.theme).color}
                            />
                            <Text
                                style={[tw`font-bold text-lg ml-2`, stil('text', data.app.theme)]}>
                                {l[data.app.lang].back}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                removeValue('TTLocation');
                                removeValue('TTDistance');
                                apiPost('updateActiveTrip', {
                                    prc: 'tripChange',
                                    lang: data.app.lang,
                                    token: data.auth.userToken,
                                    id: data.auth.userId,
                                    trip_id: data.trip.trip.id,
                                    act_price: price,
                                    act_time: act_duration,
                                    act_distance: act_distance,
                                    end_time: new Date().getTime() / 1000,
                                    status: 4,
                                })
                                    .then(() => {})
                                    .catch((error) => {
                                        console.log('DRİVERTRİP.JS ERROR (UPDATETRİP)', error);
                                    });
                            }}
                            style={[
                                tw`rounded-md flex-row items-center p-4 px-8`,
                                stil('bg2', data.app.theme),
                            ]}>
                            <Text
                                style={[tw`font-bold text-xl mr-2`, stil('text', data.app.theme)]}>
                                {l[data.app.lang].end}
                            </Text>
                            <MaterialCommunityIcons
                                name="flag-checkered"
                                size={28}
                                color={stil('text', data.app.theme).color}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
}
