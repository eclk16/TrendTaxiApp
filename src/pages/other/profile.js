import React, {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {View, Text, ScrollView, Image} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import {stil} from '../../utils';
import l from '../../languages.json';
import {setValue} from '../../async';
MaterialCommunityIcons.loadFont();
import axios from 'axios';
import StatusBarComponent from '../../components/global/status';

export default function Profile() {
  const dispatch = useDispatch();
  const data = useSelector((state) => state);
  useEffect(() => {
    getUserData(data.auth.userId, data.auth.userToken);
  }, []);

  const getUserData = (userId, token) => {
    const config = {headers: {Authorization: `Bearer ${token}`}};
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    axios.get('http://92.63.206.165/api/getUserData/' + userId, config).then((response) => {
      console.log(response.data);
      if (!response.data.data.hata) {
        let json = {
          userId: response.data.data.id,
          userToken: data.auth.userToken,
          userType: response.data.data.user_type,
          user: response.data.data,
          currentTheme: data.app.theme,
          lang: data.app.lang,
        };
        json = JSON.stringify(json);
        setValue('userData', json);
        dispatch({type: 'setUser', payload: response.data.data});
      }
    });
  };
  return (
    <>
      <StatusBarComponent />
      <ScrollView style={[stil('bg', data.app.theme), tw`p-4 flex-1`]}>
        <View style={[tw`rounded-md p-4 flex items-center justify-center`]}>
          <View style={[tw`flex items-center justify-center`]}>
            {data.auth.user.passenger?.image ? (
              <Image
                style={[tw`rounded-md`, {height: 150, width: 150}]}
                source={{uri: 'http://92.63.206.165' + data.auth.user.passenger.image}}
              />
            ) : null}
          </View>
          <View style={[tw`flex items-center justify-center`]}>
            <View style={tw`flex-row mt-2`}>
              <Text style={[tw`text-lg font-semibold`, stil('text', data.app.theme)]}>
                {' '}
                {data.auth.user.passenger?.first_name} {data.auth.user.passenger?.last_name}
              </Text>
            </View>
            <View style={tw`flex-row justify-between items-center mt-2`}>
              <MaterialCommunityIcons
                name="credit-card"
                size={18}
                color={stil('text', data.app.theme).color}
              />
              <Text style={[tw`ml-2 mr-4 font-semibold`, stil('text', data.app.theme)]}>
                {' '}
                {data.auth.userType == 'passenger'
                  ? data.auth.user.passenger?.point
                  : data.auth.user.passenger?.balance}
              </Text>

              <MaterialCommunityIcons
                name="map-marker-distance"
                size={18}
                color={stil('text', data.app.theme).color}
              />
              <Text style={[tw`ml-2 font-semibold`, stil('text', data.app.theme)]}>
                {' '}
                {data.auth.user.tripCount}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={[
            tw`rounded-md px-4 py-2 mt-2 flex items-center justify-start`,
            stil('bg2', data.app.theme),
          ]}>
          <View style={[tw`flex-row justify-between w-full`]}>
            <Text style={[stil('text', data.app.theme), tw`font-semibold`]}>
              {l[data.app.lang].first_name}
            </Text>
            <Text style={[stil('text', data.app.theme), tw` font-medium`]}>
              {data.auth.user.passenger?.first_name}
            </Text>
          </View>
        </View>
        <View
          style={[
            tw`rounded-md px-4 py-2 mt-2 flex items-center justify-start`,
            stil('bg2', data.app.theme),
          ]}>
          <View style={[tw`flex-row justify-between w-full`]}>
            <Text style={[stil('text', data.app.theme), tw`font-semibold`]}>
              {l[data.app.lang].last_name}
            </Text>
            <Text style={[stil('text', data.app.theme), tw` font-medium`]}>
              {data.auth.user.passenger?.last_name}
            </Text>
          </View>
        </View>
        <View
          style={[
            tw`rounded-md px-4 py-2 mt-2 flex items-center justify-start`,
            stil('bg2', data.app.theme),
          ]}>
          <View style={[tw`flex-row justify-between w-full`]}>
            <Text style={[stil('text', data.app.theme), tw`font-semibold`]}>
              {l[data.app.lang].phone}
            </Text>
            <Text style={[stil('text', data.app.theme), tw` font-medium`]}>
              {data.auth.user.passenger?.phone}
            </Text>
          </View>
        </View>
        <View
          style={[
            tw`rounded-md px-4 py-2 mt-2 flex items-center justify-start`,
            stil('bg2', data.app.theme),
          ]}>
          <View style={[tw`flex-row justify-between w-full`]}>
            <Text style={[stil('text', data.app.theme), tw`font-semibold`]}>
              {l[data.app.lang].email}
            </Text>
            <Text style={[stil('text', data.app.theme), tw` font-medium`]}>
              {data.auth.user.passenger?.email}
            </Text>
          </View>
        </View>
        <View
          style={[
            tw`rounded-md px-4 py-2  mt-2 flex items-center justify-start`,
            stil('bg2', data.app.theme),
          ]}>
          <View style={[tw`flex-row justify-between w-full`]}>
            <Text style={[stil('text', data.app.theme), tw`font-semibold`]}>
              {l[data.app.lang].address}
            </Text>
            <Text style={[stil('text', data.app.theme), tw` text-right font-medium w-2/3`]}>
              {data.auth.user.passenger?.contact_address}
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
