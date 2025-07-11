import React, { useState } from 'react';
import { Text, Dimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import GradientBackground from '../GradientBackground';

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
    { key: 'readings', title: 'Meter Readings' },
    { key: 'payments', title: 'Payments' },
    { key: 'tenants', title: 'Tenants' },
    { key: 'maintenance', title: 'Maintenance' },
  ]);

  const renderScene = SceneMap({
    overview: OwnerOverviewSection,
    readings: OwnerReadingsSection,
    payments: OwnerPaymentsSection,
    tenants: OwnerTenantsSection,
    maintenance: MaintenanceRequestsScreen,
  });

  return (
    <GradientBackground>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        renderTabBar={props => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: '#ff3e55' }}
            style={{ backgroundColor: '#fff' }}
            activeColor="#ff3e55"
            inactiveColor="#000"
            scrollEnabled={true}
          />
        )}
      />
    </GradientBackground>
  );
};

export default OwnerDashboardScreen;