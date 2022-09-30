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
import {Linking} from 'react-native';
import {apiPost} from '../../axios';
import {getValue, setValue, removeValue} from '../../async';
import tw from 'twrnc';
import {stil} from '../../utils';
import l from '../../languages.json';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';
import {ActivityIndicator} from 'react-native';

function MapPage2() {
    let webViewRef = React.useRef();
    const bottomSheetRef = React.useRef(null);
    const source = config.navigationBaseUrl;
    const data = useSelector((state) => state);
    const dispatch = useDispatch();
    const initialSnapPoints = React.useMemo(() => ['CONTENT_HEIGHT'], []);
    const [ortala, setOrtala] = React.useState(false);
    const [yonText, setYonText] = React.useState('');
    const [yonMesafe, setYonMesafe] = React.useState('');
    const [priceModal, setPriceModal] = React.useState(false);
    const [locations, setLocations] = React.useState([]);
    const [time, setTime] = React.useState(0);
    const [price, setPrice] = React.useState(data.trip.trip.act_price);
    const [km, setkm] = React.useState(data.trip.trip.act_distance);

    const {animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout} =
        useBottomSheetDynamicSnapPoints(initialSnapPoints);

    const [carprice, setCarPrice] = React.useState(parseFloat(data.trip.trip.act_price));
    const [kmcar, setKmCar] = React.useState(parseFloat(data.trip.trip.act_distance));
    const [geo, setGeo] = React.useState(null);
    const [fiyatHesapla, setfiyatHesapla] = React.useState([]);
    const [first, setFirst] = React.useState(true);

    const [icon, setIcon] = React.useState('arrow-up-bold');
    const [mapLoading, setMapLoading] = React.useState(true);
    const [yaklasma, setYaklasma] = React.useState(0);

    return (
        <>
            <View style={{flex: 1}}>
                {/* <View style={[{height: '100%'}]}>// HARİTA</View> */}

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
                        </View>
                        <View style={[tw`flex-row mx-4  mb-2  items-center justify-between`]}>
                            <View style={[tw`flex-row items-center justify-between`]}>
                                {data.auth.userType == 'driver' ? (
                                    <>
                                        <View
                                            style={[
                                                tw`flex items-start justify-center rounded-md p-2 mr-1`,
                                                stil('bg', data.app.theme),
                                            ]}>
                                            <Text style={[stil('text', data.app.theme)]}>
                                                {time} min {km} km
                                            </Text>
                                        </View>
                                        <View
                                            style={[
                                                tw`flex items-end justify-center rounded-md p-2`,
                                                stil('bg', data.app.theme),
                                            ]}>
                                            <Text style={[stil('text', data.app.theme)]}>
                                                {price} sum
                                            </Text>
                                        </View>
                                    </>
                                ) : null}
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
                                    style={[tw`rounded-md p-2 mr-1`, stil('bg', data.app.theme)]}>
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
                                    {data.trip.trip.locations[0].title}
                                </Text>
                            </View>
                            <View style={[tw`flex items-end justify-center`, {zIndex: 2}]}>
                                <MaterialCommunityIcons
                                    name="adjust"
                                    size={12}
                                    color={stil('text', data.app.theme).color}
                                />
                                <Text style={[stil('text', data.app.theme)]}>
                                    {
                                        data.trip.trip.locations[
                                            data.trip.trip.locations.length - 1
                                        ].title
                                    }
                                </Text>
                            </View>
                        </View>

                        <View
                            style={[
                                tw`flex-row mx-4 rounded-t-md pt-2 px-4 items-center justify-between`,
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
                        <View
                            style={[
                                tw`flex-row mx-4 rounded-b-md py-2 px-4 mb-6 items-center justify-between`,
                                stil('bg', data.app.theme),
                            ]}>
                            {data.auth.userType == 'driver' ? (
                                <TouchableOpacity
                                    onPress={() => {
                                        setPriceModal(true);
                                    }}
                                    style={[tw`px-4 w-5/6 py-4 rounded-md bg-[#00A300]`]}>
                                    <Text style={[tw`text-white text-center font-semibold`]}>
                                        {l[data.app.lang].end}
                                    </Text>
                                </TouchableOpacity>
                            ) : null}
                            <TouchableOpacity
                                style={[
                                    stil('bg2', data.app.theme),
                                    tw`p-2 ${
                                        data.auth.userType == 'passenger'
                                            ? 'w-full items-center justify-center'
                                            : ''
                                    } rounded-md`,
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
                                    size={32}
                                    color={stil('text', data.app.theme).color}
                                />
                            </TouchableOpacity>
                        </View>
                    </BottomSheetView>
                </BottomSheet>
            </View>
            <Modal
                animationType="fade"
                transparent={true}
                visible={priceModal}
                onRequestClose={() => {
                    setPriceModal(!priceModal);
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
                        <View style={[tw`  w-full`, stil('bg', data.app.theme)]}>
                            <View style={[tw` flex items-center  my-2 `]}>
                                <View>
                                    <Text
                                        style={[
                                            stil('text', data.app.theme),
                                            tw` text-center font-bold text-2xl mb-2`,
                                        ]}>
                                        {l[data.app.lang].price.toUpperCase()}
                                    </Text>
                                    <Text
                                        style={[
                                            stil('text', data.app.theme),
                                            tw` text-center font-bold text-3xl mb-8`,
                                        ]}>
                                        {Math.ceil(price / 500) * 500} sum
                                    </Text>
                                    <Text
                                        style={[
                                            stil('text', data.app.theme),
                                            tw` text-center font-bold  mb-4`,
                                        ]}>
                                        {km} km {time} min
                                    </Text>
                                </View>
                                <View style={[tw`flex-row items-center justify-between`]}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setPriceModal(false);
                                        }}
                                        style={[tw`px-4 w-1/2 py-3 rounded-md`]}>
                                        <Text
                                            style={[tw`text-[#A40000]  text-center font-semibold`]}>
                                            {l[data.app.lang].back}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            dispatch({type: 'isLoading', payload: true});
                                            setValue('TTLocations', JSON.stringify([]));
                                            Geolocation.clearWatch(geo);
                                            apiPost('updateActiveTrip', {
                                                prc: 'tripChange',
                                                lang: data.app.lang,
                                                token: data.auth.userToken,
                                                id: data.auth.userId,
                                                trip_id: data.trip.trip.id,
                                                act_price: price,
                                                act_time: time,
                                                act_distance: km,
                                                end_time: new Date().getTime() / 1000,
                                                status: 4,
                                            });
                                        }}
                                        style={[tw`px-4 w-1/2 py-3 rounded-md bg-[#00A300]`]}>
                                        <Text style={[tw`text-white text-center font-semibold`]}>
                                            {l[data.app.lang].end}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

export default MapPage2;
