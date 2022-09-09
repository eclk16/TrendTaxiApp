import React, {useEffect} from 'react';
import axios from 'axios';
import {useSelector} from 'react-redux';
import {ActivityIndicator, View, Text, ScrollView} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import {stil} from '../../utils';
import l from '../../languages.json';
import StatusBarComponent from '../../components/global/status';
MaterialCommunityIcons.loadFont();

function Reports() {
  const data = useSelector((state) => state);
  const [reports, setReports] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  useEffect(() => {
    setLoading(true);
    getTrips(data.auth.userId, data.auth.userToken, data.auth.userType);
  }, []);

  const getTrips = (id, userToken, type) => {
    setLoading(true);
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + userToken;
    axios
      .post('http://92.63.206.165/api/getTrips', {
        who: type + '_id',
        id: id,
        lang: data.app.lang,
        getReports: 1,
      })
      .then((response) => {
        if (!response.data.data.hata) {
          setReports(response.data.data);
          console.log(response.data.data);
        } else {
        }
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };

  return (
    <ScrollView style={[stil('bg', data.app.theme), tw`p-2 flex-1`]}>
      <StatusBarComponent />
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <View style={[tw`flex-row `]}>
            <View style={[tw`p-2 w-1/1`]}>
              <View style={[tw`  rounded-md p-4 flex`, stil('bg2', data.app.theme)]}>
                <View style={[tw`rounded-md mb-2`, stil('bg', data.app.theme)]}>
                  <Text style={[stil('text', data.app.theme), tw`text-center  p-2 font-medium`]}>
                    {l[data.app.lang].daily}
                  </Text>
                </View>

                <View
                  style={[
                    tw`flex-row justify-between items-center border-b-2 pb-1`,
                    {borderColor: stil('bg', data.app.theme).backgroundColor},
                  ]}>
                  <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                    {l[data.app.lang].count}
                  </Text>
                  <Text style={[stil('text', data.app.theme), tw``]}>{reports.day.count}</Text>
                </View>
                <View
                  style={[
                    tw`flex-row justify-between items-center border-b-2 pb-1`,
                    {borderColor: stil('bg', data.app.theme).backgroundColor},
                  ]}>
                  <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                    {l[data.app.lang].kilometer}
                  </Text>
                  <Text style={[stil('text', data.app.theme), tw``]}>{reports.day.km}</Text>
                </View>
                <View
                  style={[
                    tw`flex-row justify-between items-center border-b-2 pb-1`,
                    {borderColor: stil('bg', data.app.theme).backgroundColor},
                  ]}>
                  <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                    {l[data.app.lang].time}
                  </Text>
                  <Text style={[stil('text', data.app.theme), tw``]}>{reports.day.time}</Text>
                </View>
                <View
                  style={[
                    tw`flex justify-between items-center border-b-2 pb-1`,
                    {borderColor: stil('bg', data.app.theme).backgroundColor},
                  ]}>
                  <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                    {l[data.app.lang].price}
                  </Text>
                  <Text style={[stil('text', data.app.theme), tw``]}>{reports.day.price}</Text>
                </View>
                <View
                  style={[
                    tw`flex-row justify-between items-center pb-1`,
                    {borderColor: stil('bg', data.app.theme).backgroundColor},
                  ]}>
                  <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                    {l[data.app.lang].fee}
                  </Text>
                  <Text style={[stil('text', data.app.theme), tw``]}>{reports.day.feePrice}</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={[tw`flex-row mt-2`]}>
            <View style={[tw`p-2 w-1/2`]}>
              <View style={[tw`  rounded-md p-4 flex`, stil('bg2', data.app.theme)]}>
                <View style={[tw`rounded-md mb-2`, stil('bg', data.app.theme)]}>
                  <Text style={[stil('text', data.app.theme), tw`text-center  p-2 font-medium`]}>
                    {l[data.app.lang].yesterday}
                  </Text>
                </View>
                <View
                  style={[
                    tw`flex-row justify-between items-center border-b-2 pb-1`,
                    {borderColor: stil('bg', data.app.theme).backgroundColor},
                  ]}>
                  <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                    {l[data.app.lang].count}
                  </Text>
                  <Text style={[stil('text', data.app.theme), tw``]}>
                    {reports.yesterday.count}
                  </Text>
                </View>
                <View
                  style={[
                    tw`flex-row justify-between items-center border-b-2 pb-1`,
                    {borderColor: stil('bg', data.app.theme).backgroundColor},
                  ]}>
                  <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                    {l[data.app.lang].kilometer}
                  </Text>
                  <Text style={[stil('text', data.app.theme), tw``]}>{reports.yesterday.km}</Text>
                </View>
                <View
                  style={[
                    tw`flex-row justify-between items-center border-b-2 pb-1`,
                    {borderColor: stil('bg', data.app.theme).backgroundColor},
                  ]}>
                  <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                    {l[data.app.lang].time}
                  </Text>
                  <Text style={[stil('text', data.app.theme), tw``]}>{reports.yesterday.time}</Text>
                </View>
                <View
                  style={[
                    tw`flex justify-between items-center border-b-2 pb-1`,
                    {borderColor: stil('bg', data.app.theme).backgroundColor},
                  ]}>
                  <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                    {l[data.app.lang].price}
                  </Text>
                  <Text style={[stil('text', data.app.theme), tw``]}>
                    {reports.yesterday.price}
                  </Text>
                </View>
                <View
                  style={[
                    tw`flex-row justify-between items-center pb-1`,
                    {borderColor: stil('bg', data.app.theme).backgroundColor},
                  ]}>
                  <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                    {l[data.app.lang].fee}
                  </Text>
                  <Text style={[stil('text', data.app.theme), tw``]}>
                    {reports.yesterday.feePrice}
                  </Text>
                </View>
              </View>
            </View>
            <View style={[tw`p-2 w-1/2`]}>
              <View style={[tw`  rounded-md  p-4 flex`, stil('bg2', data.app.theme)]}>
                <View style={[tw`rounded-md mb-2`, stil('bg', data.app.theme)]}>
                  <Text style={[stil('text', data.app.theme), tw`text-center  p-2 font-medium`]}>
                    {l[data.app.lang].weekly}
                  </Text>
                </View>
                <View
                  style={[
                    tw`flex-row justify-between items-center border-b-2 pb-1`,
                    {borderColor: stil('bg', data.app.theme).backgroundColor},
                  ]}>
                  <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                    {l[data.app.lang].count}
                  </Text>
                  <Text style={[stil('text', data.app.theme), tw``]}>{reports.week.count}</Text>
                </View>
                <View
                  style={[
                    tw`flex-row justify-between items-center border-b-2 pb-1`,
                    {borderColor: stil('bg', data.app.theme).backgroundColor},
                  ]}>
                  <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                    {l[data.app.lang].kilometer}
                  </Text>
                  <Text style={[stil('text', data.app.theme), tw``]}>{reports.week.km}</Text>
                </View>
                <View
                  style={[
                    tw`flex-row justify-between items-center border-b-2 pb-1`,
                    {borderColor: stil('bg', data.app.theme).backgroundColor},
                  ]}>
                  <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                    {l[data.app.lang].time}
                  </Text>
                  <Text style={[stil('text', data.app.theme), tw``]}>{reports.week.time}</Text>
                </View>
                <View
                  style={[
                    tw`flex justify-between items-center border-b-2 pb-1`,
                    {borderColor: stil('bg', data.app.theme).backgroundColor},
                  ]}>
                  <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                    {l[data.app.lang].price}
                  </Text>
                  <Text style={[stil('text', data.app.theme), tw``]}>{reports.week.price}</Text>
                </View>
                <View
                  style={[
                    tw`flex-row justify-between items-center pb-1`,
                    {borderColor: stil('bg', data.app.theme).backgroundColor},
                  ]}>
                  <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                    {l[data.app.lang].fee}
                  </Text>
                  <Text style={[stil('text', data.app.theme), tw``]}>{reports.week.feePrice}</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={[tw`flex-row mt-2`]}>
            <View style={[tw`p-2 w-1/2`]}>
              <View style={[tw`  rounded-md p-4 flex`, stil('bg2', data.app.theme)]}>
                <View style={[tw`rounded-md mb-2`, stil('bg', data.app.theme)]}>
                  <Text style={[stil('text', data.app.theme), tw`text-center  p-2 font-medium`]}>
                    {l[data.app.lang].monthly}
                  </Text>
                </View>
                <View
                  style={[
                    tw`flex-row justify-between items-center border-b-2 pb-1`,
                    {borderColor: stil('bg', data.app.theme).backgroundColor},
                  ]}>
                  <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                    {l[data.app.lang].count}
                  </Text>
                  <Text style={[stil('text', data.app.theme), tw``]}>{reports.month.count}</Text>
                </View>
                <View
                  style={[
                    tw`flex-row justify-between items-center border-b-2 pb-1`,
                    {borderColor: stil('bg', data.app.theme).backgroundColor},
                  ]}>
                  <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                    {l[data.app.lang].kilometer}
                  </Text>
                  <Text style={[stil('text', data.app.theme), tw``]}>{reports.month.km}</Text>
                </View>
                <View
                  style={[
                    tw`flex-row justify-between items-center border-b-2 pb-1`,
                    {borderColor: stil('bg', data.app.theme).backgroundColor},
                  ]}>
                  <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                    {l[data.app.lang].time}
                  </Text>
                  <Text style={[stil('text', data.app.theme), tw``]}>{reports.month.time}</Text>
                </View>
                <View
                  style={[
                    tw`flex justify-between items-center border-b-2 pb-1`,
                    {borderColor: stil('bg', data.app.theme).backgroundColor},
                  ]}>
                  <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                    {l[data.app.lang].price}
                  </Text>
                  <Text style={[stil('text', data.app.theme), tw``]}>{reports.month.price}</Text>
                </View>
                <View
                  style={[
                    tw`flex-row justify-between items-center pb-1`,
                    {borderColor: stil('bg', data.app.theme).backgroundColor},
                  ]}>
                  <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                    {l[data.app.lang].fee}
                  </Text>
                  <Text style={[stil('text', data.app.theme), tw``]}>{reports.month.feePrice}</Text>
                </View>
              </View>
            </View>
            <View style={[tw`p-2 w-1/2`]}>
              <View style={[tw` rounded-md p-4 flex`, stil('bg2', data.app.theme)]}>
                <View style={[tw`rounded-md mb-2`, stil('bg', data.app.theme)]}>
                  <Text style={[stil('text', data.app.theme), tw`text-center  p-2 font-medium`]}>
                    {l[data.app.lang].yearly}
                  </Text>
                </View>
                <View
                  style={[
                    tw`flex-row justify-between items-center border-b-2 pb-1`,
                    {borderColor: stil('bg', data.app.theme).backgroundColor},
                  ]}>
                  <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                    {l[data.app.lang].count}
                  </Text>
                  <Text style={[stil('text', data.app.theme), tw``]}>{reports.year.count}</Text>
                </View>
                <View
                  style={[
                    tw`flex-row justify-between items-center border-b-2 pb-1`,
                    {borderColor: stil('bg', data.app.theme).backgroundColor},
                  ]}>
                  <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                    {l[data.app.lang].kilometer}
                  </Text>
                  <Text style={[stil('text', data.app.theme), tw``]}>{reports.year.km}</Text>
                </View>
                <View
                  style={[
                    tw`flex-row justify-between items-center border-b-2 pb-1`,
                    {borderColor: stil('bg', data.app.theme).backgroundColor},
                  ]}>
                  <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                    {l[data.app.lang].time}
                  </Text>
                  <Text style={[stil('text', data.app.theme), tw``]}>{reports.year.time}</Text>
                </View>
                <View
                  style={[
                    tw`flex justify-between items-center border-b-2 pb-1`,
                    {borderColor: stil('bg', data.app.theme).backgroundColor},
                  ]}>
                  <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                    {l[data.app.lang].price}
                  </Text>
                  <Text style={[stil('text', data.app.theme), tw``]}>{reports.year.price}</Text>
                </View>
                <View
                  style={[
                    tw`flex-row justify-between items-center pb-1`,
                    {borderColor: stil('bg', data.app.theme).backgroundColor},
                  ]}>
                  <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                    {l[data.app.lang].fee}
                  </Text>
                  <Text style={[stil('text', data.app.theme), tw``]}>{reports.year.feePrice}</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={[tw`flex-row mt-2 mb-20`]}>
            <View style={[tw`p-2 w-1/1`]}>
              <View style={[tw`  rounded-md p-4 flex`, stil('bg2', data.app.theme)]}>
                <View style={[tw`rounded-md mb-2`, stil('bg', data.app.theme)]}>
                  <Text style={[stil('text', data.app.theme), tw`text-center  p-2 font-medium`]}>
                    {l[data.app.lang].allTime}
                  </Text>
                </View>
                <View
                  style={[
                    tw`flex-row justify-between items-center border-b-2 pb-1`,
                    {borderColor: stil('bg', data.app.theme).backgroundColor},
                  ]}>
                  <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                    {l[data.app.lang].count}
                  </Text>
                  <Text style={[stil('text', data.app.theme), tw``]}>{reports.alltime.count}</Text>
                </View>
                <View
                  style={[
                    tw`flex-row justify-between items-center border-b-2 pb-1`,
                    {borderColor: stil('bg', data.app.theme).backgroundColor},
                  ]}>
                  <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                    {l[data.app.lang].kilometer}
                  </Text>
                  <Text style={[stil('text', data.app.theme), tw``]}>{reports.alltime.km}</Text>
                </View>
                <View
                  style={[
                    tw`flex-row justify-between items-center border-b-2 pb-1`,
                    {borderColor: stil('bg', data.app.theme).backgroundColor},
                  ]}>
                  <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                    {l[data.app.lang].time}
                  </Text>
                  <Text style={[stil('text', data.app.theme), tw``]}>{reports.alltime.time}</Text>
                </View>
                <View
                  style={[
                    tw`flex justify-between items-center border-b-2 pb-1`,
                    {borderColor: stil('bg', data.app.theme).backgroundColor},
                  ]}>
                  <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                    {l[data.app.lang].price}
                  </Text>
                  <Text style={[stil('text', data.app.theme), tw``]}>{reports.alltime.price}</Text>
                </View>
                <View
                  style={[
                    tw`flex-row justify-between items-center pb-1`,
                    {borderColor: stil('bg', data.app.theme).backgroundColor},
                  ]}>
                  <Text style={[stil('text', data.app.theme), tw`font-medium`]}>
                    {l[data.app.lang].fee}
                  </Text>
                  <Text style={[stil('text', data.app.theme), tw``]}>
                    {reports.alltime.feePrice}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

export default Reports;
