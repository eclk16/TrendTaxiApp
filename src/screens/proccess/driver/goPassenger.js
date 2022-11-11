import React, {useEffect} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import MapView, {PROVIDER_GOOGLE, Marker, AnimatedRegion} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {TouchableOpacity, Text, View, Linking, Alert, Image, Platform, Modal} from 'react-native';
import {stil} from '../../../utils';
import tw from 'twrnc';
import l from '../../../languages.json';
import {apiPost} from '../../../axios';
import config from '../../../app.json';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';
import {locationPermission, getCurrentLocation} from '../../../helper';
import TTMap from '../map';
//burayafont yükle gelecek

export default function DriverGoPassenger() {
    const dispatch = useDispatch();
    const data = useSelector((state) => state);

    const [iptalModal, setIptalModal] = React.useState(false);

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

    useEffect(() => {
        apiPost('mapSocket', {
            prc: 'driverLocation',
            locations: [data.app.currentLocation.latitude, data.app.currentLocation.longitude],
            id: data.trip.trip.passenger_id,
            id_2: data.trip.trip.driver_id,
        })
            .then(() => {})
            .catch((error) => {
                console.log('GOPASSENGER.JS ERROR (MAPSOCKET)', error);
            });
    }, [data.app.currentLocation]);

    return (
        <>
            <View style={[{flex: 1}, stil('bg', data.app.theme)]}>
                <View style={[tw`h-5/5`]}>
                    <TTMap
                        confisi={{
                            mbot: '40%',
                            type: 'GoPassenger',
                        }}
                    />
                </View>
                <View style={[tw`flex-row justify-center`]}>
                    <View
                        style={[
                            tw`absolute bottom-0 pb-2 px-4 pt-2 w-[90%] mb-4 rounded-md`,
                            stil('bg', data.app.theme),
                            stil('shadow', data.app.theme),
                        ]}>
                        <View
                            style={[
                                tw`flex-row items-center justify-between`,
                                {
                                    position: 'absolute',
                                    top: -56,
                                    left: 0,
                                    right: 0,
                                },
                            ]}>
                            <TouchableOpacity
                                onPress={() => {
                                    setIptalModal(true);
                                }}
                                style={[tw`px-2  py-2 rounded-md bg-red-500`]}>
                                <MaterialCommunityIcons name="cancel" size={24} color="#fff" />
                            </TouchableOpacity>
                            {calcDistance(data.app.currentLocation, data.trip.trip.locations[0]) <
                                0.1 && (
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
                                                },
                                                data: {
                                                    json: {
                                                        body:
                                                            data.trip.trip.driver.user_data
                                                                .car_plate +
                                                            ' | ' +
                                                            data.trip.trip.driver.user_data
                                                                .car_brand +
                                                            ' | ' +
                                                            data.trip.trip.driver.user_data
                                                                .car_model,
                                                        title: 'Taxi Sizni Kutmoqda !',
                                                        android: {},
                                                        ios: {
                                                            critical: true,
                                                            sound: 'ses-14.caf',
                                                            criticalVolume: 1,
                                                        },
                                                    },
                                                },
                                            });

                                            var requestOptions = {
                                                method: 'POST',
                                                headers: myHeaders,
                                                body: raw,
                                                redirect: 'follow',
                                            };

                                            fetch(
                                                'https://fcm.googleapis.com/fcm/send',
                                                requestOptions,
                                            )
                                                .then((response) => response.text())
                                                .then((result) => {
                                                    alert(l[data.app.lang].setNot);
                                                })
                                                .catch((error) => console.log('error', error));
                                        }}
                                        style={[
                                            tw`p-2 rounded-md `,
                                            stil('bg', data.app.theme),
                                            stil('shadow', data.app.theme),
                                        ]}>
                                        <MaterialCommunityIcons
                                            name="alarm-bell"
                                            size={24}
                                            color={stil('text', data.app.theme).color}
                                        />
                                    </TouchableOpacity>
                                </>
                            )}
                            <TouchableOpacity
                                style={[
                                    stil('bg', data.app.theme),
                                    stil('shadow', data.app.theme),
                                    tw`p-2 rounded-md`,
                                ]}
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
                visible={iptalModal}
                onRequestClose={() => {
                    setIptalModal(false);
                }}>
                <View style={[tw`flex-1 items-center justify-end`]}>
                    <View style={[stil('bg', data.app.theme), tw`rounded-md m-4 p-4`]}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((item, index) => {
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        tw`px-4 py-2 my-2 rounded-md`,
                                        stil('bg2', data.app.theme),
                                    ]}
                                    onPress={() => {
                                        apiPost('removeActiveTrip', {
                                            lang: data.app.lang,
                                            token: data.auth.userToken,
                                            id: data.trip.trip.passenger_id,
                                            user_type: data.auth.userType,
                                            sebeb: l[data.app.lang]['s' + item],
                                        });
                                    }}>
                                    <Text style={[stil('text', data.app.theme)]}>
                                        {l[data.app.lang]['s' + item]}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                        <TouchableOpacity
                            style={[tw`px-4 py-2 my-2 rounded-md`, stil('bg2', data.app.theme)]}
                            onPress={() => {
                                setIptalModal(false);
                            }}>
                            <Text style={[tw`text-center`, stil('text', data.app.theme)]}>
                                {l[data.app.lang]['back']}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
}
