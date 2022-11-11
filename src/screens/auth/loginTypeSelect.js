import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {stil} from '../../utils';
import tw from 'twrnc';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import l from '../../languages.json';
import {izinal} from '../../location';
//burayafont yükle gelecek

import {Text, TouchableOpacity, View} from 'react-native';
function LoginTypeSelect({setStep}) {
    const dispatch = useDispatch();
    const data = useSelector((state) => state);

    const setle = () => {
        setStep(5);
    };
    return (
        <>
            <View style={[tw`mx-4`]}>
                <TouchableOpacity
                    key={0}
                    style={[
                        stil('bg', data.app.theme),
                        tw`flex-row items-center mb-1 p-4 rounded-md justify-center`,
                    ]}
                    onPress={() => {
                        izinal();
                        dispatch({type: 'setType', payload: 'driver'});
                        setle();
                    }}>
                    <View style={[tw`flex-row items-center justify-between `]}>
                        <MaterialCommunityIcons
                            name="car-arrow-right"
                            size={32}
                            color={stil('text', data.app.theme).color}
                        />
                        <Text style={[tw`font-bold ml-2`, stil('text', data.app.theme)]}>
                            {l[data.app.lang].driver}
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    key={1}
                    style={[
                        stil('bg', data.app.theme),
                        tw`flex-row items-center mb-1 p-4 rounded-md justify-center`,
                    ]}
                    onPress={() => {
                        izinal();
                        dispatch({type: 'setType', payload: 'passenger'});
                        setle();
                    }}>
                    <View style={[tw`flex-row items-center justify-between `]}>
                        <MaterialCommunityIcons
                            name="human-greeting"
                            size={32}
                            color={stil('text', data.app.theme).color}
                        />
                        <Text style={[tw` font-bold  ml-2`, stil('text', data.app.theme)]}>
                            {l[data.app.lang].passenger}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </>
    );
}

export default LoginTypeSelect;
