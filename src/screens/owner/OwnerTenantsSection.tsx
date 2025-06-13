import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import { ownerService } from '../../services/api';
import { Surface } from 'react-native-paper';

const NETFLIX_BG = '#141414';
const NETFLIX_CARD = '#232323';
const NETFLIX_RED = '#E50914';
const NETFLIX_GRAY = '#b3b3b3';

const { width } = Dimensions.get('window');

const OwnerTenantsSection = () => {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTenants = () => {
    setLoading(true);
    ownerService.getTenants()
      .then(setTenants)
      .catch(e => Alert.alert('Error', e.response?.data?.error || 'Failed to load tenants'))
      .finally(() => setLoading(false));
  };

  const onRefresh = () => {
    setRefreshing(true);
    ownerService.getTenants()
      .then(setTenants)
      .catch(e => Alert.alert('Error', e.response?.data?.error || 'Failed to load tenants'))
      .finally(() => setRefreshing(false));
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
    <View style={{ flex: 1, backgroundColor: NETFLIX_BG }}>
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: NETFLIX_CARD,
    padding: width * 0.05,
    borderRadius: 24,
    marginBottom: width * 0.045,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#222',
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  tenantName: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#fff',
    marginBottom: 4,
  },
  label: {
    color: NETFLIX_GRAY,
    fontWeight: 'bold',
    fontSize: 15,
  },
  value: {
    color: '#fff',
    fontWeight: 'normal',
    fontSize: 15,
  },
  deleteButton: {
    backgroundColor: NETFLIX_RED,
    borderRadius: 32,
    paddingVertical: 10,
    paddingHorizontal: 28,
    alignItems: 'center',
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  noTenantsText: {
    color: NETFLIX_GRAY,
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
});

export default OwnerTenantsSection;