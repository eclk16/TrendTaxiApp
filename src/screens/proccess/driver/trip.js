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

    const [region, setRegion] = React.useState({
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
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
    const [price, setPrice] = React.useState(data.trip.trip.driver.user_data.car.start);
    useEffect(() => {
        getValue('TTDistance').then((tt) => {
            if (tt) {
                if (parseFloat(tt) > 0) {
                    setPrice(
                        getPrice(
                            {
                                start: data.trip.trip.driver.user_data.car.start,
                                km: data.trip.trip.driver.user_data.car.km,
                                paid: data.trip.trip.driver.user_data.car.paid,
                            },
                            tt,
                        ).toFixed(2),
                    );

                    setACTDistance(parseFloat(tt).toFixed(2));
                }
            }
        });
    }, []);

    // function getPrice(item, dis) {
    //     let dur = new Date().getTime() / 1000;
    //     dur = dur - data.trip.trip.start_time;

    //     let total = item.start;
    //     let tP = 0;
    //     let kP = 0;
    //     tP = item.paid * Math.ceil(dur / 60).toFixed(0);
    //     tP = tP - 3;
    //     if (tP < 0) tP = 0;
    //     tP = Math.ceil(tP / item.paid) * item.paid;

    //     kP = item.km * Math.ceil(dis).toFixed(0);
    //     console.log(kP, dis);
    //     kP = kP - 1;
    //     if (kP < 0) kP = 0;
    //     kP = Math.ceil(kP / item.km) * item.km;
    //     total = tP + kP;
    //     if (total < item.start) {
    //         total = item.start;
    //     }
    //     total = Math.ceil(total / 500) * 500;

    //     return total;
    // }
    function getPrice(item, dis) {
        let dur = new Date().getTime() / 1000;
        dur = dur - data.trip.trip.start_time;

        let total = parseFloat(item.start);
        let tP = 0;
        let kP = 0;
        tP = Math.ceil(dur / 60).toFixed(0);
        tP = tP - 3;

        if (tP < 0) tP = 0;
        tP = parseFloat(item.paid) * tP;
        tP = Math.ceil(tP / parseFloat(item.paid)) * parseFloat(item.paid);

        kP = Math.ceil(dis / 1000).toFixed(0);
        kP = kP - 1;

        if (kP < 0) kP = 0;
        kP = parseFloat(item.km) * kP;
        kP = Math.ceil(kP / parseFloat(item.km)) * parseFloat(item.km);

        total = total + tP + kP;

        if (total < item.start) {
            total = item.start;
        }
        total = Math.ceil(total / 1000) * 1000;

        return total;
    }

    function hesapla(l) {
        getValue('TTLocation').then((ttl) => {
            if (ttl) {
                let d = calcDistance(JSON.parse(ttl), l);
                if (d !== undefined) {
                    if (d > 0.005) {
                        getValue('TTDistance').then((tt) => {
                            if (tt) {
                                if (parseFloat(d) > 0) {
                                    setPrice(
                                        getPrice(
                                            {
                                                start: data.trip.trip.driver.user_data.car.start,
                                                km: data.trip.trip.driver.user_data.car.km,
                                                paid: data.trip.trip.driver.user_data.car.paid,
                                            },
                                            parseFloat(d) + parseFloat(tt),
                                        ).toFixed(2),
                                    );
                                    setValue(
                                        'TTDistance',
                                        (parseFloat(d) + parseFloat(tt)).toString(),
                                    );
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
            }
            setValue('TTLocation', JSON.stringify(l));
        });
    }
    const [modalVisible, setModalVisible] = React.useState(false);

    const [heading, setHeading] = React.useState(0);

    const [directions, setDirections] = React.useState([]);

    const [rotate, setRotate] = React.useState(true);

    const [yuzde, setYuzde] = React.useState(0);

    const [cl, setCl] = React.useState({
        latitude: 0,
        longitude: 0,
    });
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
                        showsCompass={false}
                        initialRegion={region}
                        showsUserLocation
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
                        onUserLocationChange={(e) => {
                            console.log({
                                latitude: e.nativeEvent.coordinate.latitude,
                                longitude: e.nativeEvent.coordinate.longitude,
                            });
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

                            hesapla({
                                latitude: e.nativeEvent.coordinate.latitude,
                                longitude: e.nativeEvent.coordinate.longitude,
                            });

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

                            setYuzde(x);
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
                                                style={[tw`text-gray-600 font-bold text-xl mb-2`]}>
                                                {index}
                                            </Text>
                                        </View>
                                        <Image
                                            source={require('../../../assets/img/marker-1.png')}
                                            style={[tw`w-10 h-10 `]}
                                        />
                                    </Marker>
                                );
                            }
                        })}
                        {directions.length > 0 && data.trip.trip.locations.length > 1 ? (
                            <MapViewDirections
                                language={data.app.lang == 'gb' ? 'en' : data.app.lang}
                                optimizeWaypoints={true}
                                origin={cl}
                                waypoints={
                                    directions.length > 1 ? directions.slice(1, -1) : undefined
                                }
                                destination={
                                    directions.length == 1
                                        ? directions[0]
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
                        <View
                            style={[
                                {position: 'absolute', top: -0, zIndex: 999998998989},

                                tw`rounded-md items-center opacity-75  justify-center w-full flex-row py-3 px-4`,
                            ]}></View>
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
                                    tw` w-full  rounded-md  flex-row items-center justify-between`,
                                    {
                                        top: -20,
                                        position: 'absolute',
                                    },
                                ]}>
                                <Text style={[tw`text-black`]}>
                                    {l[data.app.lang].kalan} {(distance / 1000).toFixed(2)}{' '}
                                    {l[data.app.lang].km}
                                </Text>
                                <Text style={[tw`text-black`]}>
                                    {l[data.app.lang].kalan} {(duration / 60).toFixed(1)}{' '}
                                    {l[data.app.lang].min}
                                </Text>
                            </View>
                            <Text
                                style={[
                                    tw` text-black text-center w-full text-2xl opacity-70 font-bold ml-3 `,
                                    {
                                        // top: 0,
                                        zIndex: 99999,
                                        position: 'absolute',
                                    },
                                ]}>
                                {price < parseFloat(data.trip.trip.est_price) + 2500
                                    ? data.trip.trip.est_price
                                    : price}{' '}
                                sum
                            </Text>
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
                                {(
                                    (new Date().getTime() -
                                        parseInt(parseInt(data.trip.trip.start_time) * 1000)) /
                                    1000 /
                                    60
                                ).toFixed(0)}{' '}
                                {l[data.app.lang].min}
                            </Text>
                        </View>
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
                                {(
                                    (new Date().getTime() -
                                        parseInt(parseInt(data.trip.trip.start_time) * 1000)) /
                                    1000 /
                                    60
                                ).toFixed(0)}{' '}
                                {l[data.app.lang].min}
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
                                {price < parseFloat(data.trip.trip.est_price) - 2500 ||
                                price > parseFloat(data.trip.trip.est_price) + 2500
                                    ? price
                                    : data.trip.trip.est_price}{' '}
                                sum
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
