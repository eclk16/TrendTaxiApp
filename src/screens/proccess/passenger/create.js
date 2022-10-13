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
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import Geolocation from '@react-native-community/geolocation';
//burayafont yükle gelecek

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
        })
            .then(() => {})
            .catch((error) => {
                console.log('PASSENGERCREATE.JS ERROR (ADD TRİP)', error);
            });
    };

    useEffect(() => {
        console.log(locations.length, locations);
    }, [locations]);

    const getLocationName = (lat, lon, ekle = false, sifirla = false) => {
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        axios
            .get(
                'https://nominatim.openstreetmap.org/reverse.php?lat=' +
                    lat +
                    '&lon=' +
                    lon +
                    '&zoom=18&format=jsonv2',
            )
            .then((response) => {
                if (response.data) {
                    if (locations.length > 0 && !sifirla) {
                        if (ekle) {
                            setLocations([
                                ...locations,
                                {
                                    latitude: lat,
                                    longitude: lon,
                                    latitudeDelta: 0.005,
                                    longitudeDelta: 0.005,
                                    title: response.data.name,
                                    description: response.data.display_name,
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
                                        title: response.data.name,
                                        description: response.data.display_name,
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
                                title: response.data.name,
                                description: response.data.display_name,
                            },
                        ]);
                    }
                }
            })
            .catch((e) => {
                setLocations([
                    {
                        latitude: lat,
                        longitude: lon,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                        title: '',
                        description: '',
                    },
                ]);
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
                'https://nominatim.openstreetmap.org/search.php?q=' +
                    text +
                    '&accept-language=' +
                    (data.app.lang == 'gb' ? 'en' : data.app.lang) +
                    '&limit=5&polygon_threshold=0&format=jsonv2&addressdetails=1',
            )
            .then((response) => {
                if (response.data) {
                    setResult(response.data);
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
        first: false,
    });

    useEffect(() => {
        let pint = setInterval(() => {
            if (data.app.drivers.length > 0) {
                let p = data.app.drivers;
                p.shift();
                dispatch({type: 'setDrivers', payload: p});
            }
        }, 15000);

        return () => {
            clearInterval(pint);
        };
    }, [data.app.drivers]);

    const [wichCar, setWichCar] = React.useState(0);
    const [aramaModal, setAramaModal] = React.useState(false);

    const fitCoord = (cord = null) => {
        if (cord !== null) {
            harita.current.fitToCoordinates(cord, {
                edgePadding: {
                    top: 100,
                    right: 100,
                    bottom: 100,
                    left: 100,
                },
                animated: true,
            });
        } else {
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
    };

    useEffect(() => {
        if (!region.first || locations.length == 0) {
            if (data.app.currentLocation.length > 0) {
                setRegion({
                    latitude: data.app.currentLocation[0],
                    longitude: data.app.currentLocation[1],
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                    first: true,
                });

                setLocations([
                    {
                        latitude: data.app.currentLocation[0],
                        longitude: data.app.currentLocation[1],
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    },
                ]);
                getLocationName(data.app.currentLocation[0], data.app.currentLocation[1]);
            }
        }

        return () => {
            false;
        };
    }, [data.app.currentLocation]);

    const watchPosition = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                dispatch({
                    type: 'loc',
                    payload: [position.coords.latitude, position.coords.longitude],
                });
            },
            (error) => {
                // Alert.alert('WatchPosition Error', JSON.stringify(error))
            },
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0,
            },
        );
        const PassengerCreateWP = Geolocation.watchPosition(
            (position) => {
                dispatch({
                    type: 'loc',
                    payload: [position.coords.latitude, position.coords.longitude],
                });
            },
            (error) => {
                // Alert.alert('WatchPosition Error', JSON.stringify(error))
            },
            {enableHighAccuracy: true, timeout: 20000, maximumAge: 0, distanceFilter: 2},
        );
        setSubscriptionId(PassengerCreateWP);
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

    const [moved, setMoved] = React.useState(false);
    const [isZoom, setIsZoom] = React.useState(0);
    return (
        <>
            <View style={[{flex: 1}, stil('bg', data.app.theme)]}>
                <View style={[tw`h-${h.ust}/5`]}>
                    {data.app.currentLocation.length > 0 ? (
                        <MapView
                            ref={harita}
                            provider={PROVIDER_GOOGLE}
                            region={region}
                            initialRegion={region}
                            showsUserLocation
                            zoomEnabled={true}
                            enableZoomControl={true}
                            showsMyLocationButton={false}
                            showsTraffic
                            onMapReady={() => {
                                apiPost('getPrices', {
                                    lang: data.app.lang,
                                    token: data.auth.userToken,
                                })
                                    .then((response) => {
                                        setDATA(response.data.response);
                                    })
                                    .catch((error) => {
                                        console.log('PASSENGERCREATE.JS ERROR (GET PRİCES)', error);
                                    });
                            }}
                            onRegionChange={(ret, sta) => {
                                if (markerMove) {
                                    if (sta.isGesture == true) {
                                        harita.current.getCamera().then((ret2) => {
                                            if (isZoom == ret2.zoom) {
                                                setMoved(true);
                                                setMove(true);
                                            }
                                            setIsZoom(ret2.zoom);
                                        });
                                    }
                                }
                            }}
                            onRegionChangeComplete={(ret, sta) => {
                                if (markerMove) {
                                    if (sta.isGesture == true) {
                                        setCoord(ret.latitude, ret.longitude);
                                        getLocationName(ret.latitude, ret.longitude);
                                    }
                                }
                                setMove(false);
                                setMoved(false);
                            }}
                            style={[tw`flex-1 items-center justify-center`]}>
                            {!moved ? (
                                <>
                                    {locations.map((item) => {
                                        return (
                                            <Marker
                                                key={item.latitude}
                                                coordinate={item}
                                                title={item.title}
                                                description={item.description}>
                                                <Image
                                                    source={require('../../../assets/img/marker-2.png')}
                                                    style={[tw`w-6 h-12 `]}
                                                />
                                            </Marker>
                                        );
                                    })}

                                    {!move && locations.length >= 2 ? (
                                        <MapViewDirections
                                            language={data.app.lang == 'gb' ? 'en' : data.app.lang}
                                            optimizeWaypoints={true}
                                            origin={locations[0]}
                                            waypoints={
                                                locations.length > 2
                                                    ? locations.slice(1, -1)
                                                    : undefined
                                            }
                                            destination={locations[locations.length - 1]}
                                            apikey={config.mapApi}
                                            strokeWidth={5}
                                            strokeColor="#0f365e"
                                            onReady={(result) => {
                                                setDuration(result.legs[0].duration.value);
                                                setDistance(result.legs[0].distance.value);
                                            }}
                                        />
                                    ) : null}
                                </>
                            ) : null}

                            <Image
                                source={require('../../../assets/img/marker-full-2.png')}
                                style={[
                                    {
                                        height: moved ? 100 : 0,
                                        width: moved ? 50 : 0,

                                        opacity: moved ? 100 : 0,
                                    },
                                ]}
                            />
                        </MapView>
                    ) : null}
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
                                    getLocationName(
                                        data.app.currentLocation[0],
                                        data.app.currentLocation[1],
                                        false,
                                        true,
                                    );
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
                                    name="restart"
                                    size={24}
                                    color={stil('text', data.app.theme).color}
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={[tw`flex-row`]}>
                            <TouchableOpacity
                                onPress={() => {
                                    if (locations.length > 0) {
                                        fitCoord();
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
                                    if (locations.length < 2) {
                                        getLocationName(
                                            data.app.currentLocation[0],
                                            data.app.currentLocation[1],
                                            false,
                                            true,
                                        );
                                    }
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
                                setAramaModal(true);
                            }}
                            style={[
                                tw`h-12 px-2 rounded-md w-full items-start justify-center flex`,

                                stil('bg2', data.app.theme),
                            ]}>
                            <Text style={[stil('text', data.app.theme)]}>
                                {l[data.app.lang].findguzergah}
                            </Text>
                        </TouchableOpacity>
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
                                Keyboard.dismiss();
                                if (locations.length > 0) {
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
                                    fitCoord([
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
                                name="map-marker"
                                size={24}
                                color={stil('text', data.app.theme).color}
                            />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={[tw`mb-4`]}>
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
                                                tw`w-2 font-bold ml-1`,
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
                                    {index != 0 ? (
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
                                                setMarkerMove(true);
                                                fitCoord(remainingItems);
                                            }}>
                                            <MaterialCommunityIcons
                                                name="delete"
                                                size={24}
                                                color={stil('text', data.app.theme).color}
                                            />
                                        </TouchableOpacity>
                                    ) : null}
                                </View>
                            );
                        })}
                    </ScrollView>
                    <View>
                        <GestureRecognizer
                            onSwipeLeft={(state) => {
                                if (wichCar != DATA.length - 1) {
                                    setWichCar(wichCar + 1);
                                }
                            }}
                            onSwipeRight={(state) => {
                                if (wichCar != 0) {
                                    setWichCar(wichCar - 1);
                                }
                            }}
                            config={{
                                velocityThreshold: 0.3,
                                directionalOffsetThreshold: 80,
                            }}
                            style={[tw`flex-row items-start justify-start mb-6`]}>
                            {DATA.map((item, index) => {
                                return (
                                    <View
                                        key={index}
                                        style={[
                                            tw``,
                                            {
                                                display: wichCar == index ? 'flex' : 'none',
                                            },
                                        ]}>
                                        <View
                                            style={[
                                                tw` px-2 py-1 rounded-md flex-row justify-between`,
                                                stil('bg2', data.app.theme),
                                            ]}>
                                            <View
                                                style={[
                                                    tw`flex-row w-full justify-between items-center`,
                                                ]}>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        if (wichCar != 0) {
                                                            setWichCar(wichCar - 1);
                                                        }
                                                    }}
                                                    style={[
                                                        tw`p-2 border-r`,
                                                        {
                                                            borderColor: stil('bg', data.app.theme)
                                                                .backgroundColor,
                                                        },
                                                    ]}>
                                                    <MaterialCommunityIcons
                                                        name="arrow-left-drop-circle"
                                                        size={40}
                                                        color={stil('text', data.app.theme).color}
                                                    />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[
                                                        tw`flex-row items-center justify-between rounded-md px-2`,
                                                    ]}
                                                    onPress={() => {
                                                        setFindModal(false);
                                                        dispatch({
                                                            type: 'setTripFind',
                                                            payload: true,
                                                        });
                                                        setCars({
                                                            id: item.id,
                                                            type: item.car_type,
                                                            title: item.title,
                                                            description: item.alt,
                                                            price:
                                                                Math.ceil(
                                                                    (parseFloat(item.start) +
                                                                        parseFloat(item.km) *
                                                                            Math.ceil(
                                                                                distance / 1000,
                                                                            ) -
                                                                        (Math.ceil(
                                                                            distance / 1000,
                                                                        ) > 1
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
                                                                            Math.ceil(
                                                                                distance / 1000,
                                                                            ) -
                                                                        (Math.ceil(
                                                                            distance / 1000,
                                                                        ) > 1
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
                                                    <Image
                                                        source={{
                                                            uri: config.imageBaseUrl + item.image,
                                                        }}
                                                        style={tw`h-15 w-30`}
                                                        resizeMode="contain"
                                                    />
                                                    <View style={[tw`flex justify-center`]}>
                                                        <Text
                                                            style={[
                                                                tw` font-semibold text-base`,
                                                                stil('text', data.app.theme),
                                                            ]}>
                                                            {item.title}
                                                        </Text>
                                                        <Text
                                                            style={[
                                                                tw`text-base`,
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
                                                    </View>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        if (wichCar != DATA.length - 1) {
                                                            setWichCar(wichCar + 1);
                                                        }
                                                    }}
                                                    style={[
                                                        tw`p-2 border-l`,
                                                        {
                                                            borderColor: stil('bg', data.app.theme)
                                                                .backgroundColor,
                                                        },
                                                    ]}>
                                                    <MaterialCommunityIcons
                                                        name="arrow-right-drop-circle"
                                                        size={40}
                                                        color={stil('text', data.app.theme).color}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </GestureRecognizer>
                    </View>
                </View>
            </View>

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
                                                style={[tw`flex items-center mx-4 justify-start`]}>
                                                <Image
                                                    source={{uri: config.imageBaseUrl + cars.image}}
                                                    style={[
                                                        tw`h-40 w-60 `,
                                                        // {transform: [{rotateY: '180deg'}]},
                                                    ]}
                                                    resizeMode="contain"
                                                />
                                                <View
                                                    style={[
                                                        tw` w-full flex-row items-center justify-between`,
                                                    ]}>
                                                    <Text
                                                        style={[
                                                            stil('text', data.app.theme),
                                                            tw`font-bold text-3xl `,
                                                        ]}>
                                                        {cars.title}
                                                    </Text>
                                                    <Text
                                                        style={[
                                                            stil('text', data.app.theme),
                                                            tw`font-bold text-3xl`,
                                                        ]}>
                                                        {cars.price} sum
                                                    </Text>
                                                </View>
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
            <Modal
                animationType="slide"
                transparent={true}
                visible={aramaModal}
                onRequestClose={() => {
                    setAramaModal(false);
                }}>
                <View style={[tw`flex-1 py-24 px-4`, stil('bg', data.app.theme)]}>
                    <View>
                        <TextInput
                            placeholder={l[data.app.lang].findguzergah}
                            placeholderTextColor={stil('text', data.app.theme).color}
                            style={[
                                tw`h-12 px-2 rounded-md w-full`,
                                stil('text', data.app.theme),
                                stil('bg2', data.app.theme),
                            ]}
                            autoFocus
                            onChangeText={(text) => {
                                if (text.length < 3) {
                                    setResult([]);
                                }
                                setSearchText(text);
                            }}
                            onFocus={() => {}}
                            onSubmitEditing={() => {
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
                                Keyboard.dismiss();
                                if (locations.length > 0) {
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
                                    fitCoord([
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
                                setAramaModal(false);
                            }}>
                            <MaterialCommunityIcons
                                name="map-marker"
                                size={24}
                                color={stil('text', data.app.theme).color}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={[tw`flex items-start justify-start`]}>
                        {result.map((item, index) => {
                            return (
                                <View key={index} style={[tw``]}>
                                    <View key={index} style={[tw`flex-row items-center`]}>
                                        <View
                                            style={[
                                                tw`flex-row items-center py-1 rounded-md w-full my-1 px-4`,
                                                stil('bg2', data.app.theme),
                                            ]}>
                                            <Image
                                                source={{uri: item.icon}}
                                                style={[tw`w-8 h-8`]}
                                            />
                                            <View style={[tw`flex-row  items-start ml-2 py-1`]}>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setLocations([
                                                            ...locations,
                                                            {
                                                                title: item.display_name.split(
                                                                    ',',
                                                                )[0],
                                                                description: item.display_name,
                                                                latitude: parseFloat(item.lat),
                                                                longitude: parseFloat(item.lon),
                                                            },
                                                        ]);
                                                        setMarkerMove(false);
                                                        setResult([]);
                                                        setSearchText('');

                                                        Keyboard.dismiss();

                                                        setAramaModal(false);
                                                    }}>
                                                    <View style={tw`flex justify-between`}>
                                                        <Text
                                                            style={[
                                                                tw`font-bold`,
                                                                stil('text', data.app.theme),
                                                            ]}>
                                                            {item.display_name.split(',')[0]}
                                                        </Text>
                                                        <Text
                                                            style={[
                                                                tw`text-xs`,
                                                                stil('text', data.app.theme),
                                                            ]}>
                                                            {item.display_name}
                                                        </Text>
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                    <TouchableOpacity
                        style={[
                            tw`flex-row items-center justify-center p-4 mt-4 rounded-md w-full`,
                            {
                                backgroundColor: data.app.theme == 'dark' ? '#255382' : '#f1f1f1',
                            },
                        ]}
                        onPress={() => {
                            Keyboard.dismiss();
                            setAramaModal(false);
                        }}>
                        <MaterialCommunityIcons
                            name="cancel"
                            size={16}
                            color={stil('text', data.app.theme).color}
                        />
                        <Text style={[tw`font-semibold ml-2`, stil('text', data.app.theme)]}>
                            {l[data.app.lang].cancel}
                        </Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </>
    );
}
