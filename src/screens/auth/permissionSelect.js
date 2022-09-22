import React from 'react';
import {useSelector} from 'react-redux';
import {stil} from '../../utils';
import tw from 'twrnc';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import l from '../../languages.json';

import {izinal} from '../../location';
MaterialCommunityIcons.loadFont();

import {Text, TouchableOpacity, View, Alert} from 'react-native';

function PermissionSelect() {
    const data = useSelector((state) => state);
    const [myLocation, SetMyLocation] = React.useState(null);

    return (
        <>
            <Text style={[tw`mb-6 text-center font-medium`, stil('text', data.app.theme)]}>
                {l[data.app.lang].izinVer}
            </Text>
            <Text style={[tw`my-2 text-xs text-center mx-4`, stil('text', data.app.theme)]}>
                {l[data.app.lang].konummesaj}
            </Text>
            <View style={[tw`m-4 flex justify-center rounded-md`]}>
                <TouchableOpacity
                    key={0}
                    style={[
                        stil('bg', data.app.theme),
                        tw`flex-row items-center mx-4 mb-1 p-4 rounded-md justify-between`,
                    ]}
                    onPress={() => {
                        Alert.alert(
                            l[data.app.lang].konumizin,
                            l[data.app.lang].konumizin2,
                            [
                                {
                                    text: l[data.app.lang].cancel,
                                    onPress: () => console.log('Cancel Pressed'),
                                    style: 'cancel',
                                },
                                {
                                    text: l[data.app.lang].next,
                                    onPress: () => {
                                        izinal();
                                        SetMyLocation(1);
                                    },
                                },
                            ],
                            {cancelable: false},
                        );
                    }}>
                    <View style={[tw`flex-row items-center justify-between `]}>
                        <MaterialCommunityIcons
                            name="map-marker-radius"
                            size={32}
                            color={stil('text', data.app.theme).color}
                        />
                        <Text style={[tw`  ml-4`, stil('text', data.app.theme)]}>
                            {l[data.app.lang].devam}
                        </Text>
                    </View>
                    <View style={tw`flex-row justify-end items-end`}>
                        {myLocation ? (
                            <MaterialCommunityIcons
                                name="check-circle-outline"
                                size={32}
                                color={stil('text', data.app.theme).color}
                            />
                        ) : null}
                    </View>
                </TouchableOpacity>
            </View>
        </>
    );
}

export default PermissionSelect;
