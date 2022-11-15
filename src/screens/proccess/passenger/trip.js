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
    const [kalanMesafe, setKalanMesafe] = React.useState(0);
    const [kalanSure, setKalanSure] = React.useState(0);

    const [h, setH] = React.useState({
        ust: 4,
        alt: 1,
    });

    const [region, setRegion] = React.useState({
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    });

    const [eski, setEski] = React.useState(null);

    const [step, setStep] = React.useState(null);
    const [step2, setStep2] = React.useState(null);

    const [heading, setHeading] = React.useState(0);
    const [cl, setCl] = React.useState({
        latitude: 0,
        longitude: 0,
    });
    const [rotate, setRotate] = React.useState(true);
    const [directions, setDirections] = React.useState([]);

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
    const [head, setHead] = React.useState(0);

    const [ortCalistir, setOrtCalistir] = React.useState(false);
    const [oKalan, setOKalan] = React.useState(0);
    useEffect(() => {
        let kalan = 5;

        let intervalKalan = setInterval(() => {
            if (!rotate) {
                if (kalan > 0) {
                    setOKalan(kalan);
                    kalan = kalan - 1;
                } else {
                    clearInterval(intervalKalan);
                    setRotate(true);
                }
            }
        }, 1000);

        return () => {
            clearInterval(intervalKalan);
            kalan = 5;
        };
    }, [rotate, ortCalistir]);
    return (
        <>
            <View style={[{flex: 1}, stil('bg', data.app.theme)]}>
                <View style={[tw`h-4/5`]}>
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
                        showsCompass={false}
                        rotateEnabled={true}
                        showsTraffic={false}
                        userLocationPriority={'high'}
                        userLocationUpdateInterval={1000}
                        userLocationFastestInterval={1000}
                        onRegionChange={(ret, sta) => {
                            if (sta.isGesture == true) {
                                setRotate(false);
                            }
                        }}
                        onUserLocationChange={(e) => {
                            if (region.latitude == 0) {
                                setRegion({
                                    latitude: e.nativeEvent.coordinate.latitude,
                                    longitude: e.nativeEvent.coordinate.longitude,
                                    latitudeDelta: 0.005,
                                    longitudeDelta: 0.005,
                                });
                            }
                            setCl({
                                latitude: e.nativeEvent.coordinate.latitude,
                                longitude: e.nativeEvent.coordinate.longitude,
                            });
                            if (rotate) {
                                harita.current?.animateCamera({
                                    heading: e.nativeEvent.coordinate.heading,
                                    center: {
                                        latitude: e.nativeEvent.coordinate.latitude,
                                        longitude: e.nativeEvent.coordinate.longitude,
                                    },
                                    pitch: 45,
                                    zoom: 19,
                                });
                            }

                            let remainingItems = [];
                            let re = [];
                            let gecilen = 0;
                            data.trip.trip.locations.map((item, index) => {
                                if (item.check) {
                                    gecilen = gecilen + 1;
                                    remainingItems.push(item);
                                } else {
                                    let mesafe = calcDistance(item, {
                                        latitude: e.nativeEvent.coordinate.latitude,
                                        longitude: e.nativeEvent.coordinate.longitude,
                                    });
                                    if (mesafe < 0.015) {
                                        gecilen = gecilen + 1;
                                        remainingItems.push({...item, check: 1});
                                    } else {
                                        remainingItems.push({...item});
                                        re.push(item);
                                    }
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
                        }}>
                        {/* <Marker coordinate={cl}>
                            <Image
                                source={require('../../../assets/img/compass-ai.png')}
                                style={[tw`h-10 w-10`]}
                            />
                        </Marker> */}
                        {data.trip.trip.locations.map((item, index) => {
                            if (index != 0) {
                                return (
                                    <Marker
                                        identifier={'Marker_' + index}
                                        key={index}
                                        coordinate={item}>
                                        <View
                                            style={[
                                                tw`h-full w-full text-center items-center justify-center`,
                                                {
                                                    position: 'absolute',
                                                    zIndex: 999999,
                                                },
                                            ]}>
                                            <Text
                                                style={[tw`text-gray-600 font-bold text-3xl mb-2`]}>
                                                {index}
                                            </Text>
                                        </View>
                                        <Image
                                            source={require('../../../assets/img/marker-1.png')}
                                            style={[tw`w-16 h-16 `]}
                                        />
                                    </Marker>
                                );
                            }
                        })}
                        {data.trip.trip.locations.length > 1 ? (
                            <MapViewDirections
                                resetOnChange={false}
                                origin={data.app.currentLocation}
                                waypoints={data.trip.trip.locations.filter(
                                    (item, index) =>
                                        index > 0 &&
                                        index < data.trip.trip.locations.length - 1 &&
                                        item.gecildi === false,
                                )}
                                destination={
                                    data.trip.trip.locations[data.trip.trip.locations.length - 1]
                                        .gecildi === false
                                        ? data.trip.trip.locations[
                                              data.trip.trip.locations.length - 1
                                          ]
                                        : undefined
                                }
                                apikey={config.mapApi}
                                strokeWidth={kalanMesafe > 20 ? 14 : 0}
                                strokeColor="green"
                                onReady={(result) => {
                                    let dis = 0;
                                    let dur = 0;
                                    result.legs.map((item, index) => {
                                        dis = dis + item.distance.value;
                                        dur = dur + item.duration.value;
                                    });
                                    setKalanMesafe(dis);

                                    if (data.trip.tripRequest !== null) {
                                        dispatch({
                                            type: 'setDistance',
                                            payload: (parseFloat(dis) / 1000).toFixed(2),
                                        });
                                    }
                                    setKalanSure(dur);

                                    if (result.legs[0].steps[0]) {
                                        dispatch({
                                            type: 'setYon',
                                            payload: result.legs[0].steps[0],
                                        });
                                    } else {
                                        dispatch({
                                            type: 'setYon',
                                            payload: null,
                                        });
                                    }
                                    if (result.legs[0].steps[1]) {
                                        dispatch({
                                            type: 'setYon2',
                                            payload: result.legs[0].steps[1],
                                        });
                                    } else {
                                        dispatch({
                                            type: 'setYon2',
                                            payload: null,
                                        });
                                    }
                                }}
                            />
                        ) : null}
                    </MapView>
                    {!rotate && (
                        <View
                            style={[
                                tw`flex w-full items-center justify-center bg-gray-100 opacity-50`,
                                {
                                    position: 'absolute',
                                    zIndex: 999999,
                                    bottom: 100,
                                },
                            ]}>
                            <View style={[tw`flex-row items-center justify-center`]}>
                                <Text>{l[data.app.lang].ysabitle.split('{icon}')[0]}</Text>
                                <MaterialCommunityIcons
                                    name="arrow-up-bold-hexagon-outline"
                                    size={24}
                                    color="black"
                                />
                                <Text>{l[data.app.lang].ysabitle.split('{icon}')[1]}</Text>
                            </View>
                            {oKalan > 0 && (
                                <View style={[tw`flex-row items-center justify-center`]}>
                                    <Text>
                                        {l[data.app.lang].oort} : {oKalan}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
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
                                style={[stil('bg2', data.app.theme), tw`p-2 mr-2 rounded-md`]}
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
                                            cl,
                                            directions.length > 0
                                                ? directions[directions.length - 1]
                                                : cl,
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
                                    setRotate(false);
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
