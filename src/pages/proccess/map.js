import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import tw from 'twrnc';
import {View, Text, TouchableOpacity, Dimensions, Alert} from 'react-native';
import {stil} from '../../utils';
import Geolocation from '@react-native-community/geolocation';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import {WebView} from 'react-native-webview';
import StatusBarComponent from '../../components/global/status';
import Pusher from 'pusher-js/react-native';
import {useNavigation} from '@react-navigation/native';

MaterialCommunityIcons.loadFont();

function HomePage() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const data = useSelector((state) => state);
  map = React.createRef();
  const [locations, setLocations] = React.useState([]);
  const [cars, setCars] = React.useState([]);
  const [topHeight, setTopHeight] = React.useState(0);
  const [routeTime, setRouteTime] = React.useState(0);
  const [routeDistance, setRouteDistance] = React.useState('0 ');

  useEffect(() => {
    Geolocation.getCurrentPosition(
      (position) => {
        if (position.coords.latitude != 0 && position.coords.longitude != 0) {
          setCurrent(position.coords.longitude + ',' + position.coords.latitude);
        }
      },
      (error) => {
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: false, timeout: 30000, maximumAge: 1000},
    );
  }, []);

  Geolocation.watchPosition(
    (position) => {
      setCurrent(position.coords.longitude + ',' + position.coords.latitude);
      if (data.auth.userType == 'driver') {
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        console.log(
          'http://92.63.206.165/event?prc=hesapla&type=' +
            data.auth.userType +
            '_id&user=' +
            data.auth.userId +
            '&location=' +
            current,
        );
        axios
          .get(
            'http://92.63.206.165/event?prc=hesapla&type=' +
              data.auth.userType +
              '_id&user=' +
              data.auth.userId +
              '&location=' +
              current,
          )
          .then((response) => {});
      }
    },
    (error) => {
      console.log('HATA ====== ' + error);
    },
    {
      distanceFilter: 10,
    },
  );

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const [current, setCurrent] = React.useState(null);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        if (position.coords.latitude != 0 && position.coords.longitude != 0) {
          setCurrent(position.coords.longitude + ',' + position.coords.latitude);
        }
      },
      (error) => {
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: false, timeout: 30000, maximumAge: 1000},
    );
  };

  useEffect(() => {
    Pusher.logToConsole = true;
    var pusher = new Pusher('03a866856199003ebcb7', {
      cluster: 'ap2',
    });
    var channel = pusher.subscribe('TripEvents_' + data.auth.userId);
    channel.bind('trip', function (data2) {
      if (data2.trip.prc == 'delete_trip') {
        try {
          dispatch({type: 'tripRemove', payload: {}});
        } catch (e) {
          console.log('EEE = ', e);
        }
        navigation.navigate(data.auth.userType == 'passenger' ? 'Home' : 'HomeDriverPage');
      }
      if (data2.trip.prc == 'delete_trip') {
        try {
          dispatch({type: 'tripRemove', payload: {}});
        } catch (e) {
          console.log('EEE = ', e);
        }
        navigation.navigate(data.auth.userType == 'passenger' ? 'Home' : 'HomeDriverPage');
      }
      if (data2.trip.prc == 'binildi') {
        getTrip(data.auth.userId, data.auth.userToken, data.auth.userType);
        getSource();
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
          dispatch({type: 'setTrip', payload: response.data.data});
          getSource(response.data.data.status2);
        } else {
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const binildi = () => {
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    console.log(
      'http://92.63.206.165/event?prc=binildi&type=' +
        data.auth.userType +
        '_id&user=' +
        data.auth.userId,
    );
    axios
      .get(
        'http://92.63.206.165/event?prc=binildi&type=' +
          data.auth.userType +
          '_id&user=' +
          data.auth.userId,
      )
      .then((response) => {
        getTrip(data.auth.userId, data.auth.userToken, data.auth.userType);
        getSource();
      })
      .catch((error) => {});
  };

  const deleteTrip = (bitti = null) => {
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    console.log(
      'http://92.63.206.165/event?prc=delete_trip' +
        (bitti == null ? '&iptal=1' : '&bitti=1') +
        '&type=' +
        data.auth.userType +
        '_id&user=' +
        data.auth.userId,
    );
    axios
      .get(
        'http://92.63.206.165/event?prc=delete_trip' +
          (bitti == null ? '&iptal=1' : '&bitti=1') +
          '&type=' +
          data.auth.userType +
          '_id&user=' +
          data.auth.userId,
      )
      .then((response) => {
        try {
          dispatch({type: 'tripRemove', payload: {}});
        } catch (e) {
          console.log('EEE = ', e);
        }

        navigation.navigate(data.auth.userType == 'passenger' ? 'Home' : 'HomeDriverPage');
      })
      .catch((error) => {});
  };

  const [source, setSource] = React.useState({
    uri: 'http://92.63.206.165/navigation?me=' + current + '&token=' + data.auth.userToken,
  });

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
  const [icon, setIcon] = React.useState(null);
  const [rotate, setRotate] = React.useState([]);
  const [tripDetail, setTripDetail] = React.useState([]);
  const [yuzde, setYuzde] = React.useState(0);
  const onMessage = (payload) => {
    let dataPayload;
    try {
      dataPayload = JSON.parse(payload.nativeEvent.data);
    } catch (e) {}
    try {
      if (dataPayload) {
        if (dataPayload.type === 'Console') {
          setRotate(dataPayload.data.log[0].maneuvers[0]);
          setTripDetail(dataPayload.data.log[0]);

          switch (dataPayload.data.log[0].maneuvers[0].icon) {
            case 'start':
              return setIcon('ray-start-arrow');
            case 'finish':
              return setIcon('ray-start-end');
            case 'crossroad_straight':
              return setIcon('arrow-up-bold');
            case 'crossroad_slightly_left':
              return setIcon('arrow-left-top-bold');
            case 'crossroad_left':
              return setIcon('arrow-left-top-bold');
            case 'crossroad_sharply_left':
              return setIcon('arrow-left-top-bold');
            case 'crossroad_sharply_right':
              return setIcon('arrow-right-top-bold');
            case 'crossroad_right':
              return setIcon('arrow-right-top-bold');
            case 'crossroad_slightly_right':
              return setIcon('arrow-right-top-bold');
            case 'ringroad_forward':
              return setIcon('arrow-up-bold');
            case 'ringroad_left_45':
              return setIcon('arrow-left-top-bold');
            case 'ringroad_left_90':
              return setIcon('arrow-left-top-bold');
            case 'ringroad_left_135':
              return setIcon('arrow-left-top-bold');
            case 'ringroad_left_180':
              return setIcon('arrow-u-down-left-bold');
            case 'ringroad_right_45':
              return setIcon('arrow-right-top-bold');
            case 'ringroad_right_90':
              return setIcon('arrow-right-top-bold');
            case 'ringroad_right_135':
              return setIcon('arrow-right-top-bold');
            case 'ringroad_right_180':
              return setIcon('arrow-u-down-right-bold');
            case 'turn_over_right_hand':
              return setIcon('arrow-u-down-right-bold');
            case 'turn_over_left_hand':
              return setIcon('arrow-u-down-right-bold');
            default:
              return setIcon('arrow-up-bold');
          }

          const dataa = JSON.parse(dataPayload.data.log);
        } else {
          console.log(dataPayload);
        }
      }
    } catch (e) {}
  };

  const getSource = (status2 = null) => {
    if (status2 == null) {
      status2 = data.trip.trip.status2;
    }
    if (status2 == 2 && data.auth.userType == 'driver') {
      let loc = '';
      loc =
        loc +
        data.trip.trip.first_location.split('-')[0].split(',')[1] +
        ',' +
        data.trip.trip.first_location.split('-')[0].split(',')[0];
      setSource({
        uri:
          'http://92.63.206.165/navigation?me=' +
          current +
          '&token=' +
          data.auth.userToken +
          '&points=' +
          loc,
      });
    } else if (data.trip.isTrip) {
      let loc = '';
      data.trip.trip.first_location.split('-').map((location, index) => {
        if (location != '') {
          loc =
            loc +
            location.split(',')[1] +
            ',' +
            location.split(',')[0] +
            (index != data.trip.trip.first_location.split('-').length - 2 ? '-' : '');
        }
      });
      setSource({
        uri:
          'http://92.63.206.165/navigation?me=' +
          current +
          '&token=' +
          data.auth.userToken +
          '&points=' +
          loc,
      });
    }

    console.log(source);
  };

  useEffect(() => {
    getTrip(data.auth.userId, data.auth.userToken, data.auth.userType);
    getSource();
  }, [current]);

  return (
    <>
      <StatusBarComponent />
      <View style={[tw` w-full flex-1`]}>
        <View
          style={[
            {position: 'absolute', top: 50, right: 25, zIndex: 999999},
            tw`flex items-center justify-center opacity-85 rounded-md py-2 px-6`,
            stil('bg', data.app.theme),
          ]}>
          {icon ? (
            <MaterialCommunityIcons
              style={[tw``, stil('text', data.app.theme)]}
              name={icon}
              size={56}
            />
          ) : null}
          <Text style={[tw`my-1 pb-2 font-semibold`, stil('text', data.app.theme)]}>
            {rotate.outcoming_path_comment}
          </Text>
        </View>

        <View
          style={[
            {position: 'absolute', bottom: 80, right: 0, left: 0, zIndex: 999999},
            tw`flex-row justify-between items-center mx-[5%] opacity-85 rounded-md h-12 w-[90%] px-4`,
            stil('bg', data.app.theme),
          ]}>
          <Text style={[tw`font-semibold`, stil('text', data.app.theme)]}>
            {(data.trip.trip.act_distance / 1000).toFixed(2)} km
          </Text>
          <Text style={[tw`font-semibold`, stil('text', data.app.theme)]}>
            {(data.trip.trip.act_time / 60).toFixed(2)} min
          </Text>
          <Text style={[tw`font-semibold`, stil('text', data.app.theme)]}>
            {data.trip.trip.act_price} sum
          </Text>
          <View
            style={[
              {position: 'absolute', bottom: 0, right: 0, left: 0, zIndex: 1},
              tw`flex-row justify-between items-center opacity-90 rounded-tr-md w-[${yuzde}%] p-1 bg-green-400`,
            ]}></View>
        </View>
        <WebView ref={map} source={source} injectedJavaScript={debugging} onMessage={onMessage} />
        <View
          style={[
            tw`flex-row items-center justify-between rounded-t-md`,
            stil('bg', data.app.theme),
            {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 2,
            },
          ]}>
          {data.trip.trip.status2 == 2 ? (
            <>
              <TouchableOpacity
                style={[
                  tw`flex-row items-center justify-center  w-1/2 py-5 rounded-tl-md`,
                  stil('bg2', data.app.theme),
                ]}
                onPress={() => {
                  Alert.alert(
                    l[data.app.lang].onayli,
                    '',
                    [
                      {
                        text: l[data.app.lang].back,
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                      },
                      {
                        text: l[data.app.lang].onay,
                        onPress: () => {
                          Alert.alert(
                            l[data.app.lang].iptalsebeb,
                            '',
                            [
                              {
                                text: l[data.app.lang].other,
                                onPress: () => {
                                  deleteTrip();
                                },
                              },
                              {
                                text:
                                  data.auth.userType == 'passenger'
                                    ? l[data.app.lang].nocar
                                    : l[data.app.lang].nopas,
                                onPress: () => {
                                  deleteTrip();
                                },
                              },
                            ],
                            {cancelable: false},
                          );
                        },
                      },
                    ],
                    {cancelable: false},
                  );
                }}>
                <MaterialCommunityIcons
                  name="cancel"
                  size={20}
                  color={stil('text', data.app.theme).color}
                />
                <Text style={[tw`font-medium ml-2`, stil('text', data.app.theme)]}>
                  {l[data.app.lang].cancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    l[data.app.lang].onayli,
                    '',
                    [
                      {
                        text: l[data.app.lang].back,
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                      },
                      {
                        text: l[data.app.lang].onay,
                        onPress: () => {
                          binildi();
                        },
                      },
                    ],
                    {cancelable: false},
                  );
                }}
                style={[
                  tw`flex-row items-center justify-center  w-1/2 py-5 rounded-tr-md`,
                  stil('bg2', data.app.theme),
                ]}>
                <Text style={[tw`font-semibold mr-2`, stil('text', data.app.theme)]}>
                  {data.auth.userType == 'passenger'
                    ? l[data.app.lang].incar
                    : l[data.app.lang].pcar}
                </Text>
                <MaterialCommunityIcons
                  name="check"
                  size={20}
                  color={stil('text', data.app.theme).color}
                />
              </TouchableOpacity>
            </>
          ) : (
            <>
              {data.auth.userType == 'driver' ? (
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      l[data.app.lang].onayli,
                      '',
                      [
                        {
                          text: l[data.app.lang].back,
                          onPress: () => console.log('Cancel Pressed'),
                          style: 'cancel',
                        },
                        {
                          text: l[data.app.lang].onay,
                          onPress: () => {
                            deleteTrip('bitti');
                          },
                        },
                      ],
                      {cancelable: false},
                    );
                  }}
                  style={[
                    tw`flex-row items-center justify-center  w-2/2 py-5 rounded-tr-md`,
                    stil('bg2', data.app.theme),
                  ]}>
                  <Text style={[tw`font-semibold mr-2`, stil('text', data.app.theme)]}>
                    {l[data.app.lang].tripover}
                  </Text>
                  <MaterialCommunityIcons
                    name="check"
                    size={20}
                    color={stil('text', data.app.theme).color}
                  />
                </TouchableOpacity>
              ) : null}
            </>
          )}
        </View>
      </View>
    </>
  );
}

export default HomePage;
