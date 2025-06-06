import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaintenanceRequest, MaintenanceStatus } from '../../types/maintenance';
import { useAuth } from '../../hooks/useAuth';
import { maintenanceService } from '../../services/maintenanceService';
import { socketService } from '../../services/socket';
import { showMessage } from 'react-native-flash-message';
import { Card, Title, Paragraph, Button, Chip, Portal, Modal, TextInput, Surface } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';

export const MaintenanceRequestsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');

  const fetchRequests = async () => {
    try {
      const data = await maintenanceService.getOwnerRequests();
      setRequests(data);
    } catch (error: any) {
      console.error('Fetch error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to fetch maintenance requests. Please try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    // Initialize socket connection
    socketService.initialize();

    // Listen for maintenance updates
    const unsubscribe = socketService.onMaintenanceUpdate((request) => {
      showMessage({
        message: 'New Maintenance Request',
        description: `New request from tenant ${request.tenantId}: ${request.title}`,
        type: 'info',
      });
      fetchRequests(); // Refresh the list
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleStatusUpdate = async (requestId: string, newStatus: MaintenanceStatus) => {
    try {
      console.log('Updating status for request:', requestId, 'to:', newStatus);
      
      if (newStatus === 'completed') {
        Alert.alert(
          'Complete Request',
          'Are you sure you want to mark this request as completed? The tenant will need to approve this.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Complete',
              onPress: async () => {
                try {
                  const response = await maintenanceService.updateRequestStatus(requestId, 'completed');
                  console.log('Status update response:', response);
                  showMessage({
                    message: 'Success',
                    description: 'Request marked as completed',
                    type: 'success',
                  });
                  fetchRequests();
                } catch (error: any) {
                  console.error('Error updating status:', error);
                  showMessage({
                    message: 'Error',
                    description: error.response?.data?.message || 'Failed to update status',
                    type: 'danger',
                  });
                }
              },
            },
          ]
        );
      } else {
        const response = await maintenanceService.updateRequestStatus(requestId, newStatus);
        console.log('Status update response:', response);
        showMessage({
          message: 'Success',
          description: `Request status updated to ${newStatus}`,
          type: 'success',
        });
        fetchRequests();
      }
    } catch (error: any) {
      console.error('Error in handleStatusUpdate:', error);
      showMessage({
        message: 'Error',
        description: error.response?.data?.message || 'Failed to update request status',
        type: 'danger',
      });
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
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date not available';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date not available';
    }
  };

  const renderRequest = ({ item }: { item: MaintenanceRequest }) => (
    <Surface style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.tenant}>Tenant: {item.tenantName || 'Unknown'}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
        Status: {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
      </Text>
      <Text style={styles.date}>Requested on: {formatDate(item.createdAt)}</Text>
      
      {item.status === 'completed' && item.isApprovedByTenant && (
        <Text style={styles.approved}>Approved by tenant</Text>
      )}
      
      {item.status !== 'closed' && (
        <View style={styles.buttonContainer}>
          {item.status === 'pending' && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#3498db' }]}
              onPress={() => handleStatusUpdate(item.id, 'in_progress')}>
              <Text style={styles.buttonText}>Start Work</Text>
            </TouchableOpacity>
          )}
          
          {item.status === 'in_progress' && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#2ecc71' }]}
              onPress={() => handleStatusUpdate(item.id, 'completed')}>
              <Text style={styles.buttonText}>Mark as Completed</Text>
            </TouchableOpacity>
          )}
          
          {item.status === 'completed' && item.isApprovedByTenant && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#95a5a6' }]}
              onPress={() => handleStatusUpdate(item.id, 'closed')}>
              <Text style={styles.buttonText}>Close Request</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Surface>
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRequests();
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
        <Text style={styles.header}>Maintenance Requests</Text>
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
  tenant: {
    fontSize: 16,
    color: '#666',
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
  approved: {
    fontSize: 14,
    color: '#2ecc71',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
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