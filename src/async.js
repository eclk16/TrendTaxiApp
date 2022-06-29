import AsyncStorage from '@react-native-async-storage/async-storage';

export const removeValue = async (key) => {
    try {
        AsyncStorage.removeItem(key);
    } catch (error) {
    }
}

export const setValue = async (key,value) => {
    try {
        await AsyncStorage.setItem(key,value).then(() => {
        });
    } catch (error) {
    }
}
export const getValue = async (key) => {
    try {
        let value = await AsyncStorage.getItem(key);
        return value;
        
    } catch (error) {
        return false;
    }
}