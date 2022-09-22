import React, {useEffect} from 'react';
import axios from 'axios';
import {useSelector} from 'react-redux';
import {BackHandler, TouchableOpacity, View, Text, ScrollView} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import {stil} from '../../utils';
import StatusBarComponent from '../../components/global/status';
import {apiGet} from '../../axios';
import {useNavigation} from '@react-navigation/native';
MaterialCommunityIcons.loadFont();

function Faq() {
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
    const [acik, setAcik] = React.useState(false);
    const data = useSelector((state) => state);

    useEffect(() => {
        const abortController = new AbortController();
        getSss();
        return () => {
            abortController.abort();
            false;
        };
    }, [data.app.lang]);
    const [sss, setSss] = React.useState([]);
    const getSss = () => {
        apiGet('getSsses', {
            sss_lang: data.app.lang,
        }).then((response) => {
            setSss(response.data.response);
        });
    };

    return (
        <ScrollView style={[stil('bg', data.app.theme), tw`p-4 flex-1`]}>
            <StatusBarComponent />
            {sss.map((item, index) => {
                return (
                    <View key={index}>
                        <TouchableOpacity
                            key={index}
                            onPress={() => setAcik(acik == index ? 999 : index)}>
                            <View
                                style={[
                                    tw`rounded-md mb-2 flex-row justify-between items-center p-3`,
                                    stil('bg2', data.app.theme),
                                ]}>
                                <Text style={[tw`  mb-1 ml-2 `, stil('text', data.app.theme)]}>
                                    {item.sss_title}
                                </Text>
                                <MaterialCommunityIcons
                                    name={acik == index ? 'chevron-up' : 'chevron-down'}
                                    size={24}
                                    color={stil('text', data.app.theme).color}
                                />
                            </View>
                        </TouchableOpacity>
                        {acik == index ? (
                            <View style={[tw`flex `]}>
                                <View style={[tw` px-2 pb-4`]}>
                                    <Text
                                        style={[
                                            tw`flex-row text-sm`,
                                            stil('text', data.app.theme),
                                        ]}>
                                        {item.sss_description}
                                    </Text>
                                </View>
                            </View>
                        ) : null}
                    </View>
                );
            })}
        </ScrollView>
    );
}

export default Faq;
