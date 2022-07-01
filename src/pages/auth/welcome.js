import React from 'react';
import { useDispatch,useSelector } from 'react-redux';
import { setValue,getValue } from '../../async';
import { stil } from '../../utils';
import tw from 'twrnc';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';
import MaskInput from 'react-native-mask-input';
import axios from 'axios';
import l from '../../languages.json';
import { Linking, ScrollView, TextInput } from 'react-native'

MaterialCommunityIcons.loadFont();



import {SafeAreaView, Text, TouchableOpacity, View,Image,KeyboardAvoidingView,ActivityIndicator} from 'react-native';
import StatusBarComponent from '../../components/global/status';

export default function Welcome(){
	const dispatch = useDispatch();
    const data = useSelector(state => state);
	//step 1 = language page 
	//step 2 = theme page
	//step 3 = permission page
	//step 4 = login page
	//step 5 = sms check
	const [step,setStep] = React.useState(1);
	const [myLocation,setMyLocation] = React.useState(false);
	const [userPhone,setUserPhone] = React.useState('');
	const [userSms,setUserSms] = React.useState('');
	const [loading,setLoading] = React.useState(false);
	const LANGS = [
        {
            "langCode":'uz',
            "langName":"O'zbekcha",
            "langFlag":require('../../assets/img/uz.png')
        },
        {
            "langCode":'ru',
            "langName":'Русский',
            "langFlag":require('../../assets/img/ru.png')
        },
        {
            "langCode":'gb',
            "langName":'English',
            "langFlag":require('../../assets/img/gb.png')
        },
        {
            "langCode":'tr',
            "langName":'Türkçe',
            "langFlag":require('../../assets/img/tr.png')
        },
    ];

	function setLanguage(code){
		setValue('lang',code);
        dispatch({type: 'lang', payload: code});
	}

	function setTheme(theme){
		setValue('theme',theme);
        dispatch({type: 'theme', payload: theme});
	}

	function getLocation(){
		Geolocation.getCurrentPosition(
			(position) => {
                setMyLocation(true);
			},
			(error) => {
				console.log(error.code, error.message);
			},
			{ enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
		);	
	}

	const loginFunction = () => {
        if(userPhone.length == 12) {
            setLoading(true);
            axios.defaults.headers.common["Accept"] = "application/json";
            axios.defaults.headers.common["Content-Type"] = "application/json";
            axios.post('https://trendtaxi.uz/api/login',{phone:userPhone,deviceToken:'deviceToken'})
            .then(response => {
                if(!response.data.data.hata) {
                    dispatch({type:'setAuth',payload:{
                        userId:response.data.data.id,
                        userToken:response.data.data.token,
                        userType:response.data.data.user_type,
                        user:response.data.data
                    }});
                    if(response.data.data.email_verified_at == 1) {
                        let json = {
                            userId:response.data.data.id,
                            userToken:response.data.data.token,
                            userType:response.data.data.user_type,
                            user:response.data.data,
                            currentTheme:data.app.theme,
                            currentLanguage:data.app.lang,
                        };
                        setValue('userData',JSON.stringify(json));
						getValue('userData').then(res => {

							if(res){
								console.log('RESSSSAAA = ',JSON.parse(res));
							}
						});
                        dispatch({type:'isAuth',payload:true});
                    }
                    else{
                        setStep(5);
                    }
                }
                else{
                    alert(err[data.app.lang]);
                }
                setLoading(false);
            })
            .catch(error => {
            });
        }
        else{
            alert('12 hane girin');
        }
    };

	const smsFunction = () => {
        setLoading(true);
        axios.defaults.headers.common["Accept"] = "application/json";
        axios.defaults.headers.common["Content-Type"] = "application/json";
        axios.post('https://trendtaxi.uz/api/SmsCheck',{smsCode:userSms,id:data.auth.userId})
        .then(response => {
            if(!response.data.data.hata) {
                let json = {
                    userId:data.auth.userId,
                    userToken:data.auth.userToken,
                    userType:data.auth.userType,
                    user:data.auth.user,
                    currentTheme:data.app.theme,
                    currentLanguage:data.app.lang,
                };
                setValue('userData',JSON.stringify(json));
                dispatch({type:'isAuth',payload:true});
            }
            else{
                alert(response.data.message[data.app.lang]);
            }
            setLoading(false);
        })
        .catch(error => {
        });
    };

	const pt = {
		sav: [
			tw`flex-1 px-4 justify-between`,
			stil('bg',data.app.theme)
		],
		v: [
			tw` flex items-center justify-center `
		],
		footerView:[
			tw`flex-row px-8 pb-4 items-center justify-between`,
			stil('bg',data.app.theme)
		],
		logo:[
			tw`h-32 w-32 mb-2 rounded-2xl mt-12`,
		],
		logoText:[
			tw`font-semibold text-xl`,
			stil('text',data.app.theme)
		],
		bgImage:[
			{
				position:'absolute',
				height:'90%'
			}
			,tw`opacity-10`
		]
	};

    return (
		<KeyboardAvoidingView
            style={tw`flex-1`}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            enabled
        >
			<StatusBarComponent/>
			<SafeAreaView style={pt.sav}>
				<View style={pt.v}>
					<Image style={pt.bgImage} resizeMode="contain" source={data.app.theme == 'dark' ? require('../../assets/img/uzbekistanBGA.png') : require('../../assets/img/uzbekistanBGR.png')} />
					<Image style={pt.logo} source={require('../../assets/img/1024.png')} />
					<Text style={pt.logoText}>Trend Taxi</Text>
				</View>
				<View style={[tw`flex justify-end`]}>
					<View style={[tw`flex-row justify-center items-center `]}>
						<MaterialCommunityIcons name={step == 1 ? 'alphabetical-variant' : 'circle-small'} size={40} color={stil('text',data.app.theme).color}/>
						<MaterialCommunityIcons name={step == 2 ? 'theme-light-dark' : 'circle-small'} size={40} color={stil('text',data.app.theme).color}/>
						<MaterialCommunityIcons name={step == 3 ? 'security' : 'circle-small'} size={40} color={stil('text',data.app.theme).color}/>
						<MaterialCommunityIcons name={step == 4 ? 'phone' : 'circle-small'} size={40} color={stil('text',data.app.theme).color}/>
						<MaterialCommunityIcons name={step == 5 ? 'android-messages' : 'circle-small'} size={40} color={stil('text',data.app.theme).color}/>
					</View>
					<View>
						{step == 1 &&
							<>
								<Text style={[tw`my-2 text-center`,stil('text',data.app.theme)]}>{l[data.app.lang].dilSec}</Text>
								<View style={[tw`m-4 rounded-md`]}>
									{LANGS.map((item,index) => {
										return (
											<TouchableOpacity key={index} style={[stil('bg2',data.app.theme),tw`flex-row items-center mx-4 mb-1 p-4 rounded-md justify-between`]} onPress={() => setLanguage(item.langCode)} >
												<View style={[tw`flex-row items-center justify-between `]}>
													<Image source={item.langFlag} style={[tw`h-8 w-10 rounded-md mr-4`]}/>
													<Text style={[tw`font-semibold`,stil('text',data.app.theme)]}>{item.langName}</Text>
												</View>
												<View style={tw`flex-row justify-end items-end`}>
													{data.app.lang == item.langCode ?
													<MaterialCommunityIcons name="check-circle-outline" size={32} color={stil('text',data.app.theme).color}/>
													: null}
												</View>
											</TouchableOpacity>
										);
									})}
								</View>
							</>
						}
						{step == 2 &&
							<>
								<Text style={[tw`my-2 text-center`,stil('text',data.app.theme)]}>{l[data.app.lang].temaSec}</Text>
								<View style={[tw`m-4 flex justify-center rounded-md`]}>
									<TouchableOpacity key={0} style={[stil('bg2',data.app.theme),tw`flex-row items-center mx-4 mb-1 p-4 rounded-md justify-between`]} onPress={() => setTheme('light')} >
										<View style={[tw`flex-row items-center justify-between `]}>
											<MaterialCommunityIcons name="white-balance-sunny" size={32} color={stil('text',data.app.theme).color}/>
											<Text style={[tw` font-semibold ml-4`,stil('text',data.app.theme)]}>{l[data.app.lang].lightTheme}</Text>
										</View>
										<View style={tw`flex-row justify-end items-end`}>
											{data.app.theme == 'light' ?
											<MaterialCommunityIcons name="check-circle-outline" size={32} color={stil('text',data.app.theme).color}/>
											: null}
										</View>
									</TouchableOpacity>
									<TouchableOpacity key={1} style={[stil('bg2',data.app.theme),tw`flex-row items-center mx-4 mb-1 p-4 rounded-md justify-between`]} onPress={() => setTheme('dark')} >
										<View style={[tw`flex-row items-center justify-between `]}>
											<MaterialCommunityIcons name="moon-waning-crescent" size={32} color={stil('text',data.app.theme).color}/>
											<Text style={[tw` font-semibold ml-4`,stil('text',data.app.theme)]}>{l[data.app.lang].darkTheme}</Text>
										</View>
										<View style={tw`flex-row justify-end items-end`}>
											{data.app.theme == 'dark' ?
											<MaterialCommunityIcons name="check-circle-outline" size={32} color={stil('text',data.app.theme).color}/>
											: null}
										</View>
									</TouchableOpacity>
								</View>
							</>
						}
						{step == 3 &&
							<>
								<Text style={[tw`my-2 text-center`,stil('text',data.app.theme)]}>{l[data.app.lang].izinVer}</Text>
									<View style={[tw`m-4 flex justify-center rounded-md`]}>
									<TouchableOpacity key={0} style={[stil('bg2',data.app.theme),tw`flex-row items-center mx-4 mb-1 p-4 rounded-md justify-between`]} onPress={() => getLocation()} >
										<View style={[tw`flex-row items-center justify-between `]}>
											<MaterialCommunityIcons name="map-marker-radius" size={32} color={stil('text',data.app.theme).color}/>
											<Text style={[tw` font-semibold ml-4`,stil('text',data.app.theme)]}>{l[data.app.lang].konumbilgisiizin}</Text>
										</View>
										<View style={tw`flex-row justify-end items-end`}>
											{myLocation ?
											<MaterialCommunityIcons name="check-circle-outline" size={32} color={stil('text',data.app.theme).color}/>
											: null}
										</View>
									</TouchableOpacity>
								</View>
							</>
						}
						{step == 4 &&
							<>
								<Text style={[tw`my-2 text-center`,stil('text',data.app.theme)]}>{l[data.app.lang].TelefonGir}</Text>
								<View style={[stil('bg2',data.app.theme),tw`mx-8 my-4 flex justify-center rounded-md`]}>
									<View key={0} style={[tw`flex-row items-center m-4 justify-between`]} onPress={() => getLocation()} >
										<View style={[tw`flex-row items-center justify-between `]}>
											<MaterialCommunityIcons name="cellphone" size={32} color={stil('text',data.app.theme).color}/>
											<MaskInput
												keyboardType='numeric'
												placeholder="+___ - _________"
												placeholderTextColor={stil('text',data.app.theme).color}
												style={[stil('text',data.app.theme),tw`ml-4 text-xl w-full`]}
												value={userPhone ? userPhone : ''}
												onChangeText={(masked, unmasked) => {
													setUserPhone(unmasked); 
												}}
												mask={[ '+',/\d/,/\d/, /\d/,' - ', /\d/,/\d/, ' ', /\d/, /\d/, /\d/,' ', /\d/, /\d/, ' ', /\d/, /\d/]}
											/>
										</View>
									</View>
								</View>
							</>
						}
						{step == 5 &&
							<>
								<Text style={[tw`my-2 text-center`,stil('text',data.app.theme)]}>{l[data.app.lang].smsGir}</Text>
								<View style={[stil('bg2',data.app.theme),tw`mx-8 my-4 flex justify-center rounded-md`]}>
									<View key={0} style={[tw`flex-row items-center m-4 justify-between`]} onPress={() => getLocation()} >
										<View style={[tw`flex-row items-center justify-between `]}>
											<MaterialCommunityIcons name="android-messages" size={32} color={stil('text',data.app.theme).color}/>
											<MaskInput
												keyboardType='numeric'
												placeholder="_ _ _ _ _ _"
												placeholderTextColor={stil('text',data.app.theme).color}
												style={[stil('text',data.app.theme),tw`ml-4 text-xl w-full`]}
												value={userSms ? userSms : ''}
												onChangeText={(masked, unmasked) => {
													setUserSms(unmasked); 
												}}
												mask={[ /\d/,' ', /\d/, ' ', /\d/, ' ', /\d/,  ' ', /\d/,' ', /\d/]}
											/>
										</View>
									</View>
								</View>
							</>
						}
					</View>
					<View style={pt.footerView}>	

						
						{step > 3 ? <View></View> :
							<TouchableOpacity onPress={() => {
								setStep(4);
							}}>
								<Text style={[stil('text',data.app.theme),tw`opacity-50 px-4 py-2`]}>
								{l[data.app.lang].skip}
								</Text>
							</TouchableOpacity>
						}
						<View style={[tw`flex-row`]}>
							<TouchableOpacity disabled={step == 1 ? true : false} style={[tw`flex-row ${step == 1 ? 'opacity-10' : ''} items-center px-4 py-2`,]} onPress={() => {
								setStep(step - 1);
								}}>
								<MaterialCommunityIcons name="arrow-left-drop-circle-outline" size={24} color={stil('text',data.app.theme).color} />
								<Text style={[stil('text',data.app.theme),tw`my-2 ml-2 `]}>
								{l[data.app.lang].back}
								</Text>
							</TouchableOpacity>
							<TouchableOpacity disabled={step == 4 && userPhone.length<12 ? true : (step == 5 && userPhone.length<6 ? true : false) } style={[tw`flex-row ${step == 4 && userPhone.length<12 ? 'opacity-10' : (step == 5 && userPhone.length<6 ? 'opacity-10' : '')} items-center px-4 py-2 rounded-md`,stil('bg2',data.app.theme)]} onPress={() => {
								if(step == 4){
									loginFunction();
								}
								else if(step == 5){
									smsFunction();
								}
								else{
									setStep(step + 1);
								}
								}}>
								<Text style={[stil('text',data.app.theme),tw`my-2 mr-2 `]}>
									{step == 4 ? l[data.app.lang].login : (step == 5 ? l[data.app.lang].check : l[data.app.lang].next)}
								</Text>
								{loading ? 
									<ActivityIndicator size={24} color={stil('text',data.app.theme).color}/>
									:
									<MaterialCommunityIcons name={step == 4 ? 'account-circle-outline' : ( step == 5 ? 'check-circle-outline' : 'arrow-right-drop-circle-outline')} size={24} color={stil('text',data.app.theme).color} />
								}
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</SafeAreaView>
		</KeyboardAvoidingView>
    )
}
