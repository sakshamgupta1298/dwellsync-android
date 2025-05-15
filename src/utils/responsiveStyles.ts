import { Dimensions, StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';

const { width, height } = Dimensions.get('window');

// Responsive scaling factors
export const scale = {
  width: (size: number) => width * (size / 375), // 375 is base width (iPhone 8)
  height: (size: number) => height * (size / 812), // 812 is base height (iPhone 8)
  font: (size: number) => width * (size / 375),
};

// Common responsive styles
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: scale.width(16),
  },
  card: {
    backgroundColor: '#fff',
    padding: scale.width(16),
    borderRadius: scale.width(12),
    marginBottom: scale.height(16),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: scale.font(24),
    fontWeight: 'bold',
    marginBottom: scale.height(16),
  },
  subtitle: {
    fontSize: scale.font(18),
    fontWeight: '600',
    marginBottom: scale.height(12),
  },
  text: {
    fontSize: scale.font(16),
    marginBottom: scale.height(8),
  },
  smallText: {
    fontSize: scale.font(14),
    marginBottom: scale.height(4),
  },
  button: {
    padding: scale.width(12),
    borderRadius: scale.width(8),
    marginVertical: scale.height(8),
  },
  input: {
    height: scale.height(48),
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: scale.width(8),
    paddingHorizontal: scale.width(12),
    marginBottom: scale.height(16),
    fontSize: scale.font(16),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale.height(8),
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ff3e55',
    fontSize: scale.font(14),
    marginTop: scale.height(4),
  },
  successText: {
    color: '#4CAF50',
    fontSize: scale.font(14),
    marginTop: scale.height(4),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale.width(20),
  },
  emptyStateText: {
    fontSize: scale.font(16),
    color: '#666',
    textAlign: 'center',
    marginTop: scale.height(8),
  },
});

// Screen-specific responsive styles
export const screenStyles = {
  auth: {
    container: {
      flex: 1,
      padding: scale.width(20),
      justifyContent: 'center' as const,
    },
    logo: {
      width: scale.width(120),
      height: scale.width(120),
      marginBottom: scale.height(32),
      alignSelf: 'center' as const,
    },
    form: {
      width: '100%',
      maxWidth: scale.width(400),
      alignSelf: 'center' as const,
    },
  },
  dashboard: {
    container: {
      flex: 1,
      padding: scale.width(16),
    },
    card: {
      ...commonStyles.card,
      marginBottom: scale.height(16),
    },
    statContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    statCard: {
      width: width > 600 ? '48%' : '100%',
      marginBottom: scale.height(16),
    },
  },
  meterReading: {
    container: {
      flex: 1,
      padding: scale.width(16),
    },
    imagePreview: {
      width: '100%',
      height: scale.height(200),
      borderRadius: scale.width(12),
      marginBottom: scale.height(16),
    },
    cameraButton: {
      width: scale.width(60),
      height: scale.width(60),
      borderRadius: scale.width(30),
      backgroundColor: '#ff3e55',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      bottom: scale.height(20),
      right: scale.width(20),
    },
  },
  payments: {
    container: {
      flex: 1,
      padding: scale.width(16),
    },
    paymentCard: {
      ...commonStyles.card,
      marginBottom: scale.height(16),
    },
    amount: {
      fontSize: scale.font(20),
      fontWeight: 'bold',
      marginBottom: scale.height(8),
    },
    date: {
      fontSize: scale.font(14),
      color: '#666',
    },
  },
};

export default {
  scale,
  commonStyles,
  screenStyles,
}; 