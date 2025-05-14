import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { ownerService } from '../../services/api';
import LinearGradient from 'react-native-linear-gradient';
import { Surface } from 'react-native-paper';

const OwnerTenantsSection = () => {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchTenants = () => {
    setLoading(true);
    ownerService.getTenants()
      .then(setTenants)
      .catch(e => Alert.alert('Error', e.response?.data?.error || 'Failed to load tenants'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleDelete = (id: number) => {
    Alert.alert(
      'Delete Tenant',
      'Are you sure you want to delete this tenant? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(id);
            try {
              await ownerService.deleteTenant(id);
              Alert.alert('Success', 'Tenant deleted');
              fetchTenants();
            } catch (e: any) {
              Alert.alert('Error', e.response?.data?.error || 'Failed to delete tenant');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <LinearGradient colors={["#ff914d", "#ff3e55"]} style={styles.gradient}>
      <Surface style={styles.container}>
        <Text style={styles.title}>Tenants</Text>
        <FlatList
          data={tenants}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.tenantCard}>
              <Text style={styles.tenantName}>{item.name}</Text>
              <Text style={styles.label}>ID: <Text style={styles.value}>{item.tenant_id}</Text></Text>
              <Text style={styles.label}>Rent: <Text style={styles.value}>₹{item.rent_amount}</Text></Text>
              <Text style={styles.label}>Status: <Text style={styles.value}>{item.status || 'Active'}</Text></Text>
              <TouchableOpacity
                style={[styles.deleteButton, deletingId === item.id && { opacity: 0.5 }]}
                onPress={() => handleDelete(item.id)}
                disabled={deletingId === item.id}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.noTenantsText}>No tenants found.</Text>}
        />
      </Surface>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    letterSpacing: 1,
  },
  tenantCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 4,
  },
  tenantName: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#ff3e55',
    marginBottom: 4,
  },
  label: {
    color: '#ff3e55',
    fontWeight: 'bold',
  },
  value: {
    color: '#333',
    fontWeight: 'normal',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noTenantsText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
});

export default OwnerTenantsSection;