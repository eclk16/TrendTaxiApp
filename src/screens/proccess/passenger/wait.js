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
    const [distance, setDistance] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
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

    const [bigImage, setBigImage] = React.useState(false);
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
                        showsCompass={false}
                        enableZoomControl={true}
                        followsUserLocation={true}
                        showsMyLocationButton={false}
                        //user location change
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
                        }}
                        rotateEnabled={true}
                        showsTraffic>
                        {data.trip.trip.driver.last_latitude !== null && (
                            <Marker
                                coordinate={{
                                    latitude: parseFloat(data.trip.trip.driver.last_latitude),
                                    longitude: parseFloat(data.trip.trip.driver.last_longitude),
                                }}
                                style={tw`flex items-center justify-center`}>
                                <View style={[stil('bg', data.app.theme), tw`p-1 rounded-md`]}>
                                    <Text style={[stil('text', data.app.theme), tw`text-xs`]}>
                                        {l[data.app.lang].kalan} {(duration / 60).toFixed(2)}{' '}
                                        {l[data.app.lang].min}
                                    </Text>
                                    <Text style={[stil('text', data.app.theme), tw`text-xs`]}>
                                        {l[data.app.lang].kalan} {(distance / 1000).toFixed(2)}{' '}
                                        {l[data.app.lang].km}
                                    </Text>
                                </View>
                                <Image
                                    source={require('../../../assets/img/marker-car.png')}
                                    style={[
                                        tw`${Platform.OS == 'ios' ? 'w-10 h-10' : 'w-10 h-10'}`,
                                    ]}
                                />
                            </Marker>
                        )}
                        <Marker coordinate={data.trip.trip.locations[0]}>
                            <Image
                                source={require('../../../assets/img/marker-1.png')}
                                style={[tw`h-10 w-10`]}
                            />
                        </Marker>

                        {region.last_latitude != 0 && (
                            <MapViewDirections
                                optimizeWaypoints={true}
                                origin={region}
                                destination={data.trip.trip.locations[0]}
                                apikey={config.mapApi}
                                // mode walk
                                mode="WALKING"
                                strokeWidth={10}
                                strokeColor="#0f365e"
                                resetOnChange={false}
                            />
                        )}

                        <MapViewDirections
                            optimizeWaypoints={true}
                            origin={{
                                latitude: parseFloat(data.trip.trip.driver.last_latitude),
                                longitude: parseFloat(data.trip.trip.driver.last_longitude),
                            }}
                            destination={data.trip.trip.locations[0]}
                            apikey={config.mapApi}
                            // mode walk
                            mode="WALKING"
                            strokeWidth={0}
                            strokeColor="transparent"
                            resetOnChange={false}
                            onReady={(result) => {
                                let dis = 0;
                                let dur = 0;
                                result.legs.map((item, index) => {
                                    dis = dis + item.distance.value;
                                    dur = dur + item.duration.value;
                                });
                                setDistance(dis);
                                setDuration(dur);
                            }}
                        />
                    </MapView>

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
                        <View style={[tw`flex-row items-center justify-center`]}>
                            {calcDistance(
                                {
                                    latitude: parseFloat(data.trip.trip.driver.last_latitude),
                                    longitude: parseFloat(data.trip.trip.driver.last_longitude),
                                },
                                data.trip.trip.locations[0],
                            ) < 0.1 && (
                                <>
                                    <TouchableOpacity
                                        onPress={() => {
                                            var myHeaders = new Headers();
                                            myHeaders.append(
                                                'Authorization',
                                                'key=AAAAfZtd-kk:APA91bEkNRkI3IZYdHyu9cjRBsXZlpYupj4u-HboijWEb754fHhGs9hFrYvISxmKHLNQFkU4ChNNsKhOSvVI3bymJ1DjpFHrk5klX29BAtXoL8ISakbD_cEGSkLTkHnSUezBt6U3IJ-a',
                                            );
                                            myHeaders.append('Content-Type', 'application/json');

                                            var raw = JSON.stringify({
                                                to: data.trip.trip.driver.remember_token,
                                                notification: {
                                                    body: 'Men Darhol Kelaman !',
                                                    title: 'Men Darhol Kelaman !',
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

                                            fetch(
                                                'https://fcm.googleapis.com/fcm/send',
                                                requestOptions,
                                            )
                                                .then((response) => response.text())
                                                .then((result) => {
                                                    alert(l[data.app.lang].setNotYolcu);
                                                })
                                                .catch((error) => console.log('error', error));
                                        }}
                                        style={[
                                            tw`p-2 mr-2 rounded-md `,
                                            stil('bg', data.app.theme),
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
                                {data.trip.trip.driver.user_name
                                    ? data.trip.trip.driver.user_name.split(' ')[0]
                                    : null}
                            </Text>
                        </View>
                        <View style={[tw`flex-row`]}>
                            <TouchableOpacity
                                onPress={() => {
                                    harita.current.fitToCoordinates(
                                        [
                                            region,
                                            {
                                                latitude: parseFloat(
                                                    data.trip.trip.driver.last_latitude !== null
                                                        ? data.trip.trip.driver.last_latitude
                                                        : data.trip.trip.locations[0].latitude,
                                                ),
                                                longitude: parseFloat(
                                                    data.trip.trip.driver.last_longitude !== null
                                                        ? data.trip.trip.driver.last_longitude
                                                        : data.trip.trip.locations[0].longitude,
                                                ),
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
                                style={[tw`rounded-md p-2 mr-2`, stil('bg2', data.app.theme)]}>
                                <MaterialCommunityIcons
                                    name="image-filter-center-focus"
                                    size={24}
                                    color={stil('text', data.app.theme).color}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    harita.current.fitToCoordinates([region], {
                                        edgePadding: {
                                            top: 100,
                                            right: 100,
                                            bottom: 100,
                                            left: 100,
                                        },
                                        animated: true,
                                    });
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
                                style={[tw`w-25 h-16 rounded-md`]}
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
                                    {(data.trip.trip.driver.user_data.car_plate
                                        ? data.trip.trip.driver.user_data.car_plate
                                        : ''
                                    ).toUpperCase()}
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
                                    {data.trip.trip.driver.user_data.car_brand ?? ''}{' '}
                                    {data.trip.trip.driver.user_data.car_model ?? ''}
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
                        <View style={[tw`  items-center justify-end`, ,]}>
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
