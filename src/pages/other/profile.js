import React,{useEffect} from 'react';
import {useSelector,useDispatch} from 'react-redux';
import {TouchableOpacity,View,Text, ScrollView,Image,TextInput,Modal} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import { stil } from '../../utils';
import l from '../../languages.json';
import { setValue } from '../../async';
import {useNavigation} from '@react-navigation/native';
MaterialCommunityIcons.loadFont();
import axios from 'axios';

export default function Profile(){
	const navigation = useNavigation(); 
    const dispatch = useDispatch();
    const data = useSelector(state => state);
	const [userName,setUserName] = React.useState(null);
    const [userSurname,setUserSurname] = React.useState(null);
    const [userPhone,setUserPhone] = React.useState(null);
    const [userEmail,setUserEmail] = React.useState(null);
    const [userAddress,setUserAddress] = React.useState(null);
    const [uploadedImage,setUploadedImage] = React.useState(null);
    const [userImage,setUserImage] = React.useState(null);
    const [userPoint,setUserPoint] = React.useState(null);
    const [tripCount,setTripCount] = React.useState(0);
	const [profilEdit,setProfilEdit] = React.useState(false);
	const [carEdit,setCarEdit] = React.useState(false);

    useEffect(() => {
        getUserData(data.auth.userId,data.auth.userToken);
        setUserName(data.auth.user.passenger.first_name);
        setUserSurname(data.auth.user.passenger.last_name);
        setUserPhone(data.auth.user.passenger.phone);
        if(data.auth.user.passenger.image) setUserImage({uri:'https://trendtaxi.uz'+data.auth.user.passenger.image });
        setUserEmail(data.auth.user.passenger.email);
        setUserAddress(data.auth.user.passenger.contact_address);

		console.log(data.auth.user.passenger.point);
		setTripCount(data.auth.user.tripCount)
    }, []);

    const getPhotoWithPhone = () => {
        let options = {
            storageOption:{
                path: 'images',
                mediaType: 'photo',
            },
            includeBase64:true,
            maxWidth:500,
            maxHeight:500,
            quality:0.9,
        };
        launchImageLibrary(options, response => {
            if(response.didCancel){
                console.log('User cancelled image picker');
            }else if(response.error){
                console.log('ImagePicker Error: ', response.error);
            }else if(response.customButton){
                console.log('User tapped custom button: ', response.customButton);
            }else{
                const source = response.assets[0].base64;
                setUploadedImage('data:image/jpeg;base64,'+source);
                setUserImage({uri: 'data:image/jpeg;base64,' + response.assets[0].base64});
            }
        });   
    }

    const getUserData = (userId,token) => {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        axios.defaults.headers.common["Accept"] = "application/json";
        axios.defaults.headers.common["Content-Type"] = "application/json";
        axios.defaults.headers.common["Authorization"] = "Bearer "+token;
        axios.get('https://trendtaxi.uz/api/getUserData/'+userId,config)
        .then(response => {
            if(!response.data.data.hata) {
                let json = {
                    userId:response.data.data.id,
                    userToken:data.auth.userToken,
                    userType:response.data.data.user_type,
                    user:response.data.data,
                    currentTheme:data.app.theme,
                    lang:data.app.lang,
                };
                json = JSON.stringify(json);
                setValue('userData',json);

            }
        });
    }
  
    const saveUserInfo = () => {
        const config = {
            headers: { Authorization: `Bearer ${data.auth.userToken}` }
        };
        axios.defaults.headers.common["Accept"] = "application/json";
        axios.defaults.headers.common["Content-Type"] = "application/json";
        axios.defaults.headers.common["Authorization"] = "Bearer "+data.auth.userToken;
        axios.post('https://trendtaxi.uz/api/updateUserData',{
            id:data.auth.userId,
            first_name:userName,
            last_name:userSurname,
            phone:userPhone,
            phone_number:userPhone,
            email:userEmail,
            contact_address:userAddress,
            uploadImage:uploadedImage
        })
        .then(response => {
            console.log(response.data.data);
            if(!response.data.data.hata) {
                getUserData(data.auth.userId,data.auth.userToken);
                alert(response.data.message[data.app.lang]);
            }
            else{
                alert(response.data.message[data.app.lang]);
            }
        })
        .catch(error => {
            console.log(error);
        });
    }



    return (
		<>
		<ScrollView style={[stil('bg',data.app.theme),tw`p-4 flex-1`]}>
			<View style={[tw`rounded-md p-4 flex-row items-center justify-start`,stil('bg2',data.app.theme)]}>
				<View style={[tw``]}>
					{userImage ? <Image style={[tw`rounded-md`,{height:100,width:100}]} source={userImage}/> : null}
				</View>
				<View style={[tw`ml-4`]}>
					<View style={tw`flex-row mt-2`}>
						<Text style={[tw`text-lg`,stil('text',data.app.theme)]}> {userName} {userSurname}</Text>
					</View>
					<View style={tw`flex-row mt-2`}>
						<MaterialCommunityIcons name="credit-card" size={18} color={stil('text',data.app.theme).color}/>
						<Text style={[tw`ml-2`,stil('text',data.app.theme)]}> {data.auth.userType == 'passenger' ? data.auth.user.passenger.point : data.auth.user.passenger.balance}</Text>
					</View>
					<View style={tw`flex-row mt-2`}>
						<MaterialCommunityIcons name="map-marker-distance" size={18} color={stil('text',data.app.theme).color}/>
						<Text style={[tw`ml-2`,stil('text',data.app.theme)]}> {tripCount}</Text>
					</View>
				</View>
			</View>
			<View style={[tw`rounded-md p-4 mt-4 flex items-start justify-start`,stil('bg2',data.app.theme)]}>
				<View style={[tw`flex-row w-full mb-2`]}>
					<Text style={[stil('text',data.app.theme),tw`text-base w-24`]}>{l[data.app.lang].first_name}</Text>
					<Text style={[stil('text',data.app.theme),tw`text-base`]}> : {userName}</Text>
				</View>
				<View style={[tw`flex-row w-full mb-2`]}>
					<Text style={[stil('text',data.app.theme),tw`text-base w-24`]}>{l[data.app.lang].last_name}</Text>
					<Text style={[stil('text',data.app.theme),tw`text-base`]}> : {userSurname}</Text>
				</View>
				<View style={[tw`flex-row w-full mb-2`]}>
					<Text style={[stil('text',data.app.theme),tw`text-base w-24`]}>{l[data.app.lang].phone}</Text>
					<Text style={[stil('text',data.app.theme),tw`text-base`]}> : {userPhone}</Text>
				</View>
				<View style={[tw`flex-row w-full mb-2`]}>
					<Text style={[stil('text',data.app.theme),tw`text-base w-24`]}>{l[data.app.lang].email}</Text>
					<Text style={[stil('text',data.app.theme),tw`text-base`]}> : {userEmail}</Text>
				</View>
				<View style={[tw`flex-row w-full`]}>
					<Text style={[stil('text',data.app.theme),tw`text-base w-24`]}>{l[data.app.lang].address}</Text>
					<Text style={[stil('text',data.app.theme),tw`text-base`]}> : {userAddress}</Text>
				</View>
			</View>
			<View style={[tw`rounded-md px-4 py-2 mt-4 flex items-start justify-start`,stil('bg2',data.app.theme)]}>
				<View style={[tw`flex-row w-full mb-2`]}>
					<Text style={[stil('text',data.app.theme),tw`text-base w-1/2`]}>Günlük Yolculuk</Text>
					<Text style={[stil('text',data.app.theme),tw`text-base`]}> : 18</Text>
				</View>
				<View style={[tw`flex-row w-full mb-2`]}>
					<Text style={[stil('text',data.app.theme),tw`text-base w-1/2`]}>Günlük Harcama</Text>
					<Text style={[stil('text',data.app.theme),tw`text-base`]}> : 300.000 sum</Text>
				</View>
			</View>
			<View style={[tw`rounded-md px-4 py-2 mt-4 flex items-start justify-start`,stil('bg2',data.app.theme)]}>
				<View style={[tw`flex-row w-full mb-2`]}>
					<Text style={[stil('text',data.app.theme),tw`text-base w-1/2`]}>Haftalık Yolculuk</Text>
					<Text style={[stil('text',data.app.theme),tw`text-base`]}> : 187</Text>
				</View>
				<View style={[tw`flex-row w-full mb-2`]}>
					<Text style={[stil('text',data.app.theme),tw`text-base w-1/2`]}>Haftalık Harcama</Text>
					<Text style={[stil('text',data.app.theme),tw`text-base`]}> : 2.100.000 sum</Text>
				</View>
			</View>
			<View style={[tw`rounded-md px-4 py-2 mt-4 flex items-start justify-start`,stil('bg2',data.app.theme)]}>
				<View style={[tw`flex-row w-full mb-2`]}>
					<Text style={[stil('text',data.app.theme),tw`text-base w-1/2`]}>Aylık Yolculuk</Text>
					<Text style={[stil('text',data.app.theme),tw`text-base`]}> : 1300</Text>
				</View>
				<View style={[tw`flex-row w-full mb-2`]}>
					<Text style={[stil('text',data.app.theme),tw`text-base w-1/2`]}>Aylık Harcama</Text>
					<Text style={[stil('text',data.app.theme),tw`text-base`]}> : 9.000.000 sum</Text>
				</View>
			</View>
			<View style={[tw`rounded-md px-4 py-2 mt-4 flex items-start justify-start`,stil('bg2',data.app.theme)]}>
				<View style={[tw`flex-row w-full mb-2`]}>
					<Text style={[stil('text',data.app.theme),tw`text-base w-1/2`]}>Toplam Yolculuk</Text>
					<Text style={[stil('text',data.app.theme),tw`text-base`]}> : 18723</Text>
				</View>
				<View style={[tw`flex-row w-full mb-2`]}>
					<Text style={[stil('text',data.app.theme),tw`text-base w-1/2`]}>Toplam Harcama</Text>
					<Text style={[stil('text',data.app.theme),tw`text-base`]}> : 30.000.000 sum</Text>
				</View>
			</View>
			
			
		</ScrollView>
		</>
    )
}
