import React, {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {
    BackHandler,
    TouchableOpacity,
    View,
    Text,
    ScrollView,
    Image,
    TextInput,
    KeyboardAvoidingView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import {stil} from '../../utils';
import l from '../../languages.json';

import {useNavigation} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
//burayafont yükle gelecek

import StatusBarComponent from '../../components/global/status';
import config from '../../app.json';
import {apiPost} from '../../axios';
import {getUniqueId} from 'react-native-device-info';

export default function ProfileEdit() {
    const navigation = useNavigation();
    handleBackButtonClick = () => {
        navigation.navigate('Profile');
    };
    useEffect(() => {
        const abortController = new AbortController();
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        return () => {
            abortController.abort();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };
    }, []);
    const dispatch = useDispatch();
    const data = useSelector((state) => state);
    const [userName, setUserName] = React.useState(null);
    const [carNumber, setCarNumber] = React.useState(null);
    const [uploadedImage, setUploadedImage] = React.useState(null);
    const [userImage, setUserImage] = React.useState(null);
    const [gender, setGender] = React.useState(null);
    const [dateofbirth, setDateOfBirth] = React.useState(null);

    useEffect(() => {
        const abortController = new AbortController();
        setDateOfBirth(data.auth.user.user_data.dateofbirth);
        setGender(data.auth.user.user_data.gender);
        setUserName(data.auth.user.user_name);
        setCarNumber(data.auth.user.user_data.car_number);
        if (data.auth.user.user_data.user_image)
            setUserImage({uri: config.imageBaseUrl + data.auth.user.user_data.user_image});
        return () => {
            abortController.abort();
            false;
        };
    }, []);

    const getPhotoWithPhone = () => {
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
                setUploadedImage('data:image/jpeg;base64,' + source);
                setUserImage({uri: 'data:image/jpeg;base64,' + response.assets[0].base64});
            }
        });
    };

    const saveUserInfo = () => {
        let arr;
        if (uploadedImage != null) {
            arr = {
                id: data.auth.userId,
                user_name: userName,
                user_device: getUniqueId(),
                user_image: uploadedImage,
                car_number: carNumber,
                token: data.auth.userToken,
                dateofbirth: dateofbirth,
                gender: gender,
            };
        } else {
            arr = {
                id: data.auth.userId,
                user_name: userName,
                user_device: getUniqueId(),
                car_number: carNumber,
                token: data.auth.userToken,
                dateofbirth: dateofbirth,
                gender: gender,
            };
        }

        apiPost('updateUser', arr)
            .then((response) => {
                dispatch({type: 'setUser', payload: response.data.response});
                setUserName(response.data.response.user_name);
                if (data.auth.user.user_data.user_image)
                    setUserImage({
                        uri: config.imageBaseUrl + response.data.response.user_data.user_image,
                    });
                alert(l[data.app.lang].profileEdit);
            })
            .catch((error) => {
                console.log('PROFİLEEDT.JS ERROR (UPDATE USER)', error);
            });
    };
    const [open, setOpen] = React.useState(false);

    const setTarihFormat = (number) => {
        let newText = '';
        let numbers = '0123456789';
        let adet = 0;
        for (var i = 0; i < number.length; i++) {
            if (numbers.indexOf(number[i]) > -1) {
                newText = newText + number[i];
                if (adet == 1) newText = newText + '/';
                if (adet == 3) newText = newText + '/';
                adet = adet + 1;
            }
        }
        setDateOfBirth(newText.trimEnd(' '));
    };

    const setCardFormat = (number) => {
        let newText = '';
        let numbers = '0123456789';
        let adet = 0;
        for (var i = 0; i < number.length; i++) {
            if (numbers.indexOf(number[i]) > -1) {
                newText = newText + number[i];
                if (adet == 3) newText = newText + ' ';
                if (adet == 7) newText = newText + ' ';
                if (adet == 11) newText = newText + ' ';
                adet = adet + 1;
            }
        }
        setCarNumber(newText.trimEnd(' '));
    };
    return (
        <KeyboardAvoidingView
            style={tw`flex-1`}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            enabled>
            <StatusBarComponent />
            <ScrollView style={[stil('bg', data.app.theme), tw`p-4 flex-1`]}>
                <View
                    style={[
                        tw`rounded-md p-4 flex-row items-center justify-start`,
                        stil('bg2', data.app.theme),
                    ]}>
                    <View style={[tw``]}>
                        {userImage ? (
                            <Image
                                style={[tw`rounded-md`, {height: 100, width: 100}]}
                                source={userImage}
                            />
                        ) : null}
                    </View>
                    <View style={[tw`ml-4`]}>
                        <TouchableOpacity onPress={() => getPhotoWithPhone()}>
                            <Text style={[tw`text-lg p-8`, stil('text', data.app.theme)]}>
                                {l[data.app.lang].imageUpload}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View
                    style={[
                        tw` rounded-md p-2 mt-4 flex  justify-between`,
                        stil('bg2', data.app.theme),
                    ]}>
                    <Text style={[tw` font-medium`, {color: stil('text', data.app.theme).color}]}>
                        {l[data.app.lang].first_name} :{' '}
                    </Text>
                    <View style={tw`flex flex-row justify-end`}>
                        <View
                            style={[
                                tw`w-full rounded-md  mt-2   border `,
                                {borderColor: stil('bg', data.app.theme).backgroundColor},
                            ]}>
                            <TextInput
                                style={[stil('text', data.app.theme), tw`p-2`]}
                                placeholderTextColor={stil('text', data.app.theme).color}
                                value={userName}
                                placeholder={l[data.app.lang].first_name}
                                onChangeText={(text) => setUserName(text)}
                            />
                        </View>
                    </View>
                </View>
                {data.auth.userType == 'driver' ? (
                    <View
                        style={[
                            tw` rounded-md p-2 mt-4 flex  justify-between`,
                            stil('bg2', data.app.theme),
                        ]}>
                        <Text
                            style={[tw` font-medium`, {color: stil('text', data.app.theme).color}]}>
                            {l[data.app.lang].cardNumber} :{' '}
                        </Text>
                        <View style={tw`flex flex-row justify-end`}>
                            <View
                                style={[
                                    tw`w-full rounded-md  mt-2   border `,
                                    {borderColor: stil('bg', data.app.theme).backgroundColor},
                                ]}>
                                <TextInput
                                    maxLength={19}
                                    style={[stil('text', data.app.theme), tw`p-2`]}
                                    placeholderTextColor={stil('text', data.app.theme).color}
                                    value={carNumber}
                                    onChangeText={(text) => setCardFormat(text)}
                                />
                            </View>
                        </View>
                    </View>
                ) : null}
                <View
                    style={[
                        tw` rounded-md p-2 mt-4 flex  justify-between`,
                        stil('bg2', data.app.theme),
                    ]}>
                    <Text style={[tw` font-medium`, {color: stil('text', data.app.theme).color}]}>
                        {l[data.app.lang].dateofbirth} :{' '}
                    </Text>
                    <View style={tw`flex flex-row justify-end`}>
                        <View
                            style={[
                                tw`w-full rounded-md  mt-2   border `,
                                {borderColor: stil('bg', data.app.theme).backgroundColor},
                            ]}>
                            <TextInput
                                maxLength={10}
                                style={[stil('text', data.app.theme), tw`p-2`]}
                                placeholder="00/00/0000"
                                placeholderTextColor={stil('text', data.app.theme).color}
                                value={dateofbirth}
                                onChangeText={(text) => setTarihFormat(text)}
                            />
                        </View>
                    </View>
                </View>

                <View
                    style={[
                        tw` rounded-md p-2 mt-4 flex  justify-between`,
                        stil('bg2', data.app.theme),
                    ]}>
                    <Text style={[tw` font-medium`, {color: stil('text', data.app.theme).color}]}>
                        {l[data.app.lang].gender} :{' '}
                    </Text>
                    <View style={tw`flex flex-row justify-end`}>
                        <View
                            style={[
                                tw`w-full rounded-md  mt-2    flex-row justify-between items-center`,
                                {borderColor: stil('bg', data.app.theme).backgroundColor},
                            ]}>
                            <TouchableOpacity
                                style={[
                                    tw`w-1/3 rounded-md flex-row items-center justify-between px-2`,
                                    stil('bg', data.app.theme),
                                ]}
                                onPress={() => {
                                    setGender('male');
                                }}>
                                <Text style={[stil('text', data.app.theme), tw`p-2`]}>
                                    {l[data.app.lang].male}
                                </Text>
                                {gender == 'male' ? (
                                    <MaterialCommunityIcons
                                        name="check-circle"
                                        size={24}
                                        color="green"
                                    />
                                ) : null}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    tw`w-1/3 rounded-md  flex-row items-center justify-between px-2`,
                                    stil('bg', data.app.theme),
                                ]}
                                onPress={() => {
                                    setGender('female');
                                }}>
                                <Text style={[stil('text', data.app.theme), tw`p-2`]}>
                                    {l[data.app.lang].female}
                                </Text>
                                {gender == 'female' ? (
                                    <MaterialCommunityIcons
                                        name="check-circle"
                                        size={24}
                                        color="green"
                                    />
                                ) : null}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => {
                        saveUserInfo();
                    }}
                    style={[
                        tw`flex flex-row justify-center items-center mb-24 rounded-md  mt-4 `,
                        stil('bg2', data.app.theme),
                    ]}>
                    <Text
                        style={[
                            tw`text-center text-xl android:text-xl p-2 ml-4 mr-4 `,
                            stil('text', data.app.theme),
                        ]}>
                        {l[data.app.lang].save}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
