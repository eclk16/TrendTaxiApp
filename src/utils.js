import {StyleSheet} from 'react-native';

export const useTheme = StyleSheet.create({
    dark:{
        bg:{
            backgroundColor:'rgba(15, 54, 94,1)',
        },
        bg2:{
            backgroundColor:'rgba(16,107,172,.4)',
            borderWidth:.5,
            borderColor:'rgba(16,107,172,.5)',
        },
        text:{
            color:'rgba(194,228,255,1)',
            fontFamily:'Poppins-Regular'
        }
    },
    light:{
        bg:{
            backgroundColor:'rgba(235,235,235,1)'
        },
        bg2:{
            backgroundColor:'rgba(255,255,255,.8)',
            borderWidth:.5,
            borderColor:'rgba(16,107,172,.2)'
        },
        text:{
            color:'rgba(15, 54, 94,1)',
            fontFamily:'Poppins-Regular'
        }
    }
});

export function stil(get,theme = 'light'){
    return useTheme[theme][get];
}