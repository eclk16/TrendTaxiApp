import React,{useEffect} from 'react';
import axios from 'axios';
import {useSelector} from 'react-redux';
import {ActivityIndicator,View,Text, ScrollView} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import { stil } from '../../utils';
MaterialCommunityIcons.loadFont();

function Reports() {
    const data = useSelector(state => state);
    const [reports,setReports] = React.useState([]);
    const [loading,setLoading] = React.useState(true);
    useEffect(() => {
        setLoading(true);
        getTrips(data.auth.userId,data.auth.userToken,data.auth.userType);
    },[])

    const getTrips = (id,userToken,type) => {
        setLoading(true);
        axios.defaults.headers.common["Accept"] = "application/json";
        axios.defaults.headers.common["Content-Type"] = "application/json";
        axios.defaults.headers.common["Authorization"] = "Bearer "+userToken;
        axios.post('https://trendtaxi.uz/api/getTrips',{
            who:type+'_id',
            id:id,
            lang:data.app.lang,
            getReports:1
        })
        .then(response => {
            if(!response.data.data.hata) {
               setReports(response.data.data);
               console.log(response.data.data);
            }
            else{
            }
            setLoading(false);
        })
        .catch(error => {
            console.log(error);
            setLoading(false);
        });
    }

    return (
      <ScrollView style={[stil('bg',data.app.theme),tw`p-2 flex-1`]}>
        {loading ? <ActivityIndicator size="large"/> : <>
            <View style={[tw`flex-row `]}>
                <View style={[tw`p-2 w-1/1`]}>
                    <View style={[tw`  rounded-md p-4 flex`,stil('bg2',data.app.theme)]}>
                        <Text style={[stil('text',data.app.theme),stil('bg',data.app.theme),tw`text-center rounded-md p-2 font-medium text-xl mb-2`]}>Daily</Text>
                        <View style={[tw`flex-row justify-between items-center border-b-2 pb-1`,{borderColor:stil('bg',data.app.theme).backgroundColor}]}>
                            <Text style={[stil('text',data.app.theme),tw`font-medium text-base`]}>Count</Text>
                            <Text style={[stil('text',data.app.theme),tw` text-base`]}>{reports.day.count}</Text>
                        </View>
                        <View style={[tw`flex-row justify-between items-center border-b-2 pb-1`,{borderColor:stil('bg',data.app.theme).backgroundColor}]}>
                            <Text style={[stil('text',data.app.theme),tw`font-medium text-base`]}>Kilometer</Text>
                            <Text style={[stil('text',data.app.theme),tw` text-base`]}>{reports.day.km}</Text>
                        </View>
                        <View style={[tw`flex-row justify-between items-center border-b-2 pb-1`,{borderColor:stil('bg',data.app.theme).backgroundColor}]}>
                            <Text style={[stil('text',data.app.theme),tw`font-medium text-base`]}>Time</Text>
                            <Text style={[stil('text',data.app.theme),tw` text-base`]}>{reports.day.time}</Text>
                        </View>
                        <View style={[tw`flex justify-between items-center border-b-2 pb-1`,{borderColor:stil('bg',data.app.theme).backgroundColor}]}>
                            <Text style={[stil('text',data.app.theme),tw`font-medium text-base`]}>Price</Text>
                            <Text style={[stil('text',data.app.theme),tw` text-base`]}>{reports.day.price}</Text>
                        </View>
                        <View style={[tw`flex-row justify-between items-center pb-1`,{borderColor:stil('bg',data.app.theme).backgroundColor}]}>
                            <Text style={[stil('text',data.app.theme),tw`font-medium text-base`]}>Fee</Text>
                            <Text style={[stil('text',data.app.theme),tw` text-base`]}>{reports.day.feePrice}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={[tw`flex-row mt-4`]}>
                
                <View style={[tw`p-2 w-1/2`]}>
                    <View style={[tw`  rounded-md p-4 flex`,stil('bg2',data.app.theme)]}>
                        <Text style={[stil('text',data.app.theme),stil('bg',data.app.theme),tw`text-center rounded-md p-2 font-medium text-xl mb-2`]}>Yesterday</Text>
                        <View style={[tw`flex-row justify-between items-center border-b-2 pb-1`,{borderColor:stil('bg',data.app.theme).backgroundColor}]}>
                            <Text style={[stil('text',data.app.theme),tw`font-medium text-base`]}>Count</Text>
                            <Text style={[stil('text',data.app.theme),tw` text-base`]}>{reports.yesterday.count}</Text>
                        </View>
                        <View style={[tw`flex-row justify-between items-center border-b-2 pb-1`,{borderColor:stil('bg',data.app.theme).backgroundColor}]}>
                            <Text style={[stil('text',data.app.theme),tw`font-medium text-base`]}>Kilometer</Text>
                            <Text style={[stil('text',data.app.theme),tw` text-base`]}>{reports.yesterday.km}</Text>
                        </View>
                        <View style={[tw`flex-row justify-between items-center border-b-2 pb-1`,{borderColor:stil('bg',data.app.theme).backgroundColor}]}>
                            <Text style={[stil('text',data.app.theme),tw`font-medium text-base`]}>Time</Text>
                            <Text style={[stil('text',data.app.theme),tw` text-base`]}>{reports.yesterday.time}</Text>
                        </View>
                        <View style={[tw`flex justify-between items-center border-b-2 pb-1`,{borderColor:stil('bg',data.app.theme).backgroundColor}]}>
                            <Text style={[stil('text',data.app.theme),tw`font-medium text-base`]}>Price</Text>
                            <Text style={[stil('text',data.app.theme),tw` text-base`]}>{reports.yesterday.price}</Text>
                        </View>
                        <View style={[tw`flex-row justify-between items-center pb-1`,{borderColor:stil('bg',data.app.theme).backgroundColor}]}>
                            <Text style={[stil('text',data.app.theme),tw`font-medium text-base`]}>Fee</Text>
                            <Text style={[stil('text',data.app.theme),tw` text-base`]}>{reports.yesterday.feePrice}</Text>
                        </View>
                    </View>
                </View>
                <View style={[tw`p-2 w-1/2`]}>
                    <View style={[tw`  rounded-md  p-4 flex`,stil('bg2',data.app.theme)]}>
                        <Text style={[stil('text',data.app.theme),stil('bg',data.app.theme),tw`text-center rounded-md p-2 font-medium text-xl mb-2`]}>Weekly</Text>
                        <View style={[tw`flex-row justify-between items-center border-b-2 pb-1`,{borderColor:stil('bg',data.app.theme).backgroundColor}]}>
                            <Text style={[stil('text',data.app.theme),tw`font-medium text-base`]}>Count</Text>
                            <Text style={[stil('text',data.app.theme),tw` text-base`]}>{reports.week.count}</Text>
                        </View>
                        <View style={[tw`flex-row justify-between items-center border-b-2 pb-1`,{borderColor:stil('bg',data.app.theme).backgroundColor}]}>
                            <Text style={[stil('text',data.app.theme),tw`font-medium text-base`]}>Kilometer</Text>
                            <Text style={[stil('text',data.app.theme),tw` text-base`]}>{reports.week.km}</Text>
                        </View>
                        <View style={[tw`flex-row justify-between items-center border-b-2 pb-1`,{borderColor:stil('bg',data.app.theme).backgroundColor}]}>
                            <Text style={[stil('text',data.app.theme),tw`font-medium text-base`]}>Time</Text>
                            <Text style={[stil('text',data.app.theme),tw` text-base`]}>{reports.week.time}</Text>
                        </View>
                        <View style={[tw`flex justify-between items-center border-b-2 pb-1`,{borderColor:stil('bg',data.app.theme).backgroundColor}]}>
                            <Text style={[stil('text',data.app.theme),tw`font-medium text-base`]}>Price</Text>
                            <Text style={[stil('text',data.app.theme),tw` text-base`]}>{reports.week.price}</Text>
                        </View>
                        <View style={[tw`flex-row justify-between items-center pb-1`,{borderColor:stil('bg',data.app.theme).backgroundColor}]}>
                            <Text style={[stil('text',data.app.theme),tw`font-medium text-base`]}>Fee</Text>
                            <Text style={[stil('text',data.app.theme),tw` text-base`]}>{reports.week.feePrice}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={[tw`flex-row mt-4`]}>
                <View style={[tw`p-2 w-1/2`]}>
                    <View style={[tw`  rounded-md p-4 flex`,stil('bg2',data.app.theme)]}>
                        <Text style={[stil('text',data.app.theme),stil('bg',data.app.theme),tw`text-center rounded-md p-2 font-medium text-xl mb-2`]}>Monthly</Text>
                        <View style={[tw`flex-row justify-between items-center border-b-2 pb-1`,{borderColor:stil('bg',data.app.theme).backgroundColor}]}>
                            <Text style={[stil('text',data.app.theme),tw`font-medium text-base`]}>Count</Text>
                            <Text style={[stil('text',data.app.theme),tw` text-base`]}>{reports.month.count}</Text>
                        </View>
                        <View style={[tw`flex-row justify-between items-center border-b-2 pb-1`,{borderColor:stil('bg',data.app.theme).backgroundColor}]}>
                            <Text style={[stil('text',data.app.theme),tw`font-medium text-base`]}>Kilometer</Text>
                            <Text style={[stil('text',data.app.theme),tw` text-base`]}>{reports.month.km}</Text>
                        </View>
                        <View style={[tw`flex-row justify-between items-center border-b-2 pb-1`,{borderColor:stil('bg',data.app.theme).backgroundColor}]}>
                            <Text style={[stil('text',data.app.theme),tw`font-medium text-base`]}>Time</Text>
                            <Text style={[stil('text',data.app.theme),tw` text-base`]}>{reports.month.time}</Text>
                        </View>
                        <View style={[tw`flex justify-between items-center border-b-2 pb-1`,{borderColor:stil('bg',data.app.theme).backgroundColor}]}>
                            <Text style={[stil('text',data.app.theme),tw`font-medium text-base`]}>Price</Text>
                            <Text style={[stil('text',data.app.theme),tw` text-base`]}>{reports.month.price}</Text>
                        </View>
                        <View style={[tw`flex-row justify-between items-center pb-1`,{borderColor:stil('bg',data.app.theme).backgroundColor}]}>
                            <Text style={[stil('text',data.app.theme),tw`font-medium text-base`]}>Fee</Text>
                            <Text style={[stil('text',data.app.theme),tw` text-base`]}>{reports.month.feePrice}</Text>
                        </View>
                    </View>
                </View>
                <View style={[tw`p-2 w-1/2`]}>
                    <View style={[tw` rounded-md p-4 flex`,stil('bg2',data.app.theme)]}>
                        <Text style={[stil('text',data.app.theme),stil('bg',data.app.theme),tw`text-center rounded-md p-2 font-medium text-xl mb-2`]}>Yearly</Text>
                        <View style={[tw`flex-row justify-between items-center border-b-2 pb-1`,{borderColor:stil('bg',data.app.theme).backgroundColor}]}>
                            <Text style={[stil('text',data.app.theme),tw`font-medium text-base`]}>Count</Text>
                            <Text style={[stil('text',data.app.theme),tw` text-base`]}>{reports.year.count}</Text>
                        </View>
                        <View style={[tw`flex-row justify-between items-center border-b-2 pb-1`,{borderColor:stil('bg',data.app.theme).backgroundColor}]}>
                            <Text style={[stil('text',data.app.theme),tw`font-medium text-base`]}>Kilometer</Text>
                            <Text style={[stil('text',data.app.theme),tw` text-base`]}>{reports.year.km}</Text>
                        </View>
                        <View style={[tw`flex-row justify-between items-center border-b-2 pb-1`,{borderColor:stil('bg',data.app.theme).backgroundColor}]}>
                            <Text style={[stil('text',data.app.theme),tw`font-medium text-base`]}>Time</Text>
                            <Text style={[stil('text',data.app.theme),tw` text-base`]}>{reports.year.time}</Text>
                        </View>
                        <View style={[tw`flex justify-between items-center border-b-2 pb-1`,{borderColor:stil('bg',data.app.theme).backgroundColor}]}>
                            <Text style={[stil('text',data.app.theme),tw`font-medium text-base`]}>Price</Text>
                            <Text style={[stil('text',data.app.theme),tw` text-base`]}>{reports.year.price}</Text>
                        </View>
                        <View style={[tw`flex-row justify-between items-center pb-1`,{borderColor:stil('bg',data.app.theme).backgroundColor}]}>
                            <Text style={[stil('text',data.app.theme),tw`font-medium text-base`]}>Fee</Text>
                            <Text style={[stil('text',data.app.theme),tw` text-base`]}>{reports.year.feePrice}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={[tw`flex-row mt-4`]}>
                <View style={[tw`p-2 w-1/1`]}>
                    <View style={[tw`  rounded-md p-4 flex`,stil('bg2',data.app.theme)]}>
                        <Text style={[stil('text',data.app.theme),stil('bg',data.app.theme),tw`text-center rounded-md p-2 font-medium text-xl mb-2`]}>All Time</Text>
                        <View style={[tw`flex-row justify-between items-center border-b-2 pb-1`,{borderColor:stil('bg',data.app.theme).backgroundColor}]}>
                            <Text style={[stil('text',data.app.theme),tw`font-medium text-base`]}>Count</Text>
                            <Text style={[stil('text',data.app.theme),tw` text-base`]}>{reports.alltime.count}</Text>
                        </View>
                        <View style={[tw`flex-row justify-between items-center border-b-2 pb-1`,{borderColor:stil('bg',data.app.theme).backgroundColor}]}>
                            <Text style={[stil('text',data.app.theme),tw`font-medium text-base`]}>Kilometer</Text>
                            <Text style={[stil('text',data.app.theme),tw` text-base`]}>{reports.alltime.km}</Text>
                        </View>
                        <View style={[tw`flex-row justify-between items-center border-b-2 pb-1`,{borderColor:stil('bg',data.app.theme).backgroundColor}]}>
                            <Text style={[stil('text',data.app.theme),tw`font-medium text-base`]}>Time</Text>
                            <Text style={[stil('text',data.app.theme),tw` text-base`]}>{reports.alltime.time}</Text>
                        </View>
                        <View style={[tw`flex justify-between items-center border-b-2 pb-1`,{borderColor:stil('bg',data.app.theme).backgroundColor}]}>
                            <Text style={[stil('text',data.app.theme),tw`font-medium text-base`]}>Price</Text>
                            <Text style={[stil('text',data.app.theme),tw` text-base`]}>{reports.alltime.price}</Text>
                        </View>
                        <View style={[tw`flex-row justify-between items-center pb-1`,{borderColor:stil('bg',data.app.theme).backgroundColor}]}>
                            <Text style={[stil('text',data.app.theme),tw`font-medium text-base`]}>Fee</Text>
                            <Text style={[stil('text',data.app.theme),tw` text-base`]}>{reports.alltime.feePrice}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </> }
      </ScrollView>
    );
};

export default Reports;