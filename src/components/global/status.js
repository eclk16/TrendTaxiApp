import React from 'react';
import { StatusBar } from 'react-native';
import { useTheme } from '../../utils';
import {useSelector} from 'react-redux';

function StatusBarComponent() {
    const data = useSelector(state => state);
    return ( <StatusBar backgroundColor={useTheme[data.app.theme].bg.backgroundColor} barStyle={data.app.theme == 'dark' ? 'light-content' : 'dark-content'} /> );
};

export default StatusBarComponent;