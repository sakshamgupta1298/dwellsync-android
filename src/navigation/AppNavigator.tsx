import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../utils/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import OwnerRegisterScreen from '../screens/auth/OwnerRegisterScreen';
import TenantRegisterScreen from '../screens/auth/TenantRegisterScreen';

// Tenant Screens
import TenantDashboardScreen from '../screens/tenant/DashboardScreen';
import MeterReadingScreen from '../screens/tenant/MeterReadingScreen';
import PaymentHistoryScreen from '../screens/tenant/PaymentHistoryScreen';
import TenantProfileScreen from '../screens/tenant/ProfileScreen';

// Owner Screens
import OwnerDashboardScreen from '../screens/owner/DashboardScreen';
import TenantManagementScreen from '../screens/owner/TenantManagementScreen';
import BillManagementScreen from '../screens/owner/BillManagementScreen';
import PaymentTrackingScreen from '../screens/owner/PaymentTrackingScreen';

const Stack = createNativeStackNavigator();

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
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="OwnerRegister" component={OwnerRegisterScreen} />
            <Stack.Screen name="TenantRegister" component={TenantRegisterScreen} />
          </>
        ) : user.is_owner ? (
          // Owner Stack
          <>
            <Stack.Screen name="OwnerDashboard" component={OwnerDashboardScreen} />
            <Stack.Screen name="TenantManagement" component={TenantManagementScreen} />
            <Stack.Screen name="BillManagement" component={BillManagementScreen} />
            <Stack.Screen name="PaymentTracking" component={PaymentTrackingScreen} />
          </>
        ) : (
          // Tenant Stack
          <>
            <Stack.Screen name="TenantDashboard" component={TenantDashboardScreen} />
            <Stack.Screen name="MeterReading" component={MeterReadingScreen} />
            <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
            <Stack.Screen name="TenantProfile" component={TenantProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 