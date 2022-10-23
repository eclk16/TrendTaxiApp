import {StyleSheet} from 'react-native';

export const useTheme = StyleSheet.create({
    dark: {
        bg: {
            backgroundColor: 'rgba(15, 54, 94,1)',
        },
        bg2: {
            backgroundColor: 'rgba(16,107,172,.5)',
            borderWidth: 0.5,
            borderColor: 'rgba(16,107,172,.5)',
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
            backgroundColor: 'rgba(235,235,235,1)',
        },
        bg2: {
            backgroundColor: 'rgba(255,255,255,.7)',
            borderWidth: 0.5,
            borderColor: 'rgba(16,107,172,.2)',
        },
        text: {
            color: 'rgba(15, 54, 94,1)',
            fontFamily: 'Poppins-Regular',
        },
        text: {
            color: 'rgba(15, 54, 94,.7)',
            fontFamily: 'Poppins-Regular',
        },
    },
});

export function stil(get, theme = 'light') {
    return useTheme[theme][get];
}
