import React, {useEffect} from 'react';
import {Text, Image, View, BackHandler, ScrollView} from 'react-native';
import tw from 'twrnc';
import Ionicons from 'react-native-vector-icons/Ionicons';
Ionicons.loadFont();
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
MaterialCommunityIcons.loadFont();
import {getValue} from '../../async';
import axios from 'axios';
import {stil} from '../../utils';
import {useNavigation, useRoute} from '@react-navigation/native';
import l from '../../languages.json';
import {useSelector} from 'react-redux';
import StatusBarComponent from '../../components/global/status';
import {apiPost} from '../../axios';
import config from '../../app.json';

function TripDetail() {
    const navigation = useNavigation();
    handleBackButtonClick = () => {
        navigation.navigate('Trips');
    };
    useEffect(() => {
        const abortController = new AbortController();
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        return () => {
            abortController.abort();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };
    }, []);

    const route = useRoute();

    const data = useSelector((state) => state);

    const [trip, setTrip] = React.useState([]);
    const [locations, setLocations] = React.useState([]);
    const {trip_id} = route.params;

    useEffect(() => {
        const abortController = new AbortController();
        apiPost('getTrip', {
            id: trip_id,
        })
            .then((response) => {
                setTrip(response.data.response);
                setLocations(response.data.response.locations);
            })
            .catch((error) => {});
        return () => {
            abortController.abort();
            false;
        };
    }, [trip_id]);

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
        <ScrollView style={[stil('bg', data.app.theme), tw`p-4 flex-1`]}>
            <StatusBarComponent />
            <View
                style={[
                    tw`rounded-md px-4 py-2 mt-4 flex items-start justify-start`,
                    stil('bg2', data.app.theme),
                ]}>
                <View style={[tw`flex-row w-full mb-2`]}>
                    <Text style={[stil('text', data.app.theme), tw` w-1/2`]}>#</Text>
                    <Text style={[stil('text', data.app.theme), tw``]}> : {trip.trip_id}</Text>
                </View>
                <View style={[tw`flex-row w-full mb-2`]}>
                    <Text style={[stil('text', data.app.theme), tw` w-1/2`]}>
                        {l[data.app.lang].price}
                    </Text>
                    <Text style={[stil('text', data.app.theme), tw``]}>
                        {' '}
                        : {trip.act_price} sum
                    </Text>
                </View>
                <View style={[tw`flex-row w-full mb-2`]}>
                    <Text style={[stil('text', data.app.theme), tw` w-1/2`]}>
                        {l[data.app.lang].distance}
                    </Text>
                    <Text style={[stil('text', data.app.theme), tw``]}> : {trip.act_distance}</Text>
                </View>
                <View style={[tw`flex-row w-full mb-2`]}>
                    <Text style={[stil('text', data.app.theme), tw` w-1/2`]}>
                        {l[data.app.lang].duration}
                    </Text>
                    <Text style={[stil('text', data.app.theme), tw``]}> : {trip.act_duration}</Text>
                </View>
                <View style={[tw`flex-row w-full mb-2`]}>
                    <Text style={[stil('text', data.app.theme), tw` w-1/2`]}>
                        {l[data.app.lang].score}
                    </Text>
                    <Text style={[stil('text', data.app.theme), tw``]}>
                        {' '}
                        :
                        <Ionicons
                            name="ios-star"
                            size={20}
                            color={trip.trip_score > 0 ? '#ffd700' : '#ccc'}
                        />
                        <Ionicons
                            name="ios-star"
                            size={20}
                            color={trip.trip_score > 1 ? '#ffd700' : '#ccc'}
                        />
                        <Ionicons
                            name="ios-star"
                            size={20}
                            color={trip.trip_score > 2 ? '#ffd700' : '#ccc'}
                        />
                        <Ionicons
                            name="ios-star"
                            size={20}
                            color={trip.trip_score > 3 ? '#ffd700' : '#ccc'}
                        />
                        <Ionicons
                            name="ios-star"
                            size={20}
                            color={trip.trip_score > 4 ? '#ffd700' : '#ccc'}
                        />
                    </Text>
                </View>
                {data.auth.userType == 'passenger' && trip.trip_reward > 0 ? (
                    <View style={[tw`flex-row w-full mb-2`]}>
                        <Text style={[stil('text', data.app.theme), tw` w-1/2`]}>
                            {l[data.app.lang].reward}
                        </Text>
                        <Text style={[stil('text', data.app.theme), tw``]}>
                            {' '}
                            : {trip.trip_reward} sum
                        </Text>
                    </View>
                ) : null}
                {data.auth.userType == 'driver' && trip.trip_fee > 0 ? (
                    <View style={[tw`flex-row w-full mb-2`]}>
                        <Text style={[stil('text', data.app.theme), tw` w-1/2`]}>
                            {l[data.app.lang].fee}
                        </Text>
                        <Text style={[stil('text', data.app.theme), tw``]}>
                            {' '}
                            : {trip.trip_fee} sum
                        </Text>
                    </View>
                ) : null}
            </View>
            <Text
                style={[stil('text', data.app.theme), tw`mt-4 mb-2 `, stil('bg', data.app.theme)]}>
                {l[data.app.lang].start} - {new Date(trip.start_time * 1000).getDate()}{' '}
                {l[data.app.lang][months[new Date(trip.start_time * 1000).getMonth()]]}{' '}
                {l[data.app.lang][days[new Date(trip.start_time * 1000).getDay()]]}{' '}
                {new Date(trip.start_time * 1000).getHours()}:
                {new Date(trip.start_time * 1000).getMinutes()}
            </Text>
            {trip.locations ? (
                <>
                    {Object.entries(trip.locations).map((key, i) => {
                        return (
                            <View
                                key={i}
                                style={[
                                    tw`flex-row items-center py-1 px-4 my-1 rounded-md`,
                                    stil('bg2', data.app.theme),
                                ]}>
                                <MaterialCommunityIcons
                                    style={[tw`text-center mr-2`]}
                                    name="map-marker-radius"
                                    size={16}
                                    color={stil('text', data.app.theme).color}
                                />
                                <View>
                                    <Text style={[tw`font-semibold`, stil('text', data.app.theme)]}>
                                        {trip.locations[key[0]].title}
                                    </Text>
                                    <Text style={[tw`text-xs`, stil('text', data.app.theme)]}>
                                        {trip.locations[key[0]].description}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </>
            ) : null}

            <Text style={[stil('text', data.app.theme), tw`mt-2 mb-4`]}>
                {l[data.app.lang].end} - {new Date(trip.end_time * 1000).getDate()}{' '}
                {l[data.app.lang][months[new Date(trip.end_time * 1000).getMonth()]]}{' '}
                {l[data.app.lang][days[new Date(trip.end_time * 1000).getDay()]]}{' '}
                {new Date(trip.end_time * 1000).getHours()}:
                {new Date(trip.end_time * 1000).getMinutes()}
            </Text>
            <View style={[tw`w-full h-[0.5] mb-2`, stil('bg2', data.app.theme)]}></View>
            <View>
                <View style={[tw`flex mx-2`]}>
                    <View style={[tw` my-2 `]}>
                        <View style={[tw`flex-row items-center justify-between mr-4`]}>
                            <Text style={[stil('text', data.app.theme), tw`font-bold `]}>
                                {l[data.app.lang].passenger} : {trip.passenger?.user_name}
                            </Text>
                            {trip.passenger?.user_data.user_image ? (
                                <Image
                                    style={[tw`rounded-md`, {height: 50, width: 50}]}
                                    source={{
                                        uri:
                                            config.imageBaseUrl +
                                            trip.passenger?.user_data.user_image,
                                    }}
                                />
                            ) : null}
                        </View>
                    </View>
                    <View style={[tw` my-2 `]}>
                        <View style={[tw`flex-row items-center justify-between mr-4`]}>
                            <Text style={[stil('text', data.app.theme), tw`font-bold `]}>
                                {l[data.app.lang].driver} : {trip.driver?.user_name}
                            </Text>
                            {trip.driver?.user_data.user_image ? (
                                <Image
                                    style={[tw`rounded-md`, {height: 50, width: 50}]}
                                    source={{
                                        uri:
                                            config.imageBaseUrl + trip.driver?.user_data.user_image,
                                    }}
                                />
                            ) : null}
                        </View>
                    </View>
                    <View style={[tw` my-2 `]}>
                        <View style={[tw`flex-row items-center justify-between mr-4`]}>
                            <Text style={[stil('text', data.app.theme), tw`font-bold `]}>
                                {trip.driver?.user_data.car_plate}
                            </Text>
                            <Text style={[stil('text', data.app.theme), tw`font-bold `]}>
                                {trip.driver?.user_data.car_brand}{' '}
                                {trip.driver?.user_data.car_model}
                            </Text>
                            <Text style={[stil('text', data.app.theme), tw`font-bold `]}>
                                {trip.driver?.user_data.car_type}
                            </Text>
                            {trip.driver?.user_data.car_image_1 ? (
                                <Image
                                    style={[tw`rounded-md`, {height: 50, width: 50}]}
                                    source={{
                                        uri:
                                            config.imageBaseUrl +
                                            trip.driver?.user_data.car_image_1,
                                    }}
                                />
                            ) : null}
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

export default TripDetail;
