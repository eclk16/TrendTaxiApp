import React, {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {stil} from '../../utils';
import tw from 'twrnc';
import l from '../../languages.json';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import BottomSheet, {useBottomSheetDynamicSnapPoints, BottomSheetView} from '@gorhom/bottom-sheet';
import LanguageSelect from './languageSelect';
import ThemeSelect from './themeSelect';
import {setValue} from '../../async';

//burayafont yükle gelecek

import {
    BackHandler,
    SafeAreaView,
    Text,
    View,
    Image,
    TouchableOpacity,
    KeyboardAvoidingView,
} from 'react-native';
import StatusBarComponent from '../../components/global/status';
import PermissionSelect from './permissionSelect';
import LoginTypeSelect from './loginTypeSelect';
import LoginScreen from './loginScreen';
import {getValue} from '../../async';

export default function Welcome() {
    const data = useSelector((state) => state);
    const dispatch = useDispatch();
    const [step, setStep] = React.useState(1);

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

        return () => {
            abortController.abort();
        };
    }, []);

    const LANGS = [
        {
            langCode: 'uz',
            langName: "O'zbekcha",
            langFlag: require('../../assets/img/lang/uz.png'),
        },
        {
            langCode: 'ru',
            langName: 'Русский',
            langFlag: require('../../assets/img/lang/ru.png'),
        },
        {
            langCode: 'gb',
            langName: 'English',
            langFlag: require('../../assets/img/lang/gb.png'),
        },
    ];

    function setLanguage(code) {
        setValue('TrendTaxiLang', code);
        dispatch({type: 'lang', payload: code});
    }
    return (
        <SafeAreaView style={[stil('bg', data.app.theme), tw`flex-1 items-center justify-end`]}>
            <Image
                source={require('../../assets/img/bgUzbekistan.png')}
                style={[
                    tw` h-5/6`,
                    {
                        position: 'absolute',
                        top: 0,
                        resizeMode: 'contain',
                        opacity: 1,
                        zIndex: -1,
                        // transform: [{rotate: '-10deg'}],
                    },
                ]}
            />

            <StatusBarComponent />
            <View style={[tw` flex items-center justify-end mb-4`, {zIndex: 1}]}>
                {/* <Image
                    style={[
                        tw`h-32 w-32 mb-2 rounded-2xl mt-12`,
                        {
                            zIndex: 2,
                        },
                    ]}
                    source={require('../../assets/img/1024.png')}
                /> */}
                <Text
                    style={[
                        tw`font-bold text-5xl z-15 p-5`,
                        stil('text', data.app.theme),
                        {
                            textShadowColor: '#59a1b1',
                            textShadowOffset: {width: -0.5, height: 3},
                            textShadowRadius: 2,
                        },
                    ]}>
                    Trend Taxi
                </Text>
            </View>
            <KeyboardAvoidingView
                style={[
                    tw`w-full items-center justify-end `,
                    {
                        zIndex: 1,
                    },
                ]}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={[tw`w-[90%]`, stil('shadow', data.app.theme)]}>
                    <View style={[tw` pt-4  rounded-md`, stil('bg2', data.app.theme)]}>
                        {step < 5 ? <LoginTypeSelect setStep={setStep} /> : null}
                        {step == 5 ? <LoginScreen /> : null}
                        {step > 4 && (
                            <View style={tw`flex-row items-center justify-between mt-4 mb-4 mx-4`}>
                                <TouchableOpacity
                                    onPress={() => {
                                        if (step == 1) {
                                            setStep(4);
                                        } else {
                                            setStep(step - 1);
                                        }
                                    }}
                                    style={[
                                        tw`rounded-md p-3 flex-row items-center justify-center`,
                                    ]}>
                                    {step != 1 && (
                                        <MaterialCommunityIcons
                                            name="arrow-left-drop-circle-outline"
                                            size={20}
                                            color={stil('text', data.app.theme).color}
                                        />
                                    )}
                                    <Text
                                        style={[
                                            stil('text', data.app.theme),
                                            tw` ${step == 1 ? 'text-xs' : ' ml-2'} `,
                                        ]}>
                                        {step == 1 ? l[data.app.lang].skip : l[data.app.lang].back}
                                    </Text>
                                </TouchableOpacity>
                                {step != 4 && step != 5 ? (
                                    <TouchableOpacity
                                        onPress={() => {
                                            setStep(step + 1);
                                        }}
                                        style={[
                                            tw`rounded-md p-3 flex-row items-center justify-center`,
                                            stil('bg', data.app.theme),
                                        ]}>
                                        <Text style={[stil('text', data.app.theme), tw`mr-2  `]}>
                                            {step == 5
                                                ? l[data.app.lang].login
                                                : l[data.app.lang].next}
                                        </Text>
                                        <MaterialCommunityIcons
                                            name="arrow-right-drop-circle-outline"
                                            size={20}
                                            color={stil('text', data.app.theme).color}
                                        />
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                        )}
                        {step < 5 && (
                            <View style={[tw`m-2 flex-row items-center justify-center`]}>
                                {LANGS.map((item, index) => {
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={[tw` p-2  rounded-md`]}
                                            onPress={() => setLanguage(item.langCode)}>
                                            <Image
                                                source={item.langFlag}
                                                style={[
                                                    tw` ${
                                                        item.langCode == data.app.lang
                                                            ? ''
                                                            : 'opacity-50'
                                                    } h-12 w-12 rounded-md `,
                                                ]}
                                            />
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
