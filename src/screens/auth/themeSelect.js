import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {setValue} from '../../async';
import {stil} from '../../utils';
import tw from 'twrnc';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import l from '../../languages.json';

MaterialCommunityIcons.loadFont();

import {Text, TouchableOpacity, View} from 'react-native';
function ThemeSelect() {
    const dispatch = useDispatch();
    const data = useSelector((state) => state);

    function setTheme(theme) {
        setValue('TrendTaxiTheme', theme);
        dispatch({type: 'theme', payload: theme});
    }

    return (
        <>
            <Text style={[tw`mb-6 text-center font-medium`, stil('text', data.app.theme)]}>
                {l[data.app.lang].temaSec}
            </Text>
            <View style={[tw`mx-6`]}>
                <TouchableOpacity
                    key={0}
                    style={[
                        stil('bg', data.app.theme),
                        tw`flex-row items-center mb-1 p-4 rounded-md justify-between`,
                    ]}
                    onPress={() => setTheme('light')}>
                    <View style={[tw`flex-row items-center justify-between `]}>
                        <MaterialCommunityIcons
                            name="white-balance-sunny"
                            size={32}
                            color={stil('text', data.app.theme).color}
                        />
                        <Text style={[tw`  ml-4`, stil('text', data.app.theme)]}>
                            {l[data.app.lang].lightTheme}
                        </Text>
                    </View>
                    <View style={tw`flex-row justify-end items-end`}>
                        {data.app.theme == 'light' ? (
                            <MaterialCommunityIcons
                                name="check-circle-outline"
                                size={32}
                                color={stil('text', data.app.theme).color}
                            />
                        ) : null}
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    key={1}
                    style={[
                        stil('bg', data.app.theme),
                        tw`flex-row items-center mb-1 p-4 rounded-md justify-between`,
                    ]}
                    onPress={() => setTheme('dark')}>
                    <View style={[tw`flex-row items-center justify-between `]}>
                        <MaterialCommunityIcons
                            name="moon-waning-crescent"
                            size={32}
                            color={stil('text', data.app.theme).color}
                        />
                        <Text style={[tw` ml-4`, stil('text', data.app.theme)]}>
                            {l[data.app.lang].darkTheme}
                        </Text>
                    </View>
                    <View style={tw`flex-row justify-end items-end`}>
                        {data.app.theme == 'dark' ? (
                            <MaterialCommunityIcons
                                name="check-circle-outline"
                                size={32}
                                color={stil('text', data.app.theme).color}
                            />
                        ) : null}
                    </View>
                </TouchableOpacity>
            </View>
        </>
    );
}

export default ThemeSelect;
