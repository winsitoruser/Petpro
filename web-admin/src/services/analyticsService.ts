import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

const API_URL = `${API_BASE_URL}/analytics`;

/**
 * Fetch customer growth statistics
 * @param startDate Start date in YYYY-MM-DD format
 * @param endDate End date in YYYY-MM-DD format
 * @param interval Time interval for grouping data (day, week, month)
 */
export const fetchCustomerGrowth = async (
  startDate: string,
  endDate: string,
  interval: string = 'day'
) => {
  try {
    const response = await axios.get(`${API_URL}/customer-growth`, {
      params: { startDate, endDate, interval },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching customer growth data:', error);
    throw error;
  }
};

/**
 * Fetch customer activity statistics
 * @param startDate Start date in YYYY-MM-DD format
 * @param endDate End date in YYYY-MM-DD format
 * @param interval Time interval for grouping data (day, week, month)
 */
export const fetchCustomerActivity = async (
  startDate: string,
  endDate: string,
  interval: string = 'day'
) => {
  try {
    const response = await axios.get(`${API_URL}/customer-activity`, {
      params: { startDate, endDate, interval },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching customer activity data:', error);
    throw error;
  }
};

/**
 * Fetch customer demographics data
 */
export const fetchCustomerDemographics = async () => {
  try {
    const response = await axios.get(`${API_URL}/customer-demographics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customer demographics data:', error);
    throw error;
  }
};

/**
 * Fetch service usage metrics
 * @param startDate Start date in YYYY-MM-DD format
 * @param endDate End date in YYYY-MM-DD format
 */
export const fetchServiceUsage = async (
  startDate: string,
  endDate: string
) => {
  try {
    const response = await axios.get(`${API_URL}/service-usage`, {
      params: { startDate, endDate },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching service usage data:', error);
    throw error;
  }
};

/**
 * Fetch customer retention metrics
 */
export const fetchRetentionMetrics = async () => {
  try {
    const response = await axios.get(`${API_URL}/customer-retention`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customer retention metrics:', error);
    throw error;
  }
};

/**
 * Fetch activities by user ID
 * @param userId User ID
 * @param page Page number
 * @param limit Items per page
 * @param types Activity types to filter by
 * @param startDate Start date in YYYY-MM-DD format
 * @param endDate End date in YYYY-MM-DD format
 */
export const fetchUserActivities = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
  types?: string[],
  startDate?: string,
  endDate?: string
) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/activities/user/${userId}`, {
      params: { page, limit, types, startDate, endDate },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user activities:', error);
    throw error;
  }
};

/**
 * Fetch recent activities across all users (admin only)
 * @param page Page number
 * @param limit Items per page
 * @param types Activity types to filter by
 * @param startDate Start date in YYYY-MM-DD format
 * @param endDate End date in YYYY-MM-DD format
 * @param userId Optional user ID to filter by
 */
export const fetchRecentActivities = async (
  page: number = 1,
  limit: number = 10,
  types?: string[],
  startDate?: string,
  endDate?: string,
  userId?: string
) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/activities/recent`, {
      params: { page, limit, types, startDate, endDate, userId },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
};

/**
 * Fetch activity statistics
 * @param groupBy Group by period (day, week, month)
 * @param startDate Start date in YYYY-MM-DD format
 * @param endDate End date in YYYY-MM-DD format
 */
export const fetchActivityStatistics = async (
  groupBy: string = 'day',
  startDate?: string,
  endDate?: string
) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/activities/statistics`, {
      params: { groupBy, startDate, endDate },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching activity statistics:', error);
    throw error;
  }
};
