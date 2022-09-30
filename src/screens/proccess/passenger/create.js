import React, {useEffect} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import MapView, {PROVIDER_GOOGLE, Marker, Polygon} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {
    TouchableOpacity,
    Text,
    View,
    TextInput,
    Keyboard,
    Modal,
    ScrollView,
    Image,
    ActivityIndicator,
    Alert,
    Platform,
} from 'react-native';
import {stil} from '../../../utils';
import tw from 'twrnc';
import l from '../../../languages.json';
import axios from 'axios';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {apiPost} from '../../../axios';
import config from '../../../app.json';
MaterialCommunityIcons.loadFont();

export default function PassengerCreate() {
    const dispatch = useDispatch();
    const data = useSelector((state) => state);

    const harita = React.useRef(null);
    const [locations, setLocations] = React.useState([]);
    const [h, setH] = React.useState({
        ust: 3,
        alt: 2,
    });
    const [result, setResult] = React.useState([]);
    const [searchText, setSearchText] = React.useState('');
    const [findModal, setFindModal] = React.useState(false);
    const [findingModal, setFiningModal] = React.useState(false);
    const [DATA, setDATA] = React.useState([]);
    const [distance, setDistance] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const [cars, setCars] = React.useState({});
    const [markerMove, setMarkerMove] = React.useState(true);
    const [move, setMove] = React.useState(true);

    const setNewTrip = (car) => {
        if (locations.length == 0) {
            alert(l[data.app.lang].enaz);
            return false;
        }
        dispatch({type: 'setTripFind', payload: true});
        apiPost('addActiveTrip', {
            lang: data.app.lang,
            token: data.auth.userToken,
            id: data.auth.userId,
            user_type: data.auth.userType,
            locations: locations,
            price: car.price,
            carPrice: car.start,
            duration: Math.ceil(duration / 60),
            distance: Math.ceil(distance / 1000),
            carType: car.type,
            carFee: car.fee,
        });
        console.log({
            lang: data.app.lang,
            token: data.auth.userToken,
            id: data.auth.userId,
            user_type: data.auth.userType,
            locations: locations,
            price: car.price,
            carPrice: car.start,
            duration: Math.ceil(duration / 60),
            distance: Math.ceil(distance / 1000),
            carType: car.type,
            carFee: car.fee,
        });
    };

    const getLocationName = (lat, lon, ekle = false) => {
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        axios
            .get(
                'https://catalog.api.2gis.com/3.0/items?q=' +
                    lat +
                    ',' +
                    lon +
                    '&key=runnmp5276&locale=uz_UZ&fields=items&sort=distance&location=' +
                    lat +
                    ',' +
                    lon,
            )
            .then((response) => {
                if (response.data.result) {
                    if (locations.length > 0) {
                        if (ekle) {
                            setLocations([
                                ...locations,
                                {
                                    latitude: lat,
                                    longitude: lon,
                                    latitudeDelta: 0.005,
                                    longitudeDelta: 0.005,
                                    title: response.data.result.items[0].name,
                                    description: response.data.result.items[0].full_name,
                                },
                            ]);
                        } else {
                            let remainingItems = [];
                            locations.map((item, index) => {
                                if (index == locations.length - 1) {
                                    remainingItems.push({
                                        latitude: lat,
                                        longitude: lon,
                                        latitudeDelta: 0.005,
                                        longitudeDelta: 0.005,
                                        title: response.data.result.items[0].name,
                                        description: response.data.result.items[0].full_name,
                                    });
                                } else {
                                    remainingItems.push(item);
                                }
                            });
                            setLocations(remainingItems);
                        }
                    } else {
                        setLocations([
                            {
                                latitude: lat,
                                longitude: lon,
                                latitudeDelta: 0.005,
                                longitudeDelta: 0.005,
                                title: response.data.result.items[0].name,
                                description: response.data.result.items[0].full_name,
                            },
                        ]);
                    }
                }
            });
    };

    const setCoord = (lat, lon) => {
        if (locations.length > 0) {
            let remainingItems = [];
            locations.map((item, index) => {
                if (index == locations.length - 1) {
                    remainingItems.push({
                        latitude: lat,
                        longitude: lon,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                        title: item.title,
                        description: item.description,
                    });
                } else {
                    remainingItems.push(item);
                }
            });
            setLocations(remainingItems);
        } else {
            setLocations([
                {
                    latitude: lat,
                    longitude: lon,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                    title: item.title,
                    description: item.description,
                },
            ]);
        }
    };

    useEffect(() => {
        const abortController = new AbortController();
        const getData = setTimeout(() => {
            if (searchText.length > 2) {
                arama(searchText);
            } else {
                clearTimeout(getData);
            }
        }, 500);

        return () => {
            abortController.abort();
            clearTimeout(getData);
        };
    }, [searchText]);

    const arama = (text) => {
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        axios
            .get(
                'https://catalog.api.2gis.com/3.0/items?q=' +
                    text +
                    '&key=runnmp5276&locale=uz_UZ&fields=items.full_name,items.point,items.locale,items.full_address_name&sort=distance&location=' +
                    data.app.currentLocation[0] +
                    ',' +
                    data.app.currentLocation[1],
            )
            .then((response) => {
                if (response.data.result) {
                    setResult(response.data.result.items);
                }
            })
            .catch((error) => {
                setResult([]);
            });
    };
    const [region, setRegion] = React.useState({
        latitude: data.app.currentLocation[0],
        longitude: data.app.currentLocation[1],
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    });
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
                        showsTraffic
                        loadingEnabled
                        onUserLocationChange={(ret) => {
                            dispatch({
                                type: 'loc',
                                payload: [
                                    ret.nativeEvent.coordinate.latitude,
                                    ret.nativeEvent.coordinate.longitude,
                                ],
                            });
                            setRegion({
                                latitude: ret.nativeEvent.coordinate.latitude,
                                longitude: ret.nativeEvent.coordinate.longitude,
                                latitudeDelta: 0.005,
                                longitudeDelta: 0.005,
                            });
                        }}
                        onMapReady={() => {
                            setLocations([
                                {
                                    latitude: data.app.currentLocation[0],
                                    longitude: data.app.currentLocation[1],
                                    latitudeDelta: 0.005,
                                    longitudeDelta: 0.005,
                                },
                            ]);
                            getLocationName(
                                data.app.currentLocation[0],
                                data.app.currentLocation[1],
                            );
                            apiPost('getPrices', {
                                lang: data.app.lang,
                                token: data.auth.userToken,
                            }).then((response) => {
                                setDATA(response.data.response);
                            });
                        }}
                        onRegionChange={(ret, sta) => {
                            if (markerMove) {
                                setMove(true);
                                setH({
                                    ust: 5,
                                    alt: 0,
                                });
                                if (sta.isGesture == true) {
                                    setCoord(ret.latitude, ret.longitude);
                                }
                            }
                        }}
                        onRegionChangeComplete={(ret, sta) => {
                            if (markerMove) {
                                if (sta.isGesture == true) {
                                    getLocationName(ret.latitude, ret.longitude);
                                }
                                setH({
                                    ust: 3,
                                    alt: 2,
                                });
                            }
                            setMove(false);
                        }}>
                        {locations.map((item, index) => {
                            return (
                                <Marker
                                    identifier={'Marker_' + index}
                                    key={index}
                                    coordinate={item}
                                    title={item.title}
                                    description={item.description}
                                />
                            );
                        })}
                        {!move && locations.length >= 2 ? (
                            <MapViewDirections
                                origin={locations[0]}
                                waypoints={
                                    locations.length > 2 ? locations.slice(1, -1) : undefined
                                }
                                destination={locations[locations.length - 1]}
                                apikey={config.mapApi}
                                strokeWidth={5}
                                strokeColor="#0f365e"
                                optimizeWaypoints={true}
                                onReady={(result) => {
                                    // console.log('steps = ', result.legs[0].steps);
                                    // console.log(
                                    //     'traffic_speed_entry = ',
                                    //     result.legs[0].traffic_speed_entry,
                                    // );
                                    // console.log('via_waypoint = ', result.legs[0].via_waypoint);
                                    setDuration(result.legs[0].duration.value);
                                    setDistance(result.legs[0].distance.value);
                                }}
                                onError={(errorMessage) => {
                                    // console.log('GOT AN ERROR');
                                }}
                            />
                        ) : null}
                    </MapView>
                </View>
                <View style={[tw`h-${h.alt}/5 p-4`]}>
                    <View
                        style={[
                            tw`flex-row items-center justify-between px-4`,
                            {position: 'absolute', top: -48, left: 0, right: 0},
                        ]}>
                        <View style={[tw`flex-row`]}>
                            <TouchableOpacity
                                onPress={() => {
                                    setLocations([]);
                                    getLocationName(
                                        data.app.currentLocation[0],
                                        data.app.currentLocation[1],
                                    );
                                }}
                                style={[tw`rounded-md p-2`, stil('bg', data.app.theme)]}>
                                <MaterialCommunityIcons
                                    name="restart"
                                    size={24}
                                    color={stil('text', data.app.theme).color}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    harita.current.getCamera().then((c) => {
                                        harita.current.setCamera({
                                            zoom: c.zoom - 1,
                                        });
                                    });
                                }}
                                style={[tw`rounded-md p-2 ml-2`, stil('bg', data.app.theme)]}>
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
                                style={[tw`rounded-md p-2 ml-2`, stil('bg', data.app.theme)]}>
                                <MaterialCommunityIcons
                                    name="plus"
                                    size={24}
                                    color={stil('text', data.app.theme).color}
                                />
                            </TouchableOpacity>
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
                                style={[tw`rounded-md p-2 mr-2`, stil('bg', data.app.theme)]}>
                                <MaterialCommunityIcons
                                    name="image-filter-center-focus"
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
                                                latitudeDelta: 0.015,
                                                longitudeDelta: 0.015,
                                            },
                                            {
                                                latitude:
                                                    parseFloat(data.app.currentLocation[0]) +
                                                    0.0005,
                                                longitude:
                                                    parseFloat(data.app.currentLocation[1]) +
                                                    0.0005,
                                                latitudeDelta: 0.015,
                                                longitudeDelta: 0.015,
                                            },
                                            {
                                                latitude:
                                                    parseFloat(data.app.currentLocation[0]) -
                                                    0.0005,
                                                longitude:
                                                    parseFloat(data.app.currentLocation[1]) -
                                                    0.0005,
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
                        <TextInput
                            placeholder={l[data.app.lang].findguzergah}
                            placeholderTextColor={stil('text', data.app.theme).color}
                            style={[
                                tw`h-12 px-2 rounded-md w-full`,
                                stil('text', data.app.theme),
                                stil('bg2', data.app.theme),
                            ]}
                            onChangeText={(text) => {
                                if (text.length < 3) {
                                    setResult([]);
                                }
                                setSearchText(text);
                            }}
                            onFocus={() => {
                                setH({
                                    ust: 1,
                                    alt: 4,
                                });
                            }}
                            onSubmitEditing={() => {
                                setH({
                                    ust: 3,
                                    alt: 2,
                                });
                                Keyboard.dismiss();
                            }}
                            value={searchText}
                        />
                        <TouchableOpacity
                            style={[
                                {
                                    position: 'absolute',
                                    zIndex: 1,
                                    top: 0,
                                    bottom: 0,
                                    right: 0,
                                },
                                stil('bg', data.app.theme),
                                tw`rounded-md h-10 w-10 mt-1 mr-1 p-1 items-center justify-center`,
                            ]}
                            onPress={() => {
                                if (locations.length > 0) {
                                    Keyboard.dismiss();
                                    setH({
                                        ust: 3,
                                        alt: 2,
                                    });
                                    setMarkerMove(true);
                                    getLocationName(
                                        parseFloat(
                                            parseFloat(locations[locations.length - 1].latitude) +
                                                0.0002222222222,
                                        ),
                                        parseFloat(
                                            parseFloat(locations[locations.length - 1].longitude) +
                                                0.0002222222222,
                                        ),
                                        true,
                                    );
                                } else {
                                    setLocations([
                                        {
                                            latitude: data.app.currentLocation[0],
                                            longitude: data.app.currentLocation[1],
                                            latitudeDelta: 0.005,
                                            longitudeDelta: 0.005,
                                            title: '',
                                            description: '',
                                        },
                                    ]);
                                }
                            }}>
                            <MaterialCommunityIcons
                                name="plus"
                                size={24}
                                color={stil('text', data.app.theme).color}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={[tw`flex items-start justify-start`]}>
                        {result.map((item, index) => {
                            return (
                                <View key={index} style={[tw``]}>
                                    {index < 5 ? (
                                        <>
                                            {item.point ? (
                                                <View
                                                    key={index}
                                                    style={[tw`flex-row items-center`]}>
                                                    <View style={tw`flex-row items-center`}>
                                                        <MaterialCommunityIcons
                                                            name="map-marker-plus"
                                                            size={20}
                                                            color={
                                                                data.app.theme == 'dark'
                                                                    ? '#f9f9f7'
                                                                    : '#255382'
                                                            }
                                                        />
                                                        <View
                                                            style={[
                                                                tw`flex-row items-start ml-2 py-1`,
                                                            ]}>
                                                            <TouchableOpacity
                                                                onPress={() => {
                                                                    setLocations([
                                                                        ...locations,
                                                                        {
                                                                            title: item.name,
                                                                            latitude:
                                                                                item.point.lat,
                                                                            longitude:
                                                                                item.point.lon,
                                                                            description:
                                                                                item.full_address_name
                                                                                    ? item.full_address_name
                                                                                    : '' +
                                                                                      (item.purpose_name
                                                                                          ? '- ' +
                                                                                            item.purpose_name
                                                                                          : ''),
                                                                        },
                                                                    ]);
                                                                    setMarkerMove(false);
                                                                    setResult([]);
                                                                    setSearchText('');

                                                                    Keyboard.dismiss();
                                                                    setH({
                                                                        ust: 3,
                                                                        alt: 2,
                                                                    });
                                                                }}>
                                                                <View
                                                                    style={tw`flex justify-between`}>
                                                                    <Text
                                                                        style={[
                                                                            tw` font-semibold`,
                                                                            stil(
                                                                                'text',
                                                                                data.app.theme,
                                                                            ),
                                                                        ]}>
                                                                        {item.name}
                                                                    </Text>

                                                                    <Text
                                                                        style={[
                                                                            tw`text-xs`,
                                                                            stil(
                                                                                'text',
                                                                                data.app.theme,
                                                                            ),
                                                                        ]}>
                                                                        {item.full_address_name ? (
                                                                            <>
                                                                                {
                                                                                    item.full_address_name
                                                                                }
                                                                                {item.purpose_name
                                                                                    ? '- ' +
                                                                                      item.purpose_name
                                                                                    : ''}
                                                                            </>
                                                                        ) : (
                                                                            ''
                                                                        )}
                                                                    </Text>
                                                                </View>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                </View>
                                            ) : (
                                                ''
                                            )}
                                        </>
                                    ) : null}
                                </View>
                            );
                        })}
                    </View>
                    <ScrollView>
                        {locations.map((item, index) => {
                            return (
                                <View
                                    key={index}
                                    style={[
                                        tw`flex-row items-center justify-between rounded-md  mt-1.5 p-1`,
                                        stil('bg2', data.app.theme),
                                    ]}>
                                    <View style={[tw`flex-row items-center justify-start `]}>
                                        <Text
                                            style={[
                                                tw`w-2 font-bold`,
                                                stil('text', data.app.theme),
                                            ]}>
                                            {index + 1}
                                        </Text>
                                        <MaterialCommunityIcons
                                            style={[tw`text-center mr-2`]}
                                            name="map-marker"
                                            size={24}
                                            color={stil('text', data.app.theme).color}
                                        />
                                        <View style={[tw`w-[80%]`]}>
                                            <Text
                                                style={[
                                                    tw`text-xs font-medium`,
                                                    {fontSize: 12},
                                                    stil('text', data.app.theme),
                                                ]}>
                                                {item.title}
                                            </Text>
                                            <Text
                                                style={[
                                                    tw`text-xs font-light pr-8`,
                                                    {fontSize: 12},
                                                    stil('text', data.app.theme),
                                                ]}>
                                                {item.description}
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        style={tw``}
                                        onPress={() => {
                                            let remainingItems = locations.filter(
                                                (item2, index2) => {
                                                    return index2 !== index;
                                                },
                                            );
                                            setLocations(remainingItems);
                                            setDuration(0);
                                            setDistance(0);
                                        }}>
                                        <MaterialCommunityIcons
                                            name="delete"
                                            size={24}
                                            color={stil('text', data.app.theme).color}
                                        />
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </ScrollView>
                    <View style={[tw`flex items-start justify-start mt-2 mb-2`]}>
                        <TouchableOpacity
                            disabled={data.trip.tripRequest === null ? false : true}
                            onPress={() => {
                                if (locations.length > 0) {
                                    setFindModal(true);
                                } else {
                                    alert(l[data.app.lang].enaz);
                                }
                            }}
                            style={[
                                tw`h-12 w-full flex-row items-center justify-between px-12 rounded-md `,
                                stil('bg2', data.app.theme),
                            ]}>
                            <Text style={[stil('text', data.app.theme), tw`text-xs`]}>
                                {(duration / 60).toFixed(2)} min
                            </Text>

                            <Text style={[stil('text', data.app.theme), tw`text-xs`]}>
                                {(distance / 1000).toFixed(2)} km
                            </Text>
                            <Text style={[tw`text-center text-white font-medium`]}>
                                {l[data.app.lang].start}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={findModal}
                onRequestClose={() => {
                    setFindModal(!findModal);
                }}>
                <View style={[tw`h-1/1 flex justify-end`, {backgroundColor: 'rgba(0,0,0,0.55)'}]}>
                    <View style={[tw`flex pb-6 pt-2 justify-end px-4`, stil('bg', data.app.theme)]}>
                        <Text style={[stil('text', data.app.theme), tw`text-center`]}>
                            {l[data.app.lang].selectCarType}
                        </Text>
                        <View>
                            {DATA.map((item, index) => {
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[tw`w-full`]}
                                        onPress={() => {
                                            setFindModal(false);
                                            dispatch({type: 'setTripFind', payload: true});
                                            setCars({
                                                id: item.id,
                                                type: item.car_type,
                                                title: item.title,
                                                description: item.alt,
                                                price:
                                                    Math.ceil(
                                                        (parseFloat(item.start) +
                                                            parseFloat(item.km) *
                                                                Math.ceil(distance / 1000) -
                                                            (Math.ceil(distance / 1000) > 1
                                                                ? parseFloat(item.km)
                                                                : 0)) /
                                                            1000,
                                                    ) * 1000,
                                                km: item.km,
                                                start: item.start,
                                                paid: item.paid,
                                                fee: item.fee,
                                                image: item.image,
                                            });

                                            setNewTrip({
                                                id: item.id,
                                                type: item.car_type,
                                                title: item.title,
                                                description: item.alt,
                                                price:
                                                    Math.ceil(
                                                        (parseFloat(item.start) +
                                                            parseFloat(item.km) *
                                                                Math.ceil(distance / 1000) -
                                                            (Math.ceil(distance / 1000) > 1
                                                                ? parseFloat(item.km)
                                                                : 0)) /
                                                            1000,
                                                    ) * 1000,
                                                km: item.km,
                                                start: item.start,
                                                paid: item.paid,
                                                fee: item.fee,
                                                image: item.image,
                                            });
                                        }}>
                                        <View
                                            style={[
                                                tw` px-4 my-1 py-3 rounded-md flex-row justify-between`,
                                                stil('bg2', data.app.theme),
                                            ]}>
                                            <View
                                                style={[tw`flex-row justify-between items-center`]}>
                                                <Image
                                                    source={{
                                                        uri: config.imageBaseUrl + item.image,
                                                    }}
                                                    style={tw`h-20 w-40`}
                                                    resizeMode="contain"
                                                />
                                                <View>
                                                    <Text
                                                        style={[
                                                            tw` font-semibold`,
                                                            stil('text', data.app.theme),
                                                        ]}>
                                                        {item.title}
                                                    </Text>
                                                    <Text
                                                        style={[
                                                            tw``,
                                                            stil('text', data.app.theme),
                                                        ]}>
                                                        {Math.ceil(
                                                            (parseFloat(item.start) +
                                                                parseFloat(item.km) *
                                                                    Math.ceil(distance / 1000) -
                                                                (Math.ceil(distance / 1000) > 1
                                                                    ? parseFloat(item.km)
                                                                    : 0)) /
                                                                1000,
                                                        ) * 1000}{' '}
                                                        sum
                                                    </Text>
                                                    <Text
                                                        style={[
                                                            tw`text-center font-bold`,
                                                            stil('text', data.app.theme),
                                                        ]}>
                                                        {l[data.app.lang].find_car}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <TouchableOpacity
                            disabled={data.trip.tripRequest === null ? false : true}
                            onPress={() => {
                                setFindModal(false);
                            }}
                            style={[
                                tw`h-12 mt-1 w-full items-center justify-center rounded-md `,
                                stil('bg2', data.app.theme),
                            ]}>
                            <Text style={[tw`text-center text-white font-medium`]}>
                                {l[data.app.lang].back}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={data.trip.tripFind}
                onRequestClose={() => {
                    dispatch({type: 'setTripFind', payload: false});
                }}>
                <View style={[tw`h-1/1 flex justify-end`, {backgroundColor: 'rgba(0,0,0,0.55)'}]}>
                    <View style={[tw`flex pb-6 pt-2 justify-end px-4`, stil('bg', data.app.theme)]}>
                        <View
                            style={[
                                tw`  items-center justify-center`,
                                {backgroundColor: 'rgba(0,0,0,0.55)'},
                            ]}>
                            <View
                                style={[
                                    tw`w-full flex items-center justify-end  p-2`,
                                    stil('bg', data.app.theme),
                                ]}>
                                <View style={[tw`  w-full`]}>
                                    <Text
                                        style={[
                                            tw`font-semibold text-center text-base my-2`,
                                            stil('text', data.app.theme),
                                        ]}>
                                        {l[data.app.lang].uaa}
                                    </Text>
                                    {cars ? (
                                        <View style={[tw`flex `]}>
                                            <View
                                                style={[
                                                    tw`flex-row items-center mx-4 justify-between`,
                                                ]}>
                                                <View>
                                                    <Text
                                                        style={[
                                                            stil('text', data.app.theme),
                                                            tw`font-semibold mb-1`,
                                                        ]}>
                                                        {cars.title}
                                                    </Text>
                                                    <Text
                                                        style={[
                                                            stil('text', data.app.theme),
                                                            tw`font-semibold mb-1`,
                                                        ]}>
                                                        {cars.price} sum
                                                    </Text>
                                                    <Text
                                                        style={[
                                                            stil('text', data.app.theme),
                                                            tw`font-semibold mb-1`,
                                                        ]}>
                                                        {Math.ceil(distance / 1000)}{' '}
                                                        {l[data.app.lang].minute}
                                                    </Text>
                                                    <Text
                                                        style={[
                                                            stil('text', data.app.theme),
                                                            tw`font-semibold mb-1`,
                                                        ]}>
                                                        {Math.ceil(duration / 60)}{' '}
                                                        {l[data.app.lang].kilometer}
                                                    </Text>
                                                </View>
                                                <Image
                                                    source={{uri: config.imageBaseUrl + cars.image}}
                                                    style={[
                                                        tw`h-16 w-4/5`,
                                                        {transform: [{rotateY: '180deg'}]},
                                                    ]}
                                                    resizeMode="contain"
                                                />
                                            </View>
                                            <ActivityIndicator
                                                size="large"
                                                color={stil('text', data.app.theme).color}
                                                style={[tw`my-4`]}
                                            />
                                        </View>
                                    ) : null}
                                </View>
                                <TouchableOpacity
                                    style={[
                                        tw`flex-row items-center justify-center p-4 rounded-md w-full`,
                                        {
                                            backgroundColor:
                                                data.app.theme == 'dark' ? '#255382' : '#f1f1f1',
                                        },
                                    ]}
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
                                                    text: l[data.app.lang].check,
                                                    onPress: () => {
                                                        // deleteTrip();
                                                        dispatch({
                                                            type: 'setTripFind',
                                                            payload: false,
                                                        });
                                                        apiPost('removeActiveTrip', {
                                                            lang: data.app.lang,
                                                            token: data.auth.userToken,
                                                            id: data.auth.userId,
                                                            user_type: data.auth.userType,
                                                        });
                                                    },
                                                },
                                            ],
                                            {cancelable: false},
                                        );
                                    }}>
                                    <MaterialCommunityIcons
                                        name="cancel"
                                        size={16}
                                        color={stil('text', data.app.theme).color}
                                    />
                                    <Text
                                        style={[
                                            tw`font-semibold ml-2`,
                                            stil('text', data.app.theme),
                                        ]}>
                                        {l[data.app.lang].cancel}
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
