import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();

import PassengerCreate from './passenger/create';
import PassengerWait from './passenger/wait';
import PassengerTrip from './passenger/trip';

import DriverRegister from './driver/register';
import DriverWait from './driver/wait';
import DriverGoPassenger from './driver/goPassenger';
import DriverTrip from './driver/trip';

import StatusBarComponent from '../../components/global/status';

import {useNavigation} from '@react-navigation/native';

function Kontrol() {
    const navigation = useNavigation();

    const data = useSelector((state) => state);
    const [initRout, setInitRoute] = React.useState('Control');

    useEffect(() => {
        if (data.auth.user.user_status == 0) {
            navigation.navigate('Register');
        } else if (data.trip.trip != null) {
            if (data.trip.trip.status == 2) {
                navigation.navigate('Wait');
            } else if (data.trip.trip.status == 3) {
                navigation.navigate('Trip');
            }
        } else {
            navigation.navigate('Create');
        }
    });
    return <></>;
}

export default function Home() {
    const data = useSelector((state) => state);
    const [initRout, setInitRoute] = React.useState('Control');

    return (
        <>
            <StatusBarComponent />
            <NavigationContainer independent={true} initialRouteName={initRout}>
                <Stack.Navigator>
                    <Stack.Screen
                        name="Control"
                        component={Kontrol}
                        options={{headerShown: false}}
                    />
                    <Stack.Screen
                        name="Create"
                        component={data.auth.userType == 'passenger' ? PassengerCreate : DriverWait}
                        options={{headerShown: false}}
                    />
                    <Stack.Screen
                        name="Wait"
                        component={
                            data.auth.userType == 'passenger' ? PassengerWait : DriverGoPassenger
                        }
                        options={{headerShown: false}}
                    />
                    <Stack.Screen
                        name="Trip"
                        component={data.auth.userType == 'passenger' ? PassengerTrip : DriverTrip}
                        options={{headerShown: false}}
                    />
                    <Stack.Screen
                        name="Register"
                        component={DriverRegister}
                        options={{headerShown: false}}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </>
    );
}
