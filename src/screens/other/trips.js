import React, {useEffect} from 'react';
import {BackHandler, Text, View, ActivityIndicator, FlatList} from 'react-native';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';
import tw from 'twrnc';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
MaterialCommunityIcons.loadFont();
import axios from 'axios';
import {stil} from '../../utils';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import l from '../../languages.json';
import StatusBarComponent from '../../components/global/status';
import {apiPost} from '../../axios';

function Trips() {
    const navigation = useNavigation();

    const data = useSelector((state) => state);

    const [loading, setLoading] = React.useState(true);

    const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
        const paddingToBottom = 100;
        return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    };
    useEffect(() => {
        const abortController = new AbortController();
        apiPost('getTrips', {
            user_id: data.auth.userId,
            user_type: data.auth.userType,
        })
            .then((response) => {
                setTrips(response.data.response.data);
                setLoading(false);
            })
            .catch((error) => {
                setLoading(false);
            });
        return () => {
            abortController.abort();
            false;
        };
    }, []);
    const [trips, setTrips] = React.useState([]);
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (
        <>
            <StatusBarComponent />
            <View style={[stil('bg', data.app.theme), tw`p-4 flex-1`]}>
                <FlatList
                    data={trips}
                    style={[tw``]}
                    // ListEmptyComponent={}
                    renderItem={({item, index}) => {
                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => {
                                    navigation.navigate('TripDetails', {trip_id: item.id});
                                }}>
                                <View
                                    style={[
                                        tw`flex-row items-center justify-between rounded-md  mb-1 px-2 py-1`,
                                        stil('bg2', data.app.theme),
                                    ]}>
                                    <View style={[tw`flex-row items-center justify-start w-5/6`]}>
                                        <MaterialCommunityIcons
                                            style={[tw`text-center mr-2`]}
                                            name="adjust"
                                            size={16}
                                            color={stil('text', data.app.theme).color}
                                        />
                                        <View style={[tw`ml-2`]}>
                                            <Text
                                                style={[
                                                    tw`text-center`,
                                                    stil('text', data.app.theme),
                                                ]}>
                                                {item.act_price} sum
                                            </Text>
                                            <Text
                                                style={[
                                                    tw`text-center`,
                                                    {maxWidth: 100},
                                                    stil('text', data.app.theme),
                                                ]}>
                                                {new Date(item.end_time * 1000).getDate()}{' '}
                                                {
                                                    l[data.app.lang][
                                                        months[
                                                            new Date(
                                                                item.end_time * 1000,
                                                            ).getMonth()
                                                        ]
                                                    ]
                                                }{' '}
                                                {
                                                    l[data.app.lang][
                                                        days[
                                                            new Date(item.end_time * 1000).getDay()
                                                        ]
                                                    ]
                                                }
                                            </Text>
                                        </View>
                                        <View style={[tw`ml-4`]}>
                                            {Object.entries(item.locations).map((key, i) => {
                                                if (
                                                    i == 0 ||
                                                    i == Object.entries(item.locations).length - 1
                                                )
                                                    return (
                                                        <Text
                                                            key={i}
                                                            style={[
                                                                tw``,
                                                                stil('text', data.app.theme),
                                                            ]}>
                                                            {item.locations[key[0]].title}
                                                        </Text>
                                                    );
                                            })}
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                    keyExtractor={(item, index) => index.toString()}
                />

                {loading ? <ActivityIndicator /> : <></>}
            </View>
        </>
    );
}

export default Trips;
