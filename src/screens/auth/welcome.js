import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';
import {stil} from '../../utils';
import tw from 'twrnc';
import l from '../../languages.json';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import BottomSheet, {useBottomSheetDynamicSnapPoints, BottomSheetView} from '@gorhom/bottom-sheet';
import LanguageSelect from './languageSelect';
import ThemeSelect from './themeSelect';

MaterialCommunityIcons.loadFont();

import {BackHandler, SafeAreaView, Text, View, Image, TouchableOpacity} from 'react-native';
import StatusBarComponent from '../../components/global/status';
import PermissionSelect from './permissionSelect';
import LoginTypeSelect from './loginTypeSelect';
import LoginScreen from './loginScreen';

export default function Welcome() {
    const data = useSelector((state) => state);
    const [step, setStep] = React.useState(1);
    const bottomSheetRef = React.useRef(null);

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
        // if (data.app.lang) {
        //     setStep(2);
        // }
        // if (data.app.theme) {
        //     setStep(4);
        // }
    }, []);

    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        return () => {
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };
    }, [step]);

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
                <BottomSheetView onLayout={handleContentLayout}>
                    <View style={[tw`flex-row justify-center items-center pb-4 mx-6 `]}>
                        <View
                            style={[
                                tw`h-1 ${step == 1 ? 'w-10' : 'w-1'} rounded-full mx-1`,
                                {backgroundColor: stil('text', data.app.theme).color},
                            ]}></View>
                        <View
                            style={[
                                tw`h-1 ${step == 2 ? 'w-10' : 'w-1'} rounded-full mx-1`,
                                {backgroundColor: stil('text', data.app.theme).color},
                            ]}></View>
                        <View
                            style={[
                                tw`h-1 ${step == 3 ? 'w-10' : 'w-1'} rounded-full mx-1`,
                                {backgroundColor: stil('text', data.app.theme).color},
                            ]}></View>
                        <View
                            style={[
                                tw`h-1 ${step == 4 ? 'w-10' : 'w-1'} rounded-full mx-1`,
                                {backgroundColor: stil('text', data.app.theme).color},
                            ]}></View>
                        <View
                            style={[
                                tw`h-1 ${step == 5 ? 'w-10' : 'w-1'} rounded-full mx-1`,
                                {backgroundColor: stil('text', data.app.theme).color},
                            ]}></View>
                    </View>
                    {step == 1 ? <LanguageSelect /> : null}
                    {step == 2 ? <ThemeSelect /> : null}
                    {step == 3 ? <PermissionSelect /> : null}
                    {step == 4 ? <LoginTypeSelect setStep={setStep} /> : null}
                    {step == 5 ? <LoginScreen /> : null}
                    <View
                        style={tw`flex-row items-center ${
                            step == 1 ? 'justify-end' : 'justify-between'
                        } mt-4 mb-8 mx-6`}>
                        <TouchableOpacity
                            onPress={() => {
                                if (step == 1) {
                                    setStep(4);
                                } else {
                                    setStep(step - 1);
                                }
                            }}
                            style={[tw`rounded-md p-4 flex-row items-center justify-center`]}>
                            <MaterialCommunityIcons
                                name={
                                    step == 1
                                        ? 'skip-next-circle'
                                        : 'arrow-left-drop-circle-outline'
                                }
                                size={20}
                                color={stil('text', data.app.theme).color}
                            />
                            <Text
                                style={[
                                    stil('text', data.app.theme),
                                    tw`ml-2 font-medium text-base`,
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
                                    tw`rounded-md p-4 flex-row items-center justify-center`,
                                    stil('bg', data.app.theme),
                                ]}>
                                <Text
                                    style={[
                                        stil('text', data.app.theme),
                                        tw`mr-2 font-medium text-base`,
                                    ]}>
                                    {step == 5 ? l[data.app.lang].login : l[data.app.lang].next}
                                </Text>
                                <MaterialCommunityIcons
                                    name="arrow-right-drop-circle-outline"
                                    size={20}
                                    color={stil('text', data.app.theme).color}
                                />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                </BottomSheetView>
            </BottomSheet>
        </SafeAreaView>
    );
}
