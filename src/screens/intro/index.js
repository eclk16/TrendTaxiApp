import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';
import {stil} from '../../utils';
import tw from 'twrnc';
import l from '../../languages.json';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {View, Image} from 'react-native';
import StatusBarComponent from '../../components/global/status';

export default function Intro() {
    const data = useSelector((state) => state);
    return (
        <View style={[tw` flex-1`]}>
            <StatusBarComponent />
            <Image
                source={require('../../assets/img/intro/intro1-1.jpg')}
                style={[
                    tw`w-full h-1/2`,
                    {
                        resizeMode: 'cover',
                        // borderBottomRightRadius: 250,
                    },
                ]}
            />
        </View>
    );
}
