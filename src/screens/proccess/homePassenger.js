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
    Platform,
} from 'react-native';
import WebView from 'react-native-webview';
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

MaterialCommunityIcons.loadFont();

function Passenger() {
    let webViewRef = React.useRef();

    const data = useSelector((state) => state);
    const dispatch = useDispatch();
    const source = config.mapBaseUrl;
    const bottomSheetRef = React.useRef(null);
    const initialSnapPoints = React.useMemo(() => ['40%', 'CONTENT_HEIGHT'], []);
    const [locations, setLocations] = React.useState([]);
    const [cars, setCars] = React.useState({});
    const [searchText, setSearchText] = React.useState('');
    const [DATA, setDATA] = React.useState([]);
    const [result, setResult] = React.useState([]);
    const [mapUrl, setMapUrl] = React.useState(config.mapBaseUrl);
    const [questionModal, openQuestionModal] = React.useState(false);
    const {animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout} =
        useBottomSheetDynamicSnapPoints(initialSnapPoints);

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
        if (!mapLoading) {
            dispatch({
                type: 'loc',
                payload: [data.app.currentLocation[0], data.app.currentLocation[1]],
            });
            mapLoad([data.app.currentLocation[0], data.app.currentLocation[1]]);
        }
        return () => {
            abortController.abort();
            false;
        };
    }, [mapLoading, data.trip.trip]);
    // get cars
    useEffect(() => {
        const abortController = new AbortController();

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

    const sendJS = (js) => {
        try {
            webViewRef.current?.injectJavaScript(`try {` + js + `true;} catch (error) {}`);
        } catch (error) {}
    };

    //send map changes
    useEffect(() => {
        const abortController = new AbortController();
        let json = JSON.stringify({type: 'mapCreate', id: data.auth.userId, locations: locations});
        if (locations.length > 0) sendJS(`setMarker(` + json + `);`);
        return () => {
            abortController.abort();
            false;
        };
    }, [locations]);

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

    const scripts = `

    

    const consoleLog = (type, log) => window.ReactNativeWebView.postMessage(JSON.stringify({'type': 'Console', 'data': {'type': type, 'log': log}}));
    console = {
        log: (log) => consoleLog('log', log),
        debug: (log) => consoleLog('debug', log),
        info: (log) => consoleLog('info', log),
        warn: (log) => consoleLog('warn', log),
        error: (log) => consoleLog('error', log),
      };
    `;

    const [distance, setDistance] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const onMessage = (payload) => {
        try {
            let datas = JSON.parse(JSON.parse(payload.nativeEvent.data).data.log);
            if (datas.type == 'selectMap') {
                let loc = locations;
                loc[loc.length - 1] = datas;
                setLocations(loc);
                setResult([]);
                let json = JSON.stringify({
                    type: 'mapCreate',
                    id: data.auth.userId,
                    locations: locations,
                });
                sendJS(`setMarker(` + json + `);`);
            }
            if (datas.type == 'distanceDuration') {
                setDistance(parseFloat(datas.distance));
                setDuration(datas.duration);
            }
        } catch (e) {}
    };
    const [mapLoading, setMapLoading] = React.useState(true);
    const wP = () => {
        // if (Platform.OS == 'Android') {
        //     const izin = Geolocation.requestAuthorization();
        // }

        const wid = Geolocation.watchPosition(
            (position) => {
                dispatch({
                    type: 'loc',
                    payload: [position.coords.longitude, position.coords.latitude],
                });
                sendJS(
                    `markers[0].setIcon({icon:'marker.svg'});markers[0].setCoordinates([` +
                        position.coords.longitude +
                        `,` +
                        position.coords.latitude +
                        `]);`,
                );
            },
            (error) => Alert.alert('WatchPosition Error', JSON.stringify(error)),
            {
                enableHighAccuracy: true,
                distanceFilter: 5,
            },
        );
    };
    const [first, setFirst] = React.useState(true);
    useEffect(() => {
        const abortController = new AbortController();
        if (first) {
            if (data.app.currentLocation[0] > 0) {
                mapLoad(data.app.currentLocation);
                setFirst(false);
            }
        }
        return () => {
            abortController.abort();
            false;
        };
    }, [mapLoading, data.app.currentLocation]);

    const mapLoad = (d) => {
        sendJS(`map.setCenter([` + d[0] + `,` + d[1] + `]);`);
        var url =
            'https://catalog.api.2gis.com/3.0/items?q=' +
            d[1] +
            ',' +
            d[0] +
            '&key=runnmp5276&locale=uz_UZ&fields=items.full_address_name,items.full_name,items.point,items.locale,items.full_address_name&sort=distance&location=' +
            d[1] +
            ',' +
            d[0];
        fetch(url)
            .then((response) => response.json())
            .then((data2) => {
                if (data2.meta.code != 400) {
                    setLocations([
                        {
                            title: data2.result.items[0].name ?? '',
                            description: data2.result.items[0].full_name
                                ? data2.result.items[0].full_name
                                : '' +
                                  (data2.result.items[0].purpose_name
                                      ? '- ' + data2.result.items[0].purpose_name
                                      : ''),
                            lat: d[0],
                            lon: d[1],
                        },
                    ]);
                    let json = JSON.stringify({
                        type: 'mapCreate',
                        id: data.auth.userId,
                        locations: {
                            title: data2.result.items[0].name ?? '',
                            description: data2.result.items[0].full_name
                                ? data2.result.items[0].full_name
                                : '' +
                                  (data2.result.items[0].purpose_name
                                      ? '- ' + data2.result.items[0].purpose_name
                                      : ''),
                            lat: d[0],
                            lon: d[1],
                        },
                    });

                    sendJS(`setMarker(` + json + `);`);
                } else {
                    setLocations([
                        {
                            title: '',
                            description: '',
                            lat: d[0],
                            lon: d[1],
                        },
                    ]);
                    let json = JSON.stringify({
                        type: 'mapCreate',
                        id: data.auth.userId,
                        locations: {
                            title: '',
                            description: '',
                            lat: d[0],
                            lon: d[1],
                        },
                    });
                    sendJS(`setMarker(` + json + `);`);
                }
            })
            .catch((error) => {
                setLocations([
                    {
                        title: '',
                        description: '',
                        lat: d[0],
                        lon: d[1],
                    },
                ]);
                let json = JSON.stringify({
                    type: 'mapCreate',
                    id: data.auth.userId,
                    locations: {
                        title: '',
                        description: '',
                        lat: d[0],
                        lon: d[1],
                    },
                });
                sendJS(`setMarker(` + json + `);`);
                console.log('DATA2 = ', error);
            });
    };
    return (
        <View style={{flex: 1}}>
            <View style={{height: '90%'}}>
                <WebView
                    ref={webViewRef}
                    source={{uri: mapUrl}}
                    javaScriptEnabled={true}
                    javaScriptEnabledAndroid={true}
                    injectedJavaScript={scripts}
                    onMessage={onMessage}
                    onLoad={() => {
                        wP();
                        setMapLoading(false);
                        if (data.app.mapTheme == 'dark') {
                            sendJS(`map.setStyle('e01600ee-57a3-42e1-ae5c-6a51aaf8c657');`);
                        }
                        if (data.app.mapTheme == 'light') {
                            sendJS(`map.setStyle('32b1600d-4b8b-4832-871a-e33d8e4bb57f');`);
                        }
                    }}
                />
                {mapLoading ? (
                    <View
                        style={[
                            tw`
                                    flex h-full w-full items-center justify-center`,
                            stil('bg2', data.app.theme),
                            {
                                bottom: 0,
                                position: 'absolute',
                                zIndex: 99999999999999,
                            },
                        ]}>
                        <ActivityIndicator
                            size="large"
                            style={[{zIndex: 99999999999999}]}
                            color={stil('text', data.app.theme).color}
                        />
                    </View>
                ) : null}
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
                    <View style={[tw`flex-row w-full px-4 mt-2 items-end justify-between`]}>
                        <TouchableOpacity
                            onPress={() => {
                                setLocations([]);

                                sendJS(`
                                document.getElementById("km").innerHTML = 0;
                                document.getElementById("min").innerHTML = 0;
                                changeMap();changeMap2();
                                `);

                                setCars({});
                                setResult([]);
                                setSearchText('');
                                setDistance(0);
                                setDuration(0);
                                mapLoad(data.app.currentLocation);
                                sendJS(`markerMove=true;`);
                            }}
                            style={[tw`rounded-md p-2`, stil('bg2', data.app.theme)]}>
                            <MaterialCommunityIcons
                                name="restart"
                                size={24}
                                color={stil('text', data.app.theme).color}
                            />
                        </TouchableOpacity>
                        <View style={[tw`flex-row`]}>
                            <TouchableOpacity
                                onPress={() => {
                                    openQuestionModal(true);
                                }}
                                style={[tw`rounded-md p-2 mr-2`, stil('bg2', data.app.theme)]}>
                                <MaterialCommunityIcons
                                    name="message-question-outline"
                                    size={24}
                                    color={stil('text', data.app.theme).color}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    if (data.app.mapTheme == 'light') {
                                        sendJS(
                                            `map.setStyle('e01600ee-57a3-42e1-ae5c-6a51aaf8c657');`,
                                        );
                                    }
                                    if (data.app.mapTheme == 'dark') {
                                        sendJS(
                                            `map.setStyle('32b1600d-4b8b-4832-871a-e33d8e4bb57f');`,
                                        );
                                    }
                                    setValue(
                                        'TrendTaxiMapTheme',
                                        data.app.mapTheme == 'light' ? 'dark' : 'light',
                                    );
                                    dispatch({
                                        type: 'mapTheme',
                                        payload: data.app.mapTheme == 'light' ? 'dark' : 'light',
                                    });
                                }}
                                style={[tw`rounded-md p-2 mr-2`, stil('bg2', data.app.theme)]}>
                                <MaterialCommunityIcons
                                    name={
                                        data.app.mapTheme == 'dark'
                                            ? 'white-balance-sunny'
                                            : 'moon-waning-crescent'
                                    }
                                    size={24}
                                    color={stil('text', data.app.theme).color}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    if (locations.length > 0) {
                                        sendJS(
                                            `map.fitBounds(
                                            {
                                                northEast: [` +
                                                locations[0].lat +
                                                `,` +
                                                locations[0].lon +
                                                `],
                                                southWest: [` +
                                                locations[locations.length - 1].lat +
                                                `,` +
                                                locations[locations.length - 1].lon +
                                                `],    
                                            },
                                            {
                                                padding: { top: 50, left: 150, bottom: 300, right: 150 },
                                                considerRotation: true,
                                            },
                                        );`,
                                        );
                                    }
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
                                    sendJS(
                                        `map.setCenter([` +
                                            data.app.currentLocation[0] +
                                            `,` +
                                            data.app.currentLocation[1] +
                                            `]);map.setZoom(18);`,
                                    );
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
                    <View style={[tw`px-4 pb-12`]}>
                        <View>
                            <BottomSheetTextInput
                                placeholder={l[data.app.lang].findguzergah}
                                placeholderTextColor={stil('text', data.app.theme).color}
                                style={[
                                    tw`h-12 px-4 mt-2 rounded-md w-full`,
                                    stil('text', data.app.theme),
                                    stil('bg2', data.app.theme),
                                ]}
                                onFocus={() => {}}
                                onSubmitEditing={() => {
                                    bottomSheetRef.current.snapToIndex(0);
                                }}
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
                                    tw`rounded-md h-10 w-10 mt-1 mr-1 mt-3 p-1 items-center justify-center`,
                                ]}
                                onPress={() => {
                                    if (locations.length > 0) {
                                        Keyboard.dismiss();
                                        setLocations([
                                            ...locations,
                                            {
                                                lat: parseFloat(
                                                    parseFloat(
                                                        locations[locations.length - 1].lat,
                                                    ) + 0.0002222222222,
                                                ),
                                                lon: parseFloat(
                                                    parseFloat(
                                                        locations[locations.length - 1].lon,
                                                    ) + 0.0002222222222,
                                                ),
                                                title: '...',
                                                description: '...',
                                            },
                                        ]);
                                        sendJS(
                                            `map.setCenter([` +
                                                locations[locations.length - 1].lat +
                                                `,` +
                                                locations[locations.length - 1].lon +
                                                `]);map.setZoom(17);`,
                                        );
                                        sendJS(`markerMove=true;`);
                                        bottomSheetRef.current.snapToIndex(0);
                                    } else {
                                    }
                                }}>
                                <MaterialCommunityIcons
                                    name="map-plus"
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
                                                                                lat: item.point.lon,
                                                                                lon: item.point.lat,
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
                                                                        bottomSheetRef.current.snapToIndex(
                                                                            0,
                                                                        );
                                                                        Keyboard.dismiss();
                                                                        sendJS(`markerMove=false;`);
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
                        <View style={[tw`mt-2`]}>
                            <FlatList
                                // style={[tw`h-10 w-full`, {zIndex: 9999999999}]}
                                data={DATA}
                                keyExtractor={(item, index) => index.toString()}
                                horizontal
                                renderItem={({item, index}) => {
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => {
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
                                                    paid: item.paid,
                                                    fee: item.fee,
                                                    image: item.image,
                                                });
                                            }}>
                                            <View
                                                style={[
                                                    tw`px-2 py-1 mr-2 rounded-md `,
                                                    stil('bg2', data.app.theme),
                                                ]}>
                                                <View
                                                    style={[
                                                        tw`flex-row justify-center items-center`,
                                                    ]}>
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
                                                        <Image
                                                            source={{
                                                                uri:
                                                                    config.imageBaseUrl +
                                                                    item.image,
                                                            }}
                                                            style={tw`h-12`}
                                                            resizeMode="contain"
                                                        />
                                                    </View>
                                                </View>
                                                <View>
                                                    <View
                                                        style={[
                                                            tw`flex-row items-center justify-between`,
                                                        ]}></View>
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
                        </View>
                    </View>
                </BottomSheetView>
            </BottomSheet>
            <Modal
                animationType="fade"
                transparent={true}
                visible={questionModal}
                onRequestClose={() => {
                    openQuestionModal(!questionModal);
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
                            <View style={[tw` flex-row items-center justify-between my-2 `]}>
                                <View
                                    style={[
                                        stil('bg2', data.app.theme),
                                        tw`w-1/5 flex-row items-center justify-center p-2 rounded-md`,
                                    ]}>
                                    <MaterialCommunityIcons
                                        name="restart"
                                        size={24}
                                        color={stil('text', data.app.theme).color}
                                    />
                                </View>
                                <View
                                    style={[
                                        stil('bg2', data.app.theme),
                                        tw`ml-2 py-2 rounded-md px-2 w-3/4`,
                                    ]}>
                                    <Text style={[stil('text', data.app.theme), tw`ml-2 w-3/4`]}>
                                        Haritayı, konumları ve yolculuk detaylarını sıfırlar.
                                    </Text>
                                </View>
                            </View>
                            <View style={[tw` flex-row items-center justify-between my-2  `]}>
                                <View
                                    style={[
                                        stil('bg2', data.app.theme),
                                        tw`w-1/5 flex-row items-center justify-center p-2 rounded-md`,
                                    ]}>
                                    <MaterialCommunityIcons
                                        name="white-balance-sunny"
                                        size={24}
                                        color={stil('text', data.app.theme).color}
                                    />
                                    <MaterialCommunityIcons
                                        name="moon-waning-crescent"
                                        size={24}
                                        style={[tw`ml-2`]}
                                        color={stil('text', data.app.theme).color}
                                    />
                                </View>
                                <View
                                    style={[
                                        stil('bg2', data.app.theme),
                                        tw`ml-2 py-2 rounded-md px-2 w-3/4`,
                                    ]}>
                                    <Text style={[stil('text', data.app.theme)]}>
                                        Haritanın temasını değiştirir.Koyu tema ve açık tema.
                                    </Text>
                                </View>
                            </View>
                            <View style={[tw` flex-row items-center justify-between my-2  `]}>
                                <View
                                    style={[
                                        stil('bg2', data.app.theme),
                                        tw`w-1/5 flex-row items-center justify-center p-2 rounded-md`,
                                    ]}>
                                    <MaterialCommunityIcons
                                        name="image-filter-center-focus"
                                        size={24}
                                        color={stil('text', data.app.theme).color}
                                    />
                                </View>
                                <View
                                    style={[
                                        stil('bg2', data.app.theme),
                                        tw`ml-2 py-2 rounded-md px-2 w-3/4`,
                                    ]}>
                                    <Text style={[stil('text', data.app.theme)]}>
                                        Yolculuk için seçilen konumları ortalar.
                                    </Text>
                                </View>
                            </View>

                            <View style={[tw` flex-row items-center justify-between my-2  `]}>
                                <View
                                    style={[
                                        stil('bg2', data.app.theme),
                                        tw`w-1/5 flex-row items-center justify-center p-2 rounded-md`,
                                    ]}>
                                    <MaterialCommunityIcons
                                        name="map-plus"
                                        size={24}
                                        color={stil('text', data.app.theme).color}
                                    />
                                </View>
                                <View
                                    style={[
                                        stil('bg2', data.app.theme),
                                        tw`ml-2 py-2 rounded-md px-2 w-3/4`,
                                    ]}>
                                    <Text style={[stil('text', data.app.theme)]}>
                                        Güzergahınıza yeni bir adres satırı ekler
                                    </Text>
                                </View>
                            </View>

                            <View style={[tw` flex-row items-center justify-between my-2  `]}>
                                <View
                                    style={[
                                        stil('bg2', data.app.theme),
                                        tw`w-1/5 flex-row items-center justify-center p-2 rounded-md`,
                                    ]}>
                                    <MaterialCommunityIcons
                                        name="map-marker-radius"
                                        size={24}
                                        color={stil('text', data.app.theme).color}
                                    />
                                </View>
                                <View
                                    style={[
                                        stil('bg2', data.app.theme),
                                        tw`ml-2 py-2 rounded-md px-2 w-3/4`,
                                    ]}>
                                    <Text style={[stil('text', data.app.theme)]}>
                                        Haritayı bulunduğunuz konuma getirir ve eğer hiç konum
                                        seçili değilse 1. konumu bulunduğunuz konum olarak ayarlar.
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={[
                                tw`flex-row items-center justify-center p-4 rounded-md w-full`,
                                {backgroundColor: data.app.theme == 'dark' ? '#255382' : '#f1f1f1'},
                            ]}
                            onPress={() => {
                                openQuestionModal(false);
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
