import {StyleSheet} from 'react-native';

export const useTheme = StyleSheet.create({
    dark: {
        bg: {
            backgroundColor: '#122f57',
        },
        bg2: {
            backgroundColor: 'rgba(10, 44, 80,1)',
            // borderWidth: 0.5,
            // borderColor: 'rgba(16,107,172,.5)',
        },
        shadow: {
            // shadowColor: 'rgba(10,44,80,1)',
            // shadowOffset: {
            //     width: 2,
            //     height: 2,
            // },
            // shadowOpacity: 1,
            // shadowRadius: 10.0,
            // elevation: 24,
        },
        text: {
            color: 'rgba(194,228,255,1)',
            fontFamily: 'Poppins-Regular',
        },
        text2: {
            color: 'rgba(194,228,255,.7)',
            fontFamily: 'Poppins-Regular',
        },
    },
    light: {
        bg: {
            backgroundColor: '#122f57',
        },
        bg2: {
            backgroundColor: 'rgba(10, 44, 80,1)',
            // borderWidth: 0.5,
            // borderColor: 'rgba(16,107,172,.5)',
        },
        shadow: {},
        text: {
            color: 'rgba(194,228,255,1)',
            fontFamily: 'Poppins-Regular',
        },
        text2: {
            color: 'rgba(194,228,255,.7)',
            fontFamily: 'Poppins-Regular',
        },
    },
    light2: {
        bg: {
            backgroundColor: 'rgba(235,235,235,1)',
        },
        bg2: {
            backgroundColor: 'rgba(255,255,255,1)',
            // borderWidth: 0.5,
            // borderColor: 'rgba(16,107,172,.2)',
        },
        shadow: {
            shadowColor: 'rgba(15, 54, 94,1)',
            shadowOffset: {
                width: 0.5,
                height: 0.5,
            },
            shadowOpacity: 0.9,
            shadowRadius: 0.0,

            elevation: 24,
        },
        text: {
            color: 'rgba(15, 54, 94,1)',
            fontFamily: 'Poppins-Regular',
        },
        text2: {
            color: 'rgba(15, 54, 94,.7)',
            fontFamily: 'Poppins-Regular',
        },
    },
});

export function stil(get, theme = 'light') {
    return useTheme[theme][get];
}
