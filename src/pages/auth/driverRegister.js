import React,{useEffect} from 'react';
import { useDispatch,useSelector } from 'react-redux';
import { setValue,getValue } from '../../async';
import { stil } from '../../utils';
import tw from 'twrnc';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import {launchImageLibrary} from 'react-native-image-picker';

import MaskInput from 'react-native-mask-input';
import axios from 'axios';
import l from '../../languages.json';
import {Alert, BackHandler, Linking, Modal, TextInput} from 'react-native';

MaterialCommunityIcons.loadFont();



import {SafeAreaView, Text, TouchableOpacity, View,Image,KeyboardAvoidingView,ActivityIndicator} from 'react-native';
import StatusBarComponent from '../../components/global/status';

export default function DriverRegister({isDriver,setIsDriver}){
    const dispatch = useDispatch();
    const data = useSelector(state => state);
    const [step,setStep] = React.useState(1);

    handleBackButtonClick = () => {

		let back = 1;
		if(step > 1){
			back = parseInt(step) - 1;
			setStep(back);
			return true;
		}
        else{
            setIsDriver(false);
            return true;
        }


	}

	useEffect(() => {
		BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
		return () => {
			BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
		};
	}, [step]);


    const pt = {
		sav: [
			tw`flex-1 px-4 justify-end`,
			stil('bg',data.app.theme)
		],
		v: [
			tw` flex items-center justify-center `
		],
		footerView:[
			tw`flex-row px-4 pb-4 items-center justify-end`,
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

    const getPhotoWithPhone = (who) => {
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

                if(who == 'driver'){
                    setUploadDriverImage('data:image/jpeg;base64,'+source);
                    setDriverImage({uri: 'data:image/jpeg;base64,' + response.assets[0].base64});
                }

                if(who == 'car'){
                    setUploadDriverCarImage('data:image/jpeg;base64,'+source);
                    setDriverCarImage({uri: 'data:image/jpeg;base64,' + response.assets[0].base64});
                }

                if(who == 'car2'){
                    setUploadDriverCarImage2('data:image/jpeg;base64,'+source);
                    setDriverCarImage2({uri: 'data:image/jpeg;base64,' + response.assets[0].base64});
                }

                if(who == 'car3'){
                    setUploadDriverCarImage3('data:image/jpeg;base64,'+source);
                    setDriverCarImage3({uri: 'data:image/jpeg;base64,' + response.assets[0].base64});
                }

                if(who == 'car4'){
                    setUploadDriverCarImage4('data:image/jpeg;base64,'+source);
                    setDriverCarImage4({uri: 'data:image/jpeg;base64,' + response.assets[0].base64});
                }

                if(who == 'carB'){
                    setUploadCarCertificateImage('data:image/jpeg;base64,'+source);
                    setCarCertificateImage({uri: 'data:image/jpeg;base64,' + response.assets[0].base64});
                }

                if(who == 'license'){
                    setUploadDriverLicenseImage('data:image/jpeg;base64,'+source);
                    setDriverLicenseImage({uri: 'data:image/jpeg;base64,' + response.assets[0].base64});
                }

                if(who == 'ruhsat'){
                    setUploadDriverRuhsatImage('data:image/jpeg;base64,'+source);
                    setDriverRuhsatImage({uri: 'data:image/jpeg;base64,' + response.assets[0].base64});
                }
                // setUploadedImage('data:image/jpeg;base64,'+source);
                // setUserImage({uri: 'data:image/jpeg;base64,' + response.assets[0].base64});
            }
        });   
    }

    const [driverImage,setDriverImage] = React.useState(require('../../assets/img/orneksurucu.jpeg'));
    const [uploadDriverImage,setUploadDriverImage] = React.useState('');

    const [driverLicenseImage,setDriverLicenseImage] = React.useState(require('../../assets/img/ornekehliyet.jpeg'));
    const [uploadDriverLicenseImage,setUploadDriverLicenseImage] = React.useState('');

    const [driverRuhsatImage,setDriverRuhsatImage] = React.useState(require('../../assets/img/ornekruhsat.jpeg'));
    const [uploadDriverRuhsatImage,setUploadDriverRuhsatImage] = React.useState('');

    const [driverCarImage,setDriverCarImage] = React.useState(require('../../assets/img/ornekarac1.jpeg'));
    const [uploadDriverCarImage,setUploadDriverCarImage] = React.useState('');

    const [driverCarImage2,setDriverCarImage2] = React.useState(require('../../assets/img/ornekarac2.jpeg'));
    const [uploadDriverCarImage2,setUploadDriverCarImage2] = React.useState('');

    const [driverCarImage3,setDriverCarImage3] = React.useState({uri:''});
    const [uploadDriverCarImage3,setUploadDriverCarImage3] = React.useState('');

    const [driverCarImage4,setDriverCarImage4] = React.useState({uri:''});
    const [uploadDriverCarImage4,setUploadDriverCarImage4] = React.useState('');

    const [carCertificateImage,setCarCertificateImage] = React.useState({uri:''});
    const [uploadCarCertificateImage,setUploadCarCertificateImage] = React.useState('');

    const [firstName,setFirstName] = React.useState('');
    const [lastName,setLastName] = React.useState('');
    const [phone,setPhone] = React.useState('');
    const [plaka,setPlaka] = React.useState('');
    const [gender,setGender] = React.useState('male');

    const [items, setItems] = React.useState([
        {label: l[data.app.lang].male, value: 'male'},
        {label: l[data.app.lang].female, value: 'female'}
      ]);

      const [open, setOpen] = React.useState(false);
      const [value, setValue] = React.useState(null);

    const saveDriver = () => {

        const config = {
            headers: { Authorization: `Bearer ${data.auth.userToken}` }
        };
        axios.defaults.headers.common["Accept"] = "application/json";
        axios.defaults.headers.common["Content-Type"] = "application/json";
        axios.defaults.headers.common["Authorization"] = "Bearer "+data.auth.userToken;

        axios.post('https://trendtaxi.uz/api/driverApply',{
            name:firstName,
            surname:lastName,
            phone:phone,
            gender:gender,
            plaka:plaka,
            surucu_image:uploadDriverImage,
            ruhsat_image:uploadDriverRuhsatImage,
            ehliyet_image:uploadDriverLicenseImage,
            arac_image:uploadDriverCarImage,
            arac_image2:uploadDriverCarImage2,
            arac_image3:uploadDriverCarImage3,
            arac_image4:uploadDriverCarImage4,
            carCertificate:uploadCarCertificateImage,
        })
        .then(response => {
            if(!response.data.data.hata){
                setModalOpen(true);
                // Alert.alert(
                //     l[data.app.lang].balindi,
                //     l[data.app.lang].sonucSms,
                //     [
                        
                //         {
                //             text: l[data.app.lang].check,
                //             onPress: () => {
                //                 setIsDriver(false);
                //             },
                //         },
                //     ],
                //     {cancelable: false},
                // );
            }
            else{
                Alert.alert(
                    l[data.app.lang].hata,
                    l[data.app.lang].tumbilgi,
                    [
                        
                        {
                            text: l[data.app.lang].check,
                            onPress: () => {
                                
                            },
                        },
                    ],
                    {cancelable: false},
                );
            }
            

        })
        .catch(error => {
            console.log(error);
        });
            
    };
    const [modalOpen,setModalOpen] = React.useState(false);
    return (
        <>
            <SafeAreaView style={pt.sav}>
                <View style={pt.v}>
                    
                    <Image style={pt.bgImage} resizeMode="contain" source={data.app.theme == 'dark' ? require('../../assets/img/uzbekistanBGA.png') : require('../../assets/img/uzbekistanBGR.png')} />
                    <Image style={pt.logo} source={require('../../assets/img/1024.png')} />
                    <Text style={pt.logoText}>Trend Taxi</Text>
                </View>
                <View style={[tw`flex justify-end`]}>
                <TouchableOpacity style={[tw`flex-row items-center px-4 py-2`]} onPress={() => {
                                setIsDriver(false);
                                }}>
                                <MaterialCommunityIcons name="chevron-left" size={24} color={stil('text',data.app.theme).color} />
                                <Text style={[stil('text',data.app.theme),tw`my-2 text-xs`]}>
                                    {l[data.app.lang].login}

                                </Text>
                            </TouchableOpacity>
                    <View style={[tw`flex-row justify-center items-center `]}>
                        <MaterialCommunityIcons name={step == 1 ? 'account' : 'circle-small'} size={40} color={stil('text',data.app.theme).color}/>
                        <MaterialCommunityIcons name={step == 2 ? 'file-document' : 'circle-small'} size={40} color={stil('text',data.app.theme).color}/>
                        <MaterialCommunityIcons name={step == 3 ? 'car' : 'circle-small'} size={40} color={stil('text',data.app.theme).color}/>
                    </View>
                    <View>
                        {step == 1 &&
                            <>

                                <View style={[tw`m-4 rounded-md`]}>
                                    <TextInput style={[stil('text',data.app.theme),tw`p-2 pl-4 rounded-md my-2 text-base`,stil('bg2',data.app.theme)]} placeholderTextColor={stil('text',data.app.theme).color} value={firstName} placeholder={l[data.app.lang].first_name} onChangeText={(text) => setFirstName(text)}/>
                                    <TextInput style={[stil('text',data.app.theme),tw`p-2 pl-4 rounded-md my-2 text-base`,stil('bg2',data.app.theme)]} placeholderTextColor={stil('text',data.app.theme).color} value={lastName} placeholder={l[data.app.lang].last_name} onChangeText={(text) => setLastName(text)}/>
                                    <MaskInput
                                        keyboardType='numeric'
                                        placeholder={l[data.app.lang].phone}
                                        placeholderTextColor={stil('text',data.app.theme).color}
                                        style={[stil('text',data.app.theme),tw`p-2 pl-4 rounded-md my-2 text-base`,stil('bg2',data.app.theme)]}
                                        value={phone ? phone : ''}
                                        onChangeText={(masked, unmasked) => {
                                            setPhone(unmasked); 
                                        }}
                                        mask={[ '+',/\d/,/\d/, /\d/,' - ', /\d/,/\d/, ' ', /\d/, /\d/, /\d/,' ', /\d/, /\d/, ' ', /\d/, /\d/]}
                                    />
                                    <TextInput style={[stil('text',data.app.theme),tw`p-2 pl-4 rounded-md my-2 text-base`,stil('bg2',data.app.theme)]} placeholderTextColor={stil('text',data.app.theme).color} value={plaka} placeholder={l[data.app.lang].plaka} onChangeText={(text) => setPlaka(text)}/>

                                    
                                    <DropDownPicker
                                        // textStyle={[stil('text',data.app.theme)]}
                                        style={[tw`p-2 pl-4 rounded-md my-2 text-base`,stil('bg2',data.app.theme)]}
                                        labelStyle={[stil('text',data.app.theme)]}
                                        open={open}
                                        value={gender}
                                        items={items}
                                        setOpen={setOpen}
                                        setValue={setGender}
                                        setItems={setItems}
                                    />

                                </View>
                            </>
                        }
                        {step == 2 &&
                            <>

                                <View style={[tw`m-4 rounded-md`]}>
                                    <View style={[tw`rounded-md p-2 flex-row items-center justify-start`,stil('bg2',data.app.theme)]}>
                                        <View style={[tw`h-12 w-12`]}>
                                            {driverImage ? <Image style={[tw`rounded-md`,{height:'100%',width:'100%'}]} source={driverImage}/> : null}
                                        </View>
                                        <View style={[tw`ml-4`]}>
                                            <TouchableOpacity
                                            onPress={() => getPhotoWithPhone('driver') }
                                            >
                                            <Text style={[tw` w-3/4`,stil('text',data.app.theme)]}>{l[data.app.lang].diu}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View style={[tw`rounded-md p-2 mt-2 flex-row items-center justify-start`,stil('bg2',data.app.theme)]}>
                                        <View style={[tw`h-12 w-12`]}>
                                            {driverLicenseImage ? <Image style={[tw`rounded-md`,{height:'100%',width:'100%'}]} source={driverLicenseImage}/> : null}
                                        </View>
                                        <View style={[tw`ml-4`]}>
                                            <TouchableOpacity
                                            onPress={() => getPhotoWithPhone('license') }
                                            >
                                            <Text style={[tw` w-3/4`,stil('text',data.app.theme)]}>{l[data.app.lang].dliu}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View style={[tw`rounded-md p-2 mt-2 flex-row items-center justify-start`,stil('bg2',data.app.theme)]}>
                                        <View style={[tw`h-12 w-12`]}>
                                            {driverRuhsatImage ? <Image style={[tw`rounded-md`,{height:'100%',width:'100%'}]} source={driverRuhsatImage}/> : null}
                                        </View>
                                        <View style={[tw`ml-4`]}>
                                            <TouchableOpacity
                                            onPress={() => getPhotoWithPhone('ruhsat') }
                                            >
                                            <Text style={[tw` w-3/4`,stil('text',data.app.theme)]}>{l[data.app.lang].driu}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    
                                    <View style={[tw`rounded-md p-2 mt-2 flex-row items-center justify-start`,stil('bg2',data.app.theme)]}>
                                        <View style={[tw`h-12 w-12`]}>
                                            {carCertificateImage ? <Image style={[tw`rounded-md`,{height:'100%',width:'100%'}]} source={carCertificateImage}/> : null}
                                        </View>
                                        <View style={[tw`ml-4`]}>
                                            <TouchableOpacity
                                            onPress={() => getPhotoWithPhone('carB') }
                                            >
                                            <Text style={[tw` w-3/4`,stil('text',data.app.theme)]}>{l[data.app.lang].cuciu}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                </View>
                            </>
                        }
                        {step == 3 &&
                            <>

                                <View style={[tw`m-4 flex-row items-center justify-between rounded-md`]}>
                                    
                                    <View style={[tw`rounded-md p-2 mt-2 flex items-center justify-center`,stil('bg2',data.app.theme)]}>
                                        <View style={[tw`h-20 w-32`]}>
                                            {driverCarImage ? <Image style={[tw`rounded-md`,{height:'100%',width:'100%'}]} source={driverCarImage}/> : null}
                                        </View>
                                        <View style={[tw`w-24 mt-2`]}>
                                            <TouchableOpacity
                                            onPress={() => getPhotoWithPhone('car') }
                                            >
                                            <Text style={[tw`text-center`,stil('text',data.app.theme)]}>{l[data.app.lang].dciu}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View style={[tw`rounded-md p-2 mt-2 flex items-center justify-center`,stil('bg2',data.app.theme)]}>
                                        <View style={[tw`h-20 w-32`]}>
                                            {driverCarImage ? <Image style={[tw`rounded-md`,{height:'100%',width:'100%'}]} source={driverCarImage2}/> : null}
                                        </View>
                                        <View style={[tw`w-24 mt-2`]}>
                                            <TouchableOpacity
                                            onPress={() => getPhotoWithPhone('car2') }
                                            >
                                            <Text style={[tw`text-center`,stil('text',data.app.theme)]}>{l[data.app.lang].dciu}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    
                                    

                                </View>
                            </>
                        }
                        
                    </View>
                    <View style={pt.footerView}>	

                            

                        <View style={[tw`flex-row justify-end `]}>
                            
                            {step != 1 ? 
                            <TouchableOpacity style={[tw`flex-row items-center px-4 py-2`]} onPress={() => {
                                setStep(step -1)
                                }}>
                                <MaterialCommunityIcons name="arrow-left-drop-circle-outline" size={24} color={stil('text',data.app.theme).color} />
                                <Text style={[stil('text',data.app.theme),tw`my-2 ml-2 text-xs`]}>
                                    {l[data.app.lang].back}

                                </Text>
                            </TouchableOpacity>
                            :null}
                            {step != 3 ?
                            <TouchableOpacity  style={[tw`flex-row ${step == 4 && userPhone.length<12 ? 'opacity-10' : (step == 5 && userPhone.length<6 ? 'opacity-10' : '')} items-center px-4 py-2 rounded-md`,stil('bg2',data.app.theme)]} onPress={() => {
                                    setStep(step + 1);
                                }}>
                                    
                                <Text style={[stil('text',data.app.theme),tw`my-2 mr-2 text-xs`]}>
                                    {step == 4 ? l[data.app.lang].login : (step == 5 ? l[data.app.lang].check : l[data.app.lang].next)}
                                </Text>
                                <MaterialCommunityIcons name="arrow-right-drop-circle-outline" size={24} color={stil('text',data.app.theme).color} />
                            </TouchableOpacity>
                            :null}
                            {step == 3 ?
                            <TouchableOpacity  style={[tw`flex-row ${step == 4 && userPhone.length<12 ? 'opacity-10' : (step == 5 && userPhone.length<6 ? 'opacity-10' : '')} items-center px-4 py-2 rounded-md`,stil('bg2',data.app.theme)]} onPress={() => {
                                    saveDriver();
                                }}>
                                    
                                <Text style={[stil('text',data.app.theme),tw`my-2 mr-2 `]}>
                                    {step == 4 ? l[data.app.lang].login : (step == 5 ? l[data.app.lang].check : l[data.app.lang].save)}
                                </Text>
                                <MaterialCommunityIcons name="check" size={24} color={stil('text',data.app.theme).color} />
                            </TouchableOpacity>
                            :null}
                        </View>
                    </View>
                </View>
            </SafeAreaView>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalOpen}
                onRequestClose={() => {
                    setModalOpen(!findVehicle);
                }}
            >
                <View style={[tw`h-full flex items-center justify-center`, {backgroundColor: 'rgba(0,0,0,0.5)'}]}>
                    <View
                        style={[tw` w-[95%] flex items-center justify-center rounded-md p-2`, stil('bg', data.app.theme)]}>
                        <View style={[tw`mb-4  w-full`]}>
                            <Text style={[tw`font-semibold text-center text-base my-2`, stil('text', data.app.theme)]}>{l[data.app.lang].balindi}</Text>
                            <Text style={[tw` text-center mb-2`, stil('text', data.app.theme)]}>{l[data.app.lang].sonucSms}</Text>
                            <View style={[tw`flex items-center justify-center`]}>
                                <MaterialCommunityIcons name="check-decagram" size={40} color="green"/>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={[tw`flex-row items-center justify-center p-4 rounded-md w-full`, {backgroundColor: data.app.theme == 'dark' ? '#255382' : '#f1f1f1'}]}
                            onPress={() => {
                                setIsDriver(false);
                            }}
                        >
                            <MaterialCommunityIcons name="check" size={20} color={stil('text', data.app.theme).color}/>
                            <Text style={[tw`font-semibold ml-2`, stil('text', data.app.theme)]}>{l[data.app.lang].check}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
}