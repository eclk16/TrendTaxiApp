import React, {useEffect} from 'react';
import {Text, View, Dimensions, FlatList, Image, TouchableOpacity} from 'react-native';
import {WebView} from 'react-native-webview';
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
import {apiGet, apiPost} from '../../axios';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import Geolocation from '@react-native-community/geolocation';
import {ActivityIndicator} from 'react-native';
import {ceil} from 'react-native-reanimated';

MaterialCommunityIcons.loadFont();

function Passenger() {
    const map = React.createRef();
    const dispatch = useDispatch();
    const data = useSelector((state) => state);
    const [source, setSource] = React.useState({uri: ''});
    const bottomSheetRef = React.useRef(null);
    const initialSnapPoints = React.useMemo(() => ['CONTENT_HEIGHT'], []);
    const [topHeight, setTopHeight] = React.useState(100);
    const [locations, setLocations] = React.useState([]);
    const [cars, setCars] = React.useState([]);
    const [searchText, setSearchText] = React.useState('');
    const [DATA, setDATA] = React.useState([]);
    const [result, setResult] = React.useState([]);

    const {animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout} =
        useBottomSheetDynamicSnapPoints(initialSnapPoints);

    const startLocation = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                if (locations.length == 0) {
                    var url =
                        'https://catalog.api.2gis.com/3.0/items?q=' +
                        position.coords.latitude +
                        ',' +
                        position.coords.longitude +
                        '&key=runnmp5276&locale=uz_UZ&fields=items.full_address_name,items.full_name,items.point,items.locale,items.full_address_name&sort=distance&location=' +
                        position.coords.latitude +
                        ',' +
                        position.coords.longitude;
                    fetch(url)
                        .then((response) => response.json())
                        .then((data2) => {
                            setLocations([
                                {
                                    title: data2.result.items[0].name,
                                    description: data2.result.items[0].full_name
                                        ? data2.result.items[0].full_name
                                        : '' +
                                          (data2.result.items[0].purpose_name
                                              ? '- ' + data2.result.items[0].purpose_name
                                              : ''),
                                    lat: position.coords.longitude,
                                    lon: position.coords.latitude,
                                },
                            ]);
                            if (
                                source.uri !=
                                config.mapBaseUrl +
                                    '?user=' +
                                    data.auth.userId +
                                    '&currentLocation=' +
                                    position.coords.longitude +
                                    ',' +
                                    position.coords.latitude
                            ) {
                                setSource({
                                    uri:
                                        config.mapBaseUrl +
                                        '?user=' +
                                        data.auth.userId +
                                        '&currentLocation=' +
                                        position.coords.longitude +
                                        ',' +
                                        position.coords.latitude,
                                });
                            }
                        });
                } else {
                    apiPost('mapSocket', {
                        type: 'setCenter',
                        id: data.auth.userId,
                        coord: [position.coords.longitude, position.coords.latitude],
                    });
                }
            },
            (error) => {
                return false;
                // Alert.alert(`Code ${error.code}`, error.message);
                console.log(error);
            },
            {
                accuracy: {
                    android: 'high',
                    ios: 'best',
                },
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000,
                distanceFilter: 0,
                forceRequestLocation: true,
                forceLocationManager: false,
                showLocationDialog: true,
            },
        );
    };

    // get cars
    useEffect(() => {
        startLocation();
        apiPost('getPrices', {
            lang: data.app.lang,
        }).then((response) => {
            setDATA(response.data.response);
        });
    }, []);

    useEffect(() => {
        setTopHeight(Dimensions.get('window').height - animatedContentHeight.value + 20);
    }, [initialSnapPoints]);

    //send map changes
    useEffect(() => {
        apiPost('getPrices', {
            lang: data.app.lang,
        }).then((response) => {
            setDATA(response.data.response);
        });
        apiPost('mapSocket', {type: 'mapCreate', id: data.auth.userId, locations: locations});
    }, [locations]);

    useEffect(() => {
        const getData = setTimeout(() => {
            if (searchText.length > 2) {
                arama(searchText);
            } else {
                clearTimeout(getData);
            }
        }, 500);

        return () => {
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
                    data.app.currentLocation.lat +
                    ',' +
                    data.app.currentLocation.lon,
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

    const debugging = `
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
                apiPost('mapSocket', {
                    type: 'mapCreate',
                    id: data.auth.userId,
                    locations: locations,
                });
            }
            if (datas.type == 'distanceDuration') {
                setDistance(parseFloat(datas.distance));
                setDuration(datas.duration);
                let newData = [];
                DATA.forEach((item, index) => {
                    let price = parseFloat(item.start);
                    let yol = Math.ceil(distance / 1000) * parseFloat(item.km);

                    yol = yol - parseFloat(item.km);

                    price = price + yol;
                    if (price < parseFloat(item.start)) {
                        price = parseFloat(item.start);
                    }
                    newData.push({
                        ...item,
                        price: Math.ceil(price / 1000) * 1000,
                        distance: distance,
                        duration,
                        duration,
                    });
                });
                setDATA(newData);
            }
        } catch (e) {}
    };

    return (
        <View style={{flex: 1}}>
            <View style={{height: topHeight, maxHeight: '80%'}}>
                {source.uri != '' ? (
                    <WebView
                        ref={map}
                        source={source}
                        injectedJavaScript={debugging}
                        onMessage={onMessage}
                        setDisplayZoomControls={false}
                        setBuiltInZoomControls={false}
                    />
                ) : (
                    <ActivityIndicator />
                )}
            </View>

            <BottomSheet
                ref={bottomSheetRef}
                snapPoints={animatedSnapPoints}
                handleHeight={animatedHandleHeight}
                contentHeight={animatedContentHeight}
                handleIndicatorStyle={[{display: 'none'}, tw`w-0 m-0 p-0`]}
                keyboardBehavior="interactive"
                backgroundStyle={stil('bg', data.app.theme)}>
                <BottomSheetView onLayout={handleContentLayout}>
                    <View style={[tw`px-4 pb-12`]}>
                        <View style={[tw`flex-row items-center justify-between`]}>
                            <View style={[tw`flex-row items-center justify-between`]}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setLocations([]);
                                        setCars([]);
                                        setResult([]);
                                        setSearchText([]);
                                    }}
                                    style={[tw`rounded-md p-2 mr-2`, stil('bg2', data.app.theme)]}>
                                    <MaterialCommunityIcons
                                        name="restart"
                                        size={24}
                                        color={stil('text', data.app.theme).color}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => startLocation()}
                                    style={[tw`rounded-md p-2`, stil('bg2', data.app.theme)]}>
                                    <MaterialCommunityIcons
                                        name="map-marker-radius"
                                        size={24}
                                        color={stil('text', data.app.theme).color}
                                    />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                style={[
                                    tw`rounded-md p-2 flex-row items-center justify-center`,
                                    stil('bg2', data.app.theme),
                                ]}>
                                {/* <MaterialCommunityIcons
                                    name="car-connected"
                                    size={24}
                                    color={stil('text', data.app.theme).color}
                                /> */}
                                <Text style={[tw`font-semibold`, stil('text', data.app.theme)]}>
                                    {l[data.app.lang].find_car}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[tw``]}>
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
                                                    title: item.title,
                                                    description: item.alt,
                                                    price: item.price ?? item.start,
                                                    km: item.km,
                                                    paid: item.paid,
                                                    fee: item.fee,
                                                    image: item.image,
                                                });
                                            }}>
                                            <View
                                                style={[
                                                    tw`px-2 py-1 my-2 mr-2 rounded-md `,
                                                    stil('bg2', data.app.theme),
                                                ]}>
                                                <View style={[tw` flex-row  justify-between`]}>
                                                    <Image
                                                        source={{
                                                            uri: config.imageBaseUrl + item.image,
                                                        }}
                                                        style={tw`w-24`}
                                                        resizeMode="contain"
                                                    />
                                                    <View>
                                                        <Text
                                                            style={[
                                                                tw``,
                                                                stil('text', data.app.theme),
                                                            ]}>
                                                            {item.title}
                                                        </Text>
                                                        <Text
                                                            style={[
                                                                tw`text-xs`,
                                                                stil('text', data.app.theme),
                                                            ]}>
                                                            {item.price ?? item.start} sum
                                                        </Text>
                                                    </View>
                                                </View>
                                                <View>
                                                    <View
                                                        style={[
                                                            tw`flex-row mt-1 items-center justify-between`,
                                                        ]}>
                                                        <Text
                                                            style={[
                                                                tw`text-xs`,
                                                                stil('text', data.app.theme),
                                                            ]}>
                                                            {Math.ceil(duration / 60)} min
                                                        </Text>

                                                        <Text
                                                            style={[
                                                                tw`text-xs`,
                                                                stil('text', data.app.theme),
                                                            ]}>
                                                            {Math.ceil(distance / 1000)} km
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        </View>
                        <View style={[tw``]}>
                            <FlatList
                                // style={[tw`h-10 w-full`, {zIndex: 9999999999}]}
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
                                                <MaterialCommunityIcons
                                                    style={[tw`text-center mr-2`]}
                                                    name="adjust"
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
                        <View>
                            <BottomSheetTextInput
                                placeholder={l[data.app.lang].findguzergah}
                                placeholderTextColor={stil('text', data.app.theme).color}
                                style={[
                                    tw`h-12 px-4 rounded-md w-full`,
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
                                    tw`rounded-md h-10 w-10 mt-1 mr-1 p-1 items-center justify-center`,
                                ]}
                                onPress={() => {
                                    if (locations.length > 0) {
                                        setLocations([
                                            ...locations,
                                            locations[locations.length - 1],
                                        ]);
                                    } else {
                                        startLocation();
                                    }
                                }}>
                                <MaterialCommunityIcons
                                    name="map-plus"
                                    size={28}
                                    color={stil('text', data.app.theme).color}
                                />
                            </TouchableOpacity>
                        </View>
                        {result.map((item, index) => {
                            return (
                                <View key={index} style={[]}>
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
                                                                tw`flex-row items-start ml-2 py-2`,
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
                </BottomSheetView>
            </BottomSheet>
        </View>
    );
}

export default Passenger;
