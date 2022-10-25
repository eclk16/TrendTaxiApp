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
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

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

    const [rotate, setRotate] = React.useState(true);

    const [cl, setCl] = React.useState({
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    const [head, setHead] = React.useState(0);
    const [speed, setSpeed] = React.useState(0);

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
                        showsCompass={false}
                        showsMyLocationButton={false}
                        showsTraffic
                        userLocationPriority={'high'}
                        userLocationUpdateInterval={1000}
                        userLocationFastestInterval={1000}
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
                            setSpeed(e.nativeEvent.coordinate.speed);
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

                            let mesafe = calcDistance(
                                {
                                    latitude: e.nativeEvent.coordinate.latitude,
                                    longitude: e.nativeEvent.coordinate.longitude,
                                },
                                {
                                    latitude: data.trip.trip.driver.last_latitude,
                                    longitude: data.trip.trip.driver.last_longitude,
                                },
                            );

                            if (mesafe > 0.01) {
                                apiPost('mapSocket', {
                                    prc: 'driverLocation',
                                    locations: [
                                        e.nativeEvent.coordinate.latitude,
                                        e.nativeEvent.coordinate.longitude,
                                    ],
                                    id: data.trip.trip.passenger_id,
                                    id_2: data.trip.trip.driver_id,
                                })
                                    .then(() => {})
                                    .catch((error) => {
                                        console.log('GOPASSENGER.JS ERROR (MAPSOCKET)', error);
                                    });
                            }
                        }}
                        onRegionChange={(ret, sta) => {
                            if (sta.isGesture == true) {
                                setOrtCalistir(!ortCalistir);
                                setRotate(false);
                            }
                        }}>
                        {/* <Marker coordinate={cl}>
                            <Image
                                source={require('../../../assets/img/compass-ai.png')}
                                style={[tw`h-10 w-10`]}
                            />
                        </Marker> */}

                        <Marker coordinate={data.trip.trip.locations[0]}>
                            <Image
                                source={require('../../../assets/img/marker-people.png')}
                                style={[tw`w-10 h-10 `]}
                            />
                        </Marker>
                        {calcDistance(cl, data.trip.trip.locations[0]) > 0.04 && (
                            <MapViewDirections
                                language={data.app.lang == 'gb' ? 'en' : data.app.lang}
                                optimizeWaypoints={true}
                                origin={cl}
                                destination={data.trip.trip.locations[0]}
                                apikey={config.mapApi}
                                strokeWidth={12}
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
                        )}
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
                        {calcDistance(cl, data.trip.trip.locations[0]) < 0.1 && (
                            <>
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
                                    style={[tw`px-4 w-3/6 py-3 rounded-md bg-[#00A300]`]}>
                                    <Text style={[tw`text-white text-center font-semibold`]}>
                                        {l[data.app.lang].start}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        var myHeaders = new Headers();
                                        myHeaders.append(
                                            'Authorization',
                                            'key=AAAAfZtd-kk:APA91bEkNRkI3IZYdHyu9cjRBsXZlpYupj4u-HboijWEb754fHhGs9hFrYvISxmKHLNQFkU4ChNNsKhOSvVI3bymJ1DjpFHrk5klX29BAtXoL8ISakbD_cEGSkLTkHnSUezBt6U3IJ-a',
                                        );
                                        myHeaders.append('Content-Type', 'application/json');

                                        var raw = JSON.stringify({
                                            to: data.trip.trip.passenger.remember_token,
                                            notification: {
                                                body:
                                                    data.trip.trip.driver.user_data.car_plate +
                                                    ' | ' +
                                                    data.trip.trip.driver.user_data.car_brand +
                                                    ' | ' +
                                                    data.trip.trip.driver.user_data.car_model,
                                                title: 'Taxi Sizni Kutmoqda !',
                                                sound: 'default',
                                                importance: 4,
                                            },
                                        });

                                        var requestOptions = {
                                            method: 'POST',
                                            headers: myHeaders,
                                            body: raw,
                                            redirect: 'follow',
                                        };
                                        console.log(
                                            data.trip.trip.passenger.remember_token,
                                            'https://fcm.googleapis.com/fcm/send',
                                            requestOptions,
                                        );

                                        fetch('https://fcm.googleapis.com/fcm/send', requestOptions)
                                            .then((response) => response.text())
                                            .then((result) => {
                                                alert(l[data.app.lang].setNot);
                                            })
                                            .catch((error) => console.log('error', error));
                                    }}
                                    style={[tw`p-2 rounded-md `, stil('bg', data.app.theme)]}>
                                    <MaterialCommunityIcons
                                        name="alarm-bell"
                                        size={24}
                                        color={stil('text', data.app.theme).color}
                                    />
                                </TouchableOpacity>
                            </>
                        )}
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
                            {position: 'absolute', top: '10%', right: 0},
                            tw`rounded-md`,
                            stil('bg', data.app.theme),
                        ]}>
                        {step !== null ? (
                            <>
                                <View style={[tw`flex-row items-center rounded-md p-2 pb-0 mr-2`]}>
                                    <MaterialCommunityIcons
                                        name={arrow(step.maneuver)}
                                        size={64}
                                        color={stil('text', data.app.theme).color}
                                    />
                                    <View style={[tw`flex items-center justify-between ml-2`]}>
                                        <Text style={[stil('text', data.app.theme), tw`mb-1`]}>
                                            {step.distance.text}
                                        </Text>
                                        <Text
                                            style={[
                                                stil('text', data.app.theme),
                                                tw`text-xs mb-1`,
                                            ]}>
                                            {step.duration.text}
                                        </Text>
                                    </View>
                                </View>
                            </>
                        ) : null}
                    </View>
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
                                    setRotate(false);
                                    harita.current.fitToCoordinates(
                                        [cl, data.trip.trip.locations[0]],
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
