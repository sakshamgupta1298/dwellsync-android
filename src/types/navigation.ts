export type RootStackParamList = {
  Landing: undefined;
  LoginSelection: undefined;
  OwnerLogin: undefined;
  TenantLogin: undefined;
  OwnerRegister: undefined;
  TenantRegister: undefined;
  PasswordReset: undefined;
  OwnerDashboard: undefined;
  TenantManagement: undefined;
  BillManagement: undefined;
  PaymentTracking: undefined;
  MaintenanceRequests: undefined;
  TenantDashboard: undefined;
  MeterReading: undefined;
  PaymentHistory: undefined;
  TenantProfile: undefined;
  MaintenanceRequest: undefined;
  MaintenanceHistory: undefined;
  Payment: {
    rentAmount: number;
    propertyId: string;
    tenantId: string;
  };
  // Add other screens as needed
}; 