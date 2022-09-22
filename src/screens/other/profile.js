import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';
import {BackHandler, View, Text, ScrollView, Image} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import {stil} from '../../utils';
import l from '../../languages.json';
import {getUniqueId, getManufacturer} from 'react-native-device-info';
import {useNavigation} from '@react-navigation/native';
MaterialCommunityIcons.loadFont();

import StatusBarComponent from '../../components/global/status';
import config from '../../app.json';

export default function Profile() {
    const navigation = useNavigation();
    handleBackButtonClick = () => {
        navigation.navigate(data.auth.userType == 'passenger' ? 'Home' : 'HomeDriverPage');
    };
    useEffect(() => {
        const abortController = new AbortController();
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        return () => {
            abortController.abort();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };
    }, []);
    const data = useSelector((state) => state);
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
        return ((number.length > 0 ? '+' : '') + newText).trimEnd(' ');
    };

    return (
        <>
            <StatusBarComponent />
            <ScrollView style={[stil('bg', data.app.theme), tw`p-4 flex-1`]}>
                <View style={[tw`rounded-md p-4 flex items-center justify-center`]}>
                    <View style={[tw`flex items-center justify-center`]}>
                        {data.auth.user.user_data.user_image ? (
                            <Image
                                style={[tw`rounded-md`, {height: 150, width: 150}]}
                                source={{
                                    uri: config.imageBaseUrl + data.auth.user.user_data.user_image,
                                }}
                            />
                        ) : null}
                    </View>
                    <View style={[tw`flex items-center justify-center`]}>
                        <View style={tw`flex-row mt-2`}>
                            <Text style={[tw`text-lg font-semibold`, stil('text', data.app.theme)]}>
                                {' '}
                                {data.auth.user.user_name}
                            </Text>
                        </View>
                        <View style={tw`flex-row justify-between items-center mt-2`}>
                            <MaterialCommunityIcons
                                name="credit-card"
                                size={18}
                                color={stil('text', data.app.theme).color}
                            />
                            <Text
                                style={[tw`ml-2 mr-4 font-semibold`, stil('text', data.app.theme)]}>
                                {' '}
                                {data.auth.user.user_balance}
                            </Text>

                            <MaterialCommunityIcons
                                name="map-marker-distance"
                                size={18}
                                color={stil('text', data.app.theme).color}
                            />

                            <Text
                                style={[tw`ml-2 mr-4 font-semibold`, stil('text', data.app.theme)]}>
                                {' '}
                                {data.auth.user.user_tripCount ?? 0}
                            </Text>
                            <MaterialCommunityIcons
                                name="star"
                                size={18}
                                color={stil('text', data.app.theme).color}
                            />
                            <Text style={[tw`ml-2 font-semibold`, stil('text', data.app.theme)]}>
                                {' '}
                                {data.auth.user.user_score ?? 0}
                            </Text>
                        </View>
                    </View>
                </View>
                <View
                    style={[
                        tw`rounded-md px-4 py-2 mt-2 flex items-center justify-start`,
                        stil('bg2', data.app.theme),
                    ]}>
                    <View style={[tw`flex-row justify-between w-full`]}>
                        <Text style={[stil('text', data.app.theme), tw`font-semibold`]}>
                            {l[data.app.lang].first_name}
                        </Text>
                        <Text style={[stil('text', data.app.theme), tw` font-medium`]}>
                            {data.auth.user.user_name}
                        </Text>
                    </View>
                </View>
                <View
                    style={[
                        tw`rounded-md px-4 py-2 mt-2 flex items-center justify-start`,
                        stil('bg2', data.app.theme),
                    ]}>
                    <View style={[tw`flex-row justify-between w-full`]}>
                        <Text style={[stil('text', data.app.theme), tw`font-semibold`]}>
                            {l[data.app.lang].phone}
                        </Text>
                        <Text style={[stil('text', data.app.theme), tw` font-medium`]}>
                            {setFormat(data.auth.user.user_phone)}
                        </Text>
                    </View>
                </View>
                <View
                    style={[
                        tw`rounded-md px-4 py-2 mt-2 flex items-center justify-start`,
                        stil('bg2', data.app.theme),
                    ]}>
                    <View style={[tw`flex-row justify-between w-full`]}>
                        <Text style={[stil('text', data.app.theme), tw`font-semibold`]}>
                            <MaterialCommunityIcons
                                name="map-marker-radius"
                                size={20}
                                color={stil('text', data.app.theme).color}
                            />
                        </Text>
                        <Text style={[stil('text', data.app.theme), tw` font-medium`]}>
                            {data.auth.user.last_latitude},{data.auth.user.last_longitude}
                        </Text>
                    </View>
                </View>
                <View
                    style={[
                        tw`rounded-md px-4 py-2 mt-2 flex items-center justify-start`,
                        stil('bg2', data.app.theme),
                    ]}>
                    <View style={[tw`flex-row justify-between w-full`]}>
                        <Text style={[stil('text', data.app.theme), tw`font-semibold`]}>
                            <MaterialCommunityIcons
                                name="bus-stop"
                                size={20}
                                color={stil('text', data.app.theme).color}
                            />
                        </Text>
                        <Text style={[stil('text', data.app.theme), tw` font-medium`]}>
                            {data.auth.user.user_taxi_park}
                        </Text>
                    </View>
                </View>
                <View
                    style={[
                        tw`rounded-md px-4 py-2 mt-2 flex items-center justify-start`,
                        stil('bg2', data.app.theme),
                    ]}>
                    <View style={[tw`flex-row justify-between w-full`]}>
                        <Text style={[stil('text', data.app.theme), tw`font-semibold`]}></Text>
                        <Text style={[stil('text', data.app.theme), tw` font-medium`]}>
                            {getUniqueId()}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </>
    );
}
