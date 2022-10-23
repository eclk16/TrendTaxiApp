import React from 'react';
import {Image, View, ActivityIndicator} from 'react-native';
import {useSelector} from 'react-redux';
import {stil} from '../../utils';
import StatusBarComponent from './status';
export default function Loading() {
    const data = useSelector((state) => state);
    return (
        <View
            style={[
                {flex: 1, alignItems: 'center', justifyContent: 'center'},
                stil('bg', data.app.theme),
            ]}>
            <StatusBarComponent />
            <Image
                style={{
                    height: '50%',
                    width: '100%',
                    opacity: 0.4,
                    position: 'absolute',
                    zIndex: -1000,
                }}
                resizeMode="contain"
                source={
                    data.app.theme == 'dark'
                        ? require('../../assets/img/uzbekistanBGA.png')
                        : require('../../assets/img/uzbekistanBGR.png')
                }
            />
            <ActivityIndicator size="large" style={{zIndex: 9999}}></ActivityIndicator>
        </View>
    );
}
