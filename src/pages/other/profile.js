import React from 'react';
import {useSelector} from 'react-redux';
import {View, Text, ScrollView, Image} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import {stil} from '../../utils';
import l from '../../languages.json';

MaterialCommunityIcons.loadFont();

import StatusBarComponent from '../../components/global/status';

export default function Profile() {
    const data = useSelector((state) => state);

    return (
        <>
            <StatusBarComponent />
            <ScrollView style={[stil('bg', data.app.theme), tw`p-4 flex-1`]}>
                <View style={[tw`rounded-md p-4 flex items-center justify-center`]}>
                    <View style={[tw`flex items-center justify-center`]}>
                        {data.auth.user.image ? (
                            <Image
                                style={[tw`rounded-md`, {height: 150, width: 150}]}
                                source={{uri: 'http://92.63.206.165' + data.auth.user.image}}
                            />
                        ) : null}
                    </View>
                    <View style={[tw`flex items-center justify-center`]}>
                        <View style={tw`flex-row mt-2`}>
                            <Text style={[tw`text-lg font-semibold`, stil('text', data.app.theme)]}>
                                {' '}
                                {data.auth.user.name}
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
                                {data.auth.user.balance}
                            </Text>

                            <MaterialCommunityIcons
                                name="map-marker-distance"
                                size={18}
                                color={stil('text', data.app.theme).color}
                            />
                            <Text style={[tw`ml-2 font-semibold`, stil('text', data.app.theme)]}>
                                {' '}
                                {data.auth.user.tripCount}
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
                            {data.auth.user.name}
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
                            {data.auth.user.phone}
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
                            {l[data.app.lang].email}
                        </Text>
                        <Text style={[stil('text', data.app.theme), tw` font-medium`]}>
                            {data.auth.user.email}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </>
    );
}
