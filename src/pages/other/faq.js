import React,{useEffect} from 'react';
import axios from 'axios';
import {useSelector} from 'react-redux';
import {TouchableOpacity,View,Text, ScrollView} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import { stil } from '../../utils';
MaterialCommunityIcons.loadFont();

function Faq() {
    const [acik,setAcik] = React.useState(false);
    const data = useSelector(state => state);
    const [theme, setTheme] = React.useState(data.app.currentTheme);
    const [lang, setLang] = React.useState(data.app.currentLanguage);


    useEffect(() => {
        getSss();
    }, []);
    const [sss,setSss] = React.useState([]);
    const getSss = () => {
        axios.defaults.headers.common["Accept"] = "application/json";
        axios.defaults.headers.common["Content-Type"] = "application/json";
        axios.get('https://trendtaxi.uz/api/getSss',{lang:data.app.currentLanguage})
        .then(response => {
            if(!response.data.data.hata) {
                setSss(response.data.data);
            }
            else{
            }
        })
        .catch(error => {
            console.log(error);
        });
    }

    return (
      <ScrollView style={[stil('bg',data.app.theme),tw`p-4 flex-1`]}>
        {sss.map((item,index) => {
            return (
                <View key={index}>
                    <TouchableOpacity key={index} onPress={() => setAcik(acik == index ? 999 : index)}>
                        <View style={[tw`rounded-md mb-2 flex-row justify-between items-center p-3`,stil('bg2',data.app.theme)]}>
                            <Text style={[tw` text-base mb-1 ml-2 `,stil('text',data.app.theme)]}>
                                {item.sss_title}
                            </Text>
                            <MaterialCommunityIcons name={acik == index ? 'chevron-up' : 'chevron-down'} size={24} color={stil('text',data.app.theme).color}/>
                        </View>
                    </TouchableOpacity>
                    {acik == index ?
                        <View style={[tw`flex `]}>
                            <View style={[tw` px-2 pb-4`]}>
                                <Text style={[tw`flex-row text-sm`,stil('text',data.app.theme)]}>
                                    {item.sss_description}
                                </Text>
                            </View>
                    </View>
                    : null }
                </View>
            )
        })}
      </ScrollView>
    );
};

export default Faq;