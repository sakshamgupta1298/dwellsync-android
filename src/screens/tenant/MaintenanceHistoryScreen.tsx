import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { maintenanceService } from '../../services/maintenanceService';
import { MaintenanceRequest, MaintenanceStatus } from '../../types/maintenance';
import LinearGradient from 'react-native-linear-gradient';
import { Surface } from 'react-native-paper';

const MaintenanceHistoryScreen = () => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await maintenanceService.getTenantRequests();
      console.log('Maintenance requests data:', JSON.stringify(data, null, 2));
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      Alert.alert('Error', 'Failed to fetch maintenance requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      Alert.alert(
        'Approve Completion',
        'Are you sure you want to approve this maintenance work as completed?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Approve',
            onPress: async () => {
              console.log('Approving request with ID:', requestId, typeof requestId);
              await maintenanceService.approveRequest(String(parseInt(requestId, 10)));

              fetchRequests();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to approve request');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      Alert.alert(
        'Reject Completion',
        'Are you sure you want to reject this maintenance work as completed?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reject',
            onPress: async () => {
              await maintenanceService.rejectRequest(String(parseInt(requestId, 10)));
              fetchRequests();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to reject request');
    }
  };

  const getStatusColor = (status: MaintenanceStatus) => {
    switch (status) {
      case 'pending':
        return '#e67e22';
      case 'in_progress':
        return '#3498db';
      case 'completed':
        return '#2ecc71';
      case 'closed':
        return '#95a5a6';
      default:
        return '#95a5a6';
    }
  };

  const formatDate = (dateString: string) => {
    console.log('Raw date string:', dateString);
    try {
      const date = new Date(dateString);
      console.log('Parsed date:', date);
      if (isNaN(date.getTime())) {
        console.log('Invalid date detected');
        return 'Date not available';
      }
      // Only return the date part
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      console.log('Formatted date:', formattedDate);
      return formattedDate;
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Date not available';
    }
  };

  const renderRequest = ({ item }: { item: MaintenanceRequest }) => {
    console.log('Rendering request:', item.id, 'with date:', item.createdAt);
    return (
      <Surface style={styles.card}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
          Status: {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
        <Text style={styles.date}>Requested on: {formatDate(item.createdAt)}</Text>
        {item.status === 'completed' && item.isApprovedByTenant && (
          <Text style={styles.approved}>You have approved this completion</Text>
        )}
        {item.status === 'completed' && !item.isApprovedByTenant && (
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#2ecc71' }]}
              onPress={() => handleApprove(item.id)}
            >
              <Text style={styles.buttonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#e74c3c' }]}
              onPress={() => handleReject(item.id)}
            >
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </Surface>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={["#ff914d", "#ff3e55"]} style={styles.gradient}>
        <StatusBar barStyle="light-content" backgroundColor="#ff3e55" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#ff914d", "#ff3e55"]} style={styles.gradient}>
      <StatusBar barStyle="light-content" backgroundColor="#ff3e55" />
      <View style={styles.container}>
        <Text style={styles.header}>Your Maintenance Requests</Text>
        <FlatList
          data={requests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.empty}>No maintenance requests found.</Text>}
        />
      </View>
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
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 22,
    elevation: 5,
    shadowColor: '#ff3e55',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff3e55',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  approved: {
    fontSize: 14,
    color: '#2ecc71',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
  },
  empty: {
    marginTop: 40,
    textAlign: 'center',
    color: '#fff',
  },
});

export default MaintenanceHistoryScreen; 