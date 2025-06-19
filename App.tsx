/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/utils/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { Provider as PaperProvider } from 'react-native-paper';
import { Alert, Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CAMERA_PERMISSION_KEY = 'camera_permission_requested';

const requestCameraPermission = async () => {
  const alreadyRequested = await AsyncStorage.getItem(CAMERA_PERMISSION_KEY);
  if (alreadyRequested) return;

  let permission;
  if (Platform.OS === 'ios') {
    permission = PERMISSIONS.IOS.CAMERA;
  } else {
    permission = PERMISSIONS.ANDROID.CAMERA;
  }

  const result = await request(permission);
  await AsyncStorage.setItem(CAMERA_PERMISSION_KEY, 'true');

  if (result !== RESULTS.GRANTED) {
    Alert.alert(
      'Camera Permission',
      'Camera access is required to use this feature. Please enable it in settings.'
    );
  }
};

function App(): React.JSX.Element {
  useEffect(() => {
    requestCameraPermission();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
