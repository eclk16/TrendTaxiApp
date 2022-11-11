import React, {useEffect} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import MapView, {PROVIDER_GOOGLE, Marker, AnimatedRegion} from 'react-native-maps';
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
import {locationPermission, getCurrentLocation} from '../../../helper';
import TTMap from '../map';

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
    const [price, setPrice] = React.useState(data.trip.trip.est_price);
    useEffect(() => {
        hesapla();
    }, []);

    function getPrice(item, dis) {
        let dur = new Date().getTime() / 1000;
        dur = dur - data.trip.trip.start_time;
        let total = parseFloat(item.start);
        let tP = 0;
        let kP = 0;
        tP = Math.ceil(dur / 60).toFixed(0);
        if (tP < 0) tP = 0;
        tP = parseFloat(item.paid) * tP;
        tP = Math.ceil(tP / parseFloat(item.paid)) * parseFloat(item.paid);

        kP = Math.ceil(dis).toFixed(0);
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

    function hesapla() {
        let p = data.trip.trip.est_price;
        if (data.trip.trip.locations.length > 1) {
            let dd = calcDistance(
                data.app.currentLocation,
                data.trip.trip.locations[data.trip.trip.locations.length - 1],
            );
            if (dd < 0.35) {
                setPrice(data.trip.trip.est_price);
            } else {
                p = getPrice(
                    {
                        start: data.trip.trip.driver.user_data.car.start,
                        km: data.trip.trip.driver.user_data.car.km,
                        paid: data.trip.trip.driver.user_data.car.paid,
                    },
                    parseFloat(data.trip.trip.act_distance),
                ).toFixed(2);
                setPrice(p);
            }
        } else {
            p = getPrice(
                {
                    start: data.trip.trip.driver.user_data.car.start,
                    km: data.trip.trip.driver.user_data.car.km,
                    paid: data.trip.trip.driver.user_data.car.paid,
                },
                parseFloat(data.trip.trip.act_distance),
            ).toFixed(2);

            setPrice(p);
        }
    }
    const [modalVisible, setModalVisible] = React.useState(false);

    useEffect(() => {
        hesapla();
    }, [data.app.currentLocation]);

    return (
        <>
            <View style={[{flex: 1}, stil('bg', data.app.theme)]}>
                <View style={[tw`h-5/5`]}>
                    <TTMap
                        confisi={{
                            mbot: '40%',
                            type: 'Trip',
                        }}
                    />
                </View>
                <View style={[tw`flex items-center`]}>
                    <View
                        style={[
                            tw`absolute bottom-0 pb-4 px-4 pt-2 w-[90%] mb-6 rounded-md`,
                            stil('bg', data.app.theme),
                            stil('shadow', 'light'),
                        ]}>
                        <View
                            style={[
                                tw`flex-row items-center justify-between `,
                                {
                                    position: 'absolute',
                                    top: -56,
                                    left: 0,
                                    right: 0,
                                },
                                stil('shadow', 'light'),
                            ]}>
                            <View
                                style={[
                                    stil('shadow', 'light'),
                                    stil('bg', data.app.theme),
                                    tw`rounded-md items-center justify-center flex-row p-3 `,
                                ]}>
                                <Text style={[stil('text', data.app.theme), tw` font-semibold `]}>
                                    {price} sum
                                </Text>
                            </View>
                            <View
                                style={[
                                    stil('shadow', 'light'),
                                    stil('bg', data.app.theme),
                                    tw`rounded-md items-center justify-center flex-row p-3 `,
                                ]}>
                                <Text style={[stil('text', data.app.theme), tw` font-semibold `]}>
                                    {parseFloat(data.trip.trip.act_distance).toFixed(2)}{' '}
                                    {l[data.app.lang].km}
                                </Text>
                            </View>
                            <View
                                style={[
                                    stil('shadow', 'light'),
                                    stil('bg', data.app.theme),
                                    tw`rounded-md items-center justify-center flex-row p-3 `,
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
                            <TouchableOpacity
                                onPress={() => {
                                    setModalVisible(true);
                                }}
                                style={[
                                    tw` px-3  py-1 rounded-md bg-[#00A300]`,
                                    stil('shadow', 'light'),
                                ]}>
                                <MaterialCommunityIcons
                                    name="flag-checkered"
                                    size={36}
                                    color="white"
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={[tw`flex-row items-center justify-between`]}>
                            <View style={[tw`flex-row items-center `]}>
                                <MaterialCommunityIcons
                                    name="human-greeting-variant"
                                    size={24}
                                    color={stil('text', data.app.theme).color}
                                />
                                <Text style={[stil('text', data.app.theme), tw` text-base `]}>
                                    {' '}
                                    : {data.trip.trip ? data.trip.trip.passenger.user_name : null}
                                </Text>
                            </View>
                        </View>
                        {data.trip.yon !== null ? (
                            <View style={[tw`  `, stil('bg', data.app.theme)]}>
                                <View style={[tw`flex-row items-center justify-between mb-1 mt-2`]}>
                                    <View
                                        style={[
                                            tw`border-2 flex-row rounded-md items-center justify-center`,
                                            {
                                                borderColor: stil('text', data.app.theme).color,
                                            },
                                        ]}>
                                        <MaterialCommunityIcons
                                            name={arrow(
                                                data.trip.yon.distance.value < 10
                                                    ? data.trip.yon2?.maneuver
                                                    : data.trip.yon?.maneuver,
                                            )}
                                            size={48}
                                            color={stil('text', data.app.theme).color}
                                        />
                                        <Text
                                            style={[
                                                stil('text', data.app.theme),
                                                tw` mb-1 mr-2 text-base font-semibold`,
                                            ]}>
                                            {data.trip.yon.distance.text}
                                        </Text>
                                    </View>
                                    <Text
                                        style={[
                                            stil('text', data.app.theme),
                                            tw`  text-right  w-[60%]`,
                                        ]}>
                                        {data.trip.yon.html_instructions.replace(
                                            /(<([^>]+)>)/gi,
                                            '',
                                        )}
                                    </Text>
                                </View>
                            </View>
                        ) : null}
                        {data.trip.yon2 !== null ? (
                            <View style={[tw` rounded-md`, stil('bg', data.app.theme)]}>
                                <View
                                    style={[
                                        tw`flex-row items-center justify-start opacity-50 my-1`,
                                    ]}>
                                    <MaterialCommunityIcons
                                        name={arrow(data.trip.yon2.maneuver)}
                                        size={20}
                                        color={stil('text', data.app.theme).color}
                                    />
                                    <Text
                                        numberOfLines={1}
                                        style={[
                                            stil('text', data.app.theme),
                                            tw`text-xs w-[90%]  ml-2`,
                                        ]}>
                                        {data.trip.yon2.html_instructions.replace(
                                            /(<([^>]+)>)/gi,
                                            '',
                                        )}
                                    </Text>
                                </View>
                            </View>
                        ) : null}
                    </View>
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
                                {parseFloat(data.trip.trip.act_distance).toFixed(2)}{' '}
                                {l[data.app.lang].km}
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
                                {price}
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
