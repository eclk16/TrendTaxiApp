import React,{useEffect} from 'react';
import { useDispatch,useSelector } from 'react-redux';
import { setValue,getValue } from '../../async';
import { stil } from '../../utils';
import tw from 'twrnc';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';
import MaskInput from 'react-native-mask-input';
import axios from 'axios';
import l from '../../languages.json';
import {BackHandler, Linking, ScrollView, Alert} from 'react-native';
import { getUniqueId, getManufacturer } from 'react-native-device-info';


MaterialCommunityIcons.loadFont();



import {SafeAreaView, Text, TouchableOpacity, View,Image,KeyboardAvoidingView,ActivityIndicator} from 'react-native';
import StatusBarComponent from '../../components/global/status';
import DriverRegister from './driverRegister';


export default function Welcome(){
	const dispatch = useDispatch();
    const data = useSelector(state => state);
	const [step,setStep] = React.useState(1);
	const [myLocation,setMyLocation] = React.useState(false);
	const [userPhone,setUserPhone] = React.useState('');
	const [userSms,setUserSms] = React.useState('');
	const [loading,setLoading] = React.useState(false);



	handleBackButtonClick = () => {

		let back = 1;
		if(step > 1){
			back = parseInt(step) - 1;
			setStep(back);
			return true;
		}


	}

	useEffect(() => {
		BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
		return () => {
			BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
		};
	}, [step]);


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
        // {
        //     "langCode":'tr',
        //     "langName":'Türkçe',
        //     "langFlag":require('../../assets/img/tr.png')
        // },
    ];

	function setLanguage(code){
		setValue('lang',code);
        dispatch({type: 'lang', payload: code});
	}

	function setTheme(theme){
		setValue('theme',theme);
        dispatch({type: 'theme', payload: theme});
	}

	const getCurrentLocation = () => {

		Geolocation.getCurrentPosition(
			(position) => {
				if(position.coords.latitude != 0 && position.coords.longitude != 0){

					setMyLocation(true);
				}
			},
			(error) => {
				console.log(error.code, error.message);
			},
			{ enableHighAccuracy: true, timeout: 30000, maximumAge: 1000 }
		);
	}

	function getLocation(){
		getCurrentLocation();
	}

	const loginFunction = () => {
        if(userPhone.length == 12) {
            setLoading(true);
            axios.defaults.headers.common["Accept"] = "application/json";
            axios.defaults.headers.common["Content-Type"] = "application/json";
            axios.post('https://trendtaxi.uz/api/login',{phone:userPhone,deviceToken:getUniqueId(),userType:isDriverRegister ? 'driver' : 'passenger'})
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
                        setStep(6);
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
			tw`flex-1 px-4 justify-end`,
			stil('bg',data.app.theme)
		],
		v: [
			tw` flex items-center justify-center `
		],
		footerView:[
			tw`flex-row px-8 pb-4 items-center justify-end`,
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
	const [isDriverRegister,setIsDriverRegister] = React.useState(false);

    return (
		<KeyboardAvoidingView
            style={tw`flex-1`}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            enabled
        >
			<StatusBarComponent/>
			{/* {isDriverRegister ? 
				<>
					<DriverRegister isRegister={isDriverRegister} setIsDriver={setIsDriverRegister}/>
				</>
			: */}
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
							<MaterialCommunityIcons name={step == 4 ? 'human' : 'circle-small'} size={40} color={stil('text',data.app.theme).color}/>
							<MaterialCommunityIcons name={step == 5 ? 'phone' : 'circle-small'} size={40} color={stil('text',data.app.theme).color}/>
							<MaterialCommunityIcons name={step == 6 ? 'android-messages' : 'circle-small'} size={40} color={stil('text',data.app.theme).color}/>
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
														<Text style={[tw``,stil('text',data.app.theme)]}>{item.langName}</Text>
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
												<Text style={[tw`  ml-4`,stil('text',data.app.theme)]}>{l[data.app.lang].lightTheme}</Text>
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
												<Text style={[tw` ml-4`,stil('text',data.app.theme)]}>{l[data.app.lang].darkTheme}</Text>
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
									<Text style={[tw`my-2 text-xs text-center mx-4`,stil('text',data.app.theme)]}>{l[data.app.lang].konummesaj}</Text>
										<View style={[tw`m-4 flex justify-center rounded-md`]}>
										<TouchableOpacity key={0} style={[stil('bg2',data.app.theme),tw`flex-row items-center mx-4 mb-1 p-4 rounded-md justify-between`]} onPress={() => {
											Alert.alert(
												l[data.app.lang].konumizin,
												l[data.app.lang].konumizin2,
												[
													{
														text: l[data.app.lang].cancel,
														onPress: () => console.log('Cancel Pressed'),
														style: 'cancel',
													},
													{
														text: l[data.app.lang].next,
														onPress: () => {
															getLocation();
														},
													},
												],
												{cancelable: false},
											);
										}} >
											<View style={[tw`flex-row items-center justify-between `]}>
												<MaterialCommunityIcons name="map-marker-radius" size={32} color={stil('text',data.app.theme).color}/>
												<Text style={[tw` font-semibold ml-4`,stil('text',data.app.theme)]}>{l[data.app.lang].devam}</Text>
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
									<Text style={[tw`my-2 text-center`,stil('text',data.app.theme)]}>{l[data.app.lang].temaSec}</Text>
									<View style={[tw`m-4 flex justify-center rounded-md`]}>
										<TouchableOpacity key={0} style={[stil('bg2',data.app.theme),tw`flex-row items-center mx-4 mb-1 p-4 rounded-md justify-between`]} onPress={() => {
											setIsDriverRegister(true);
											setStep(5);
											}} >
											<View style={[tw`flex-row items-center justify-between `]}>
												<MaterialCommunityIcons name="car-key" size={32} color={stil('text',data.app.theme).color}/>
												<Text style={[tw`  ml-4`,stil('text',data.app.theme)]}>{l[data.app.lang].dregister}</Text>
											</View>
										</TouchableOpacity>
										<TouchableOpacity key={1} style={[stil('bg2',data.app.theme),tw`flex-row items-center mx-4 mb-1 p-4 rounded-md justify-between`]} onPress={() => {
											setIsDriverRegister(false);
											setStep(5);
											}} >
											<View style={[tw`flex-row items-center justify-between `]}>
												<MaterialCommunityIcons name="login" size={32} color={stil('text',data.app.theme).color}/>
												<Text style={[tw` ml-4`,stil('text',data.app.theme)]}>{l[data.app.lang].passengerLogin}</Text>
											</View>
										</TouchableOpacity>
									</View>
								</>
							}
							{step == 5 &&
								<>
									<Text style={[tw`my-2 text-center`,stil('text',data.app.theme)]}>{l[data.app.lang].TelefonGir}</Text>
									<Text style={[tw`my-2 mx-4 text-xs text-center`,stil('text',data.app.theme)]}>{l[data.app.lang].loginMesaj}</Text>
								
									<View style={[stil('bg2',data.app.theme),tw`mx-8 my-4 flex justify-center rounded-md`]}>
										<View key={0} style={[tw`flex-row items-center m-4 justify-between`]} onPress={() => getLocation()} >
											<View style={[tw`flex-row items-center justify-between `]}>
												<MaterialCommunityIcons name="cellphone" size={32} color={stil('text',data.app.theme).color}/>
												<MaskInput
													keyboardType='numeric'
													placeholder="+___ - _________"
													placeholderTextColor={stil('text',data.app.theme).color}
													style={[stil('text',data.app.theme),tw`ml-4 w-full`]}
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
							{step == 6 &&
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

							
							
							<View style={[tw`flex-row`]}>
								{step != 1 ?
								<TouchableOpacity style={[tw`flex-row items-center px-4 py-2  ${step == 4 ? 'w-2/2' : 'w-1/2'}`]} onPress={() => {
									if(step == 1){
										setIsDriverRegister(!isDriverRegister);
									}else{
										setStep(step - 1);
									}
									}}>
									<MaterialCommunityIcons name={step == 1 ? "car-key" : "arrow-left-drop-circle-outline"} size={16} style={[tw`${step == 1 ? 'opacity-80' : ''}`]} color={stil('text',data.app.theme).color} />
									<Text style={[stil('text',data.app.theme),tw`my-2 ml-2  ${step == 1 ? 'opacity-80' : ''}`]}>
									{step == 1 ? l[data.app.lang].dregister : l[data.app.lang].back}

									</Text>
								</TouchableOpacity>
								: null }
								{step != 4 ?
								<TouchableOpacity disabled={step == 5 && userPhone.length<12 ? true : (step == 5 && userPhone.length<6 ? true : false) } style={[tw`flex-row ${step == 1 ? 'w-full justify-between' : 'w-1/2 justify-between'} ${step == 4 && userPhone.length<12 ? 'opacity-10' : (step == 5 && userPhone.length<6 ? 'opacity-10' : '')} items-center px-4 py-2 rounded-md`,stil('bg2',data.app.theme)]} onPress={() => {
									if(step == 5){
										
										loginFunction();
										
									}
									else if(step == 6){
										smsFunction();
									}
									else{
										setStep(step + 1);
									}
									}}>
									<Text style={[stil('text',data.app.theme),tw`my-2 mr-2  `]}>
										{step == 5 ? l[data.app.lang].login : (step == 6 ? l[data.app.lang].check : (step == 1 ? l[data.app.lang].next : l[data.app.lang].next))}
									</Text>
									{loading ? 
										<ActivityIndicator size={18} color={stil('text',data.app.theme).color}/>
										:
										<MaterialCommunityIcons name={step == 4 ? 'account-circle-outline' : ( step == 5 ? 'check-circle-outline' : 'arrow-right-drop-circle-outline')} size={24} color={stil('text',data.app.theme).color} />
									}
								</TouchableOpacity>
								: null}
							</View>
						</View>
					</View>
				</SafeAreaView>
	
		</KeyboardAvoidingView>
    )
}
