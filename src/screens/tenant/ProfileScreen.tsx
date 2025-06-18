import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { authService } from '../../services/api';
import { useAuth } from '../../utils/AuthContext';

// Netflix theme colors
const NETFLIX_BG = '#141414';
const NETFLIX_CARD = '#232323';
const NETFLIX_RED = '#E50914';
const NETFLIX_GRAY = '#b3b3b3';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  request?: any;
}

const ProfileScreen = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      await authService.changePassword(currentPassword, newPassword);
      Alert.alert('Success', 'Password updated successfully');
      // Clear the form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Change password error:', error);
      const apiError = error as ApiError;
      Alert.alert('Error', apiError.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Manage your account settings</Text>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{user?.name}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Tenant ID</Text>
            <Text style={styles.infoValue}>{user?.tenant_id}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Change Password</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Current Password"
            placeholderTextColor={NETFLIX_GRAY}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />
          
          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor={NETFLIX_GRAY}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            placeholderTextColor={NETFLIX_GRAY}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleChangePassword}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Updating..." : "Update Password"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NETFLIX_BG,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  card: {
    backgroundColor: NETFLIX_CARD,
    borderRadius: 8,
    padding: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: NETFLIX_GRAY,
    marginBottom: 20,
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: NETFLIX_GRAY,
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 4,
    padding: 15,
    marginBottom: 15,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: NETFLIX_RED,
    borderRadius: 4,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;