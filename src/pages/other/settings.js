import React from 'react';
import {useSelector,useDispatch} from 'react-redux';
import {TouchableOpacity,View,Text, ScrollView,Image} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import { stil } from '../../utils';
import l from '../../languages.json';
import { setValue } from '../../async';
import StatusBarComponent from '../../components/global/status';
MaterialCommunityIcons.loadFont();



export default function Settings(){
	const dispatch = useDispatch();
    const data = useSelector(state => state);
	const [myLocation,setMyLocation] = React.useState(false);
	const [userPhone,setUserPhone] = React.useState('');

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

    return (
		<ScrollView style={[stil('bg',data.app.theme),tw`p-4 flex-1`]}>
						<>
							<StatusBarComponent/>
							<Text style={[tw`m-4 text-center`,stil('text',data.app.theme)]}>{l[data.app.lang].dilSec}</Text>
							<View style={[tw` flex justify-center rounded-md`]}>
								{LANGS.map((item,index) => {
									return (
										<TouchableOpacity key={index} style={[stil('bg2',data.app.theme),tw`flex-row items-center mb-1 p-4 rounded-md justify-between`]} onPress={() => setLanguage(item.langCode)} >
											<View style={[tw`flex-row items-center justify-between `]}>
												<Image source={item.langFlag} style={[tw`h-8 w-10 rounded-md mr-4`]}/>
												<Text style={[tw` font-semibold`,stil('text',data.app.theme)]}>{item.langName}</Text>
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
					
						<>
							<Text style={[tw`m-4 text-center`,stil('text',data.app.theme)]}>{l[data.app.lang].temaSec}</Text>
							<View style={[tw` flex justify-center rounded-md`]}>
								<TouchableOpacity key={0} style={[stil('bg2',data.app.theme),tw`flex-row items-center  mb-1 p-4 rounded-md justify-between`]} onPress={() => setTheme('light')} >
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
								<TouchableOpacity key={1} style={[stil('bg2',data.app.theme),tw`flex-row items-center  mb-1 p-4 rounded-md justify-between`]} onPress={() => setTheme('dark')} >
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
					
		</ScrollView>
    )
}
