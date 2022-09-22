import React, {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {stil} from '../../utils';
import tw from 'twrnc';
import {removeValue} from '../../async';
import l from '../../languages.json';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {launchImageLibrary} from 'react-native-image-picker';
import {getUniqueId, getManufacturer} from 'react-native-device-info';

import BottomSheet, {
    useBottomSheetDynamicSnapPoints,
    BottomSheetView,
    BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import {apiPost} from '../../axios';
MaterialCommunityIcons.loadFont();

import {
    BackHandler,
    SafeAreaView,
    Text,
    View,
    Image,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
} from 'react-native';
import StatusBarComponent from '../../components/global/status';

export default function DriverForm() {
    const dispatch = useDispatch();
    const data = useSelector((state) => state);
    const [step, setStep] = React.useState(1);
    const bottomSheetRef = React.useRef(null);
    const [DATA, setDATA] = React.useState([]);
    const [kayitModal, setKayitModal] = React.useState(false);

    const initialSnapPoints = React.useMemo(() => ['CONTENT_HEIGHT'], []);

    const {animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout} =
        useBottomSheetDynamicSnapPoints(initialSnapPoints);

    handleBackButtonClick = () => {
        let back = 1;
        if (step > 1) {
            back = parseInt(step) - 1;
            setStep(back);
            return true;
        }
    };

    useEffect(() => {
        const abortController = new AbortController();
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        return () => {
            abortController.abort();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };
    }, [step]);

    useEffect(() => {
        const abortController = new AbortController();
        if (data.auth.user.user_name != '') {
            setKayitModal(true);
            setStep(0);
        }
        setFormat(data.auth.user.user_phone);
        apiPost('getPrices', {
            lang: data.app.lang,
            token: data.app.userToken,
        }).then((response) => {
            setDATA(response.data.response);
        });
        return () => {
            abortController.abort();
            false;
        };
    }, []);

    const setFormat = (number) => {
        let newText = '';
        let numbers = '0123456789';
        let adet = 0;
        for (var i = 0; i < number.length; i++) {
            if (numbers.indexOf(number[i]) > -1) {
                newText = newText + number[i];
                if (adet == 2) newText = newText + ' ';
                if (adet == 4) newText = newText + ' ';
                if (adet == 7) newText = newText + ' ';
                if (adet == 9) newText = newText + ' ';
                adet = adet + 1;
            }
        }
        setPhone(((number.length > 0 ? '+' : '') + newText).trimEnd(' '));
    };

    const getPhotoWithPhone = (who) => {
        let options = {
            storageOption: {
                path: 'images',
                mediaType: 'photo',
            },
            includeBase64: true,
            maxWidth: 500,
            maxHeight: 500,
            quality: 0.9,
        };
        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                const source = response.assets[0].base64;
                let ia = [];
                ia[who] = {uri: 'data:image/jpeg;base64,' + source};
                ia[who + '_upload'] = 'data:image/jpeg;base64,' + source;
                setImages({...images, ...ia});
            }
        });
    };

    const [name, setName] = React.useState('');
    const [plaka, setPlaka] = React.useState('');
    const [carType, setCarType] = React.useState('');
    const [carBrand, setCarBrand] = React.useState('');
    const [carModel, setCarModel] = React.useState('');
    const [phone, setPhone] = React.useState(data.auth.user.user_phone);
    const [images, setImages] = React.useState({
        driver: require('../../assets/img/orneksurucu.jpeg'),
        license_image: require('../../assets/img/ornekehliyet.jpeg'),
        driver_license_image: require('../../assets/img/ornekruhsat.jpeg'),
        car_image_1: require('../../assets/img/ornekarac2.jpeg'),
        car_image_2: require('../../assets/img/ornekarac1.jpeg'),
    });

    const [loading, setLoading] = React.useState(false);

    const saveDriver = () => {
        setLoading(true);
        if (name == '') {
            alert(l[data.app.lang].first_name + l[data.app.lang].notnull);
            return false;
            setLoading(false);
        } else if (plaka == '') {
            alert(l[data.app.lang].carPlate + l[data.app.lang].notnull);
            return false;
            setLoading(false);
        } else if (carType == '') {
            alert(l[data.app.lang].carType + l[data.app.lang].notnull);
            return false;
            setLoading(false);
        } else if (phone.length != 17) {
            alert(l[data.app.lang].phone + l[data.app.lang].notnull);
            return false;
            setLoading(false);
        } else if (!images.driver_upload) {
            alert(l[data.app.lang].diu + l[data.app.lang].notnull);
            return false;
            setLoading(false);
        } else if (!images.license_image_upload) {
            alert(l[data.app.lang].dliu + l[data.app.lang].notnull);
            return false;
            setLoading(false);
        } else if (!images.driver_license_image_upload) {
            alert(l[data.app.lang].driu + l[data.app.lang].notnull);
            return false;
            setLoading(false);
        } else if (!images.car_image_1_upload) {
            alert(l[data.app.lang].dciu + l[data.app.lang].notnull);
            return false;
            setLoading(false);
        } else if (!images.car_image_2_upload) {
            alert(l[data.app.lang].dciu + l[data.app.lang].notnull);
            return false;
            setLoading(false);
        }

        apiPost('updateUser', {
            token: data.auth.userToken,
            id: data.auth.userId,
            user_device: getUniqueId(),
            user_name: name,
            car_plate: plaka,
            car_type: carType,
            car_brand: carBrand,
            car_model: carModel,
            user_image: images.driver_upload,
            car_image_1: images.car_image_1_upload,
            car_image_2: images.car_image_2_upload,
            license_image: images.license_image_upload,
            driver_license_image: images.driver_license_image_upload,
            car_usage_license_image: images.car_usage_license_image_upload,
            user_status: 1,
            user_balance: 100000,
        }).then((response) => {
            dispatch({type: 'setUser', payload: response.data.response});
            setKayitModal(true);
            setStep(0);
            setLoading(false);
        });
    };

    return (
        <SafeAreaView style={[stil('bg', data.app.theme), tw`flex-1 items-center justify-start`]}>
            <StatusBarComponent />
            <View style={[tw`mt-24 flex items-center justify-center `]}>
                <Image
                    style={[
                        {
                            position: 'absolute',
                            height: '100%',
                        },
                        tw`opacity-100`,
                    ]}
                    resizeMode="contain"
                    source={
                        data.app.theme == 'dark'
                            ? require('../../assets/img/uzbekistanBGA.png')
                            : require('../../assets/img/uzbekistanBGR.png')
                    }
                />
                <Image
                    style={[tw`h-32 w-32 mb-2 rounded-2xl mt-12`]}
                    source={require('../../assets/img/1024.png')}
                />
                <Text style={[tw`font-semibold text-xl`, stil('text', data.app.theme)]}>
                    Trend Taxi
                </Text>
            </View>
            <BottomSheet
                ref={bottomSheetRef}
                snapPoints={animatedSnapPoints}
                handleHeight={animatedHandleHeight}
                contentHeight={animatedContentHeight}
                handleIndicatorStyle={[{display: 'none'}, tw`w-0 m-0 p-0`]}
                keyboardBehavior="interactive"
                backgroundStyle={stil('bg2', data.app.theme)}
                style={[tw`mx-4`, {zIndex: 9999}]}>
                <BottomSheetView onLayout={handleContentLayout} style={[tw`mx-4 pb-4`]}>
                    <View>
                        <Text
                            style={[
                                tw`text-center font-semibold text-lg mb-4`,
                                {letterSpacing: 4},
                                stil('text', data.app.theme),
                            ]}>
                            {l[data.app.lang].dregister}
                        </Text>
                    </View>
                    {step == 1 ? (
                        <View>
                            <View>
                                <Text style={[tw`ml-1 pb-1`, stil('text', data.app.theme)]}>
                                    {l[data.app.lang].first_name}
                                </Text>
                                <BottomSheetTextInput
                                    placeholder={l[data.app.lang].first_name}
                                    placeholderTextColor={stil('text', data.app.theme).color}
                                    style={[
                                        tw`h-12 px-4 mb-4 rounded-md w-full`,
                                        stil('text', data.app.theme),
                                        stil('bg', data.app.theme),
                                    ]}
                                    onChangeText={(text) => {
                                        setName(text);
                                    }}
                                    value={name}
                                />
                            </View>
                            <View>
                                <Text style={[tw`ml-1 pb-1`, stil('text', data.app.theme)]}>
                                    {l[data.app.lang].phone}
                                </Text>
                                <BottomSheetTextInput
                                    autoFocus={true}
                                    placeholder="+___-__-___-__-__"
                                    placeholderTextColor={stil('text', data.app.theme).color}
                                    style={[
                                        tw`h-12 rounded-md px-4 mb-4`,
                                        stil('text', data.app.theme),
                                        stil('bg', data.app.theme),
                                    ]}
                                    onChangeText={(text) => {
                                        setFormat(text);
                                    }}
                                    value={phone}
                                    maxLength={17}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View>
                                <Text style={[tw`ml-1 pb-1`, stil('text', data.app.theme)]}>
                                    {l[data.app.lang].diu}
                                </Text>
                                <TouchableOpacity onPress={() => getPhotoWithPhone('driver')}>
                                    <View
                                        style={[
                                            tw`rounded-md p-2 mb-4 flex-row items-center justify-between`,
                                            stil('bg', data.app.theme),
                                        ]}>
                                        <View style={[tw`h-12 w-12`]}>
                                            {images.driver ? (
                                                <Image
                                                    style={[
                                                        tw`rounded-md`,
                                                        {height: '100%', width: '100%'},
                                                    ]}
                                                    source={images.driver ?? ''}
                                                />
                                            ) : null}
                                        </View>
                                        <View style={[tw`ml-4`]}>
                                            <Text style={[tw``, stil('text', data.app.theme)]}>
                                                {l[data.app.lang].upload}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : null}
                    {step == 2 ? (
                        <View>
                            <View>
                                <Text style={[tw`ml-1 pb-1`, stil('text', data.app.theme)]}>
                                    {l[data.app.lang].dliu}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => getPhotoWithPhone('license_image')}>
                                    <View
                                        style={[
                                            tw`rounded-md p-2 mb-4 flex-row items-center justify-between`,
                                            stil('bg', data.app.theme),
                                        ]}>
                                        <View style={[tw`h-12 w-12`]}>
                                            {images.license_image ? (
                                                <Image
                                                    style={[
                                                        tw`rounded-md`,
                                                        {height: '100%', width: '100%'},
                                                    ]}
                                                    source={images.license_image ?? ''}
                                                />
                                            ) : null}
                                        </View>
                                        <View style={[tw`ml-4`]}>
                                            <Text style={[tw``, stil('text', data.app.theme)]}>
                                                {l[data.app.lang].upload}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View>
                                <Text style={[tw`ml-1 pb-1`, stil('text', data.app.theme)]}>
                                    {l[data.app.lang].driu}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => getPhotoWithPhone('driver_license_image')}>
                                    <View
                                        style={[
                                            tw`rounded-md p-2 mb-4 flex-row items-center justify-between`,
                                            stil('bg', data.app.theme),
                                        ]}>
                                        <View style={[tw`h-12 w-12`]}>
                                            {images.driver_license_image ? (
                                                <Image
                                                    style={[
                                                        tw`rounded-md`,
                                                        {height: '100%', width: '100%'},
                                                    ]}
                                                    source={images.driver_license_image ?? ''}
                                                />
                                            ) : null}
                                        </View>
                                        <View style={[tw`ml-4`]}>
                                            <Text style={[tw``, stil('text', data.app.theme)]}>
                                                {l[data.app.lang].upload}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View>
                                <Text style={[tw`ml-1 pb-1`, stil('text', data.app.theme)]}>
                                    {l[data.app.lang].cuciu}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => getPhotoWithPhone('car_usage_license_image')}>
                                    <View
                                        style={[
                                            tw`rounded-md p-2 mb-4 flex-row items-center justify-between`,
                                            stil('bg', data.app.theme),
                                        ]}>
                                        <View style={[tw`h-12 w-12`]}>
                                            {images.car_usage_license_image ? (
                                                <Image
                                                    style={[
                                                        tw`rounded-md`,
                                                        {height: '100%', width: '100%'},
                                                    ]}
                                                    source={images.car_usage_license_image ?? ''}
                                                />
                                            ) : null}
                                        </View>
                                        <View style={[tw`ml-4`]}>
                                            <Text style={[tw``, stil('text', data.app.theme)]}>
                                                {l[data.app.lang].upload}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : null}
                    {step == 3 ? (
                        <View>
                            <View>
                                <Text style={[tw`ml-1 pb-1`, stil('text', data.app.theme)]}>
                                    {l[data.app.lang].carPlate}
                                </Text>
                                <BottomSheetTextInput
                                    placeholder={l[data.app.lang].carPlate}
                                    placeholderTextColor={stil('text', data.app.theme).color}
                                    style={[
                                        tw`h-12 px-4 mb-4 rounded-md w-full`,
                                        stil('text', data.app.theme),
                                        stil('bg', data.app.theme),
                                    ]}
                                    onChangeText={(text) => {
                                        setPlaka(text);
                                    }}
                                    value={plaka}
                                />
                            </View>
                            <View>
                                <Text style={[tw`ml-1 pb-1`, stil('text', data.app.theme)]}>
                                    {l[data.app.lang].carType}
                                </Text>
                                <View style={[tw`flex-row mb-4 items-center justify-between`]}>
                                    {DATA.map((item, index) => {
                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                onPress={() => {
                                                    setCarType(item.car_type);
                                                }}
                                                style={[
                                                    tw`p-3 rounded-md`,
                                                    stil(
                                                        carType == item.car_type ? 'bg2' : 'bg',
                                                        data.app.theme,
                                                    ),
                                                    {
                                                        borderWidth: 1,
                                                    },
                                                ]}>
                                                <Text style={[stil('text', data.app.theme)]}>
                                                    {item.title}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                            <View>
                                <Text style={[tw`ml-1 pb-1`, stil('text', data.app.theme)]}>
                                    {l[data.app.lang].carBrand}
                                </Text>
                                <BottomSheetTextInput
                                    placeholder={l[data.app.lang].carBrand}
                                    placeholderTextColor={stil('text', data.app.theme).color}
                                    style={[
                                        tw`h-12 px-4 mb-4 rounded-md w-full`,
                                        stil('text', data.app.theme),
                                        stil('bg', data.app.theme),
                                    ]}
                                    onChangeText={(text) => {
                                        setCarBrand(text);
                                    }}
                                    value={carBrand}
                                />
                            </View>
                            <View>
                                <Text style={[tw`ml-1 pb-1`, stil('text', data.app.theme)]}>
                                    {l[data.app.lang].carModel}
                                </Text>
                                <BottomSheetTextInput
                                    placeholder={l[data.app.lang].carModel}
                                    placeholderTextColor={stil('text', data.app.theme).color}
                                    style={[
                                        tw`h-12 px-4 mb-4 rounded-md w-full`,
                                        stil('text', data.app.theme),
                                        stil('bg', data.app.theme),
                                    ]}
                                    onChangeText={(text) => {
                                        setCarModel(text);
                                    }}
                                    value={carModel}
                                />
                            </View>
                        </View>
                    ) : null}
                    {step == 4 ? (
                        <View>
                            <View>
                                <Text style={[tw`ml-1 pb-1`, stil('text', data.app.theme)]}>
                                    {l[data.app.lang].dciu}
                                </Text>
                                <TouchableOpacity onPress={() => getPhotoWithPhone('car_image_1')}>
                                    <View
                                        style={[
                                            tw`rounded-md p-2 mb-4 flex-row items-center justify-between`,
                                            stil('bg', data.app.theme),
                                        ]}>
                                        <View style={[tw`h-12 w-12`]}>
                                            {images.car_image_1 ? (
                                                <Image
                                                    style={[
                                                        tw`rounded-md`,
                                                        {height: '100%', width: '100%'},
                                                    ]}
                                                    source={images.car_image_1 ?? ''}
                                                />
                                            ) : null}
                                        </View>
                                        <View style={[tw`ml-4`]}>
                                            <Text style={[tw``, stil('text', data.app.theme)]}>
                                                {l[data.app.lang].upload}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View>
                                <Text style={[tw`ml-1 pb-1`, stil('text', data.app.theme)]}>
                                    {l[data.app.lang].dciu}
                                </Text>
                                <TouchableOpacity onPress={() => getPhotoWithPhone('car_image_2')}>
                                    <View
                                        style={[
                                            tw`rounded-md p-2 mb-4 flex-row items-center justify-between`,
                                            stil('bg', data.app.theme),
                                        ]}>
                                        <View style={[tw`h-12 w-12`]}>
                                            {images.car_image_2 ? (
                                                <Image
                                                    style={[
                                                        tw`rounded-md`,
                                                        {height: '100%', width: '100%'},
                                                    ]}
                                                    source={images.car_image_2 ?? ''}
                                                />
                                            ) : null}
                                        </View>
                                        <View style={[tw`ml-4`]}>
                                            <Text style={[tw``, stil('text', data.app.theme)]}>
                                                {l[data.app.lang].upload}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : null}
                    <View style={[tw`flex-row items-center justify-between mt-4 mb-8`]}>
                        <TouchableOpacity
                            onPress={() => {
                                if (step == 1) {
                                    dispatch({type: 'authRemove'});
                                    dispatch({type: 'isAuth', payload: false});
                                    removeValue('TrendTaxiUser');
                                } else {
                                    setStep(step - 1);
                                }
                            }}
                            style={[
                                tw`flex-row items-center justify-center px-8 py-2 rounded-md`,
                                stil('bg', data.app.theme),
                            ]}>
                            <MaterialCommunityIcons
                                name="arrow-left-circle"
                                size={24}
                                color={stil('text', data.app.theme).color}
                            />
                            <Text style={[stil('text', data.app.theme), tw`ml-2`]}>
                                {l[data.app.lang].back}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                if (step == 4) {
                                    saveDriver();
                                } else {
                                    setStep(step + 1);
                                }
                            }}
                            style={[
                                tw`flex-row items-center justify-center px-8 py-2 rounded-md`,
                                stil('bg', data.app.theme),
                            ]}>
                            <Text style={[stil('text', data.app.theme), tw`mr-2`]}>
                                {step == 4 ? l[data.app.lang].save : l[data.app.lang].next}
                            </Text>
                            {loading ? (
                                <ActivityIndicator />
                            ) : (
                                <MaterialCommunityIcons
                                    name={step == 4 ? 'content-save' : 'arrow-right-circle'}
                                    size={24}
                                    color={stil('text', data.app.theme).color}
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                </BottomSheetView>
            </BottomSheet>
            <Modal
                animationType="fade"
                transparent={true}
                visible={kayitModal}
                onRequestClose={() => {
                    setKayitModal(!kayitModal);
                }}>
                <View
                    style={[
                        tw` flex-1 items-center justify-end pb-24`,
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
                                        tw`w-full py-2 rounded-md px-2 items-center`,
                                    ]}>
                                    <MaterialCommunityIcons
                                        name="check-circle-outline"
                                        size={64}
                                        color="green"
                                    />
                                    <Text style={[stil('text', data.app.theme), tw`text-center`]}>
                                        {l[data.app.lang].alreadyHesap}
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
                                setKayitModal(!kayitModal);
                                dispatch({type: 'authRemove'});
                                dispatch({type: 'isAuth', payload: false});
                                removeValue('TrendTaxiUser');
                            }}>
                            <Text style={[tw`font-semibold ml-2`, stil('text', data.app.theme)]}>
                                {l[data.app.lang].back}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
