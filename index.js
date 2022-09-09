/**
 * @format
 */
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';
import AppWrapper from './App';

AppRegistry.registerComponent(appName, () => AppWrapper);
