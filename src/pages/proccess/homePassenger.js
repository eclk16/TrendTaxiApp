import React, {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import tw from 'twrnc';
import BottomSheet, {BottomSheetTextInput} from '@gorhom/bottom-sheet';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {stil} from '../../utils';
import Geolocation from '@react-native-community/geolocation';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import {WebView} from 'react-native-webview';
import StatusBarComponent from '../../components/global/status';
import Pusher from 'pusher-js/react-native';
import l from '../../languages.json';
import {useNavigation} from '@react-navigation/native';

MaterialCommunityIcons.loadFont();

function HomePage() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const data = useSelector((state) => state);
  const [DATA, setDATA] = React.useState([]);
  const map = React.createRef();
  const [locations, setLocations] = React.useState([]);
  const [cars, setCars] = React.useState([]);
  const [result, setResult] = React.useState([]);
  const [locationModal, setLocationModal] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');
  const [haritadanSec, setHaritadanSec] = React.useState(true);
  const [haritadanSecilen, setHaritadanSecilen] = React.useState([]);
  const [findVehicle, setFindVehicle] = React.useState(false);
  const [routeTime, setRouteTime] = React.useState(0);
  const [routeDistance, setRouteDistance] = React.useState('0 ');
  const [resultType, setResultType] = React.useState(false);
  const [source, SetSource] = React.useState(
    'http://92.63.206.162/?user=' + data.auth.userId + '&currentLocation=69.184671,41.204796',
  );

  const bottomSheetRef = React.useRef(null);

  // variables

  const snapPoints = React.useMemo(
    () => ['50%', '15%', '20%', '30%', '40%', '50%', '75%', '90%'],
    [],
  );
  const topHeight = React.useMemo(() => ['50', '90', '90', '80', '70', '60', '35', '20'], []);
  const [hTop, SetHTop] = React.useState('90');
  const [snap, SetSnap] = React.useState(snapPoints);
  // callbacks
  const handleSheetChanges = React.useCallback((index: number) => {
    console.log('handleSheetChanges', index);
    SetSnap(index);
    SetHTop(topHeight[index]);
  }, []);

  if (typeof String.prototype.replaceAll === 'undefined') {
    String.prototype.replaceAll = function (match, replace) {
      return this.replace(new RegExp(match, 'g'), () => replace);
    };
  }

  useEffect(() => {}, []);

  useEffect(() => {
    getCurrentLocation();
    getCars();
  }, []);

  const mapConfiguration = (me = '') => {
    let param = '';
    locations.forEach((value, index) => {
      param =
        param +
        '&marker' +
        index +
        '=' +
        value.lon +
        ',' +
        value.lat +
        ',' +
        value.title.replaceAll(',', ' ');
    });

    if (locations.length > 1 && locations[1].title != 'Belirsiz') {
      let price = [];
      for (let c in cars) {
        let arac = {
          ...cars[c],
          totalPrice: cars[c].km * routeDistance.split(' ')[0] - cars[c].km + cars[c].price,
        };
        price.push(arac);
      }
      setCars(price);
    }
  };

  const getCars = () => {
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios
      .get('http://92.63.206.165/api/getCarTypes')
      .then((response) => {
        if (!response.data.data.hata) {
          setDATA(response.data.data);
        } else {
        }
      })
      .catch((error) => {
        console.log('getCars', error);
      });
  };

  useEffect(() => {
    const getData = setTimeout(() => {
      if (searchText.length > 2) {
        setResultType(false);
        arama(searchText);
      } else {
        clearTimeout(getData);
      }
    }, 500);

    return () => {
      clearTimeout(getData);
    };
  }, [searchText]);

  const arama = (text) => {
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    let lang = '';
    if (data.app.lang == 'tr') {
      lang = 'uz_UZ';
    }
    if (data.app.lang == 'gb') {
      lang = 'uz_UZ';
    }
    if (data.app.lang == 'ru') {
      lang = 'uz_UZ';
    }
    if (data.app.lang == 'uz') {
      lang = 'uz_UZ';
    }
    axios
      .get(
        'https://catalog.api.2gis.com/3.0/items?q=' +
          text +
          '&key=runnmp5276&locale=' +
          lang +
          '&fields=items.full_name,items.point,items.locale,items.full_address_name&sort=distance&location=' +
          current,
      )
      // axios.get('https://search-maps.yandex.ru/v1/?text='+text+'&lang='+lang+'&apikey=ae55dcf2-7140-4585-a883-e16d89cc31d2')
      .then((response) => {
        console.log(response.data);
        if (response.data.result) {
          setResult(response.data.result.items);
          setResultType(true);
        }
      })
      .catch((error) => {
        setResult([]);
        setResultType(true);
        console.log('search', error);
      });
  };
  const [current, setCurrent] = React.useState('');
  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        console.log('POSITION = ', position);
        setCurrent(position.coords.longitude + ',' + position.coords.latitude);
        setCurrentLocation();
      },
      (error) => {
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: false, timeout: 30000, maximumAge: 1000},
    );
  };

  const [kabul, setKabul] = React.useState({
    car0: 0,
    car1: 0,
    car2: 0,
    car3: 0,
  });

  const setCurrentLocation = () => {
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    console.log(
      'http://92.63.206.165/event?prc=mapConfig&user=' +
        data.auth.userId +
        '&currentLocation=' +
        current +
        '&mapPrc=setCurrent',
    );
    axios
      .get(
        'http://92.63.206.165/event?prc=mapConfig&user=' +
          data.auth.userId +
          '&currentLocation=' +
          current +
          '&mapPrc=setCurrent',
      )
      .then((response) => {})
      .catch((error) => {
        console.log(error);
      });
  };

  const setCenter = (type = 0) => {
    getCurrentLocation();
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.headers.common['Content-Type'] = 'application/json';

    axios
      .get(
        'http://92.63.206.165/event?prc=mapConfig&user=' +
          data.auth.userId +
          '&currentLocation=' +
          (type != 0 ? type : current) +
          '&mapPrc=setCenter',
      )
      .then((response) => {})
      .catch((error) => {
        console.log(error);
      });
  };

  const createTrip = (cari = 0) => {
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    let loc = '';
    locations.map((location, index) => {
      loc =
        loc +
        location.lat +
        ',' +
        location.lon +
        ',' +
        location.title.replaceAll(',', ' ').replaceAll('-', ' ').replaceAll("'", ' ') +
        ',' +
        location.description.replaceAll(',', ' ').replaceAll('-', ' ').replaceAll("'", ' ') +
        '-';
    });
    axios
      .get(
        'http://92.63.206.165/event?' +
          'prc=trip_create&' +
          'km_price=' +
          cars[cari].km +
          '&' +
          'paid_price=' +
          cars[cari].paid +
          '&' +
          'start_price=' +
          cars[cari].price +
          '&' +
          'car_id=' +
          cars[cari].title +
          '&' +
          'start=' +
          loc +
          '&' +
          'car=' +
          cars[cari].title +
          '&' +
          'duration=' +
          routeTime +
          '&' +
          'distance=' +
          routeDistance +
          '&' +
          'price=' +
          cars[cari].totalPrice +
          '&' +
          'user=' +
          data.auth.userId,
      )
      .then((response) => {
        const istekler = response.data.drivers;
        let wait = 0;
        istekler.forEach((element) => {
          setTimeout(() => {
            soforeIstek(response.data.trip.id, element, response.data.start);
          }, wait);
          wait = wait + 17000;
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    var param = '';
    locations.forEach((value, index) => {
      param =
        param +
        '&marker' +
        index +
        '=' +
        value.lon +
        ',' +
        value.lat +
        ',' +
        value.title.replaceAll(',', ' ');
    });
    console.log(
      'http://92.63.206.165/event?user=' +
        data.auth.userId +
        '&currentLocation=' +
        current +
        '&prc=mapConfig&mapPrc=setMarker' +
        param,
    );
    axios
      .get(
        'http://92.63.206.165/event?user=' +
          data.auth.userId +
          '&currentLocation=' +
          current +
          '&prc=mapConfig&mapPrc=setMarker' +
          param,
      )
      .then((response) => {})
      .catch((error) => {
        console.log(error);
      });
  }, [locations]);

  useEffect(() => {
    Pusher.logToConsole = true;
    var pusher = new Pusher('03a866856199003ebcb7', {
      cluster: 'ap2',
    });
    var channel = pusher.subscribe('TripEvents_' + data.auth.userId);
    channel.bind('trip', function (data) {
      console.log(data);
      if (data.trip.prc == 'tripOnaylandi') {
        onaylandi();
      }
    });
    return () => {
      pusher?.disconnect();
    };
  }, []);

  const getTrip = (id, userToken, userType) => {
    const config = {
      headers: {Authorization: `Bearer ${userToken}`},
    };
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + userToken;
    axios
      .post('http://92.63.206.165/api/isActiveTrip', {
        id: id,
        lang: data.app.lang,
        type: userType + '_id',
      })
      .then((response) => {
        if (!response.data.data.hata) {
          console.log(response.data.data);
          dispatch({type: 'setTrip', payload: response.data.data});
          navigation.navigate('Harita');
        } else {
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const [cagir, setCagir] = React.useState(1);
  const onaylandi = () => {
    getTrip(data.auth.userId, data.auth.userToken, data.auth.userType);
  };

  const [istekCar, setIstekCar] = React.useState(0);
  const soforeIstek = (trip_id, id, start) => {
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios
      .get(
        'http://92.63.206.165/event?prc=sofor_istek&driver_id=' +
          id +
          '&trip_id=' +
          trip_id +
          '&start=' +
          start,
      )
      .then((response) => {
        console.log(response.data);
      });
  };

  const deleteTrip = () => {
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios
      .get('http://92.63.206.165/event?prc=delete_trip&user=' + data.auth.userId)
      .then((response) => {})
      .catch((error) => {});
  };

  const debugging = `
    const consoleLog = (type, log) => window.ReactNativeWebView.postMessage(JSON.stringify({'type': 'Console', 'data': {'type': type, 'log': log}}));
    console = {
        log: (log) => consoleLog('log', log),
        debug: (log) => consoleLog('debug', log),
        info: (log) => consoleLog('info', log),
        warn: (log) => consoleLog('warn', log),
        error: (log) => consoleLog('error', log),
      };
  `;
  const onMessage = (payload) => {
    let dataPayload;
    try {
      console.log(payload.nativeEvent.data);
      dataPayload = JSON.parse(payload.nativeEvent.data);
    } catch (e) {}
    try {
      console.log(dataPayload);
      if (dataPayload) {
        if (dataPayload.type === 'Console' && dataPayload.data.type == 'log') {
          const dataa = JSON.parse(dataPayload.data.log);
          if (dataa.distance) {
            setRouteDistance(dataa.distance);
            setRouteTime(dataa.duration);
            if (locations.length > 1 && locations[1].title != 'Belirsiz') {
              let price = [];
              for (let c in cars) {
                let arac = {
                  ...cars[c],
                  totalPrice:
                    cars[c].km * dataa.distance.split(' ')[0] - cars[c].km + cars[c].price,
                };

                price.push(arac);
              }
              setCars(price);
            } else {
              let price = [];
              for (let c in cars) {
                let arac = {
                  ...cars[c],
                  totalPrice: 0,
                };

                price.push(arac);
              }
              setCars(price);
            }
            console.info(`[Console] ${JSON.stringify(dataPayload.data.log)}`);
          }
          if (dataa.type == 'selectMap') {
            setHaritadanSecilen(dataa);
          }
        }
      }
    } catch (e) {}
  };

  return (
    <>
      <StatusBarComponent />
      <View style={[tw` w-full`, {height: hTop + '%'}]}>
        <WebView
          ref={map}
          source={{
            uri: source,
          }}
          injectedJavaScript={debugging}
          onMessage={onMessage}
        />
        <View
          style={[
            tw`w-full flex-row justify-end items-center`,
            // stil('bg2', data.app.theme),
            {position: 'absolute', bottom: 90, zIndex: 999999999},
          ]}>
          <TouchableOpacity
            style={[
              stil('bg', data.app.theme),
              tw`rounded-md mx-2 h-10 w-10 items-center justify-center`,
            ]}
            onPress={() => {
              setCenter(locations.length > 0 ? locations[0].lon + ',' + locations[0].lat : '');
            }}>
            <MaterialCommunityIcons
              name="map-marker-up"
              size={36}
              color={stil('text', data.app.theme).color}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              stil('bg', data.app.theme),
              tw`rounded-md mx-2 h-10 w-10 items-center justify-center`,
            ]}
            onPress={() => {
              setCenter(
                locations.length > 0
                  ? locations[locations.length - 1].lon + ',' + locations[locations.length - 1].lat
                  : '',
              );
            }}>
            <MaterialCommunityIcons
              name="map-marker-down"
              size={36}
              color={stil('text', data.app.theme).color}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              stil('bg', data.app.theme),
              tw`rounded-md mx-2 h-10 w-10 items-center justify-center`,
            ]}
            onPress={() => {
              setCenter();
            }}>
            <MaterialCommunityIcons
              name="map-marker-radius"
              size={36}
              color={stil('text', data.app.theme).color}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              stil('bg', data.app.theme),
              tw`rounded-md mx-2 h-10 w-10 items-center justify-center`,
            ]}
            onPress={() => {
              setLocations([...locations, haritadanSecilen]);
            }}>
            <MaterialCommunityIcons
              name="map-marker-check"
              size={36}
              color={stil('text', data.app.theme).color}
            />
          </TouchableOpacity>
        </View>
      </View>
      <BottomSheet
        handleIndicatorStyle={[stil('bg2', data.app.theme), tw`w-24`]}
        ref={bottomSheetRef}
        index={3}
        snapPoints={snapPoints}
        keyboardBehavior="extend"
        onChange={handleSheetChanges}
        backgroundStyle={stil('bg', data.app.theme)}
        style={tw`py-2 px-4`}>
        <View>
          {snap > 2 ? (
            <>
              <View key="address">
                <Text style={[tw`font-medium mb-2`, stil('text', data.app.theme)]}>
                  {l[data.app.lang].addresss}
                </Text>
                <FlatList
                  data={locations}
                  style={[tw``]}
                  ListEmptyComponent={() => (
                    <BottomSheetTextInput
                      placeholderTextColor={stil('text', data.app.theme).color}
                      placeholder={l[data.app.lang].findguzergah}
                      style={[
                        tw`h-12 rounded-md p-2 `,
                        stil('text', data.app.theme),
                        stil('bg2', data.app.theme),
                      ]}
                      onChangeText={(text) => {
                        setSearchText(text);
                        if (text == '') {
                          setResult([]);
                        }
                      }}
                      value={searchText}
                    />
                  )}
                  renderItem={({item, index}) => {
                    return (
                      <>
                        <View
                          key={index}
                          style={[
                            tw`flex-row items-center justify-between rounded-md  mb-1 px-2 py-1`,
                            stil('bg2', data.app.theme),
                          ]}>
                          <View style={[tw`flex-row items-center justify-start w-5/6`]}>
                            <MaterialCommunityIcons
                              style={[tw`text-center mr-2`]}
                              name="adjust"
                              size={16}
                              color={stil('text', data.app.theme).color}
                            />
                            <View>
                              <Text
                                style={[
                                  tw`text-xs font-medium`,
                                  {fontSize: 12},
                                  stil('text', data.app.theme),
                                ]}>
                                {item.title}
                              </Text>
                              <Text
                                style={[
                                  tw`text-xs font-light pr-8`,
                                  {fontSize: 12},
                                  stil('text', data.app.theme),
                                ]}>
                                {item.description}
                              </Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            style={tw``}
                            onPress={() => {
                              let remainingItems = locations.filter((item2, index2) => {
                                return index2 !== index;
                              });
                              setLocations(remainingItems);
                            }}>
                            <MaterialCommunityIcons
                              name="delete"
                              size={24}
                              color={stil('text', data.app.theme).color}
                            />
                          </TouchableOpacity>
                        </View>
                        {index == locations.length - 1 ? (
                          <>
                            <BottomSheetTextInput
                              placeholderTextColor={stil('text', data.app.theme).color}
                              placeholder={l[data.app.lang].findguzergah}
                              style={[
                                tw`h-12 rounded-md p-2 `,
                                stil('text', data.app.theme),
                                stil('bg2', data.app.theme),
                              ]}
                              onChangeText={(text) => {
                                setSearchText(text);
                                if (text == '') {
                                  setResult([]);
                                }
                              }}
                              value={searchText}
                            />
                          </>
                        ) : null}
                      </>
                    );
                  }}
                  keyExtractor={(item, index) => index.toString()}
                />
                <>
                  {result.map((item, index) => {
                    return (
                      <View key={index} style={[]}>
                        {index < 5 ? (
                          <>
                            {item.point ? (
                              <View key={index} style={[tw`flex-row items-center`]}>
                                <View style={tw`flex-row items-center`}>
                                  <MaterialCommunityIcons
                                    name="map-marker-plus"
                                    size={20}
                                    color={data.app.theme == 'dark' ? '#f9f9f7' : '#255382'}
                                  />
                                  <View style={[tw`flex-row items-start ml-2 py-2`]}>
                                    <TouchableOpacity
                                      onPress={() => {
                                        setLocations([
                                          ...locations,
                                          {
                                            title: item.name,
                                            lat: item.point.lat,
                                            lon: item.point.lon,
                                            description: item.full_address_name
                                              ? item.full_address_name
                                              : '' +
                                                (item.purpose_name ? '- ' + item.purpose_name : ''),
                                          },
                                        ]);
                                        setResult([]);
                                        setSearchText('');
                                      }}>
                                      <View style={tw`flex justify-between`}>
                                        <Text
                                          style={[
                                            tw` font-semibold`,
                                            stil('text', data.app.theme),
                                          ]}>
                                          {item.name}
                                        </Text>

                                        <Text style={[tw`text-xs`, stil('text', data.app.theme)]}>
                                          {item.full_address_name ? (
                                            <>
                                              {item.full_address_name}
                                              {item.purpose_name ? '- ' + item.purpose_name : ''}
                                            </>
                                          ) : (
                                            ''
                                          )}
                                        </Text>
                                      </View>
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              </View>
                            ) : (
                              ''
                            )}
                          </>
                        ) : null}
                      </View>
                    );
                  })}
                </>
              </View>
            </>
          ) : null}
          <View key="cars" style={tw`mt-4`}>
            {snap > 2 ? (
              <>
                <Text style={[tw`font-medium `, stil('text', data.app.theme)]}>
                  {l[data.app.lang].cars}
                </Text>
                <View style={tw`flex-row`}>
                  <View style={[tw``]}>
                    <FlatList
                      data={DATA}
                      keyExtractor={(item, index) => index.toString()}
                      horizontal
                      renderItem={({item, index}) => {
                        return (
                          <TouchableOpacity
                            onPress={() => {
                              if (cars.length < 4) {
                                setCars([
                                  ...cars,
                                  {
                                    id: Math.random(1000000, 9999999),
                                    title: item.title,
                                    description: item.start.description,
                                    alt: item.alt,
                                    price: item.start.price,
                                    paid: item.paid.price,
                                    km: item.km.price,
                                    image: item.image,
                                    totalPrice:
                                      item.km.price * routeDistance.split(' ')[0] -
                                      item.km.price +
                                      item.start.price,
                                    load: true,
                                  },
                                ]);
                              }
                            }}
                            key={index}
                            style={[
                              tw`flex  items-center mr-2 my-2 rounded p-2 `,
                              {
                                shadowColor: stil('text', data.app.theme).color,
                                shadowOffset: {
                                  width: 1,
                                  height: 1,
                                },
                                shadowOpacity: 0.1,
                                shadowRadius: 0,
                                elevation: 5,
                              },
                              stil('bg2', data.app.theme),
                              tw` rounded`,
                            ]}>
                            <Image
                              source={{uri: item.image}}
                              style={tw`h-10 w-20`}
                              resizeMode="contain"
                            />
                            <View style={tw`flex justify-between items-center`}>
                              <Text style={[tw` font-medium`, stil('text', data.app.theme)]}>
                                {item.title} -{' '}
                                {item.km.price * routeDistance.split(' ')[0] -
                                  item.km.price +
                                  item.start.price >
                                item.start.price
                                  ? item.km.price * routeDistance.split(' ')[0] -
                                    item.km.price +
                                    item.start.price
                                  : item.start.price}{' '}
                                sum
                              </Text>
                              <Text style={[tw` text-xs`, stil('text', data.app.theme)]}>
                                {item.alt}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      }}
                    />
                  </View>
                </View>
              </>
            ) : null}
            {snap > 0 ? (
              <FlatList
                data={cars}
                // horizontal
                style={[tw``]}
                renderItem={({item, index}) => {
                  return (
                    <View
                      key={index}
                      style={[
                        tw`flex-row items-center justify-between mb-1 px-4 py-1 rounded-md`,
                        stil('bg2', data.app.theme),
                      ]}>
                      <View style={tw`items-center  justify-center flex`}>
                        <Text style={[tw``, stil('text', data.app.theme)]}>{item.title}</Text>
                        <Image
                          source={{uri: item.image}}
                          style={[
                            tw`h-10 w-15`,
                            {
                              transform: [
                                {
                                  rotateY: '180deg',
                                },
                              ],
                            },
                          ]}
                          resizeMode="contain"
                        />
                      </View>
                      <View
                        style={[
                          tw`flex items-center justify-center `,
                          stil('text', data.app.theme),
                        ]}>
                        <MaterialCommunityIcons
                          name="map-marker-path"
                          size={20}
                          color={stil('text', data.app.theme).color}
                        />
                        <Text
                          style={[tw`text-xs mt-1`, {fontSize: 10}, stil('text', data.app.theme)]}>
                          {routeDistance}
                        </Text>
                      </View>
                      <View
                        style={[
                          tw`flex items-center justify-center`,
                          stil('text', data.app.theme),
                        ]}>
                        <MaterialCommunityIcons
                          name="clock-start"
                          size={20}
                          color={stil('text', data.app.theme).color}
                        />
                        <Text
                          style={[tw`text-xs mt-1`, {fontSize: 10}, stil('text', data.app.theme)]}>
                          {routeTime}
                        </Text>
                      </View>
                      <View
                        style={[
                          tw`flex items-center justify-center`,
                          stil('text', data.app.theme),
                        ]}>
                        <MaterialCommunityIcons
                          name="credit-card"
                          size={20}
                          color={stil('text', data.app.theme).color}
                        />
                        <Text
                          style={[tw`text-xs mt-1`, {fontSize: 10}, stil('text', data.app.theme)]}>
                          {item.totalPrice} sum
                        </Text>
                      </View>
                    </View>
                  );
                }}
                keyExtractor={(item, index) => index.toString()}
              />
            ) : null}
          </View>

          <View key="find" style={tw`flex w-full items-center justify-center`}>
            <TouchableOpacity
              onPress={() => {
                if (locations.length > 1 && cars.length > 0) {
                  setFindVehicle(true);
                  createTrip();
                } else {
                  Alert.alert('', l[data.app.lang].enaz);
                }
              }}
              style={[
                tw`flex-row w-full items-center justify-center  p-4 rounded-md`,
                stil('bg2', data.app.theme),
              ]}>
              <MaterialCommunityIcons
                name="car-connected"
                size={20}
                color={stil('text', data.app.theme).color}
              />
              <Text style={[tw`font-medium `, stil('text', data.app.theme)]}>
                {l[data.app.lang].find_car}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>
      <Modal
        animationType="fade"
        transparent={true}
        visible={findVehicle}
        onRequestClose={() => {
          setFindVehicle(!findVehicle);
        }}>
        <View
          style={[tw` flex-1 items-center justify-center`, {backgroundColor: 'rgba(0,0,0,0.55)'}]}>
          <View
            style={[
              tw` w-[90%] flex items-center justify-end rounded-md p-2`,
              stil('bg', data.app.theme),
            ]}>
            <View style={[tw`mb-12  w-full`]}>
              <Text
                style={[
                  tw`font-semibold text-center text-base my-2`,
                  stil('text', data.app.theme),
                ]}>
                {l[data.app.lang].uaa}
              </Text>
              <View style={[tw`flex `]}>
                {cars.map((car, index) => {
                  return (
                    <View key={index} style={[tw`flex-row items-center px-2`]}>
                      <Image
                        source={{uri: car.image}}
                        style={[tw`h-16 w-20 mr-4`, {transform: [{rotateY: '180deg'}]}]}
                        resizeMode="contain"
                      />
                      <Text style={[stil('text', data.app.theme), tw`font-semibold mr-4`]}>
                        {car.title}
                      </Text>
                      {!car.load ? (
                        <MaterialCommunityIcons
                          name="check"
                          size={16}
                          color={stil('text', data.app.theme).color}
                        />
                      ) : (
                        <ActivityIndicator
                          animating={car.load ? true : true}
                          size="small"
                          color={stil('text', data.app.theme).color}
                        />
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
            <TouchableOpacity
              style={[
                tw`flex-row items-center justify-center p-4 rounded-md w-full`,
                {backgroundColor: data.app.theme == 'dark' ? '#255382' : '#f1f1f1'},
              ]}
              onPress={() => {
                Alert.alert(
                  '',
                  l[data.app.lang].iptall,
                  [
                    {
                      text: l[data.app.lang].back,
                      onPress: () => console.log('Cancel Pressed'),
                      style: 'cancel',
                    },
                    {
                      text: l[data.app.lang].check,
                      onPress: () => {
                        deleteTrip();
                        setFindVehicle(false);
                      },
                    },
                  ],
                  {cancelable: false},
                );
              }}>
              <MaterialCommunityIcons
                name="cancel"
                size={16}
                color={stil('text', data.app.theme).color}
              />
              <Text style={[tw`font-semibold ml-2`, stil('text', data.app.theme)]}>
                {l[data.app.lang].cancel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default HomePage;
