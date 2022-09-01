import React, {useEffect} from 'react';
import {Text, Image, View, BackHandler, ScrollView} from 'react-native';
import tw from 'twrnc';
import Ionicons from 'react-native-vector-icons/Ionicons';
Ionicons.loadFont();
import {getValue} from '../../async';
import axios from 'axios';
import {stil} from '../../utils';
import {useNavigation, useRoute} from '@react-navigation/native';
import l from '../../languages.json';
import {useSelector} from 'react-redux';
import StatusBarComponent from '../../components/global/status';

function TripDetail() {
  const navigation = useNavigation();

  const route = useRoute();

  const data = useSelector((state) => state);

  const [loading, setLoading] = React.useState(true);
  const url = {
    // trip:'http://127.0.0.1:8000/api/getTrip/',
    trip: 'http://92.63.206.165/api/getTrip',
  };
  const {trip_id} = route.params;

  useEffect(() => {
    setLoading(true);

    getTrip(trip_id, data.auth.userToken);

    setUserType(data.auth.userType);
  }, [trip_id]);
  const [tripStartTime, setTripStartTime] = React.useState(null);
  const [tripEndTime, setTripEndTime] = React.useState(null);
  const [tripStartPoint, setTripStartPoint] = React.useState(null);
  const [tripEndPoint, setTripEndPoint] = React.useState(null);
  const [tripPrice, setTripPrice] = React.useState(null);
  const [tripDistance, setTripDistance] = React.useState(null);
  const [tripTime, setTripTime] = React.useState(null);
  const [tripStatus, setTripStatus] = React.useState(null);
  const [tripDriver, setTripDriver] = React.useState(null);
  const [tripPassenger, setTripPassenger] = React.useState(null);
  const [tripDriverImage, setTripDriverImage] = React.useState(null);
  const [tripPassengerImage, setTripPassengerImage] = React.useState(null);
  const [tripCar, setTripCar] = React.useState(null);
  const [tripScore, setTripScore] = React.useState(null);
  const [tripCarImage, setTripCarImage] = React.useState(null);
  const [reward, setReward] = React.useState(null);
  const [tripId, setTripId] = React.useState(null);
  const [userType, setUserType] = React.useState(null);

  const getTrip = (id, userToken) => {
    console.log('TRİP İD : ' + trip_id);
    const config = {
      headers: {Authorization: `Bearer ${userToken}`},
    };
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + userToken;
    axios
      .post(url.trip, {
        id: id,
        lang: data.app.lang,
      })
      .then((response) => {
        if (!response.data.data.hata) {
          setTripStartTime(response.data.data.start_time);
          setTripEndTime(response.data.data.end_time);

          setTripStartPoint(response.data.data.first_location_name);
          setTripEndPoint(response.data.data.last_location_name);
          setReward(response.data.data.reward);
          setTripPrice(response.data.data.act_price);
          setTripDistance(response.data.data.act_distance);
          setTripTime(response.data.data.act_time);

          setTripScore(response.data.data.sofor.score);
          setTripId(response.data.data.trip_id);
          setTripStatus(response.data.data.status);
          setTripDriver(
            response.data.data.sofor.first_name + ' ' + response.data.data.sofor.last_name,
          );
          setTripDriverImage(response.data.data.sofor_image);
          setTripPassengerImage(response.data.data.yolcu_image);
          setTripPassenger(
            response.data.data.yolcu.first_name + ' ' + response.data.data.yolcu.last_name,
          );
          setTripCar(response.data.data.sofor.araba.plaka);
          setTripCarImage('http://92.63.206.165' + response.data.data.sofor.araba.image);
        } else {
        }
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };

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
          <Text style={[stil('text', data.app.theme), tw``]}> : {tripId}</Text>
        </View>
        <View style={[tw`flex-row w-full mb-2`]}>
          <Text style={[stil('text', data.app.theme), tw` w-1/2`]}>{l[data.app.lang].price}</Text>
          <Text style={[stil('text', data.app.theme), tw``]}> : {tripPrice} sum</Text>
        </View>
        <View style={[tw`flex-row w-full mb-2`]}>
          <Text style={[stil('text', data.app.theme), tw` w-1/2`]}>
            {l[data.app.lang].distance}
          </Text>
          <Text style={[stil('text', data.app.theme), tw``]}> : {tripDistance}</Text>
        </View>
        <View style={[tw`flex-row w-full mb-2`]}>
          <Text style={[stil('text', data.app.theme), tw` w-1/2`]}>
            {l[data.app.lang].duration}
          </Text>
          <Text style={[stil('text', data.app.theme), tw``]}> : {tripTime}</Text>
        </View>
        <View style={[tw`flex-row w-full mb-2`]}>
          <Text style={[stil('text', data.app.theme), tw` w-1/2`]}>{l[data.app.lang].score}</Text>
          <Text style={[stil('text', data.app.theme), tw``]}>
            {' '}
            :
            <Ionicons name="ios-star" size={20} color={tripScore > 0 ? '#ffd700' : '#ccc'} />
            <Ionicons name="ios-star" size={20} color={tripScore > 1 ? '#ffd700' : '#ccc'} />
            <Ionicons name="ios-star" size={20} color={tripScore > 2 ? '#ffd700' : '#ccc'} />
            <Ionicons name="ios-star" size={20} color={tripScore > 3 ? '#ffd700' : '#ccc'} />
            <Ionicons name="ios-star" size={20} color={tripScore > 4 ? '#ffd700' : '#ccc'} />
          </Text>
        </View>
        {reward > 0 ? (
          <View style={[tw`flex-row w-full mb-2`]}>
            <Text style={[stil('text', data.app.theme), tw` w-1/2`]}>
              {l[data.app.lang].reward}
            </Text>
            <Text style={[stil('text', data.app.theme), tw``]}> : {reward} TT</Text>
          </View>
        ) : null}
      </View>
      <Text style={[stil('text', data.app.theme), tw`mt-4 `, stil('bg', data.app.theme)]}>
        {l[data.app.lang].start} - {tripStartTime}
      </Text>
      <View
        style={[
          tw`rounded-md px-4 py-2 my-2 flex items-start justify-start`,
          stil('bg2', data.app.theme),
        ]}>
        <View style={[tw`flex w-full mb-2`]}>
          <Text style={[stil('text', data.app.theme), tw`text-xs`]}>{tripStartPoint}</Text>
        </View>
      </View>
      <Text style={[stil('text', data.app.theme), tw`mt-2 `]}>
        {l[data.app.lang].end} - {tripEndTime}
      </Text>
      <View
        style={[
          tw`rounded-md px-4 py-2 my-2 flex items-start justify-start`,
          stil('bg2', data.app.theme),
        ]}>
        <View style={[tw`flex w-full mb-2`]}>
          <Text style={[stil('text', data.app.theme), tw`text-xs`]}>{tripEndPoint} TT</Text>
        </View>
      </View>

      {userType === 'driver' ? (
        <>
          <Text style={[stil('text', data.app.theme), tw`mt-2 `]}>
            {l[data.app.lang].passenger}
          </Text>
          <View
            style={[
              tw`rounded-md px-4 py-2 my-2 flex items-start justify-start`,
              stil('bg2', data.app.theme),
            ]}>
            <View style={[tw`flex w-full mb-2`]}>
              <Image
                source={{uri: tripPassengerImage}}
                style={[tw`h-24 w-24 rounded-2 mr-2 mb-2`]}
              />
              <Text style={[stil('text', data.app.theme)]}>{tripPassenger}</Text>
            </View>
          </View>
        </>
      ) : null}
      {userType === 'passenger' ? (
        <>
          <Text style={[stil('text', data.app.theme), tw`mt-2 `]}>{l[data.app.lang].driver}</Text>
          <View
            style={[
              tw`rounded-md p-4 my-2 flex items-start justify-start`,
              stil('bg2', data.app.theme),
            ]}>
            <View style={[tw`flex-row justify-between w-full mb-2`]}>
              <View style={[tw`flex justify-start items-start mb-2`]}>
                <Image source={{uri: tripDriverImage}} style={[tw`h-24 w-24 rounded-md mb-2`]} />
                <Text style={[stil('text', data.app.theme)]}>{tripDriver}</Text>
              </View>
              <View style={[tw`flex justify-end items-end mb-2`]}>
                <Image source={{uri: tripCarImage}} style={[tw`h-24 w-24 rounded-md mb-2`]} />
                <Text style={[stil('text', data.app.theme)]}>{tripCar}</Text>
              </View>
            </View>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

export default TripDetail;
