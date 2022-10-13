import React from 'react';
import {Text, TouchableOpacity, View, Image} from 'react-native';
import tw from 'twrnc';
import l from '../../languages.json';
import {stil} from '../../utils';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
//burayafont yükle gelecek
import {useDispatch, useSelector} from 'react-redux';
import {setValue} from '../../async';

function LanguageSelect() {
    const dispatch = useDispatch();
    const data = useSelector((state) => state);
    const LANGS = [
        {
            langCode: 'uz',
            langName: "O'zbekcha",
            langFlag: require('../../assets/img/uz.png'),
        },
        {
            langCode: 'ru',
            langName: 'Русский',
            langFlag: require('../../assets/img/ru.png'),
        },
        {
            langCode: 'gb',
            langName: 'English',
            langFlag: require('../../assets/img/gb.png'),
        },
    ];

    function setLanguage(code) {
        setValue('TrendTaxiLang', code);
        dispatch({type: 'lang', payload: code});
    }
    return (
        <View>
            <Text style={[tw`mb-6 text-center font-medium`, stil('text', data.app.theme)]}>
                {l[data.app.lang].dilSec}
            </Text>
            <View style={[tw`mx-6`]}>
                {LANGS.map((item, index) => {
                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                stil('bg', data.app.theme),
                                tw`flex-row items-center mb-1 p-4 rounded-md justify-between`,
                            ]}
                            onPress={() => setLanguage(item.langCode)}>
                            <View style={[tw`flex-row items-center justify-between `]}>
                                <Image
                                    source={item.langFlag}
                                    style={[tw`h-8 w-10 rounded-md mr-4`]}
                                />
                                <Text style={[tw``, stil('text', data.app.theme)]}>
                                    {item.langName}
                                </Text>
                            </View>
                            <View style={tw`flex-row justify-end items-end`}>
                                {data.app.lang == item.langCode ? (
                                    <MaterialCommunityIcons
                                        name="check-circle-outline"
                                        size={32}
                                        color={stil('text', data.app.theme).color}
                                    />
                                ) : null}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

export default LanguageSelect;
