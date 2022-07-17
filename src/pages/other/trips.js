import React,{useEffect} from 'react';
import { Text, View,ActivityIndicator,BackHandler } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import tw from 'twrnc';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
MaterialCommunityIcons.loadFont();
import axios from 'axios';
import { stil } from '../../utils';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import l from '../../languages.json';
import StatusBarComponent from '../../components/global/status';

function Trips() {
  const navigation = useNavigation(); 

    const data = useSelector(state => state);

    const [loading,setLoading] = React.useState(true);
    const [refresh,setRefresh] = React.useState(1);
    const [start,setStart] = React.useState(0);

    const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
        const paddingToBottom = 100;
        return layoutMeasurement.height + contentOffset.y >=
          contentSize.height - paddingToBottom;
    };
    useEffect(() => {
        getTrips(data.auth.userId,data.auth.userToken,data.auth.userType);
    }, [refresh]);
    const [trips,setTrips] = React.useState([]);

    const getTrips = (id,userToken,type) => {
        const config = {
            headers: { Authorization: `Bearer ${userToken}` }
        };
        axios.defaults.headers.common["Accept"] = "application/json";
        axios.defaults.headers.common["Content-Type"] = "application/json";
        axios.defaults.headers.common["Authorization"] = "Bearer "+userToken;
        axios.post('https://trendtaxi.uz/api/getTrips',{
            who:type+'_id',
            id:id,
            start:start,
            lang:data.app.lang
        })
        .then(response => {
            if(!response.data.data.hata) {
                setTrips([...trips, ...response.data.data]);
                setStart(start+5);
                console.log(start);
            }
            else{
            }
            setLoading(false);
        })
        .catch(error => {
            console.log(error);
            setLoading(false);
        });
    }

    return (
        <>
            <StatusBarComponent/>
            <ScrollView style={[stil('bg',data.app.theme),tw`p-4 flex-1`]}
                onScroll={({nativeEvent}) => {
                    if (isCloseToBottom(nativeEvent)) {
                        setLoading(true);
                        setRefresh(refresh+1);
                    }
                }}
                scrollEventThrottle={400}
              >
                    <View>
                        {trips.length == 0 ? <Text style={[tw`text-center `,stil('text',data.app.theme)]}>{l[data.app.lang].gecmisYok}</Text> : null}
                        {trips.map((trip,index) => {
                            return (
                                <TouchableOpacity key={index} 
                                onPress={()=>{
                                    navigation.navigate('TripDetail', {trip_id: trip.id});
                                }}>
                                    <Text style={[tw` mb-2 ml-2`,stil('text',data.app.theme)]}>
                                        {trip.trip_id}  {trip.start_time}
                                    </Text>
                                    <View style={[tw`flex rounded-md mb-5 bg-white px-2 py-4`,{backgroundColor:data.app.theme == 'dark' ? '#255382' : '#f9f9f7'}]}>
                                        <View style={[tw` rounded-md `]}>
                                            <View style={[tw`flex-row px-2 `]}>
                                                <View style={tw`w-4/4`}>
                                                    <View style={[tw`mb-2 flex flex-row items-center justify-center`]}>
                                                        <MaterialCommunityIcons name="map-marker" size={24} color={stil('text',data.app.theme).color} />
                                                        <Text style={[tw`flex-auto ml-2 text-xs`,stil('text',data.app.theme)]}>{trip.first_location_name}</Text>
                                                    </View>
                                                    <View style={[tw` flex flex-row items-center justify-center`]}>
                                                        <MaterialCommunityIcons name="map-marker-check" size={24} color={stil('text',data.app.theme).color} />
                                                        <Text style={[tw`flex-auto ml-2 text-xs`,stil('text',data.app.theme)]}>{trip.last_location_name}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                    {loading ? <ActivityIndicator/> : <></> }
                </ScrollView>
        </>
    );
};


export default Trips;