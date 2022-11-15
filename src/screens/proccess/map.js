import React, {useEffect} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import MapView, {PROVIDER_GOOGLE, Marker, Circle, AnimatedRegion} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {Image, Platform, Text, TouchableOpacity, View} from 'react-native';
import tw from 'twrnc';
import config from '../../app.json';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {stil} from '../../utils';
import l from '../../languages.json';
import {apiPost} from '../../axios';

export default function TTMap({confisi}) {
    const dispatch = useDispatch();
    const data = useSelector((state) => state);

    const harita = React.useRef(null);
    const markerRef = React.useRef(null);

    const [kalanMesafe, setKalanMesafe] = React.useState(0);
    const [kalanSure, setKalanSure] = React.useState(0);

    const [gidilenMesafe, setGidilenMesafe] = React.useState(0);
    const [gidilenSure, setGidilenSure] = React.useState(0);

    const [yuzde, setYuzde] = React.useState(0);

    const [destination, setDestination] = React.useState(null);
    const [currentLocation, setCurrentLocation] = React.useState(null);

    const [myLoc, setMyLoc] = React.useState(new AnimatedRegion(data.app.currentLocation));
    const [rotaTakip, setRotaTakip] = React.useState(true);
    const [rotaKalan, setRotaKalan] = React.useState(0);

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
        } else return 'road-variant';
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

    useEffect(() => {
        let kalan = 5;

        let intervalKalan = setInterval(() => {
            if (!rotaTakip) {
                if (kalan > 0) {
                    kalan = kalan - 1;
                    setRotaKalan(kalan);
                } else {
                    clearInterval(intervalKalan);
                    setRotaTakip(true);
                }
            }
        }, 1000);

        return () => {
            clearInterval(intervalKalan);
            kalan = 5;
        };
    }, [rotaTakip]);

    useEffect(() => {
        if (rotaTakip) {
            harita.current?.animateCamera({
                heading: data.app.currentLocation.heading,
                center: {
                    latitude: data.app.currentLocation.latitude,
                    longitude: data.app.currentLocation.longitude,
                },
                padding: {
                    top: 1000,
                },
                pitch: 45,
                zoom: 19,
            });
        }
    }, [data.app.currentLocation, rotaTakip]);

    const [distance, setDistance] = React.useState(
        confisi.type == 'Trip' ? parseFloat(data.trip.trip.act_distance) : 0,
    );
    const [lastLocation, setLastLocation] = React.useState(null);

    useEffect(() => {
        if (Platform.OS == 'android') {
            if (markerRef.current) {
                markerRef.current.animateMarkerToCoordinate(data.app.currentLocation, 1000);
            }
        } else {
            myLoc
                .timing(data.app.currentLocation, {
                    duration: 1000,
                    useNativeDriver: true,
                })
                .start();
        }
        if (kalanMesafe < 0.025) {
            dispatch({type: 'yon', payload: null});
            dispatch({type: 'yon2', payload: null});
        }
        if (confisi.type == 'Trip') {
            if (lastLocation != null) {
                let addDistance = calcDistance(lastLocation, data.app.currentLocation);
                addDistance = parseFloat(addDistance);
                let d = parseFloat(distance) + addDistance;
                setDistance(d);
                if (d - parseFloat(data.trip.trip.act_distance) > 0.1) {
                    apiPost('updateActiveTrip', {
                        prc: 'tripChange',
                        lang: data.app.lang,
                        token: data.auth.userToken,
                        id: data.auth.userId,
                        trip_id: data.trip.trip.id,
                        act_distance: d,
                    });
                }
            }
            setLastLocation(data.app.currentLocation);
            // calcDistance(data.app.currentLocation, loc);

            let siradaki = 0;
            let newLoc = [];
            data.trip.trip.locations.forEach((loc, index) => {
                if (siradaki == 0) {
                    if (loc.gecildi == false) {
                        let distance = calcDistance(data.app.currentLocation, loc);
                        if (distance < 0.025) {
                            newLoc.push({...loc, gecildi: true});
                        } else {
                            newLoc.push(loc);
                        }
                        siradaki = index;
                    } else {
                        newLoc.push(loc);
                    }
                } else {
                    newLoc.push(loc);
                }
            });
            if (siradaki != 0) {
                // dispatch({type: 'trip', payload: {...data.trip.trip, locations: newLoc}});

                apiPost('updateActiveTrip', {
                    prc: 'tripChange',
                    lang: data.app.lang,
                    token: data.auth.userToken,
                    id: data.auth.userId,
                    trip_id: data.trip.trip.id,
                    locations: newLoc,
                });
            }
        }
    }, [data.app.currentLocation]);

    function sifirla() {
        setKalanMesafe(0);
        setKalanSure(0);
        setDestination(null);
    }

    return (
        <>
            <MapView
                loadingEnabled={true}
                ref={harita}
                mapType="standard"
                provider={PROVIDER_GOOGLE}
                style={{flex: 1}}
                // region={data.app.currentLocation}
                initialRegion={data.app.currentLocation}
                showsUserLocation={false}
                showsCompass={false}
                loadingBackgroundColor={stil('bg2', data.app.theme).backgroundColor}
                showsMyLocationButton={false}
                showsTraffic={false}
                onRegionChange={(region, sta) => {
                    if (sta.isGesture) {
                        setRotaTakip(false);
                    }
                }}>
                <Marker.Animated ref={markerRef} coordinate={myLoc}>
                    <Image
                        source={require('../../assets/img/compass-ai.png')}
                        style={[tw`w-10 h-10`]}
                    />
                </Marker.Animated>

                {confisi.type === 'GoPassenger' && (
                    <Marker coordinate={data.trip.trip.locations[0]}>
                        <Image
                            source={require('../../assets/img/marker-people.png')}
                            style={[tw`w-10 h-10`]}
                        />
                    </Marker>
                )}

                {confisi.type === 'Trip' &&
                    data.trip.trip.locations.map((item, index) => {
                        if (index != 0) {
                            return (
                                <Marker coordinate={item} key={index}>
                                    <Image
                                        source={require('../../assets/img/marker-1.png')}
                                        style={[tw`w-10 h-10`]}
                                    />
                                </Marker>
                            );
                        }
                    })}

                {data.trip.tripRequest !== null && (
                    <Marker coordinate={data.trip.tripRequest.locations[0]}>
                        <Image
                            source={require('../../assets/img/marker-people.png')}
                            style={[tw`w-10 h-10`]}
                        />
                    </Marker>
                )}

                {confisi.type == 'DriverWait' &&
                data.app.currentLocation.latitude !== 41.299409367279715 &&
                data.trip.tripRequest !== null ? (
                    <MapViewDirections
                        origin={data.app.currentLocation}
                        destination={data.trip.tripRequest.locations[0]}
                        apikey={config.mapApi}
                        strokeWidth={14}
                        strokeColor="green"
                        onReady={(result) => {
                            harita.current.fitToCoordinates(
                                [data.app.currentLocation, data.trip.tripRequest.locations[0]],
                                {
                                    edgePadding: {
                                        top: 200,
                                        right: 100,
                                        bottom: 200,
                                        left: 100,
                                    },
                                    animated: true,
                                },
                            );
                        }}
                    />
                ) : null}
                {confisi.type == 'GoPassenger' &&
                data.app.currentLocation.latitude !== 41.299409367279715 ? (
                    <MapViewDirections
                        resetOnChange={false}
                        origin={data.app.currentLocation}
                        destination={data.trip.trip.locations[0]}
                        apikey={config.mapApi}
                        strokeWidth={kalanMesafe > 50 ? 14 : 0}
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
                {confisi.type == 'Trip' &&
                data.app.currentLocation.latitude !== 41.299409367279715 ? (
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
                                ? data.trip.trip.locations[data.trip.trip.locations.length - 1]
                                : undefined
                        }
                        apikey={config.mapApi}
                        strokeWidth={kalanMesafe > 50 ? 14 : 0}
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

            {!rotaTakip && (
                <View style={[tw`absolute w-full bottom-[${confisi.mbot}]`, {zIndex: 99}]}>
                    <View
                        style={[
                            tw`flex w-full items-center justify-center  opacity-70`,
                            stil('bg', data.app.theme),
                        ]}>
                        <View style={[tw`flex-row w-[50%] items-center justify-center`]}>
                            <Text style={[stil('text', data.app.theme)]}>
                                {rotaKalan} | {l[data.app.lang].ysabitle.split('{icon}')[0]}
                            </Text>
                            <MaterialCommunityIcons
                                name="arch"
                                size={24}
                                color={stil('text', data.app.theme).color}
                            />
                            <Text style={[stil('text', data.app.theme)]}>
                                {l[data.app.lang].ysabitle.split('{icon}')[1]}
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            <View
                style={[
                    tw`absolute right-0 mr-2 justify-between  bottom-[${confisi.mbot}]`,
                    {zIndex: 999999},
                ]}>
                <TouchableOpacity
                    onPress={() => {
                        setRotaTakip(false);
                        harita.current.fitToCoordinates(
                            [
                                data.app.currentLocation,
                                data.trip.trip !== null
                                    ? {
                                          latitude:
                                              parseFloat(data.trip.trip.locations[0].latitude) +
                                              0.0015,
                                          longitude:
                                              parseFloat(data.trip.trip.locations[0].longitude) +
                                              0.0015,
                                          latitudeDelta: 0.015,
                                          longitudeDelta: 0.015,
                                      }
                                    : {
                                          latitude:
                                              parseFloat(data.app.currentLocation.latitude) +
                                              0.0015,
                                          longitude:
                                              parseFloat(data.app.currentLocation.longitude) +
                                              0.0015,
                                          latitudeDelta: 0.015,
                                          longitudeDelta: 0.015,
                                      },
                                data.trip.tripRequest !== null && data.trip.trip === null
                                    ? data.trip.tripRequest.locations
                                    : {
                                          latitude:
                                              parseFloat(data.app.currentLocation.latitude) -
                                              0.0015,
                                          longitude:
                                              parseFloat(data.app.currentLocation.longitude) -
                                              0.0015,
                                          latitudeDelta: 0.015,
                                          longitudeDelta: 0.015,
                                      },
                                data.app.locations.length > 0
                                    ? data.app.locations
                                    : {
                                          latitude:
                                              parseFloat(data.app.currentLocation.latitude) -
                                              0.0015,
                                          longitude:
                                              parseFloat(data.app.currentLocation.longitude) -
                                              0.0015,
                                          latitudeDelta: 0.015,
                                          longitudeDelta: 0.015,
                                      },
                            ],
                            {
                                edgePadding: {
                                    top: 200,
                                    right: 100,
                                    bottom: 200,
                                    left: 100,
                                },
                                animated: true,
                            },
                        );
                    }}
                    style={[
                        stil('bg', data.app.theme),
                        stil('shadow', 'light'),
                        tw`rounded-md p-1 mb-1`,
                    ]}>
                    <MaterialCommunityIcons
                        name="fit-to-page"
                        size={32}
                        color={stil('text', data.app.theme).color}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        setRotaTakip(false);
                        harita.current.fitToCoordinates(
                            [
                                {
                                    latitude: data.app.currentLocation.latitude,
                                    longitude: data.app.currentLocation.longitude,
                                    latitudeDelta: 0.015,
                                    longitudeDelta: 0.015,
                                },
                                {
                                    latitude:
                                        parseFloat(data.app.currentLocation.latitude) + 0.0015,
                                    longitude:
                                        parseFloat(data.app.currentLocation.longitude) + 0.0015,
                                    latitudeDelta: 0.015,
                                    longitudeDelta: 0.015,
                                },
                                {
                                    latitude:
                                        parseFloat(data.app.currentLocation.latitude) - 0.0015,
                                    longitude:
                                        parseFloat(data.app.currentLocation.longitude) - 0.0015,
                                    latitudeDelta: 0.015,
                                    longitudeDelta: 0.015,
                                },
                            ],
                            {
                                edgePadding: {
                                    top: 200,
                                    right: 100,
                                    bottom: 200,
                                    left: 100,
                                },
                                animated: true,
                            },
                        );
                    }}
                    style={[
                        stil('bg', data.app.theme),
                        stil('shadow', 'light'),
                        tw`rounded-md p-1 mb-1`,
                    ]}>
                    <MaterialCommunityIcons
                        name="map-marker-radius"
                        size={32}
                        color={stil('text', data.app.theme).color}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => {
                        setRotaTakip(true);
                    }}
                    style={[
                        stil('bg', data.app.theme),
                        stil('shadow', 'light'),
                        tw`rounded-md p-1 mb-1`,
                    ]}>
                    <MaterialCommunityIcons
                        name="arch"
                        size={32}
                        color={stil('text', data.app.theme).color}
                    />
                </TouchableOpacity>
            </View>
            <View
                style={[
                    tw`absolute right-0 mr-2 justify-between top-[10%]`,
                    {zIndex: 999999},
                    tw`h-24 w-24 rounded-full border-[2] border-red-500 bg-white flex items-center justify-center`,
                ]}>
                {data.app.yon !== null && (
                    <MaterialCommunityIcons
                        name={arrow(
                            data.trip.yon?.distance?.value < 10
                                ? data.trip.yon2?.maneuver
                                : data.trip.yon?.maneuver,
                        )}
                        size={56}
                        color="black"
                    />
                )}
                <View
                    style={[
                        tw`absolute right-10 justify-between bottom-[66%]`,
                        {zIndex: 999999},
                        tw`h-18 w-18 rounded-full border-[2] border-blue-500 bg-white flex items-center justify-center`,
                    ]}>
                    <Text style={[tw`text-black font-bold text-2xl`]}>
                        {parseFloat((data.app.currentLocation.speed * 60 * 60) / 1000) > 25 ? (
                            ((data.app.currentLocation.speed * 60 * 60) / 1000).toFixed(0)
                        ) : (
                            <MaterialCommunityIcons name="snail" size={32} color="black" />
                        )}
                    </Text>
                </View>
            </View>
        </>
    );
}
