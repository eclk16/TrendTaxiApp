import React, {useEffect} from 'react';
import {
    Text,
    View,
    FlatList,
    Image,
    TouchableOpacity,
    Modal,
    Alert,
    Keyboard,
    Dimensions,
    Platform,
} from 'react-native';
import config from '../../app.json';
import {useSelector, useDispatch} from 'react-redux';
import BottomSheet, {
    useBottomSheetDynamicSnapPoints,
    BottomSheetView,
    BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import tw from 'twrnc';
import {stil} from '../../utils';
import l from '../../languages.json';
import {apiPost} from '../../axios';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import Geolocation from '@react-native-community/geolocation';
import {ActivityIndicator} from 'react-native';
import {setValue} from '../../async';
import MapView, {PROVIDER_GOOGLE, Marker, Polygon} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

MaterialCommunityIcons.loadFont();

function Passenger() {
    const data = useSelector((state) => state);
    const dispatch = useDispatch();
    const bottomSheetRef = React.useRef(null);
    const harita = React.useRef(null);
    const initialSnapPoints = React.useMemo(() => ['CONTENT_HEIGHT'], []);

    const [cars, setCars] = React.useState({});
    const [searchText, setSearchText] = React.useState('');
    const [DATA, setDATA] = React.useState([]);
    const [result, setResult] = React.useState([]);
    const [questionModal, openQuestionModal] = React.useState(false);
    const [carModal, openCarModal] = React.useState(false);

    const [mapHeight, setMapHeight] = React.useState('100%');
    const {animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout} =
        useBottomSheetDynamicSnapPoints(initialSnapPoints);

    useEffect(() => {
        let val = animatedContentHeight.value;
        let windowHeight = Dimensions.get('window').height;
        setMapHeight(windowHeight - val);
    }, [animatedContentHeight]);

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
    };

    useEffect(() => {
        const abortController = new AbortController();
        getLocationName(data.app.currentLocation[0], data.app.currentLocation[1]);
        apiPost('getPrices', {
            lang: data.app.lang,
            token: data.auth.userToken,
        }).then((response) => {
            setDATA(response.data.response);
        });
        return () => {
            abortController.abort();
            false;
        };
    }, []);

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

    const getLocationName = (lat, lon) => {
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

    const [locations, setLocations] = React.useState([]);

    const [distance, setDistance] = React.useState(0);
    const [duration, setDuration] = React.useState(0);

    const [marker, setMarker] = React.useState({
        latitude: data.app.currentLocation[0],
        longitude: data.app.currentLocation[1],
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
        title: '',
        description: '',
    });
    const [haritaSurukle, setHaritaSurukle] = React.useState(false);

    const markerColor = ['green', 'red', 'blue', 'gray', 'yellow', 'purple'];

    return (
        <View style={{flex: 1}}>
            <View style={{height: mapHeight}}>
                <MapView
                    ref={harita}
                    // provider={PROVIDER_GOOGLE}
                    style={{flex: 1}}
                    region={locations[0] ?? null}
                    initialRegion={locations[0] ?? null}
                    showsUserLocation
                    zoomEnabled={true}
                    enableZoomControl={true}
                    // showsMyLocationButton
                    showsTraffic
                    loadingEnabled
                    onMapReady={() => {}}
                    onRegionChange={(ret, sta) => {
                        if (sta.isGesture == true) {
                            setHaritaSurukle(true);
                            setMarker(ret);
                        }
                    }}
                    onRegionChangeComplete={(ret, sta) => {
                        if (sta.isGesture == true) {
                            setHaritaSurukle(false);
                            getLocationName(ret.latitude, ret.longitude);
                        }
                    }}>
                    {locations.map((item, index) => {
                        return (
                            <Marker
                                identifier={'Marker_' + index}
                                key={index}
                                coordinate={item}
                                title={item.title}
                                description={item.description}
                                pinColor={markerColor[index]}
                            />
                        );
                    })}
                    {haritaSurukle ? (
                        <Marker
                            identifier={'surukleMarker'}
                            key={123}
                            coordinate={marker}
                            pinColor="cyan"
                        />
                    ) : null}

                    {locations.length >= 2 && (
                        <MapViewDirections
                            origin={locations[0]}
                            waypoints={locations.length > 2 ? locations.slice(1, -1) : undefined}
                            destination={locations[locations.length - 1]}
                            apikey={
                                Platform.OS == 'android' ? config.mapApiAndroid : config.mapApiIOS
                            }
                            strokeWidth={3}
                            strokeColor="hotpink"
                            optimizeWaypoints={true}
                            onStart={(params) => {
                                console.log(
                                    `Started routing between "${params.origin}" and "${params.destination}"`,
                                );
                            }}
                            onReady={(result) => {
                                console.log(`Distance: ${result.distance} km`);
                                console.log(`Duration: ${result.duration} min.`);
                            }}
                            onError={(errorMessage) => {
                                // console.log('GOT AN ERROR');
                            }}
                        />
                    )}
                </MapView>

                <View
                    style={[
                        tw`flex-row w-full px-4 mt-2 items-end justify-between`,
                        {
                            position: 'absolute',
                            bottom: 10,
                        },
                    ]}>
                    <TouchableOpacity
                        onPress={() => {
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
                        }}
                        style={[tw`rounded-md p-2`, stil('bg', data.app.theme)]}>
                        <MaterialCommunityIcons
                            name="restart"
                            size={24}
                            color={stil('text', data.app.theme).color}
                        />
                    </TouchableOpacity>
                    <View style={[tw`flex`]}>
                        <TouchableOpacity
                            onPress={() => {
                                if (locations.length > 0) {
                                    harita.current.fitToCoordinates(locations, {
                                        edgePadding: {top: 100, right: 100, bottom: 100, left: 100},
                                        animated: true,
                                    });
                                }
                            }}
                            style={[tw`rounded-md p-2 mb-2`, stil('bg', data.app.theme)]}>
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
                                        },
                                    ],
                                    {
                                        edgePadding: {top: 100, right: 100, bottom: 100, left: 100},
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
            </View>
            <BottomSheet
                ref={bottomSheetRef}
                snapPoints={animatedSnapPoints}
                handleHeight={animatedHandleHeight}
                contentHeight={animatedContentHeight}
                handleIndicatorStyle={[{display: 'none'}, tw`w-0 m-0 p-0`]}
                handleStyle={{display: 'none'}}
                keyboardBehavior="interactive"
                backgroundStyle={stil('bg', data.app.theme)}>
                <BottomSheetView onLayout={handleContentLayout}>
                    <View style={[tw`px-4 pb-8`]}>
                        <View>
                            <BottomSheetTextInput
                                placeholder={l[data.app.lang].findguzergah}
                                placeholderTextColor={stil('text', data.app.theme).color}
                                style={[
                                    tw`h-12 px-4 mt-4 rounded-md w-full`,
                                    stil('text', data.app.theme),
                                    stil('bg2', data.app.theme),
                                ]}
                                onChangeText={(text) => {
                                    if (text.length < 3) {
                                        setResult([]);
                                    }
                                    setSearchText(text);
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
                                    tw`rounded-md h-10 w-10 mt-1 mr-1 mt-5 p-1 items-center justify-center`,
                                ]}
                                onPress={() => {
                                    if (locations.length > 0) {
                                        Keyboard.dismiss();
                                        setLocations([
                                            ...locations,
                                            {
                                                latitude: parseFloat(
                                                    parseFloat(
                                                        locations[locations.length - 1].latitude,
                                                    ) + 0.0002222222222,
                                                ),
                                                longitude: parseFloat(
                                                    parseFloat(
                                                        locations[locations.length - 1].longitude,
                                                    ) + 0.0002222222222,
                                                ),
                                                latitudeDelta: 0.005,
                                                longitudeDelta: 0.005,
                                                title: '',
                                                description: '',
                                            },
                                        ]);
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
                        <View style={[tw`mb-2 mt-1`]}>
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
                                                                        setResult([]);
                                                                        setSearchText('');

                                                                        Keyboard.dismiss();
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
                        <View style={[tw``]}>
                            <FlatList
                                data={locations}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({item, index}) => {
                                    return (
                                        <View
                                            key={index}
                                            style={[
                                                tw`flex-row items-center justify-between rounded-md  mb-1 px-2 py-1`,
                                                stil('bg2', data.app.theme),
                                            ]}>
                                            <View
                                                style={[
                                                    tw`flex-row items-center justify-start w-5/6`,
                                                ]}>
                                                <Text
                                                    style={[
                                                        tw`w-2 font-semibold`,
                                                        stil('text', data.app.theme),
                                                    ]}>
                                                    {index + 1}
                                                </Text>
                                                <MaterialCommunityIcons
                                                    style={[tw`text-center mr-2`]}
                                                    name="map-marker"
                                                    size={16}
                                                    color={stil('text', data.app.theme).color}
                                                />
                                                <View>
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
                                                }}>
                                                <MaterialCommunityIcons
                                                    name="delete"
                                                    size={24}
                                                    color={stil('text', data.app.theme).color}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    );
                                }}
                            />
                        </View>
                        <View style={[tw`mt-2`, {flex: 1}]}>
                            <TouchableOpacity
                                onPress={() => {
                                    openCarModal(true);
                                }}
                                style={[
                                    tw`rounded-md py-2 items-center `,
                                    stil('bg2', data.app.theme),
                                ]}>
                                <Text
                                    style={[
                                        tw`text-base font-semibold`,
                                        stil('text', data.app.theme),
                                    ]}>
                                    Start
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </BottomSheetView>
            </BottomSheet>

            <Modal
                animationType="fade"
                transparent={true}
                visible={carModal}
                onRequestClose={() => {
                    openCarModal(!carModal);
                }}>
                <View
                    style={[
                        tw` flex-1 items-center justify-end pb-12`,
                        {backgroundColor: 'rgba(0,0,0,0.55)'},
                    ]}>
                    <View
                        style={[
                            tw` w-[90%] flex items-center justify-center rounded-md p-2`,
                            stil('bg', data.app.theme),
                        ]}>
                        <FlatList
                            data={DATA}
                            scrollEnabled={true}
                            keyExtractor={(item, index) => index.toString()}
                            // horizontal
                            renderItem={({item, index}) => {
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[tw`w-full`]}
                                        onPress={() => {
                                            openCarModal(false);
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
                                                style={[tw`flex-row justify-center items-center`]}>
                                                <View>
                                                    <Text
                                                        style={[
                                                            tw`text-center font-semibold`,
                                                            stil('text', data.app.theme),
                                                        ]}>
                                                        {item.title}
                                                    </Text>
                                                    <Text
                                                        style={[
                                                            tw`text-center`,
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
                                            </View>
                                            <View
                                                style={[tw`flex-row justify-center items-center`]}>
                                                <Image
                                                    source={{
                                                        uri: config.imageBaseUrl + item.image,
                                                    }}
                                                    style={tw`h-12 w-24`}
                                                    resizeMode="contain"
                                                />

                                                <Text
                                                    style={[
                                                        tw`text-center font-bold`,
                                                        stil('text', data.app.theme),
                                                    ]}>
                                                    {l[data.app.lang].find_car}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                        <TouchableOpacity
                            style={[
                                tw`flex-row items-center justify-center p-4 rounded-md mt-4 w-full`,
                                {backgroundColor: data.app.theme == 'dark' ? '#255382' : '#f1f1f1'},
                            ]}
                            onPress={() => {
                                openCarModal(false);
                            }}>
                            <Text style={[tw`font-semibold ml-2`, stil('text', data.app.theme)]}>
                                {l[data.app.lang].back}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="fade"
                transparent={true}
                visible={data.trip.tripFind}
                onRequestClose={() => {
                    dispatch({type: 'setTripFind', payload: false});
                }}>
                <View
                    style={[
                        tw` flex-1 items-center justify-center`,
                        {backgroundColor: 'rgba(0,0,0,0.55)'},
                    ]}>
                    <View
                        style={[
                            tw` w-[90%] flex items-center justify-end rounded-md p-2`,
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
                                    <View style={[tw`flex-row items-center mx-4 justify-between`]}>
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
                                {backgroundColor: data.app.theme == 'dark' ? '#255382' : '#f1f1f1'},
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
                                                dispatch({type: 'setTripFind', payload: false});
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
                            <Text style={[tw`font-semibold ml-2`, stil('text', data.app.theme)]}>
                                {l[data.app.lang].cancel}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

export default Passenger;
