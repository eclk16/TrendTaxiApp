import React, {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';

import ModalMenu from '../../components/global/menu';
import StatusBarComponent from '../../components/global/status';

import Register from './driver/register';
import DriverWait from './driver/wait';
import DriverGoPassenger from './driver/goPassenger';
import DriverTrip from './driver/trip';

import PassengerCreate from './passenger/create';
import PassengerWait from './passenger/wait';
import PassengerTrip from './passenger/trip';
import {Modal, View, Text, Clipboard, TouchableOpacity} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import {stil} from '../../utils';
import l from '../../languages.json';
import {apiPost} from '../../axios';

export default function Home() {
    const data = useSelector((state) => state);
    const dispatch = useDispatch();
    const [point, setPoint] = React.useState(3);

    return (
        <>
            <StatusBarComponent />
            {data.auth.user.user_status == 0 && data.auth.user.user_name === '' ? (
                <Register />
            ) : (
                <>
                    <ModalMenu />
                    {data.auth.userType == 'passenger' ? (
                        <>
                            {data.trip.trip === null ? (
                                <PassengerCreate />
                            ) : (
                                <>
                                    {data.trip.trip.status == 2 ? <PassengerWait /> : null}
                                    {data.trip.trip.status == 3 ? <PassengerTrip /> : null}
                                </>
                            )}
                        </>
                    ) : null}
                    {data.auth.userType == 'driver' ? (
                        <>
                            {data.trip.trip === null ? (
                                <DriverWait />
                            ) : (
                                <>
                                    {data.trip.trip.status == 2 ? <DriverGoPassenger /> : null}
                                    {data.trip.trip.status == 3 ? <DriverTrip /> : null}
                                </>
                            )}
                        </>
                    ) : (
                        <></>
                    )}
                </>
            )}
            {data.auth.user.setPoint != false ? (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={data.auth.user.setPoint != false ? true : false}
                    onRequestClose={() => {}}>
                    <View
                        style={[tw`h-1/1 flex justify-end`, {backgroundColor: 'rgba(0,0,0,0.55)'}]}>
                        <View
                            style={[
                                tw`flex pb-6 pt-2 justify-end px-4`,
                                stil('bg', data.app.theme),
                            ]}>
                            <View
                                style={[
                                    tw`  items-center justify-center py-8`,
                                    // {backgroundColor: 'rgba(0,0,0,0.55)'},
                                ]}>
                                <Text style={[stil('text', data.app.theme), tw`font-bold text-xl`]}>
                                    {data.auth.user.setPoint.driver.user_name}
                                </Text>
                                <Text
                                    style={[
                                        stil('text', data.app.theme),
                                        tw`font-bold text-3xl my-3`,
                                    ]}>
                                    {data.auth.user.setPoint.act_price} sum
                                </Text>
                                <TouchableOpacity
                                    style={[tw`flex-row items-center justify-center`]}
                                    onPress={() => {
                                        Clipboard.setString(
                                            data.auth.user.setPoint.driver.user_data.car_number,
                                        );
                                    }}>
                                    <MaterialCommunityIcons
                                        name="credit-card"
                                        size={24}
                                        color={stil('text', data.app.theme).color}
                                    />
                                    <Text
                                        style={[
                                            stil('text', data.app.theme),
                                            tw`font-bold text-xl my-3 ml-4`,
                                        ]}>
                                        {data.auth.user.setPoint.driver.user_data.car_number}
                                    </Text>
                                </TouchableOpacity>
                                <Text
                                    style={[
                                        stil('text', data.app.theme),
                                        tw`font-bold text-xl my-3`,
                                    ]}>
                                    {l[data.app.lang].setPoint}
                                </Text>
                                <View style={[tw`flex-row items-center justify-center`]}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setPoint(1);
                                        }}>
                                        <MaterialCommunityIcons
                                            name="star"
                                            size={50}
                                            color={
                                                point > 0
                                                    ? 'orange'
                                                    : stil('text', data.app.theme).color
                                            }
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setPoint(2);
                                        }}>
                                        <MaterialCommunityIcons
                                            name="star"
                                            size={50}
                                            color={
                                                point > 1
                                                    ? 'orange'
                                                    : stil('text', data.app.theme).color
                                            }
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setPoint(3);
                                        }}>
                                        <MaterialCommunityIcons
                                            name="star"
                                            size={50}
                                            color={
                                                point > 2
                                                    ? 'orange'
                                                    : stil('text', data.app.theme).color
                                            }
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setPoint(4);
                                        }}>
                                        <MaterialCommunityIcons
                                            name="star"
                                            size={50}
                                            color={
                                                point > 3
                                                    ? 'orange'
                                                    : stil('text', data.app.theme).color
                                            }
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setPoint(5);
                                        }}>
                                        <MaterialCommunityIcons
                                            name="star"
                                            size={50}
                                            color={
                                                point > 4
                                                    ? 'orange'
                                                    : stil('text', data.app.theme).color
                                            }
                                        />
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity
                                    style={[
                                        tw`flex-row w-full mt-8 items-center justify-center px-4 py-2 rounded-md`,
                                        stil('bg2', data.app.theme),
                                    ]}
                                    onPress={() => {
                                        apiPost('updatePastTrip', {
                                            prc: 'tripChange',
                                            lang: data.app.lang,
                                            token: data.auth.userToken,
                                            id: data.auth.userId,
                                            trip_id: data.auth.user.setPoint.id,
                                            trip_score: point,
                                        });
                                        let us = data.auth.user;
                                        us.setPoint = false;
                                        dispatch({type: 'setUser', payload: us});
                                    }}>
                                    <MaterialCommunityIcons
                                        name="content-save"
                                        size={50}
                                        color={stil('text', data.app.theme).color}
                                    />
                                    <Text
                                        style={[
                                            stil('text', data.app.theme),
                                            tw`font-bold text-xl my-3`,
                                        ]}>
                                        {l[data.app.lang].close}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            ) : null}
        </>
    );
}
