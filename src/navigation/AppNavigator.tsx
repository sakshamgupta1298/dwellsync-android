import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../utils/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import OwnerRegisterScreen from '../screens/auth/OwnerRegisterScreen';
import TenantRegisterScreen from '../screens/auth/TenantRegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';

// Tenant Screens
import TenantDashboardScreen from '../screens/tenant/DashboardScreen';
import MeterReadingScreen from '../screens/tenant/MeterReadingScreen';
import PaymentHistoryScreen from '../screens/tenant/PaymentHistoryScreen';
import TenantProfileScreen from '../screens/tenant/ProfileScreen';
import { MaintenanceRequestScreen } from '../screens/tenant/MaintenanceRequestScreen';
import MaintenanceHistoryScreen from '../screens/tenant/MaintenanceHistoryScreen';
import PaymentScreen from '../screens/PaymentScreen';

// Owner Screens
import OwnerDashboardScreen from '../screens/owner/DashboardScreen';
import TenantManagementScreen from '../screens/owner/TenantManagementScreen';
import BillManagementScreen from '../screens/owner/BillManagementScreen';
import PaymentTrackingScreen from '../screens/owner/PaymentTrackingScreen';
import { MaintenanceRequestsScreen } from '../screens/owner/MaintenanceRequestsScreen';

import LandingScreen from '../screens/LandingScreen';
import LoginSelectionScreen from '../screens/LoginSelectionScreen';

import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsAndConditionsScreen from '../screens/TermsAndConditionsScreen';
import AboutUsScreen from '../screens/AboutUsScreen';

// Define navigation param types
type RootStackParamList = {
  Landing: undefined;
  LoginSelection: undefined;
  OwnerLogin: undefined;
  TenantLogin: undefined;
  OwnerRegister: undefined;
  TenantRegister: undefined;
  ForgotPassword: undefined;
  OTPVerification: { email: string };
  ResetPassword: { email: string };
  OwnerDashboard: undefined;
  TenantManagement: undefined;
  BillManagement: undefined;
  PaymentTracking: undefined;
  MaintenanceRequests: undefined;
  TenantDashboard: undefined;
  MeterReading: undefined;
  PaymentHistory: undefined;
  TenantProfile: undefined;
  MaintenanceRequest: undefined;
  MaintenanceHistory: undefined;
  Payment: {
    rentAmount: number;
    propertyId: string;
    tenantId: string;
  };
  PrivacyPolicy: undefined;
  TermsAndConditions: undefined;
  AboutUs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          // Auth Stack
          <>
            <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }} />
            <Stack.Screen name="LoginSelection" component={LoginSelectionScreen} options={{ headerShown: false }} />
            <Stack.Screen name="OwnerLogin"
              options={{ headerShown: false }}
            >
              {props => <LoginScreen {...props} showRegister={true} />}
            </Stack.Screen>
            <Stack.Screen name="TenantLogin"
              options={{ headerShown: false }}
            >
              {props => <LoginScreen {...props} showRegister={false} />}
            </Stack.Screen>
            <Stack.Screen name="OwnerRegister" component={OwnerRegisterScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="TenantRegister" component={TenantRegisterScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: false, title: 'Privacy Policy' }} />
            <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} options={{ headerShown: false, title: 'Terms and Conditions' }} />
            <Stack.Screen name="AboutUs" component={AboutUsScreen} options={{ headerShown: false, title: 'About Us' }} />
          </>
        ) : user.is_owner ? (
          // Owner Stack
          <>
            <Stack.Screen name="OwnerDashboard" component={OwnerDashboardScreen} options={{ headerShown: false }} />
            <Stack.Screen name="TenantManagement" component={TenantManagementScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="BillManagement" component={BillManagementScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="PaymentTracking" component={PaymentTrackingScreen} options={{ headerShown: false }}/>
            <Stack.Screen 
              name="MaintenanceRequests" 
              component={MaintenanceRequestsScreen} 
              options={{ 
                headerShown: true,
                title: 'Maintenance Requests',
                headerStyle: {
                  backgroundColor: '#fff',
                },
                headerTintColor: '#000',
              }}
            />
          </>
        ) : (
          // Tenant Stack
          <>
            <Stack.Screen name="TenantDashboard" component={TenantDashboardScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="MeterReading" component={MeterReadingScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} options={{ headerShown: false }} />
            <Stack.Screen name="TenantProfile" component={TenantProfileScreen} options={{ headerShown: false }} />
            <Stack.Screen 
              name="MaintenanceRequest" 
              component={MaintenanceRequestScreen} 
              options={{ 
                headerShown: false,
                title: 'Submit Maintenance Request',
                headerStyle: {
                  backgroundColor: '#fff',
                },
                headerTintColor: '#000',
              }}
            />
            <Stack.Screen 
              name="MaintenanceHistory" 
              component={MaintenanceHistoryScreen} 
              options={{ 
                headerShown: false,
                title: 'Maintenance History',
                headerStyle: {
                  backgroundColor: '#fff',
                },
                headerTintColor: '#000',
              }}
            />
            <Stack.Screen 
              name="Payment" 
              component={PaymentScreen} 
              options={{
                headerShown: true,
                title: 'Make Payment',
                headerStyle: {
                  backgroundColor: '#141414', // NETFLIX_BG
                },
                headerTintColor: '#fff', // White for text/icons
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 