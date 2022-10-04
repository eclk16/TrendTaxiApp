import React from 'react';
import {View, Text, TouchableOpacity, Image, Alert, Modal} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import l from '../../languages.json';
import {stil} from '../../utils';
import {useDispatch, useSelector} from 'react-redux';
import {removeValue} from '../../async';
import {useNavigation} from '@react-navigation/native';
import config from '../../app.json';
import list from './menuList';

MaterialCommunityIcons.loadFont();

const ModalMenu = () => {
    const dispatch = useDispatch();
    const data = useSelector((state) => state);
    const navigation = useNavigation();
    const [menu, setMenu] = React.useState(false);
    return (
        <>
            <View
                style={[
                    stil('bg', data.app.theme),
                    tw`rounded-r-md `,
                    {position: 'absolute', left: 0, top: '8%', zIndex: 999999999999},
                ]}>
                <TouchableOpacity
                    onPress={() => {
                        setMenu(!menu);
                    }}
                    style={[tw`px-3 py-2`]}>
                    <MaterialCommunityIcons
                        name="menu"
                        size={32}
                        color={stil('text', data.app.theme).color}
                    />
                </TouchableOpacity>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={menu}
                onRequestClose={() => {
                    setMenu(false);
                }}>
                <View style={[tw`flex-1 justify-end`, {backgroundColor: 'rgba(0,0,0,0.55)'}]}>
                    <View
                        style={[
                            tw`w-full  p-4 rounded-t-md border-b`,
                            stil('bg', data.app.theme),
                            {borderBottomColor: stil('text', data.app.theme).color},
                        ]}>
                        {data.auth.userId != null ? (
                            <View>
                                <View style={[tw`flex-row justify-start items-start pb-2`]}>
                                    <Image
                                        style={[tw`mr-4 rounded-md h-32 w-32`]}
                                        source={{
                                            uri:
                                                config.imageBaseUrl +
                                                data.auth.user.user_data.user_image,
                                        }}
                                    />
                                    <View>
                                        <Text style={[tw` text-lg`, stil('text', data.app.theme)]}>
                                            {data.auth.user.user_name}
                                        </Text>
                                        <View style={[tw`flex-row items-center mt-2`]}>
                                            <MaterialCommunityIcons
                                                name="wallet"
                                                size={24}
                                                color={stil('text', data.app.theme).color}
                                            />
                                            <Text style={[tw`ml-3`, stil('text', data.app.theme)]}>
                                                {data.auth.user.user_balance}
                                            </Text>
                                        </View>
                                        <View style={[tw`flex-row items-center mt-2`]}>
                                            <MaterialCommunityIcons
                                                name="map-marker-distance"
                                                size={24}
                                                color={stil('text', data.app.theme).color}
                                            />
                                            <Text style={[tw`ml-3`, stil('text', data.app.theme)]}>
                                                {data.auth.user.user_tripCount ?? 0}
                                            </Text>
                                        </View>
                                        <View style={[tw`flex-row items-center mt-2`]}>
                                            <MaterialCommunityIcons
                                                name="star"
                                                size={24}
                                                color={stil('text', data.app.theme).color}
                                            />
                                            <Text style={[tw`ml-3`, stil('text', data.app.theme)]}>
                                                {data.auth.user.user_score ?? 0}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ) : null}
                    </View>
                    <View style={[tw`w-full p-4`, stil('bg', data.app.theme)]}>
                        {list.map((item, index) => {
                            return item.type == 'seperator' ? (
                                <View
                                    key={index}
                                    style={[
                                        tw`w-full border-b  my-2`,
                                        {
                                            borderColor: stil('bg2', data.app.theme)
                                                .backgroundColor,
                                        },
                                    ]}></View>
                            ) : item.hidden ? null : (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        tw`flex-row my-1 items-center py-2 px-3 rounded-md`,
                                        stil('bg2', data.app.theme),
                                    ]}
                                    onPress={() => {
                                        setMenu(false);
                                        navigation.navigate(item.navigate);
                                    }}>
                                    <MaterialCommunityIcons
                                        name={item.icon}
                                        size={24}
                                        color={stil('text', data.app.theme).color}
                                    />
                                    <Text
                                        style={[
                                            tw`ml-4 font-semibold text-base`,
                                            stil('text', data.app.theme),
                                        ]}>
                                        {l[data.app.lang][item.text]}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                        <View
                            style={[
                                tw` rounded-t-md border-b flex-row items-center justify-between mt-2 pb-4`,
                                {borderBottomColor: stil('text', data.app.theme).color},
                            ]}>
                            <TouchableOpacity
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
                                                    dispatch({
                                                        type: 'isAuth',
                                                        payload: false,
                                                    });
                                                    dispatch({
                                                        type: 'setTrip',
                                                        payload: null,
                                                    });
                                                    removeValue('TrendTaxiUser');
                                                },
                                            },
                                        ],
                                        {cancelable: false},
                                    );
                                }}
                                style={[
                                    tw`flex-row p-3 rounded-md items-center justify-center`,
                                    stil('bg2', data.app.theme),
                                ]}>
                                <MaterialCommunityIcons
                                    name="logout-variant"
                                    size={24}
                                    color={stil('text', data.app.theme).color}
                                />
                            </TouchableOpacity>
                            <View style={[tw`flex-row`]}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setMenu(false);
                                        navigation.navigate('Faq');
                                    }}
                                    style={[
                                        tw`flex-row p-3 rounded-md items-center justify-center`,
                                        stil('bg2', data.app.theme),
                                    ]}>
                                    <MaterialCommunityIcons
                                        name="chat-question"
                                        size={24}
                                        color={stil('text', data.app.theme).color}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setMenu(false);
                                        navigation.navigate('Settings');
                                    }}
                                    style={[
                                        tw`flex-row p-3 ml-2 rounded-md items-center justify-center`,
                                        stil('bg2', data.app.theme),
                                    ]}>
                                    <MaterialCommunityIcons
                                        name="cog"
                                        size={24}
                                        color={stil('text', data.app.theme).color}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={[tw`pb-4 pt-2 `]}>
                            <TouchableOpacity
                                onPress={() => {
                                    setMenu(false);
                                }}
                                style={[tw`w-full flex-row items-center justify-center`]}>
                                <MaterialCommunityIcons
                                    name="chevron-double-down"
                                    size={64}
                                    color={stil('text', data.app.theme).color}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

export default ModalMenu;
