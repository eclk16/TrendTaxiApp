import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import list from './components/global/menuList';
import {useSelector} from 'react-redux';
import l from './languages.json';
import Welcome from './screens/auth/welcome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {stil} from './utils';
import {TouchableOpacity} from 'react-native';
MaterialCommunityIcons.loadFont();

const Stack = createStackNavigator();

const Router = () => {
    const data = useSelector((state) => state);
    const [headerTitleCentered, setHeaderTitleCentered] = React.useState(true);
    return (
        <>
            {!data.auth.isAuth ? (
                <Welcome />
            ) : (
                <NavigationContainer initialRouteName="Home">
                    <Stack.Navigator>
                        {list.map((item, index) => {
                            return (
                                <Stack.Screen
                                    key={index}
                                    name={item.navigate}
                                    component={item.component}
                                    options={({navigation}) => ({
                                        headerMode: 'screen',
                                        headerShown: item.header,
                                        title: l[data.app.lang][item.text],
                                        headerTintColor: stil('text', data.app.theme).color,
                                        headerStyle: {
                                            backgroundColor: stil('bg', data.app.theme)
                                                .backgroundColor,
                                        },
                                        headerBackTitleVisible: false,
                                        headerTitleAlign: headerTitleCentered ? 'center' : 'left',
                                        headerRight: ({tintColor}) => (
                                            <>
                                                {item.navigate == 'Profile' ? (
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            navigation.navigate('ProfileEdit');
                                                        }}>
                                                        <MaterialCommunityIcons
                                                            name="pencil"
                                                            color={tintColor}
                                                            size={24}
                                                            style={{
                                                                marginHorizontal:
                                                                    Platform.OS === 'ios' ? 8 : 0,
                                                            }}
                                                        />
                                                    </TouchableOpacity>
                                                ) : null}
                                            </>
                                        ),
                                    })}
                                />
                            );
                        })}
                    </Stack.Navigator>
                </NavigationContainer>
            )}
        </>
    );
};

export default Router;
