import React, { useState } from 'react';
import { Text, Dimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

// Fallback OwnerOverviewSection if not yet implemented
import OwnerOverviewSection from './OwnerOverviewSection';
import OwnerReadingsSection from './OwnerReadingsSection';
import OwnerPaymentsSection from './OwnerPaymentsSection';
import OwnerTenantsSection from './OwnerTenantsSection';

const initialLayout = { width: Dimensions.get('window').width };

type RouteType = { key: string; title: string };

const OwnerDashboardScreen = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState<RouteType[]>([
    { key: 'overview', title: 'Overview' },
    { key: 'readings', title: 'Meter Readings' },
    { key: 'payments', title: 'Payments' },
    { key: 'tenants', title: 'Tenants' },
  ]);

  const renderScene = SceneMap({
    overview: OwnerOverviewSection,
    readings: OwnerReadingsSection,
    payments: OwnerPaymentsSection,
    tenants: OwnerTenantsSection,
  });

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={initialLayout}
      renderTabBar={props => (
        <TabBar
          {...props}
          indicatorStyle={{ backgroundColor: '#007AFF' }}
          style={{ backgroundColor: '#fff' }}
          activeColor="#000"
          inactiveColor="#000"
          labelStyle={{ fontWeight: 'bold' }}
        />
    
      )}
    />
  );
};

export default OwnerDashboardScreen;