import apiClient from './apiClient';
import API_ENDPOINTS from '../../config/apiEndpoints';
import { Booking, Car } from '../../types';

export const dashboardService = {
  // Get today's bookings
  getTodayBookings: async (): Promise<Booking[]> => {
    const today = new Date().toISOString().split('T')[0];
    const response = await apiClient.get(API_ENDPOINTS.BOOKINGS.BY_DATE(today));
    return response.data;
  },

  // Get recent bookings
  getRecentBookings: async (limit: number = 5): Promise<Booking[]> => {
    const response = await apiClient.get(API_ENDPOINTS.BOOKINGS.RECENT(limit));
    return response.data;
  },

  // Get all bookings (paginated)
  getAllBookings: async (page: number = 0, size: number = 10) => {
    const response = await apiClient.get(API_ENDPOINTS.BOOKINGS.BASE, {
      params: { page, size, sort: 'createdAt,desc' },
    });
    return response.data;
  },

  // Get booking count
  getBookingCount: async (): Promise<number> => {
    const response = await apiClient.get(API_ENDPOINTS.BOOKINGS.COUNT);
    return response.data;
  },

  // Get today's booking count
  getTodayBookingCount: async (): Promise<number> => {
    const today = new Date().toISOString().split('T')[0];
    const response = await apiClient.get(API_ENDPOINTS.BOOKINGS.COUNT_BY_DATE(today));
    return response.data;
  },

  // Get all cars
  getAllCars: async () => {
    const response = await apiClient.get(API_ENDPOINTS.CARS.BASE, {
      params: { page: 0, size: 100 },
    });
    return response.data;
  },

  // Get car count
  getCarCount: async (): Promise<number> => {
    const response = await apiClient.get(API_ENDPOINTS.CARS.COUNT);
    return response.data;
  },

  // Get featured cars
  getFeaturedCars: async (): Promise<Car[]> => {
    const response = await apiClient.get(API_ENDPOINTS.CARS.FEATURED);
    return response.data;
  },
};