import React from 'react';
import {View} from 'react-native';

export default function Harita({props,children}){
    return (
      <View {...props}>
        {children}
      </View>
    )
}
