import Geolocation from '@react-native-community/geolocation';
import {Alert, Linking, PermissionsAndroid, Platform} from 'react-native';

const openSetting = () => {
    Linking.openSettings().catch(() => {
        Alert.alert('Unable to open settings');
    });
};

const hasPermissionIOS = async () => {
    const status = await Geolocation.requestAuthorization('whenInUse');

    if (status === 'granted') {
        return true;
    }

    if (status === 'denied') {
        Alert.alert('Location permission denied');
    }

    if (status === 'disabled') {
        Alert.alert(
            `Turn on Location Services to allow "TrendTaxi" to determine your location.`,
            '',
            [
                {text: 'Go to Settings', onPress: openSetting},
                {text: "Don't Use Location", onPress: () => {}},
            ],
        );
    }

    return false;
};

const hasLocationPermission = async () => {
    if (Platform.OS === 'ios') {
        const hasPermission = await hasPermissionIOS();
        return hasPermission;
    }

    if (Platform.OS === 'android' && Platform.Version < 23) {
        return true;
    }

    const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (hasPermission) {
        return true;
    }

    const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (status === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
    }

    if (status === PermissionsAndroid.RESULTS.DENIED) {
        alert('Location permission denied by user.');
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        alert('Location permission revoked by user.');
    }

    return false;
};

export const myCurrentLocation = async (locationTitle = false) => {
    const hasPermission = await hasLocationPermission();
    Geolocation.getCurrentPosition(
        (position) => {
            if (locationTitle) {
            } else {
                return {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                };
            }
            console.log(position);
        },
        (error) => {
            return false;
            // Alert.alert(`Code ${error.code}`, error.message);
            console.log(error);
        },
        {
            accuracy: {
                android: 'high',
                ios: 'best',
            },
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
            distanceFilter: 0,
            forceRequestLocation: true,
            forceLocationManager: false,
            showLocationDialog: true,
        },
    );
};
