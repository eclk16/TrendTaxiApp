import React, {useEffect} from 'react';
import {Text, View, TouchableOpacity, Platform} from 'react-native';
import WebView from 'react-native-webview';
import config from '../../app.json';
import {useSelector, useDispatch} from 'react-redux';
import BottomSheet, {useBottomSheetDynamicSnapPoints, BottomSheetView} from '@gorhom/bottom-sheet';
import tw from 'twrnc';
import {stil} from '../../utils';
import l from '../../languages.json';
import {apiPost} from '../../axios';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';
import {ActivityIndicator} from 'react-native';
import DriverForm from './driverFormScreen';
import Sound from 'react-native-sound';
import {setValue} from '../../async';

function Driver() {
    Sound.setCategory('Playback');
    let webViewRef = React.useRef();
    const bottomSheetRef = React.useRef(null);
    const data = useSelector((state) => state);
    const dispatch = useDispatch();
    const initialSnapPoints = React.useMemo(() => ['CONTENT_HEIGHT'], []);
    const [timeoutSn, setTimeoutSn] = React.useState(10);
    const [mapLoading, setMapLoading] = React.useState(true);
    let soundFile = 'ses14.mp3';
    if (Platform.OS === 'ios') {
        soundFile = 'ses-14.mp3';
    } else {
        soundFile = 'ses14.mp3';
    }

    const [mapUrl, setMapUrl] = React.useState(config.mapBaseUrl);

    const [soundLoaded, setSoundLoaded] = React.useState(false);

    const {animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout} =
        useBottomSheetDynamicSnapPoints(initialSnapPoints);

    const sendJS = (js) => {
        try {
            webViewRef.current?.injectJavaScript(`try {` + js + `true;} catch (error) {}`);
        } catch (error) {}
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

    const onMessage = (payload) => {
        try {
            let datas = JSON.parse(JSON.parse(payload.nativeEvent.data).data.log);
        } catch (e) {}
    };

    useEffect(() => {
        const abortController = new AbortController();
        if (!mapLoading) {
            dispatch({
                type: 'loc',
                payload: [data.app.currentLocation[0], data.app.currentLocation[1]],
            });
            sendJS(
                `markers[0].setIcon({icon:'nullCar.svg'});markerMove=false;markers[0].setCoordinates([` +
                    data.app.currentLocation[0] +
                    `,` +
                    data.app.currentLocation[1] +
                    `]);map.setCenter([` +
                    data.app.currentLocation[0] +
                    `,` +
                    data.app.currentLocation[1] +
                    `]);`,
            );
        }
        return () => {
            abortController.abort();
            false;
        };
    }, [mapLoading, data.trip.trip]);

    useEffect(() => {
        const abortController = new AbortController();
        apiActive(data.app.isActive ? 'active' : 'inactive');
        let int = setInterval(() => {
            apiActive(data.app.isActive ? 'active' : 'inactive');
        }, 10000);
        return () => {
            abortController.abort();
            clearInterval(int);
        };
    }, [data.app.isActive]);

    const apiActive = (activ = null) => {
        if (data.trip.trip === null && data.trip.tripRequest === null) {
            apiPost('updateUser', {
                id: data.auth.userId,
                is_active: activ == null ? data.app.isActive : activ,
                token: data.auth.userToken,
                last_latitude: data.app.currentLocation[0],
                last_longitude: data.app.currentLocation[1],
            }).catch((error) => {
                console.log('YOLCULUK KABUL ETME HATASI = ', error);
            });
        }
    };

    useEffect(() => {
        const abortController = new AbortController();
        let kalan = 10;
        let interr = setInterval(() => {
            kalan = kalan - 1;
            if (kalan < 0) {
                dispatch({type: 'setRequest', payload: null});
                dispatch({type: 'ia', payload: true});
                setloc([]);
            }
            setTimeoutSn(kalan);
        }, 1000);
        if (!data.trip.tripRequest) {
            dispatch({type: 'ia', payload: true});
            setTimeoutSn(10);
            clearInterval(interr);
            setloc([]);
        } else {
            let sound = new Sound(soundFile, Sound.MAIN_BUNDLE, () => {
                sound.play(() => {
                    sound.play();
                });
            });
            setloc(data.trip.tripRequest.locations);
        }

        return () => {
            abortController.abort();
            setloc([]);
            dispatch({type: 'ia', payload: true});
            clearInterval(interr);
        };
    }, [data.trip.tripRequest, soundLoaded]);

    const setloc = (loc) => {
        if (loc.length > 0) {
            let json = JSON.stringify({
                type: 'mapCreate',
                id: data.auth.userId,
                locations: loc,
            });
            sendJS(
                `markerMove=false;setMarker(` +
                    json +
                    `);map.fitBounds(
                    {
                        northEast: [` +
                    loc[0].lat +
                    `,` +
                    loc[0].lon +
                    `],
                        southWest: [` +
                    loc[loc.length - 1].lat +
                    `,` +
                    loc[loc.length - 1].lon +
                    `],    
                    },
                    {
                        padding: { top: 150, left: 150, bottom: 450, right: 150 },
                        considerRotation: true,
                    },
                );`,
            );
        } else {
            let json = JSON.stringify({
                type: 'mapCreate',
                id: data.auth.userId,
                locations: [
                    {
                        lat: data.app.currentLocation[0],
                        lon: data.app.currentLocation[1],
                        title: '',
                        description: '',
                        icon: 1,
                    },
                ],
            });
            if (!mapLoading) {
                dispatch({type: 'ia', payload: true});
                sendJS(`setMarker(` + json + `);markerMove=false;`);
                // sendJS(
                //     `markers[0].setIcon({icon:'nullCar.svg'});markers[0].setLabel({});markers[0].setCoordinates([` +
                //         data.app.currentLocation[0] +
                //         `,` +
                //         data.app.currentLocation[1] +
                //         `]);`,
                // );
                mapLoad(data.app.currentLocation);
            }
        }
        return () => {
            abortController.abort();
            false;
        };
    };

    const wP = () => {
        const wid = Geolocation.watchPosition(
            (position) => {
                dispatch({
                    type: 'loc',
                    payload: [position.coords.longitude, position.coords.latitude],
                });
                sendJS(
                    `markers[0].setIcon({icon:'nullCar.svg'});markers[0].setCoordinates([` +
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

    const onaylaFunction = () => {
        apiPost('updateActiveTrip', {
            prc: 'tripCheck',
            lang: data.app.lang,
            token: data.auth.userToken,
            id: data.auth.userId,
            trip_id: data.trip.tripRequest.id,
        }).catch((error) => {
            console.log('YOLCULUK KABUL ETME HATASI = ', error);
        });
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
        if (!mapLoading) {
            sendJS(`markerMove=false;map.setCenter([` + d[0] + `,` + d[1] + `]);`);

            apiActive('active');
        }
    };

    return (
        <>
            {data.auth.user.user_status == 0 ? (
                <DriverForm />
            ) : (
                <>
                    <View style={{flex: 1}}>
                        <View style={[{height: '100%'}]}>
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
                                        sendJS(
                                            `map.setStyle('e01600ee-57a3-42e1-ae5c-6a51aaf8c657');`,
                                        );
                                    }
                                    if (data.app.mapTheme == 'light') {
                                        sendJS(
                                            `map.setStyle('32b1600d-4b8b-4832-871a-e33d8e4bb57f');`,
                                        );
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
                            backgroundStyle={[stil('bg', data.app.theme), tw`mx-4`]}>
                            <BottomSheetView onLayout={handleContentLayout}>
                                <View style={[tw`flex-row mt-2 items-center justify-center`]}>
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
                                            tw`rounded-md p-2 mr-2`,
                                            stil('bg2', data.app.theme),
                                        ]}>
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
                                <View style={[tw`flex-row mb-12 mt-2 items-center justify-center`]}>
                                    {data.trip.tripRequest != null ? (
                                        <View style={[tw`flex mx-4 items-center justify-center`]}>
                                            <View style={[tw`mb-4 mx-4 w-full`]}>
                                                <View
                                                    style={[
                                                        tw` rounded-md mb-1`,
                                                        stil('bg2', data.app.theme),
                                                        stil('text', data.app.theme),
                                                    ]}>
                                                    <Text
                                                        style={[
                                                            tw`font-semibold text-center p-2`,
                                                            stil('text', data.app.theme),
                                                        ]}>
                                                        {data.trip.tripRequest.passenger.user_name}
                                                    </Text>
                                                </View>
                                                <View style={[tw`flex`]}>
                                                    <View
                                                        style={[
                                                            stil('bg2', data.app.theme),
                                                            tw`flex-row justify-between items-center my-2 p-2 rounded-md`,
                                                        ]}>
                                                        <View
                                                            style={[
                                                                tw`   mb-1 items-center flex-row`,

                                                                stil('text', data.app.theme),
                                                            ]}>
                                                            <Text
                                                                style={[
                                                                    stil('text', data.app.theme),
                                                                    tw`font-bold text-center `,
                                                                ]}>
                                                                {data.trip.tripRequest.est_duration}{' '}
                                                                min
                                                            </Text>
                                                        </View>
                                                        <View
                                                            style={[
                                                                tw`  mb-1  items-center flex-row`,

                                                                stil('text', data.app.theme),
                                                            ]}>
                                                            <Text
                                                                style={[
                                                                    stil('text', data.app.theme),
                                                                    tw`font-bold text-center `,
                                                                ]}>
                                                                {data.trip.tripRequest.est_distance}{' '}
                                                                km
                                                            </Text>
                                                        </View>
                                                        <View
                                                            style={[
                                                                tw`  mb-1 items-center flex-row`,

                                                                stil('text', data.app.theme),
                                                            ]}>
                                                            <Text
                                                                style={[
                                                                    stil('text', data.app.theme),
                                                                    tw`font-bold text-center `,
                                                                ]}>
                                                                {data.trip.tripRequest.est_price}{' '}
                                                                sum
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    {data.trip.tripRequest.locations.map(
                                                        (item, index) => {
                                                            return (
                                                                <View
                                                                    key={index}
                                                                    style={[
                                                                        tw`flex-row items-center mb-2 rounded-md px-2 py-1`,
                                                                        stil('bg2', data.app.theme),
                                                                    ]}>
                                                                    <View>
                                                                        <MaterialCommunityIcons
                                                                            style={[
                                                                                tw`text-center mr-2`,
                                                                            ]}
                                                                            name="adjust"
                                                                            size={16}
                                                                            color={
                                                                                stil(
                                                                                    'text',
                                                                                    data.app.theme,
                                                                                ).color
                                                                            }
                                                                        />
                                                                    </View>
                                                                    <View>
                                                                        <Text
                                                                            style={[
                                                                                tw`text-xs font-semibold`,
                                                                                stil(
                                                                                    'text',
                                                                                    data.app.theme,
                                                                                ),
                                                                            ]}>
                                                                            {item.title}
                                                                        </Text>
                                                                        <Text
                                                                            style={[
                                                                                tw`text-xs`,
                                                                                stil(
                                                                                    'text',
                                                                                    data.app.theme,
                                                                                ),
                                                                            ]}>
                                                                            {item.description}
                                                                        </Text>
                                                                    </View>
                                                                </View>
                                                            );
                                                        },
                                                    )}
                                                </View>
                                            </View>
                                            <View style={[tw`flex items-center justify-center`]}>
                                                <TouchableOpacity
                                                    style={[
                                                        tw`flex-row items-center justify-center rounded-md px-4 w-50 bg-green-600`,
                                                    ]}
                                                    onPress={() => {
                                                        onaylaFunction();
                                                    }}>
                                                    <View
                                                        style={[
                                                            tw` h-[100%] w-[${
                                                                50 - parseInt(timeoutSn * 5)
                                                            }] rounded-md bg-green-900`,
                                                            {
                                                                borderTopRightRadius: 1000,

                                                                left: 0,
                                                                position: 'absolute',
                                                                zIndex: 999,
                                                            },
                                                        ]}></View>
                                                    <MaterialCommunityIcons
                                                        style={{zIndex: 9999}}
                                                        name="check"
                                                        size={20}
                                                        color="white"
                                                    />
                                                    <Text
                                                        style={[
                                                            tw`font-semibold ml-2 py-4 text-white`,
                                                            {zIndex: 9999},
                                                        ]}>
                                                        {l[data.app.lang].check} ({timeoutSn})
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            disabled={data.trip.tripRequest === null ? false : true}
                                            onPress={() => {
                                                dispatch({type: 'ia', payload: !data.app.isActive});
                                            }}
                                            style={[
                                                tw`${
                                                    data.app.isActive
                                                        ? 'bg-green-700'
                                                        : 'bg-gray-700'
                                                } p-4 rounded-md w-2/3`,
                                            ]}>
                                            <Text style={[tw`text-center text-white font-medium`]}>
                                                {l[data.app.lang].status}:{' '}
                                                {data.app.isActive
                                                    ? l[data.app.lang].active
                                                    : l[data.app.lang].inactive}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </BottomSheetView>
                        </BottomSheet>
                    </View>
                </>
            )}
        </>
    );
}

export default Driver;
