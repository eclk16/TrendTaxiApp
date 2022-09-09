import React, {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {
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
import {setValue} from '../../async';
import {useNavigation} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
MaterialCommunityIcons.loadFont();
import axios from 'axios';
import StatusBarComponent from '../../components/global/status';
import config from '../../app.json';
import {apiPost} from '../../axios';
import {getUniqueId} from 'react-native-device-info';

export default function ProfileEdit() {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const data = useSelector((state) => state);
    const [userName, setUserName] = React.useState(null);
    const [userPhone, setUserPhone] = React.useState(null);
    const [uploadedImage, setUploadedImage] = React.useState(null);
    const [userImage, setUserImage] = React.useState(null);

    useEffect(() => {
        setUserName(data.auth.user.user_name);
        setUserPhone(data.auth.user.user_phone);
        if (data.auth.user.user_data.user_image)
            setUserImage({uri: config.imageBaseUrl + data.auth.user.user_data.user_image});
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
        apiPost('updateUser', {
            id: data.auth.userId,
            user_name: userName,
            user_device: getUniqueId(),
            user_image: uploadedImage,
            token: data.auth.userToken,
        })
            .then((response) => {
                dispatch({type: 'setUser', payload: response.data.response});
                setUserName(response.data.response.user_name);
                setUserPhone(response.data.response.user_phone);
                if (data.auth.user.user_data.user_image)
                    setUserImage({
                        uri: config.imageBaseUrl + response.data.response.user_data.user_image,
                    });
            })
            .catch((error) => {
                console.log(error);
            });
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

                <View
                    style={[
                        tw` rounded-md p-2 mt-4 flex  justify-between`,
                        stil('bg2', data.app.theme),
                    ]}>
                    <Text style={[tw` font-medium`, {color: stil('text', data.app.theme).color}]}>
                        {l[data.app.lang].phone} :{' '}
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
                                value={userPhone}
                                placeholder={l[data.app.lang].phone}
                                onChangeText={(text) => setUserPhone(text)}
                            />
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
