import React,{useEffect} from 'react';
import {useSelector} from 'react-redux';
import tw from 'twrnc';
import { View,Text,ScrollView,TouchableOpacity,Image,Modal,TextInput,FlatList,ActivityIndicator,Dimensions,Alert } from 'react-native';
import { stil } from '../../utils';
import Geolocation from '@react-native-community/geolocation';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import Harita from './map';

MaterialCommunityIcons.loadFont();

function HomePage() {
    const data = useSelector(state => state);
    const [DATA,setDATA] = React.useState([]);
    map = React.createRef();
    const [locations,setLocations] = React.useState([]);
    const [cars,setCars] = React.useState([]);
    const [polyline,setPolyline] = React.useState([]);
    const [result,setResult] = React.useState([]);
    const [locationModal,setLocationModal] = React.useState(false);
    const [searchText,setSearchText] = React.useState('');
    const [haritadanSec,setHaritadanSec] = React.useState(false);
    const [haritadanSecilen,setHaritadanSecilen] = React.useState([]);
    const [findVehicle,setFindVehicle] = React.useState(false);
    const [bottomHeight,setBottomHeight] = React.useState(0);
    const [topHeight,setTopHeight] = React.useState(0);

    const [routeTime,setRouteTime] = React.useState(0);
    const [routeDistance,setRouteDistance] = React.useState(0);
    const [routePrice,setRoutePrice] = React.useState([]);
    const [resultType,setResultType] = React.useState(false);


    useEffect(() => {
        Geolocation.getCurrentPosition((position) => {if(position){
          setHaritadanSecilen({lat:position.coords.latitude,lon:position.coords.longitude});  
		  mapConfiguration();
        }},(error) => {console.log(error.code, error.message);},{ enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 });
    },[]);

    useEffect(() => {
        mapConfiguration();
    },[locations]);

    useEffect(() => {
        getCars();
    },[]);

    const mapConfiguration = () => {

    }

    const getCars = () => {
        axios.defaults.headers.common["Accept"] = "application/json";
        axios.defaults.headers.common["Content-Type"] = "application/json";
        axios.get('https://trendtaxi.uz/api/getCarTypes')
        .then(response => {
            if(!response.data.data.hata) {
                setDATA(response.data.data);
            }
            else{
            }
        })
        .catch(error => {
            console.log('getCars',error);
        });
    };

    useEffect(() => {
        const getData = setTimeout(() => {
            if(searchText.length>2){
                setResultType(false);
                arama(searchText);
            }
            else{
                clearTimeout(getData);
            }
        }, 500); 

        return () => {
            clearTimeout(getData);
        } 

    },[searchText]);

    const arama = (text) => {
        axios.defaults.headers.common["Accept"] = "application/json";
        axios.defaults.headers.common["Content-Type"] = "application/json";
        let lang = '';
        if(data.app.lang == 'tr') { lang = 'uz_UZ';}
        if(data.app.lang == 'gb') { lang = 'uz_UZ';}
        if(data.app.lang == 'ru') { lang = 'uz_UZ';}
        if(data.app.lang == 'uz') { lang = 'uz_UZ';}
        axios.get('https://catalog.api.2gis.com/3.0/items?q='+text+'&key=runnmp5276&locale='+lang+'&fields=items.full_name,items.point,items.locale,items.full_address_name')
        // axios.get('https://search-maps.yandex.ru/v1/?text='+text+'&lang='+lang+'&apikey=ae55dcf2-7140-4585-a883-e16d89cc31d2')
        .then(response => {
          console.log(response.data);
            if(response.data.result) {
                setResult(response.data.result.items);
                setResultType(true);
            }
        })
        .catch(error => {
            setResult([]);
            setResultType(true);
            console.log('search',error);
        });
    }

    const getCurrentLocation = () => {
        Geolocation.getCurrentPosition(
			(position) => {
                if(position.coords.latitude != 0 && position.coords.longitude != 0){
                    setCurrentPosition(position);
                }
			},
			(error) => {
				console.log(error.code, error.message);
			},
			{ enableHighAccuracy: false, timeout: 30000, maximumAge: 1000 }
		);
    }

    setCurrentPosition = async (position) => {
        axios.defaults.headers.common["Accept"] = "application/json";
        axios.defaults.headers.common["Content-Type"] = "application/json";
        let lang = '';
        if(data.app.lang == 'tr') { lang = 'uz_UZ';}
        if(data.app.lang == 'gb') { lang = 'uz_UZ';}
        if(data.app.lang == 'ru') { lang = 'uz_UZ';}
        if(data.app.lang == 'uz') { lang = 'uz_UZ';}
        // console.log('https://catalog.api.2gis.com/3.0/items?q='+position.coords.latitude+','+position.coords.longitude+'&key=runnmp5276&locale='+lang+'&fields=items.full_name,items.point,items.locale,items.full_address_name')
        axios.get('https://catalog.api.2gis.com/3.0/items?q='+position.coords.latitude+','+position.coords.longitude+'&key=runnmp5276&locale='+lang+'&fields=items.full_name,items.point,items.locale,items.full_address_name')
        .then(response => {
            setLocations([...locations,{
              title:response.data.result.items[0].name,
              lat:response.data.result.items[0].point.lat,
              lon:response.data.result.items[0].point.lon,
              description:(response.data.result.items[0].full_address_name && response.data.result.items[0].full_address_name) + (response.data.result.items[0].purpose_name && '- '+response.data.result.items[0].purpose_name)
            }]);
        })
        .catch(error => {
            console.log('setCurrentPosition',error);
        });
    }
    
    useEffect(() => {
        if(haritadanSec){
            const getData = setTimeout(() => {
                axios.defaults.headers.common["Accept"] = "application/json";
                axios.defaults.headers.common["Content-Type"] = "application/json";
                let lang = '';
                if(data.app.lang == 'tr') { lang = 'uz_UZ';}
                if(data.app.lang == 'gb') { lang = 'uz_UZ';}
                if(data.app.lang == 'ru') { lang = 'uz_UZ';}
                if(data.app.lang == 'uz') { lang = 'uz_UZ';}
                axios.get('https://catalog.api.2gis.com/3.0/items?q='+haritadanSecilen.lat+','+haritadanSecilen.lon+'&key=runnmp5276&locale='+lang+'&fields=items.full_name,items.point,items.locale,items.full_address_name')
                .then(response => {
                    if(response.data.result.items[0]) {
                        setHaritadanSecilen({...haritadanSecilen,
                            title:response.data.result.items[0].name,
                            description:response.data.result.items[0].full_address_name + (response.data.result.items[0].purpose_name && '- '+response.data.result.items[0].purpose_name)
                        });
                    }
                })
                .catch(error => {
                    setResult([]);
                    console.log('haritasecimyap',error);
                });
            }, 2000); 
            return () => {
                clearTimeout(getData);
            } 
        }
    },[haritadanSecilen]);

    const createTrip = () => {
        axios.defaults.headers.common["Accept"] = "application/json";
        axios.defaults.headers.common["Content-Type"] = "application/json";
        // console.log('CREATE LİNK','https://trendtaxi.uz/event?prc=trip_create&km_price='+data.trip.carType.km.price+'&paid_price='+data.trip.carType.paid.price+'&start_price='+data.trip.carType.start.price+'&car_id='+data.trip.carType.name+'&start='+data.trip.startLocation.latitude+','+data.trip.startLocation.longitude+'&end='+data.trip.endLocation.latitude+','+data.trip.endLocation.longitude+'&car='+data.trip.carType.id+'&duration='+data.trip.tripDetail.duration+'&distance='+data.trip.tripDetail.distance+'&price='+data.trip.tripDetail.price+'&user='+data.auth.userId),
        axios.get('https://trendtaxi.uz/event?prc=trip_create&km_price='+data.trip.carType.km.price+'&paid_price='+data.trip.carType.paid.price+'&start_price='+data.trip.carType.start.price+'&car_id='+data.trip.carType.name+'&start='+data.trip.startLocation.latitude+','+data.trip.startLocation.longitude+'&end='+data.trip.endLocation.latitude+','+data.trip.endLocation.longitude+'&car='+data.trip.carType.id+'&duration='+data.trip.tripDetail.duration+'&distance='+data.trip.tripDetail.distance+'&price='+data.trip.tripDetail.price+'&user='+data.auth.userId)
        .then(response => {
            
        })
        .catch(error => {});
    }

    const deleteTrip = () => {
        axios.defaults.headers.common["Accept"] = "application/json";
        axios.defaults.headers.common["Content-Type"] = "application/json";
        axios.get('https://trendtaxi.uz/event?prc=delete_trip&car_id='+data.trip.carType.name+'&start='+data.trip.startLocation.latitude+','+data.trip.startLocation.longitude+'&end='+data.trip.endLocation.latitude+','+data.trip.endLocation.longitude+'&car='+data.trip.carType.id+'&duration='+data.trip.tripDetail.duration+'&distance='+data.trip.tripDetail.distance+'&price='+data.trip.tripDetail.price+'&user='+data.auth.userId+'&trip_id='+data.trip.tripId)
        .then(response => {
            
        })
        .catch(error => {});
    }


    return (
        <>
            <View style={[tw` w-full`,{height:topHeight}]}>
                <Harita
                style={[tw`bg-red-400 h-32 w-full`]} 
                >
                    
                </Harita>      
                {haritadanSec ? 
                    <View style={[tw`flex-row items-center justify-between rounded-t-md`,stil('bg',data.app.theme),{position:'absolute',bottom:0,left:0,right:0}]}>
                        <TouchableOpacity
                        style={[tw`flex-row items-center justify-center  w-1/2 py-3 rounded-tl-md`,stil('bg2',data.app.theme)]}
                        onPress={() => {
                            setLocationModal(true);
                            setHaritadanSec(false);
                        }}
                        >
                            <MaterialCommunityIcons name="cancel" size={20} color={stil('text',data.app.theme).color} />
                            <Text style={[tw`font-medium ml-2`,stil('text',data.app.theme)]}>İptal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                        onPress={() => {
                            setHaritadanSec(false);
                            setLocationModal(true);
                            setLocations([...locations,haritadanSecilen]);
                        }}
                        style={[tw`flex-row items-center justify-center  w-1/2 py-3 rounded-tr-md`,stil('bg2',data.app.theme)]}
                        >
                            <Text style={[tw`font-semibold mr-2`,stil('text',data.app.theme)]}>Konumu Onayla</Text>
                            <MaterialCommunityIcons name="check" size={20} color={stil('text',data.app.theme).color} />
                        </TouchableOpacity>
                    </View>
                :
                    <View style={[tw`flex-row items-center justify-between rounded-t-md`,stil('bg',data.app.theme),{position:'absolute',bottom:0,left:0,right:0}]}>
                        <TouchableOpacity
                        style={[tw`flex-row items-center justify-center w-1/2 py-3 rounded-tl-md`,stil('bg2',data.app.theme)]}
                        onPress={() => {
                            setLocationModal(true);
                        }}
                        >
                            <MaterialCommunityIcons name="cog" size={20} color={stil('text',data.app.theme).color} />
                            <Text style={[tw`font-medium ml-2`,stil('text',data.app.theme)]}>Düzenle</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                        onPress={() => {
                            if(locations.length>1 && cars.length>0){
                                setFindVehicle(true);
                            }
                            else{
                                alert('Lütfen en az 2 konum ve 1 araba seçiniz.');
                            }
                            
                        }}
                        style={[tw`flex-row items-center justify-center w-1/2 py-3 rounded-tr-md`,stil('bg2',data.app.theme)]}
                        >
                            <Text style={[tw`font-medium mr-2`,stil('text',data.app.theme)]}>Araç Bul</Text>
                            <MaterialCommunityIcons name="car-connected" size={20} color={stil('text',data.app.theme).color} />
                        </TouchableOpacity>
                    </View>
                } 
            </View>
            <View 
            onLayout={(event) => {
                var {x, y, width, height} = event.nativeEvent.layout;
                const ScreenHeight = Dimensions.get('window').height;
                setTopHeight(ScreenHeight - (height));
                setBottomHeight((height));
            }}
            style={[tw` w-full flex items-center pt-1 px-3 pb-1`,stil('bg',data.app.theme)]}>
                    <View style={[tw`  w-full   rounded-md `,{maxHeight:150},stil('text',data.app.theme)]}>
                        <Text style={[tw`text-start font-semibold my-1`,stil('text',data.app.theme)]}>Rota ({locations.length})</Text>
                        <FlatList
                            data={locations}
                            style={[tw`px-2 `]}
                            ListEmptyComponent={() => (
                                <View style={[tw``]}>
                                    <Text style={[tw`text-start text-xs`,stil('text',data.app.theme)]}>Henüz seçilmiş bir güzergah bulunamadı</Text>
                                </View>
                            )}
                            renderItem={({item,index}) => {
                                return (
                                    <View key={index} style={[tw`flex-row w-[100%] rounded-md items-center p-1 mt-1`,stil('bg2',data.app.theme)]}>
                                        <View style={[tw`items-center`]}>
                                            <MaterialCommunityIcons style={[tw`w-6 text-center`]} name={index == 0 ? 'home' : (index == (locations.length -1) ? 'flag' : 'map-marker')} size={24} color={stil('text',data.app.theme).color} />
                                        </View>
                                        <View style={[tw`ml-2`]}>
                                            <Text style={[tw`text-xs font-semibold`,stil('text',data.app.theme)]}>
                                                {item.title}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            }}
                            keyExtractor={(item,index) => index.toString()}
                        />
                    </View>
                    <View style={[tw`w-full  mt-2  rounded-md  mb-8`,{maxHeight:150},stil('text',data.app.theme)]}>
                        <Text style={[tw`text-start font-semibold my-1`,stil('text',data.app.theme)]}>Araçlar ({cars.length})</Text>
                        <FlatList 
                            data={cars}
                            // horizontal
                            style={[tw`px-2`]}
                            ListEmptyComponent={() => (
                                <View style={[tw``]}>
                                    <Text style={[tw`text-start text-xs`,stil('text',data.app.theme)]}>Henüz seçilmiş bir araç bulunamadı</Text>
                                </View>
                            )}
                            renderItem={({item,index}) => {
                                return (
                                    <View key={index} style={[tw`flex-row  items-center justify-between mt-1 border rounded-md`,stil('bg2',data.app.theme)]}>
                                        <View style={tw`items-center w-1/3 justify-between px-1 flex`}>
                                            <Text style={[tw`font-medium`,stil('text',data.app.theme)]}>
                                                {item.title}
                                            </Text>
                                            <Image source={{uri:item.image}} style={[tw`h-10 w-15`,{
                                                transform: [{
                                                    rotateY: '180deg',
                                                }]
                                            }]} resizeMode="contain"/>
                                        </View>
                                        <View style={[tw`flex-row w-2/3 justify-between px-1 items-center`]}>
                                            <View style={[tw`flex items-center justify-center `,stil('text',data.app.theme)]}>
                                                <MaterialCommunityIcons name="map-marker-path"  size={20} color={stil('text',data.app.theme).color} />
                                                <Text style={[tw`text-xs mt-1`,stil('text',data.app.theme)]}>{routeDistance} km</Text>
                                            </View>
                                            <View style={[tw`flex items-center justify-center`,stil('text',data.app.theme)]}>
                                                <MaterialCommunityIcons name="clock-start"  size={20} color={stil('text',data.app.theme).color} />
                                                <Text style={[tw`text-xs mt-1`,stil('text',data.app.theme)]}>{routeTime}</Text>
                                            </View>
                                            <View style={[tw`flex items-center justify-center`,stil('text',data.app.theme)]}>
                                                <MaterialCommunityIcons name="credit-card"  size={20} color={stil('text',data.app.theme).color} />
                                                <Text style={[tw`text-xs mt-1`,stil('text',data.app.theme)]}>{item.totalPrice} sum</Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            }}
                            keyExtractor={(item,index) => index.toString()}
                        />
                    </View>
            </View>



            {/* Find Vehicle Modals */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={findVehicle}
                onRequestClose={() => {
                    setFindVehicle(!findVehicle);
                }}
            >
                <View style={[tw`h-full flex items-center justify-center`,{backgroundColor:'rgba(0,0,0,0.5)'}]}>
                    <View style={[tw` w-[95%] flex items-center justify-end rounded-md p-2`,stil('bg',data.app.theme)]}>
                    <View style={[tw`mb-12  w-full`]}>
                        <Text style={[tw`font-semibold text-center text-base my-2`,stil('text',data.app.theme)]}>Uygun Araçlar Aranıyor</Text>
                        <View style={[tw`flex `]}>
                            {cars.map((car,index) => {
                                return (
                                    <View key={index} style={[tw`flex-row items-center px-2`]}>
                                        <Image source={{uri:car.image}} style={[tw`h-16 w-20 mr-4`,{transform: [{rotateY: '180deg',}]}]} resizeMode="contain"/>
                                        <Text style={[stil('text',data.app.theme),tw`font-semibold mr-4`]}>{car.title}</Text>
                                        {car.driver ? <Text>{car.driver.name}</Text> : <ActivityIndicator animating={car.driver ? false : true} size="small" color={stil('text',data.app.theme).color} />}
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[tw`flex-row items-center justify-center p-4 rounded-md w-full`,{backgroundColor:data.app.theme == 'dark' ? '#255382' : '#f1f1f1'}]}
                        onPress={() => {
                            Alert.alert(
                                'İşlem iptal edilecek.',
                                'Bundan emin misiniz?',
                                [
                                    {
                                        text: 'Geri',
                                        onPress: () => console.log('Cancel Pressed'),
                                        style: 'cancel',
                                    },
                                    {
                                        text: 'Evet iptal et', 
                                        onPress: () => {
                                            setFindVehicle(false);
                                        }
                                    },
                                ],
                                {cancelable: false},
                            );
                        }}
                        >
                            <MaterialCommunityIcons name="cancel" size={16} color={stil('text',data.app.theme).color} />
                            <Text style={[tw`font-semibold ml-2`,stil('text',data.app.theme)]}>İptal</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>




            {/* Configuration Modals */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={locationModal}
                onRequestClose={() => {
                    setLocationModal(!locationModal);
                }}
            >
                <ScrollView 
                    style={[tw`flex p-6 pt-12 h-1/1`,
                    {backgroundColor:data.app.theme == 'dark' ? 'rgba(15, 54, 94,1)' : '#eeeeee'}
                ]}>
                    <View style={tw` mt-4`}>
                        <Text style={[tw` font-semibold text-xl ml-2 mt-1`,stil('text',data.app.theme)]}>
                            Güzergah Belirle
                        </Text>
                    </View>
                    <View style={tw`flex-row items-center mt-2 justify-between`}>
                        <View style={[tw`w-6/6`]}>
                            <TextInput 
                            placeholderTextColor={stil('text',data.app.theme).color}
                            placeholder="Search for place"
                            style={[tw`h-10 rounded p-2 text-xs bg-white w-full`,stil('text',data.app.theme),stil('bg2',data.app.theme)]}
                            onChangeText={(text) => {
                                setSearchText(text);
                                if(text == ''){
                                    setResult([]);
                                }
                            }}
                            value={searchText}
                            />
                        </View>
                        <TouchableOpacity
                        style={{position:'absolute',right:0,top:0,bottom:0,padding:8}}
                        onPress={() => {
                            
                            setHaritadanSec(true);
                            setLocationModal(false);
                           
                        }}
                        >
                            <MaterialCommunityIcons name="map-search" size={24} color={stil('text',data.app.theme).color}></MaterialCommunityIcons>
                        </TouchableOpacity>
                    </View>
                    <View style={tw`flex-row items-center mt-2 justify-between`}>

                        <TouchableOpacity style={tw`flex-row items-center  justify-end`}
                        onPress={() => {
                            if(locations.length>0){
                                setLocations([...locations,{
                                    lat:locations[0].lat,
                                    lon:locations[0].lon,
                                    title:'Belirsiz',
                                    description:'Belirsiz',
                                }]);
                            }
                            
                        }}
                        >
                            <Text style={[tw` font-semibold mr-2`,stil('text',data.app.theme)]}>Açık Adres</Text>
                            <MaterialCommunityIcons name="road-variant" size={24} color={stil('text',data.app.theme).color}></MaterialCommunityIcons>
                        </TouchableOpacity>

                        <TouchableOpacity style={tw`flex-row items-center justify-end`}
                        onPress={() => {
                            getCurrentLocation();
                        }}
                        >
                            <MaterialCommunityIcons name="map-marker-account" size={24} color={stil('text',data.app.theme).color}></MaterialCommunityIcons>
                            <Text style={[tw` font-semibold ml-2`,stil('text',data.app.theme)]}>Konumum</Text>
                        </TouchableOpacity>

                    </View>
                    <View style={tw`flex-row mt-2`}>
                        <View style={[tw`w-4/4`,result.length != 0 && stil('bg2',data.app.theme),tw`px-2 rounded`]}>
                            {result.length == 0 && searchText.length>2 ?
                                <View style={[tw`flex-row  items-center justify-center font-semibold p-2`,stil('text',data.app.theme)]}>
                                    {resultType ? 
                                        <>
                                        <Text style={[tw`text-center font-semibold ml-2`,stil('text',data.app.theme)]}>Sonuç Bulunamadı</Text>
                                        </> 
                                    :
                                        <>
                                            <ActivityIndicator size="small" color={stil('text',data.app.theme).color} />
                                            <Text style={[tw`text-center font-semibold ml-2`,stil('text',data.app.theme)]}>Sonuçlar Aranıyor</Text>
                                        </>
                                    }
                                </View>
                            :
                                <>
                                    {result.map((item,index) => {
                                        return (
                                            <View key={index} style={[]}>
                                            {index < 5 ?
                                            <>
                                              {item.point &&
                                                <View key={index} style={[tw`flex-row items-center`]}>
                                                    <View style={tw`flex-row items-center`}>
                                                        <MaterialCommunityIcons name="map-marker-plus" size={20} color={data.app.theme == 'dark' ? '#f9f9f7' : '#255382'} />
                                                        <View style={[tw`flex-row items-start ml-2 py-2`]}
                                                        >
                                                            <TouchableOpacity
                                                            onPress={() => {
                                                                setLocations([...locations,{
                                                                    title:item.name,
                                                                    lat:item.point.lat,
                                                                    lon:item.point.lon,
                                                                    description:item.full_address_name + (item.purpose_name && '- '+item.purpose_name),
                                                                }]);
                                                                setResult([]);
                                                                setSearchText('');
                                                            }}
                                                            >
                                                                <View style={tw`flex justify-between`}>
                                                                    <Text style={[tw` font-semibold`,stil('text',data.app.theme)]}>
                                                                        {item.name} 
                                                                    </Text>
                                                                    {item.full_address_name &&
                                                                      <Text style={[tw`text-xs`,stil('text',data.app.theme)]}>
                                                                          {item.full_address_name}
                                                                          {item.purpose_name && '- '+item.purpose_name}
                                                                      </Text>
                                                                    }
                                                                </View>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                </View>
                                              }
                                              </>
                                                : null}
                                            </View>
                                        );
                                    })}
                                </>
                            }
                            
                        </View>
                    </View>
                    <View style={tw`flex mt-2 w-full items-start justify-between`}>
                        
                        {locations.map((item,index) => {
                            return (
                                <View key={index} style={tw`flex-row items-center justify-between`}>
                                    <TouchableOpacity
                                    style={tw`mb-1 p-3`}
                                    onPress={() => {
                                        let remainingItems = locations.filter((item2,index2) => {return index2 !== index});
                                        setLocations(remainingItems);
                                    }}      
                                    >
                                        <MaterialCommunityIcons name="delete" size={24} color={data.app.theme == 'dark' ? '#f66' : '#f66'} />
                                    </TouchableOpacity>
                                    <View style={[tw`flex-row items-start px-2 py-1`]}>
                                        <View style={tw`flex justify-between `}>
                                            <Text style={[tw`text-xs font-semibold`,stil('text',data.app.theme)]}>
                                                <Text style={tw`opacity-75`}>{index == 0 ? 'Start' : (index == locations.length - 1 ? 'Finish' : 'Ara Durak')}</Text> - {item.title}
                                            </Text>
                                            <Text style={[tw`text-xs pr-8`,stil('text',data.app.theme)]}>
                                                {item.description}
                                            </Text>
                                        </View>
                                    </View>
                                
                                </View>
                            );
                        })}
                    </View>
                    <View style={tw` mt-4 border-t border-gray-300 pt-4`}>
                        <Text style={[tw` font-semibold text-xl ml-2 mt-1`,stil('text',data.app.theme)]}>
                            Araç Belirle
                        </Text>
                    </View>
                    <View style={tw`flex-row mt-2`}>
                        <View style={[tw`w-4/4`]}>
                            <FlatList
                                data={DATA}
                                keyExtractor={(item,index) => index.toString()}
                                horizontal
                                renderItem={({item,index}) => {
                                    return (
                                        <TouchableOpacity 
                                        onPress={() => {
                                            if(cars.length < 4) {
                                                setCars([...cars,{
                                                    id:index,
                                                    title:item.title,
                                                    description:item.start.description,
                                                    alt:item.alt,
                                                    price:item.start.price,
                                                    paid:item.paid.price,
                                                    km:item.km.price,
                                                    image:item.image,
                                                    totalPrice:0
                                                }]); 
                                            }
                                        }}
                                        key={index} style={[tw`flex items-center mx-2 my-2 rounded p-2 `,{
                                            shadowColor: stil('text',data.app.theme).color,
                                            shadowOffset: {
                                                width: 1,
                                                height: 1,
                                            },
                                            shadowOpacity: 0.10,
                                            shadowRadius: 0,
                                            elevation: 5,
                                        },stil('bg2',data.app.theme),tw`px-6 rounded`]}>
                                            <Image source={{uri:item.image}} style={tw`h-20 w-40`} resizeMode="contain"/>
                                            <View style={tw`flex justify-between items-center`}>
                                                <Text style={[tw` font-semibold`,stil('text',data.app.theme)]}>
                                                    {item.title} - {item.start.description}
                                                </Text>
                                                <Text style={[tw`text-xs`,stil('text',data.app.theme)]}>
                                                    {item.alt}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    );}
                                }
                            />
                            
                        </View>
                    </View>
                    <View style={tw`flex mt-2 mb-4 w-full items-start justify-between`}>
                        {cars.map((item,index) => {
                            return (
                                <View key={index} style={tw`flex-row  justify-between`}>
                                    <TouchableOpacity
                                    style={tw`mb-1  p-3`}
                                    onPress={() => {
                                        let remainingItems = cars.filter((item2,index2) => {return index2 !== index});
                                        setCars(remainingItems);
                                    }}      
                                    >
                                        <MaterialCommunityIcons name="delete" size={24} color={data.app.theme == 'dark' ? '#f66' : '#f66'} />
                                    </TouchableOpacity>
                                    <View style={[tw`flex-row items-center px-2 py-1`]}>
                                        <View style={tw`flex justify-between mr-4`}>
                                            <Image source={{uri:item.image}} style={tw`h-10 w-20`} resizeMode="contain"/>
                                        </View>
                                        <View style={tw`flex justify-between `}>
                                            <Text style={[tw`text-xs font-semibold`,stil('text',data.app.theme)]}>
                                                {item.title}
                                            </Text>
                                            <Text style={[tw`text-xs pr-8`,stil('text',data.app.theme)]}>
                                                {item.description}
                                            </Text>
                                        </View>
                                    </View>
                                
                                </View>
                            );
                        })}
                    </View>
                    <TouchableOpacity
                        style={[tw`flex w-full items-center rounded mb-24 py-4  `,{
                            shadowColor: stil('text',data.app.theme).color,
                            shadowOffset: {
                                width: 2,
                                height: 2,
                            },
                            shadowOpacity: 0.10,
                            shadowRadius: 0,
                            elevation: 5,
                        },stil('bg2',data.app.theme),tw` rounded`]}
                        onPress={() => {
                            setLocationModal(!locationModal);
                            setHaritadanSec(false);
                                let price = [];
                                for(let c in cars){
                                    let arac = {
                                        ...cars[c],
                                        totalPrice:((cars[c].km * routeDistance)-cars[c].km) + cars[c].price,
                                    }
                                    price.push(arac);
                                    
                                }
                                setCars(price);
                        }}
                    >
                        <Text style={[tw`text-base font-semibold`,stil('text',data.app.theme)]}>Uygula</Text>
                    </TouchableOpacity>
                </ScrollView>
                
            </Modal>
        </>
    );
};

export default HomePage;