import React, {useEffect} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {TouchableOpacity, Text, View, Linking, Modal, Image} from 'react-native';
import {stil} from '../../../utils';
import tw from 'twrnc';
import l from '../../../languages.json';
import {apiPost} from '../../../axios';
import config from '../../../app.json';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
MaterialCommunityIcons.loadFont();

export default function PassengerWait({navigation}) {
    const dispatch = useDispatch();
    const data = useSelector((state) => state);
    const harita = React.useRef(null);

    const [h, setH] = React.useState({
        ust: 4,
        alt: 1,
    });

    const [region, setRegion] = React.useState({
        latitude: data.app.currentLocation[0],
        longitude: data.app.currentLocation[1],
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    });
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

    useEffect(() => {
        setLocations([
            locations[0],
            {
                latitude: data.trip.trip.driver.last_latitude,
                longitude: data.trip.trip.driver.last_longitude,
            },
        ]);
        return () => {
            setLocations([]);
        };
    }, [data.trip.trip.driver.last_latitude]);
    return (
        <>
            <View style={[{flex: 1}, stil('bg', data.app.theme)]}>
                <View style={[tw`h-${h.ust}/5`]}>
                    <MapView
                        ref={harita}
                        provider={PROVIDER_GOOGLE}
                        style={{flex: 1}}
                        // region={region}
                        initialRegion={region}
                        showsUserLocation
                        zoomEnabled={true}
                        enableZoomControl={true}
                        rotateEnabled={true}
                        showsTraffic
                        onUserLocationChange={(ret) => {
                            setRegion({
                                latitude: ret.nativeEvent.coordinate.latitude,
                                longitude: ret.nativeEvent.coordinate.longitude,
                                latitudeDelta: 0.005,
                                longitudeDelta: 0.005,
                            });
                            setLocations([
                                {
                                    latitude: ret.nativeEvent.coordinate.latitude,
                                    longitude: ret.nativeEvent.coordinate.longitude,
                                },
                                {
                                    latitude: data.trip.trip.driver.last_latitude,
                                    longitude: data.trip.trip.driver.last_longitude,
                                },
                            ]);
                        }}
                        loadingEnabled>
                        {locations.map((item, index) => {
                            if (index == 1) {
                                return (
                                    <Marker
                                        identifier={'Marker_' + index}
                                        key={index}
                                        coordinate={item}>
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
                        {locations.length >= 2 ? (
                            <MapViewDirections
                                lineDashPattern={[0]}
                                origin={locations[0]}
                                waypoints={
                                    locations.length > 2 ? locations.slice(1, -1) : undefined
                                }
                                destination={locations[locations.length - 1]}
                                apikey={config.mapApi}
                                strokeWidth={5}
                                strokeColor="#0f365e"
                                optimizeWaypoints={true}
                                onReady={(result) => {}}
                                onError={(errorMessage) => {
                                    // console.log('GOT AN ERROR');
                                }}
                            />
                        ) : null}
                    </MapView>
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
                        <Text
                            style={[
                                stil('text', data.app.theme),
                                tw`font-semibold text-base mb-1`,
                            ]}>
                            {data.trip.trip ? data.trip.trip.driver.user_name.split(' ')[0] : null}
                        </Text>
                        <View style={[tw`flex-row`]}>
                            <TouchableOpacity
                                onPress={() => {
                                    harita.current.getCamera().then((c) => {
                                        harita.current.setCamera({
                                            zoom: c.zoom - 1,
                                        });
                                    });
                                }}
                                style={[tw`rounded-md p-2 mr-2`, stil('bg', data.app.theme)]}>
                                <MaterialCommunityIcons
                                    name="minus"
                                    size={24}
                                    color={stil('text', data.app.theme).color}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    harita.current.getCamera().then((c) => {
                                        harita.current.setCamera({
                                            zoom: c.zoom + 1,
                                        });
                                    });
                                }}
                                style={[tw`rounded-md p-2 mr-2`, stil('bg', data.app.theme)]}>
                                <MaterialCommunityIcons
                                    name="plus"
                                    size={24}
                                    color={stil('text', data.app.theme).color}
                                />
                            </TouchableOpacity>
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
                                style={[tw`rounded-md p-2 mr-2`, stil('bg', data.app.theme)]}>
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
                                style={[tw`rounded-md p-2`, stil('bg', data.app.theme)]}>
                                <MaterialCommunityIcons
                                    name="map-marker-radius"
                                    size={24}
                                    color={stil('text', data.app.theme).color}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={[tw`flex-row items-center justify-between`]}>
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
                                style={[tw`w-16 h-16 rounded-md`]}
                            />
                        </TouchableOpacity>
                        <View style={[tw``]}>
                            <Text
                                style={[stil('text', data.app.theme), tw`font-semibold text-base`]}>
                                {data.trip.trip.driver.user_data.car_plate.toUpperCase()}
                            </Text>
                        </View>
                        <View style={[tw``]}>
                            <Text
                                style={[stil('text', data.app.theme), tw`font-semibold text-base`]}>
                                {data.trip.trip.driver.user_data.car_brand}
                            </Text>
                            <Text
                                style={[stil('text', data.app.theme), tw`font-semibold text-base`]}>
                                {data.trip.trip.driver.user_data.car_model}
                            </Text>
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
                                    <Text style={[tw`text-white text-center font-semibold`]}>
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
