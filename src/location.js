import Geolocation from 'react-native-geolocation-service';
import {Alert, Linking, PermissionsAndroid, Platform, ToastAndroid} from 'react-native';

const hasPermissionIOS = async () => {
    const openSetting = () => {
        Linking.openSettings().catch(() => {
            Alert.alert('Unable to open settings');
        });
    };
    const status = await Geolocation.requestAuthorization('whenInUse');

    if (status === 'granted') {
        return true;
    }

    Alert.alert(`Turn on Location Services to allow "Trend Taxi" to determine your location.`, '', [
        {text: 'Go to Settings', onPress: openSetting},
        {text: "Don't Use Location", onPress: () => {}},
    ]);

    return false;
};

const hasLocationPermission = async () => {
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
        Alert.alert(
            `Turn on Location Services to allow "Trend Taxi" to determine your location.`,
            '',
            [
                {
                    text: 'Go to Settings',
                    onPress: () => {
                        Linking.openSettings();
                    },
                },
                {text: "Don't Use Location", onPress: () => {}},
            ],
        );

        ToastAndroid.show('Location permission denied by user.', ToastAndroid.LONG);
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        Alert.alert(
            `Turn on Location Services to allow "Trend Taxi" to determine your location.`,
            '',
            [
                {
                    text: 'Go to Settings',
                    onPress: () => {
                        Linking.openSettings();
                    },
                },
                {text: "Don't Use Location", onPress: () => {}},
            ],
        );
        ToastAndroid.show('Location permission revoked by user.', ToastAndroid.LONG);
    }

    return false;
};

export const izinal = async () => {
    if (Platform.OS === 'android') {
        const hasPermission = await hasLocationPermission();
        console.log(hasPermission);
        return hasPermission;
    } else {
        const hasPermission = await hasPermissionIOS();
        console.log(hasPermission);
        return hasPermission;
    }
};
