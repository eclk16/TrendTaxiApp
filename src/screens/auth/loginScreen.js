import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {setValue} from '../../async';
import {stil} from '../../utils';
import tw from 'twrnc';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import l from '../../languages.json';
import BottomSheet, {BottomSheetTextInput} from '@gorhom/bottom-sheet';
import {getUniqueId, getManufacturer} from 'react-native-device-info';

MaterialCommunityIcons.loadFont();

import {Text, TouchableOpacity, View, ActivityIndicator} from 'react-native';
import {apiPost} from '../../axios';
function LoginScreen() {
    const dispatch = useDispatch();
    const data = useSelector((state) => state);

    const [loading, setLoading] = React.useState(false);
    const [userPhone, setUserPhone] = React.useState('');
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
        setUserPhone(((number.length > 0 ? '+' : '') + newText).trimEnd(' '));
    };

    const [smsOnay, setSmsOnay] = React.useState(false);
    const [smsOnayText, setSmsOnayText] = React.useState('');

    const [loginUser, setLoginUser] = React.useState([]);

    const smsOnayFunction = () => {
        setLoading(true);
        if (loginUser.smsToken != smsOnayText) {
            setLoading(false);
            alert('!');
            return;
        }
        apiPost('updateUser', {
            id: loginUser.id,
            user_device: getUniqueId(),
            user_verified_code: 1,
            token: loginUser.token,
        })
            .then((response) => {
                console.log(response.data);
                loginFunction();
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    };

    const loginFunction = () => {
        setLoading(true);
        apiPost('auth/login', {
            user_phone: userPhone.replaceAll(' ', '').replace('+', ''),
            user_device: getUniqueId(),
            user_taxi_park: 'trendtaxi',
            user_type: data.auth.userType,
        })
            .then((response) => {
                if (response.data.smsToken) {
                    setLoginUser(response.data);
                    setSmsOnay(true);
                } else {
                    setValue(
                        'TrendTaxiUser',
                        JSON.stringify({
                            type: response.data.response.user_type,
                            id: response.data.response.id,
                            token: response.data.token,
                        }),
                    );
                    dispatch({type: 'setId', payload: response.data.response.id});
                    dispatch({type: 'setToken', payload: response.data.token});
                    dispatch({type: 'setType', payload: response.data.response.user_type});
                    dispatch({type: 'setUser', payload: response.data.response});
                    dispatch({type: 'isAuth', payload: true});
                }
                setLoading(false);
            })
            .catch((error) => {
                setLoading(false);
            });
    };

    return (
        <>
            <Text style={[tw`mb-6 text-center font-medium`, stil('text', data.app.theme)]}>
                {smsOnay ? l[data.app.lang].smsGir : l[data.app.lang].TelefonGir}
            </Text>
            <View style={[tw`mx-6`]}>
                {smsOnay ? (
                    <>
                        <BottomSheetTextInput
                            autoFocus={true}
                            placeholder="_ _ _ _ _ _"
                            placeholderTextColor={stil('text', data.app.theme).color}
                            style={[
                                tw`h-14 text-xl rounded-md px-4 text-center`,
                                stil('text', data.app.theme),
                                stil('bg', data.app.theme),
                            ]}
                            onChangeText={(text) => {
                                setSmsOnayText(text);
                            }}
                            value={smsOnayText}
                            maxLength={6}
                            keyboardType="numeric"
                        />
                    </>
                ) : (
                    <>
                        <BottomSheetTextInput
                            autoFocus={true}
                            placeholder="+___-__-___-__-__"
                            placeholderTextColor={stil('text', data.app.theme).color}
                            style={[
                                tw`h-14 text-xl rounded-md px-4 text-center`,
                                stil('text', data.app.theme),
                                stil('bg', data.app.theme),
                            ]}
                            onChangeText={(text) => {
                                setFormat(text);
                            }}
                            value={userPhone}
                            maxLength={17}
                            keyboardType="numeric"
                        />
                    </>
                )}
                {userPhone.length < 17 ? null : (
                    <TouchableOpacity
                        disabled={loading}
                        onPress={() => {
                            {
                                smsOnay ? smsOnayFunction() : loginFunction();
                            }
                        }}
                        style={[
                            stil('bg', data.app.theme),
                            tw`rounded-md p-4 mt-4 flex-row items-center justify-center`,
                        ]}>
                        {loading ? (
                            <ActivityIndicator
                                size={18}
                                color={stil('text', data.app.theme).color}
                            />
                        ) : smsOnay ? (
                            <>
                                <MaterialCommunityIcons
                                    name="check"
                                    size={20}
                                    color={stil('text', data.app.theme).color}
                                />
                            </>
                        ) : (
                            <>
                                <MaterialCommunityIcons
                                    name="login"
                                    size={20}
                                    color={stil('text', data.app.theme).color}
                                />
                            </>
                        )}

                        <Text
                            style={[stil('text', data.app.theme), tw`ml-2 font-medium text-base`]}>
                            {smsOnay ? l[data.app.lang].check : l[data.app.lang].login}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </>
    );
}

export default LoginScreen;