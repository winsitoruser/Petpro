// Types for Customer Analytics data

// Growth data types
export interface GrowthDataPoint {
  date: string;
  count: number;
}

// Activity data types
export interface ActivityDataPoint {
  date: string;
  activity_type: string;
  count: number;
}

// Demographics data types
export interface PetTypeData {
  type: string;
  count: number;
}

export interface UserActivity {
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  activity_count: number;
}

export interface DemographicsData {
  petTypesData: PetTypeData[];
  topActiveUsers: UserActivity[];
}

// Service usage data types
export interface ServiceTypeBooking {
  service_type: string;
  count: number;
}

export interface MonthlyRevenue {
  month: string;
  total_amount: string;
}

export interface ServiceUsageData {
  bookingsByType: ServiceTypeBooking[];
  monthlyRevenue: MonthlyRevenue[];
}

// Retention data types
export interface RetentionByMonth {
  month: string;
  retention_rate: number;
  total_users: number;
}

export interface CustomerWithBookings {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  booking_count: number;
}

export interface RetentionData {
  retentionByMonth: RetentionByMonth[];
  customersWithMultipleBookings: CustomerWithBookings[];
}

// Chart data types
export interface ChartDataset {
  label?: string;
  data: number[];
  borderColor?: string | string[];
  backgroundColor?: string | string[];
  borderWidth?: number;
  yAxisID?: string;
}

export interface LineChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface PieChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface BarChartData {
  labels: string[];
  datasets: ChartDataset[];
}
