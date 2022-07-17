import React from 'react';
import { StatusBar } from 'react-native';
import { stil } from '../../utils';
import {useSelector} from 'react-redux';

function StatusBarComponent() {
    const data = useSelector(state => state);
    return ( <StatusBar backgroundColor={stil('bg',data.app.theme)} barStyle={data.app.theme == 'dark' ? 'light-content' : 'dark-content'} /> );
};

export default StatusBarComponent;