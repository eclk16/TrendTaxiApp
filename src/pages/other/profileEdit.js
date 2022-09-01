import React, {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import {stil} from '../../utils';
import l from '../../languages.json';
import {setValue} from '../../async';
import {useNavigation} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
MaterialCommunityIcons.loadFont();
import axios from 'axios';
import StatusBarComponent from '../../components/global/status';

export default function ProfileEdit() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const data = useSelector((state) => state);
  const [userName, setUserName] = React.useState(null);
  const [userSurname, setUserSurname] = React.useState(null);
  const [userPhone, setUserPhone] = React.useState(null);
  const [userEmail, setUserEmail] = React.useState(null);
  const [userAddress, setUserAddress] = React.useState(null);
  const [uploadedImage, setUploadedImage] = React.useState(null);
  const [userImage, setUserImage] = React.useState(null);

  useEffect(() => {
    getUserData(data.auth.userId, data.auth.userToken);
    setUserName(data.auth.user.passenger?.first_name);
    setUserSurname(data.auth.user.passenger?.last_name);
    setUserPhone(data.auth.user.passenger?.phone);
    if (data.auth.user.passenger?.image)
      setUserImage({uri: 'http://92.63.206.165' + data.auth.user.passenger?.image});
    setUserEmail(data.auth.user.passenger?.email);
    setUserAddress(data.auth.user.passenger?.contact_address);
  }, []);

  const getPhotoWithPhone = () => {
    let options = {
      storageOption: {
        path: 'images',
        mediaType: 'photo',
      },
      includeBase64: true,
      maxWidth: 500,
      maxHeight: 500,
      quality: 0.9,
    };
    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = response.assets[0].base64;
        setUploadedImage('data:image/jpeg;base64,' + source);
        setUserImage({uri: 'data:image/jpeg;base64,' + response.assets[0].base64});
      }
    });
  };

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

  const saveUserInfo = () => {
    const config = {
      headers: {Authorization: `Bearer ${data.auth.userToken}`},
    };
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.auth.userToken;
    axios
      .post('http://92.63.206.165/api/updateUserData', {
        id: data.auth.userId,
        first_name: userName,
        last_name: userSurname,
        phone: userPhone,
        phone_number: userPhone,
        email: userEmail,
        contact_address: userAddress,
        uploadImage: uploadedImage,
      })
      .then((response) => {
        console.log(response.data.data);
        if (!response.data.data.hata) {
          getUserData(data.auth.userId, data.auth.userToken);
          alert(response.data.message[data.app.lang]);
          navigation.navigate('Profile', {referer: 'edit'});
        } else {
          alert(response.data.message[data.app.lang]);
          navigation.navigate('Profile', {referer: 'edit'});
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <KeyboardAvoidingView
      style={tw`flex-1`}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      enabled>
      <StatusBarComponent />
      <ScrollView style={[stil('bg', data.app.theme), tw`p-4 flex-1`]}>
        <View
          style={[
            tw`rounded-md p-4 flex-row items-center justify-start`,
            stil('bg2', data.app.theme),
          ]}>
          <View style={[tw``]}>
            {userImage ? (
              <Image style={[tw`rounded-md`, {height: 100, width: 100}]} source={userImage} />
            ) : null}
          </View>
          <View style={[tw`ml-4`]}>
            <TouchableOpacity onPress={() => getPhotoWithPhone()}>
              <Text style={[tw`text-lg p-8`, stil('text', data.app.theme)]}>
                {l[data.app.lang].imageUpload}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={[tw` rounded-md p-2 mt-4 flex  justify-between`, stil('bg2', data.app.theme)]}>
          <Text style={[tw` font-medium`, {color: stil('text', data.app.theme).color}]}>
            {l[data.app.lang].first_name} :{' '}
          </Text>
          <View style={tw`flex flex-row justify-end`}>
            <View
              style={[
                tw`w-full rounded-md  mt-2   border `,
                {borderColor: stil('bg', data.app.theme).backgroundColor},
              ]}>
              <TextInput
                style={[stil('text', data.app.theme), tw`p-2`]}
                placeholderTextColor={stil('text', data.app.theme).color}
                value={userName}
                placeholder={l[data.app.lang].first_name}
                onChangeText={(text) => setUserName(text)}
              />
            </View>
          </View>
        </View>
        <View style={[tw` rounded-md p-2 mt-4 flex  justify-between`, stil('bg2', data.app.theme)]}>
          <Text style={[tw` font-medium`, {color: stil('text', data.app.theme).color}]}>
            {l[data.app.lang].last_name} :{' '}
          </Text>
          <View style={tw`flex flex-row justify-end`}>
            <View
              style={[
                tw`w-full rounded-md  mt-2   border `,
                {borderColor: stil('bg', data.app.theme).backgroundColor},
              ]}>
              <TextInput
                style={[stil('text', data.app.theme), tw`p-2`]}
                placeholderTextColor={stil('text', data.app.theme).color}
                value={userSurname}
                placeholder={l[data.app.lang].last_name}
                onChangeText={(text) => setUserSurname(text)}
              />
            </View>
          </View>
        </View>
        <View style={[tw` rounded-md p-2 mt-4 flex  justify-between`, stil('bg2', data.app.theme)]}>
          <Text style={[tw` font-medium`, {color: stil('text', data.app.theme).color}]}>
            {l[data.app.lang].phone} :{' '}
          </Text>
          <View style={tw`flex flex-row justify-end`}>
            <View
              style={[
                tw`w-full rounded-md  mt-2   border `,
                {borderColor: stil('bg', data.app.theme).backgroundColor},
              ]}>
              <TextInput
                style={[stil('text', data.app.theme), tw`p-2`]}
                placeholderTextColor={stil('text', data.app.theme).color}
                value={userPhone}
                placeholder={l[data.app.lang].phone}
                onChangeText={(text) => setUserPhone(text)}
              />
            </View>
          </View>
        </View>
        <View style={[tw` rounded-md p-2 mt-4 flex  justify-between`, stil('bg2', data.app.theme)]}>
          <Text style={[tw` font-medium`, {color: stil('text', data.app.theme).color}]}>
            {l[data.app.lang].email} :{' '}
          </Text>
          <View style={tw`flex flex-row justify-end`}>
            <View
              style={[
                tw`w-full rounded-md  mt-2   border `,
                {borderColor: stil('bg', data.app.theme).backgroundColor},
              ]}>
              <TextInput
                style={[stil('text', data.app.theme), tw`p-2`]}
                placeholderTextColor={stil('text', data.app.theme).color}
                value={userEmail}
                placeholder={l[data.app.lang].email}
                onChangeText={(text) => setUserEmail(text)}
              />
            </View>
          </View>
        </View>
        <View style={[tw` rounded-md p-2 mt-4 flex  justify-start`, stil('bg2', data.app.theme)]}>
          <Text style={[tw`text-left font-medium`, {color: stil('text', data.app.theme).color}]}>
            {l[data.app.lang].address} :{' '}
          </Text>
          <View style={tw`flex flex-row justify-end`}>
            <View
              style={[
                tw`w-full rounded-md  mt-2   border `,
                {borderColor: stil('bg', data.app.theme).backgroundColor},
              ]}>
              <TextInput
                style={[stil('text', data.app.theme), tw`p-2`]}
                multiline={true}
                placeholderTextColor={stil('text', data.app.theme).color}
                value={userAddress}
                placeholder={l[data.app.lang].address}
                onChangeText={(text) => setUserAddress(text)}
              />
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            saveUserInfo();
          }}
          style={[
            tw`flex flex-row justify-center items-center mb-24 rounded-md  mt-4 `,
            stil('bg2', data.app.theme),
          ]}>
          <Text
            style={[
              tw`text-center text-xl android:text-xl p-2 ml-4 mr-4 `,
              stil('text', data.app.theme),
            ]}>
            {l[data.app.lang].save}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
