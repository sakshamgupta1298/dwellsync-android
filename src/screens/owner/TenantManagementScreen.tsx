import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TenantManagementScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tenant Management Screen (To be implemented)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    color: '#333',
  },
});

export default TenantManagementScreen;