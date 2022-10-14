import React, {useEffect} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {TouchableOpacity, Text, View, Linking, Modal, Image, Alert} from 'react-native';
import {stil} from '../../../utils';
import tw from 'twrnc';
import l from '../../../languages.json';
import {apiPost} from '../../../axios';
import config from '../../../app.json';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';
//burayafont yükle gelecek

export default function PassengerWait() {
    const dispatch = useDispatch();
    const data = useSelector((state) => state);
    const harita = React.useRef(null);

    const [h, setH] = React.useState({
        ust: 4,
        alt: 1,
    });

    const [region, setRegion] = React.useState(null);
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

    const [bigImage, setBigImage] = React.useState(false);

    useEffect(() => {
        setLocations([
            {
                latitude: data.app.currentLocation[0],
                longitude: data.app.currentLocation[1],
            },
            {
                latitude: parseFloat(data.trip.trip.driver.last_latitude),
                longitude: parseFloat(data.trip.trip.driver.last_longitude),
            },
        ]);
        console.log(locations, region, data.app.currentLocation);
    }, [data.trip.trip.driver.last_latitude]);

    useEffect(() => {
        if (region == null) {
            if (data.app.currentLocation.length > 0) {
                setRegion({
                    latitude: parseFloat(data.app.currentLocation[0]),
                    longitude: parseFloat(data.app.currentLocation[1]),
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                    first: true,
                });
            }
        }

        return () => {
            false;
        };
    }, [data.app.currentLocation]);

    const watchPosition = () => {
        const PassengerWaitWP = Geolocation.watchPosition(
            (position) => {
                dispatch({
                    type: 'loc',
                    payload: [position.coords.latitude, position.coords.longitude],
                });
                setLocations([
                    {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    },
                    {
                        latitude: parseFloat(data.trip.trip.driver.last_latitude),
                        longitude: parseFloat(data.trip.trip.driver.last_longitude),
                    },
                ]);
            },
            (error) => {
                // Alert.alert('WatchPosition Error', JSON.stringify(error))
            },
            {enableHighAccuracy: true, timeout: 20000, maximumAge: 0, distanceFilter: 2},
        );
        setSubscriptionId(PassengerWaitWP);
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
                    {data.app.currentLocation.length > 0 ? (
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
                            showsUserLocation
                            zoomEnabled={true}
                            enableZoomControl={true}
                            showsMyLocationButton={false}
                            rotateEnabled={true}
                            showsTraffic
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
                            {locations.map((item, index) => {
                                if (index == 1) {
                                    return (
                                        <Marker key={index} coordinate={item}>
                                            <Image
                                                source={{
                                                    uri:
                                                        config.imageBaseUrl +
                                                        data.trip.trip.driver.user_data.car.image.replace(
                                                            '2.png',
                                                            '.png',
                                                        ),
                                                }}
                                                style={[tw`h-8 w-16`]}
                                            />
                                        </Marker>
                                    );
                                }
                            })}
                            {data.app.currentLocation.length > 0 ? (
                                <MapViewDirections
                                    language={data.app.lang == 'gb' ? 'en' : data.app.lang}
                                    optimizeWaypoints={true}
                                    origin={{
                                        latitude: data.app.currentLocation[0],
                                        longitude: data.app.currentLocation[1],
                                    }}
                                    destination={data.trip.trip.locations[0]}
                                    apikey={config.mapApi}
                                    // mode walk
                                    mode="WALKING"
                                    strokeWidth={10}
                                    strokeColor="#0f365e"
                                    resetOnChange={false}
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
                                zIndex: 999,
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
                    <View
                        style={[
                            tw`flex-row items-center justify-end mx-4`,
                            {
                                position: 'absolute',
                                bottom: 10,
                                left: 0,
                                right: 0,
                            },
                        ]}>
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
                </View>
                <View style={[tw`h-${h.alt}/5 pb-4 px-4 pt-2`]}>
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
                                    ? data.trip.trip.driver.user_name.split(' ')[0]
                                    : null}
                            </Text>
                        </View>
                        <View style={[tw`flex-row`]}>
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
                                }}
                                style={[tw`rounded-md p-2 mr-2`, stil('bg2', data.app.theme)]}>
                                <MaterialCommunityIcons
                                    name="image-filter-center-focus"
                                    size={24}
                                    color={stil('text', data.app.theme).color}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    fitContent();
                                }}
                                style={[tw`rounded-md p-2`, stil('bg2', data.app.theme)]}>
                                <MaterialCommunityIcons
                                    name="map-marker-radius"
                                    size={24}
                                    color={stil('text', data.app.theme).color}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={[tw`flex-row items-center justify-start`]}>
                        <TouchableOpacity
                            onPress={() => {
                                setBigImage(true);
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
            <Modal
                animationType="slide"
                transparent={true}
                visible={bigImage}
                onRequestClose={() => {
                    setBigImage(false);
                }}>
                <View style={[tw`h-1/1 flex justify-end`]}>
                    <View style={[tw`flex justify-end`]}>
                        <View style={[tw`  items-center justify-center`, ,]}>
                            <View
                                style={[
                                    tw`w-full flex items-center justify-center  p-2`,
                                    stil('bg', data.app.theme),
                                ]}>
                                <Image
                                    source={{
                                        uri:
                                            config.imageBaseUrl +
                                            data.trip.trip.driver.user_data.car_image_1,
                                    }}
                                    style={[tw`w-full h-5/6 rounded-md`]}
                                />
                                <TouchableOpacity
                                    onPress={() => {
                                        setBigImage(false);
                                    }}
                                    style={[
                                        tw`px-4 w-full mt-2 py-3 rounded-md `,
                                        stil('bg2', data.app.theme),
                                    ]}>
                                    <Text
                                        style={[
                                            stil('text', data.app.theme),
                                            tw` text-center font-semibold`,
                                        ]}>
                                        {l[data.app.lang].back}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}
