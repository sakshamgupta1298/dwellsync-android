import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { ownerService } from '../../services/api';

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
    <View style={styles.container}>
      <Text style={styles.title}>Tenants</Text>
      <FlatList
        data={tenants}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.tenantCard}>
            <Text style={styles.tenantName}>{item.name}</Text>
            <Text>ID: {item.tenant_id}</Text>
            <Text>Rent: ₹{item.rent_amount}</Text>
            <Text>Status: {item.status || 'Active'}</Text>
            <TouchableOpacity
              style={[styles.deleteButton, deletingId === item.id && { opacity: 0.5 }]}
              onPress={() => handleDelete(item.id)}
              disabled={deletingId === item.id}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text>No tenants found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  tenantCard: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, elevation: 1 },
  tenantName: { fontWeight: 'bold', fontSize: 16 },
  deleteButton: { backgroundColor: '#e74c3c', borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 10 },
  deleteButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default OwnerTenantsSection;