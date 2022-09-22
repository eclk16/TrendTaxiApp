import React, {useEffect} from 'react';
import {Text, View, FlatList, Image, TouchableOpacity, Modal, Alert} from 'react-native';
import WebView from 'react-native-webview';
import config from '../../app.json';
import {useSelector, useDispatch} from 'react-redux';
import BottomSheet, {
    useBottomSheetDynamicSnapPoints,
    BottomSheetView,
    BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import {apiPost} from '../../axios';

import tw from 'twrnc';
import {stil} from '../../utils';
import l from '../../languages.json';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';
import {ActivityIndicator} from 'react-native';
import {setValue} from '../../async';
import MapPage2 from './map2';
import {Linking} from 'react-native';

function MapPage() {
    let webViewRef = React.useRef();
    const bottomSheetRef = React.useRef(null);
    const source = config.navigationBaseUrl;
    const data = useSelector((state) => state);
    const dispatch = useDispatch();
    const initialSnapPoints = React.useMemo(() => ['CONTENT_HEIGHT'], []);
    const [ortala, setOrtala] = React.useState(false);
    const [yonText, setYonText] = React.useState('');
    const [yonMesafe, setYonMesafe] = React.useState('');

    const {animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout} =
        useBottomSheetDynamicSnapPoints(initialSnapPoints);

    const sendJS = (js) => {
        try {
            webViewRef.current?.injectJavaScript(js + `true;`);
        } catch (error) {}
    };

    const yonIcon = (iconu) => {
        switch (iconu) {
            case 'start':
                return setIcon('ray-start-arrow');
            case 'finish':
                return setIcon('ray-start-end');
            case 'crossroad_straight':
                return setIcon('arrow-up-bold');
            case 'crossroad_slightly_left':
                return setIcon('arrow-left-top-bold');
            case 'crossroad_left':
                return setIcon('arrow-left-top-bold');
            case 'crossroad_sharply_left':
                return setIcon('arrow-left-top-bold');
            case 'crossroad_sharply_right':
                return setIcon('arrow-right-top-bold');
            case 'crossroad_right':
                return setIcon('arrow-right-top-bold');
            case 'crossroad_slightly_right':
                return setIcon('arrow-right-top-bold');
            case 'ringroad_forward':
                return setIcon('arrow-up-bold');
            case 'ringroad_left_45':
                return setIcon('arrow-left-top-bold');
            case 'ringroad_left_90':
                return setIcon('arrow-left-top-bold');
            case 'ringroad_left_135':
                return setIcon('arrow-left-top-bold');
            case 'ringroad_left_180':
                return setIcon('arrow-u-down-left-bold');
            case 'ringroad_right_45':
                return setIcon('arrow-right-top-bold');
            case 'ringroad_right_90':
                return setIcon('arrow-right-top-bold');
            case 'ringroad_right_135':
                return setIcon('arrow-right-top-bold');
            case 'ringroad_right_180':
                return setIcon('arrow-u-down-right-bold');
            case 'turn_over_right_hand':
                return setIcon('arrow-u-down-right-bold');
            case 'turn_over_left_hand':
                return setIcon('arrow-u-down-right-bold');
            default:
                return setIcon('ray-start-arrow');
        }
    };
    const [geo, setGeo] = React.useState(null);
    const wP = () => {
        const wid = Geolocation.watchPosition(
            (position) => {
                dispatch({
                    type: 'loc',
                    payload: [position.coords.longitude, position.coords.latitude],
                });
                if (data.auth.userType == 'driver') {
                    apiPost('mapSocket', {
                        id: data.trip.trip.driver_id,
                        id_2: data.trip.trip.passenger_id,
                        token: data.auth.userToken,
                        locations: [position.coords.longitude, position.coords.latitude],
                        prc: 'driverLocation',
                    });
                }
            },
            (error) => Alert.alert('WatchPosition Error', JSON.stringify(error)),
            {
                enableHighAccuracy: true,
                distanceFilter: 5,
            },
        );
        setGeo(wid);
    };
    useEffect(() => {
        const abortController = new AbortController();
        if (!mapLoading) {
            sendJS(
                `
            directions.clear();
            directions.carRoute({
                points: [    
                    [` +
                    data.trip.trip.driver.last_latitude +
                    `,` +
                    data.trip.trip.driver.last_longitude +
                    `],[` +
                    data.trip.trip.locations[0].lat +
                    `,` +
                    data.trip.trip.locations[0].lon +
                    `]
                                   
                ]
            });driver.setCoordinates([` +
                    data.trip.trip.driver.last_latitude +
                    `,` +
                    data.trip.trip.driver.last_longitude +
                    `]);
            `,
            );
            getNavigation(
                data.trip.trip.driver.last_latitude,
                data.trip.trip.driver.last_longitude,
            );
        }
        return () => {
            abortController.abort();
        };
    }, [data.trip.trip.driver.last_latitude, geo]);

    useEffect(() => {
        const abortController = new AbortController();
        if (ortala) {
            if (!mapLoading) {
                sendJS(
                    `map.setCenter([` +
                        data.trip.trip.driver.last_latitude +
                        `,` +
                        data.trip.trip.driver.last_longitude +
                        `]);map.setZoom(18);`,
                );
            }
        }

        return () => {
            abortController.abort();
            false;
        };
    }, [mapLoading, ortala, data.trip.trip.driver.last_latitude]);

    const getNavigation = (xx, yy) => {
        var myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('Accept', 'application/json');

        var raw = JSON.stringify({
            alternative: 0,
            locale: data.app.lang,
            point_a_name: 'Source',
            point_b_name: 'Target',
            type: 'jam',
            points: [
                {
                    start: true,
                    type: 'walking',
                    x: xx,
                    y: yy,
                },
                {
                    start: false,
                    type: 'walking',
                    x: data.trip.trip.locations[0].lat,
                    y: data.trip.trip.locations[0].lon,
                },
            ],
            need_altitudes: true,
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow',
        };

        fetch(
            'https://catalog.api.2gis.com/carrouting/6.0.0/global?key=cd5e111e-b442-4ef4-aee5-6711f03326a3',
            requestOptions,
        )
            .then((response) => response.json())
            .then((result) => {
                hareket(result.result[0].maneuvers);
            })
            .catch((error) => console.log('error', error));
    };

    const fitBound = () => {
        sendJS(
            `map.fitBounds(
                        {
                            northEast: [` +
                data.trip.trip.driver.last_latitude +
                `,` +
                data.trip.trip.driver.last_longitude +
                `],
                            southWest: [` +
                data.trip.trip.locations[data.trip.trip.locations.length - 1].lat +
                `,` +
                data.trip.trip.locations[data.trip.trip.locations.length - 1].lon +
                `],    
                        },
                        {
                            padding: { top: 150, left: 150, bottom: 150, right: 150 },
                            considerRotation: true,
                        },
                    );`,
        );
    };

    const hareket = (dpp) => {
        yonIcon(dpp[1].icon ? dpp[1].icon : 'ray-start-arrow');
        setYonText(dpp[0].turn_direction ? dpp[0].turn_direction : '');
        setYonMesafe(dpp[0].outcoming_path_comment ? dpp[0].outcoming_path_comment : '');
    };

    const [icon, setIcon] = React.useState('arrow-up-bold');
    const [mapLoading, setMapLoading] = React.useState(true);
    const [yaklasma, setYaklasma] = React.useState(0);
    return (
        <>
            {data.trip.trip.status == 3 ? (
                <MapPage2 />
            ) : (
                <View style={{flex: 1}}>
                    <View style={[{height: '100%'}]}>
                        <WebView
                            ref={webViewRef}
                            source={{uri: source}}
                            javaScriptEnabled={true}
                            javaScriptEnabledAndroid={true}
                            onTouchMove={() => {
                                setOrtala(false);
                            }}
                            onLoad={() => {
                                if (data.app.mapTheme == 'dark') {
                                    sendJS(`map.setStyle('e01600ee-57a3-42e1-ae5c-6a51aaf8c657');`);
                                }
                                if (data.app.mapTheme == 'light') {
                                    sendJS(`map.setStyle('32b1600d-4b8b-4832-871a-e33d8e4bb57f');`);
                                }
                                wP();
                                setMapLoading(false);
                                getNavigation(
                                    data.trip.trip.driver.last_latitude,
                                    data.trip.trip.driver.last_longitude,
                                );
                                fitBound();
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

                    {data.auth.userType == 'driver' ? (
                        <View
                            style={[
                                stil('bg', data.app.theme),
                                tw`rounded-md h-32 w-32 p-3 items-center justify-center flex`,
                                {position: 'absolute', zIndex: 9999999999, top: 50, right: 10},
                            ]}>
                            {icon ? (
                                <MaterialCommunityIcons
                                    style={[tw``, stil('text', data.app.theme)]}
                                    name={icon}
                                    size={56}
                                />
                            ) : null}
                            <Text style={[tw`font-bold text-base`, stil('text', data.app.theme)]}>
                                {yonText ? yonText.toUpperCase() : ''}
                            </Text>
                            <Text style={[stil('text', data.app.theme)]}>{yonMesafe}</Text>
                        </View>
                    ) : null}
                    <BottomSheet
                        ref={bottomSheetRef}
                        snapPoints={animatedSnapPoints}
                        handleHeight={animatedHandleHeight}
                        contentHeight={animatedContentHeight}
                        handleIndicatorStyle={[{display: 'none'}, tw`w-0 m-0 p-0`]}
                        handleStyle={{display: 'none'}}
                        keyboardBehavior="interactive"
                        backgroundStyle={[tw`mx-4 mb-24`, {backgroundColor: 'transparent'}]}>
                        <BottomSheetView onLayout={handleContentLayout}>
                            <View style={[tw`flex-row mx-4 mb-2 justify-between `]}>
                                <TouchableOpacity
                                    style={[stil('bg', data.app.theme), tw`p-2 rounded-md`]}
                                    onPress={() => {
                                        setOrtala(true);
                                    }}>
                                    {!ortala ? (
                                        <MaterialCommunityIcons
                                            name="arch"
                                            size={32}
                                            color={stil('text', data.app.theme).color}
                                        />
                                    ) : null}
                                </TouchableOpacity>
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
                                        size={32}
                                        color={stil('text', data.app.theme).color}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={[tw`flex-row mx-4  mb-2  items-center justify-between`]}>
                                <View style={[tw`flex-row items-center justify-between`]}>
                                    <View
                                        style={[
                                            tw`flex items-start justify-center rounded-md p-2 mr-1`,
                                            stil('bg', data.app.theme),
                                        ]}>
                                        <Text style={[stil('text', data.app.theme)]}>
                                            {data.trip.trip.act_duration} min{' '}
                                            {data.trip.trip.act_distance} km
                                        </Text>
                                    </View>
                                    <View
                                        style={[
                                            tw`flex items-end justify-center rounded-md p-2`,
                                            stil('bg', data.app.theme),
                                        ]}>
                                        <Text style={[stil('text', data.app.theme)]}>
                                            {data.trip.trip.act_price} sum
                                        </Text>
                                    </View>
                                </View>
                                <View style={[tw`flex-row items-center justify-between`]}>
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
                                                payload:
                                                    data.app.mapTheme == 'light' ? 'dark' : 'light',
                                            });
                                        }}
                                        style={[
                                            tw`rounded-md p-2 mr-1`,
                                            stil('bg', data.app.theme),
                                        ]}>
                                        <MaterialCommunityIcons
                                            name={
                                                data.app.mapTheme == 'dark'
                                                    ? 'white-balance-sunny'
                                                    : 'moon-waning-crescent'
                                            }
                                            size={20}
                                            color={stil('text', data.app.theme).color}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (data.trip.trip.locations.length > 0) {
                                                fitBound();
                                            }
                                        }}
                                        style={[tw`rounded-md p-2 `, stil('bg', data.app.theme)]}>
                                        <MaterialCommunityIcons
                                            name="image-filter-center-focus"
                                            size={20}
                                            color={stil('text', data.app.theme).color}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View
                                style={[
                                    tw`flex-row mx-4 rounded-md mb-2 py-2 px-4 items-center justify-between`,
                                    stil('bg', data.app.theme),
                                ]}>
                                <View
                                    style={[
                                        tw`w-full h-1 ml-8  pr-8`,
                                        {
                                            position: 'absolute',
                                            top: 0,
                                            zIndex: 1,
                                        },
                                    ]}>
                                    <View
                                        style={[
                                            tw`w-full h-1 `,
                                            {
                                                backgroundColor: stil('text', data.app.theme).color,
                                            },
                                            {
                                                top: 12,
                                                zIndex: 0,
                                            },
                                        ]}></View>
                                    <View
                                        style={[
                                            tw`w-[${yaklasma}%] h-1 bg-green-400`,
                                            {
                                                position: 'absolute',
                                                top: 12,
                                                zIndex: 0,
                                            },
                                        ]}></View>
                                </View>
                                <View style={[tw`flex items-start justify-center`, {zIndex: 2}]}>
                                    <MaterialCommunityIcons
                                        name="adjust"
                                        size={12}
                                        color={stil('text', data.app.theme).color}
                                    />
                                    <Text style={[stil('text', data.app.theme)]}>
                                        {l[data.app.lang].start} : {l[data.app.lang].mylocation}
                                    </Text>
                                </View>
                                <View style={[tw`flex items-end justify-center`, {zIndex: 2}]}>
                                    <MaterialCommunityIcons
                                        name="adjust"
                                        size={12}
                                        color={stil('text', data.app.theme).color}
                                    />
                                    <Text style={[stil('text', data.app.theme)]}>
                                        {l[data.app.lang].end} : {l[data.app.lang].passenger}
                                    </Text>
                                </View>
                            </View>

                            <View
                                style={[
                                    tw`flex-row mx-4 rounded-t-md py-2 px-4 items-center justify-between`,
                                    stil('bg', data.app.theme),
                                ]}>
                                {data.auth.userType == 'passenger' ? (
                                    <>
                                        <View style={[tw`flex items-start`]}>
                                            <Text style={[stil('text', data.app.theme)]}>
                                                {l[data.app.lang].driver} :{' '}
                                                {data.trip.trip.driver.user_name}
                                            </Text>
                                            <Text style={[stil('text', data.app.theme)]}>
                                                {l[data.app.lang].carPlate} :{' '}
                                                {data.trip.trip.driver.user_data.car_plate}
                                            </Text>
                                        </View>
                                        <View style={[tw`flex items-start`]}>
                                            <Text style={[stil('text', data.app.theme)]}>
                                                {l[data.app.lang].car} :{' '}
                                                {data.trip.trip.driver.user_data.car_brand}{' '}
                                                {data.trip.trip.driver.user_data.car_model}
                                            </Text>
                                            <Text style={[stil('text', data.app.theme)]}>
                                                {l[data.app.lang].carType}:{' '}
                                                {data.trip.trip.driver.user_data.car_type}
                                            </Text>
                                        </View>
                                    </>
                                ) : null}
                            </View>
                            {data.auth.userType == 'driver' ? (
                                <View
                                    style={[
                                        tw`flex-row mx-4 rounded-b-md py-2 px-4 mb-6 items-center justify-between`,
                                        stil('bg', data.app.theme),
                                    ]}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            Alert.alert(
                                                '',
                                                l[data.app.lang].iptall,
                                                [
                                                    {
                                                        text: l[data.app.lang].back,
                                                        onPress: () =>
                                                            console.log('Cancel Pressed'),
                                                        style: 'cancel',
                                                    },
                                                    {
                                                        text: l[data.app.lang].confirm,
                                                        onPress: () => {
                                                            dispatch({
                                                                type: 'isLoading',
                                                                payload: true,
                                                            });
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
                                        style={[tw`px-4 w-2/5 py-4 rounded-md`]}>
                                        <Text style={[tw`text-red-500 text-center font-semibold`]}>
                                            {l[data.app.lang].cancel}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            dispatch({type: 'isLoading', payload: true});
                                            apiPost('updateActiveTrip', {
                                                prc: 'tripChange',
                                                lang: data.app.lang,
                                                token: data.auth.userToken,
                                                id: data.auth.userId,
                                                trip_id: data.trip.trip.id,
                                                status: 3,
                                            });
                                        }}
                                        style={[tw`px-4 w-2/5 py-4 rounded-md bg-[#00A300]`]}>
                                        <Text style={[tw`text-white text-center font-semibold`]}>
                                            {l[data.app.lang].start}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[stil('bg2', data.app.theme), tw`p-2 rounded-md`]}
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
                                            size={32}
                                            color={stil('text', data.app.theme).color}
                                        />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={[tw`mb-6`]}></View>
                            )}
                        </BottomSheetView>
                    </BottomSheet>
                </View>
            )}
        </>
    );
}

export default MapPage;
