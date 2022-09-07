import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {removeValue, getValue} from '../../async';
import {stil} from '../../utils';
import tw from 'twrnc';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import l from '../../languages.json';
import axios from 'axios';

MaterialCommunityIcons.loadFont();

import {
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import StatusBarComponent from '../../components/global/status';

export default function TimerPage() {
    const data = useSelector((state) => state);
    const dispatch = useDispatch();
    const [tarih, SetTarih] = React.useState('');

    useEffect(() => {
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        var param = '';

        axios
            .get('http://92.63.206.162/sayac.html')
            .then((response) => {
                SetTarih(new Date(response.request._response).getTime());
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    useEffect(() => {
        var x = setInterval(function () {
            var now = new Date().getTime();
            var distance = tarih - now;
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);
            setD(days);
            setH(hours);
            setM(minutes);
            setS(seconds);
        }, 1000);
        return () => {
            clearInterval(x);
        };
    }, [tarih]);

    const [d, setD] = React.useState([]);
    const [h, setH] = React.useState([]);
    const [m, setM] = React.useState([]);
    const [s, setS] = React.useState([]);
    const pt = {
        sav: [tw`flex-1 px-4 justify-end`, stil('bg', data.app.theme)],
        v: [tw` flex items-center justify-center `],
        footerView: [tw`flex-row px-8 pb-4 items-center justify-end`, stil('bg', data.app.theme)],
        logo: [tw`h-32 w-32 mb-2 rounded-2xl mt-12`],
        logoText: [tw`font-semibold text-xl`, stil('text', data.app.theme)],
        bgImage: [
            {
                position: 'absolute',
                height: '90%',
            },
            tw`opacity-10`,
        ],
    };
    return (
        <>
            <SafeAreaView
                style={[tw`flex-1 items-center justify-center`, stil('bg', data.app.theme)]}>
                <StatusBarComponent />
                <View style={[tw` flex items-center justify-center `]}>
                    <Image
                        style={pt.bgImage}
                        resizeMode="contain"
                        source={
                            data.app.theme == 'dark'
                                ? require('../../assets/img/uzbekistanBGA.png')
                                : require('../../assets/img/uzbekistanBGR.png')
                        }
                    />
                    <Image style={pt.logo} source={require('../../assets/img/1024.png')} />
                    <Text style={pt.logoText}>Trend Taxi</Text>
                </View>
                <View>
                    {data.app.lang == 'gb' ? (
                        <>
                            <Text
                                style={[tw` mx-4 mb-2 text-center`, stil('text', data.app.theme)]}>
                                Attention! Dear Compatriots, the TREND TAXI team informs you that
                                due to the fact that we encountered errors and shortcomings in our
                                application, we, together with our team and programmers, eliminate
                                errors and shortcomings as soon as possible! Our goal is to provide
                                quality and exemplary service to our people! Best regards, TREND
                                TAXI team!
                            </Text>
                        </>
                    ) : null}
                    {data.app.lang == 'ru' ? (
                        <>
                            <Text
                                style={[tw` mx-4 mb-2 text-center`, stil('text', data.app.theme)]}>
                                Внимание! Уважаемые Соотечественники, команда TREND TAXI сообщает
                                вам, что в связи с тем, что мы столкнулись с ошибками и недочетами в
                                нашем приложении, мы вместе с нашей командой и программистами
                                устраняем ошибки и недочеты в кратчайшие сроки! Наша цель -
                                предоставить качественное и образцовое обслуживание нашим людям! С
                                уважением, команда TRND TAXI!
                            </Text>
                        </>
                    ) : null}
                    {data.app.lang == 'uz' ? (
                        <>
                            <Text
                                style={[tw` mx-4 mb-2 text-center`, stil('text', data.app.theme)]}>
                                Diqqat! Xurmatli Vatandoshlar TREND TAXI jamoasi sizlarga shuni
                                ma’lum qiladiki, ilovamizda xato va kamchiliklarga duch kelganimiz
                                tufayli biz jamoamiz xamda dasturchilar bilan birgalikda xato -
                                kamchiliklarni zudlik bilan tez fursat ichida bartaraf etmoqdamiz!
                                Bizning maqsad Xalqimizga sifatli va namunali xizmat ko’rsatishdir!
                                Xurmat bilan TREND TAXI jamoasi!
                            </Text>
                        </>
                    ) : null}
                    <Text style={[tw` mx-4 mb-2 text-center`, stil('text', data.app.theme)]}>
                        {l[data.app.lang].loginMesaj}
                    </Text>
                </View>
                <View style={[tw`flex-row items-center justify-center`]}>
                    <Text style={[tw`mx-1 text-xl text-center`, stil('text', data.app.theme)]}>
                        {d}
                    </Text>
                    <Text style={[tw` text-xs text-center`, stil('text', data.app.theme)]}>
                        {l[data.app.lang].day}
                    </Text>
                    <Text style={[tw`mx-1 text-xl text-center`, stil('text', data.app.theme)]}>
                        {h}
                    </Text>
                    <Text style={[tw` text-xs text-center`, stil('text', data.app.theme)]}>
                        {l[data.app.lang].hour}
                    </Text>
                    <Text style={[tw`mx-1 text-xl text-center`, stil('text', data.app.theme)]}>
                        {m}
                    </Text>
                    <Text style={[tw` text-xs text-center`, stil('text', data.app.theme)]}>
                        {l[data.app.lang].minute}
                    </Text>
                    <Text style={[tw`mx-1 text-xl text-center`, stil('text', data.app.theme)]}>
                        {s}
                    </Text>
                    <Text style={[tw`text-xs text-center`, stil('text', data.app.theme)]}>
                        {l[data.app.lang].second}
                    </Text>
                </View>
                <Text style={[tw`my-4 mx-4 text-lg text-center`, stil('text', data.app.theme)]}>
                    {l[data.app.lang].bekle}
                </Text>
                <View style={[tw`flex items-center justify-center`]}>
                    <TouchableOpacity
                        style={[tw` rounded`, {borderColor: stil('text', data.app.theme).color}]}
                        onPress={() => {
                            Alert.alert(
                                l[data.app.lang].logout,
                                l[data.app.lang].areyouokayLogout,
                                [
                                    {
                                        text: l[data.app.lang].cancel,
                                        onPress: () => console.log('Cancel Pressed'),
                                        style: 'cancel',
                                    },
                                    {
                                        text: l[data.app.lang].confirm,
                                        onPress: () => {
                                            dispatch({type: 'authRemove'});
                                            dispatch({type: 'isLogin', payload: false});
                                            removeValue('userData');
                                        },
                                    },
                                ],
                                {cancelable: false},
                            );
                        }}>
                        <View style={[tw`w-full `]}>
                            <View style={[tw` py-2 flex-row items-center`]}>
                                <View style={[tw`rounded-md p-1`]}>
                                    <MaterialCommunityIcons
                                        name="logout"
                                        size={24}
                                        color={stil('text', data.app.theme).color}
                                    />
                                </View>
                                <Text
                                    style={[
                                        stil('text', data.app.theme),
                                        tw` text-base`,
                                        {paddingLeft: 2},
                                    ]}>
                                    {' '}
                                    {l[data.app.lang].logout}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </>
    );
}
