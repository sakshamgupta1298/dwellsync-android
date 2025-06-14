import React, { useState, useEffect } from 'react';
import { Text, Dimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import GradientBackground from '../GradientBackground';
import { socketService } from '../../services/socket';
import { showMessage } from 'react-native-flash-message';

// Fallback OwnerOverviewSection if not yet implemented
import OwnerOverviewSection from './OwnerOverviewSection';
import OwnerReadingsSection from './OwnerReadingsSection';
import OwnerPaymentsSection from './OwnerPaymentsSection';
import OwnerTenantsSection from './OwnerTenantsSection';
import { MaintenanceRequestsScreen } from './MaintenanceRequestsScreen';

const initialLayout = { width: Dimensions.get('window').width };

type RouteType = { key: string; title: string };

const OwnerDashboardScreen = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState<RouteType[]>([
    { key: 'overview', title: 'Overview' },
    { key: 'readings', title: 'Readings' },
    { key: 'payments', title: 'Payments' },
    { key: 'tenants', title: 'Tenants' },
    { key: 'maintenance', title: 'Maintenance' },
  ]);

  useEffect(() => {
    // Initialize socket connection
    socketService.initialize();

    // Listen for maintenance notifications
    const unsubscribe = socketService.onMaintenanceNotification((notification) => {
      if (notification.type === 'new_request') {
        showMessage({
          message: 'New Maintenance Request',
          description: notification.message,
          type: 'info',
          duration: 5000,
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const renderScene = SceneMap({
    overview: OwnerOverviewSection,
    readings: OwnerReadingsSection,
    payments: OwnerPaymentsSection,
    tenants: OwnerTenantsSection,
    maintenance: MaintenanceRequestsScreen,
  });

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: '#E50914' }}
      style={{ backgroundColor: '#141414' }}
      labelStyle={{ color: '#fff' }}
    />
  );

  return (
    <GradientBackground>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        renderTabBar={renderTabBar}
      />
    </GradientBackground>
  );
};

export default OwnerDashboardScreen;