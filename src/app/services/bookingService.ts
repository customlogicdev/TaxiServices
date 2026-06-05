import apiClient from './apiClient';
import API_ENDPOINTS from '../../config/apiEndpoints';
import { Booking, BookingFormData, PaginatedBookingResponse } from '../../types';

export const bookingService = {
  // Create Booking
  createBooking: async (data: BookingFormData): Promise<Booking> => {
    const response = await apiClient.post(API_ENDPOINTS.BOOKINGS.BASE, data);
    return response.data;
  },

  // Get All Bookings (Paginated)
  getAllBookings: async (
    page: number = 0,
    size: number = 10,
    sort: string = 'createdAt,desc'
  ): Promise<PaginatedBookingResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.BOOKINGS.BASE, {
      params: { page, size, sort },
    });
    return response.data;
  },

  // Get Booking by ID
  getBookingById: async (id: number): Promise<Booking> => {
    const response = await apiClient.get(API_ENDPOINTS.BOOKINGS.BY_ID(id));
    return response.data;
  },

  // Get Booking by Number
  getBookingByNumber: async (bookingNumber: string): Promise<Booking> => {
    const response = await apiClient.get(
      API_ENDPOINTS.BOOKINGS.BY_NUMBER(bookingNumber)
    );
    return response.data;
  },

  // Update Booking
  updateBooking: async (
    id: number,
    data: Partial<BookingFormData>
  ): Promise<Booking> => {
    const response = await apiClient.put(
      API_ENDPOINTS.BOOKINGS.BY_ID(id),
      data
    );
    return response.data;
  },

  // Delete Booking
  deleteBooking: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.BOOKINGS.BY_ID(id));
  },

  // Search Bookings
  searchBookings: async (
    keyword: string,
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedBookingResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.BOOKINGS.SEARCH, {
      params: { keyword, page, size },
    });
    return response.data;
  },

  // Filter Bookings
  filterBookings: async (filters: {
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    carId?: number;
    pickupDate?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedBookingResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.BOOKINGS.FILTER, {
      params: filters,
    });
    return response.data;
  },

  // Get Bookings by Car
  getBookingsByCar: async (carId: number): Promise<Booking[]> => {
    const response = await apiClient.get(
      API_ENDPOINTS.BOOKINGS.BY_CAR(carId)
    );
    return response.data;
  },

  // Get Bookings by Date
  getBookingsByDate: async (date: string): Promise<Booking[]> => {
    const response = await apiClient.get(
      API_ENDPOINTS.BOOKINGS.BY_DATE(date)
    );
    return response.data;
  },

  // Get Bookings by Date Range
  getBookingsByDateRange: async (
    startDate: string,
    endDate: string
  ): Promise<Booking[]> => {
    const response = await apiClient.get(API_ENDPOINTS.BOOKINGS.DATE_RANGE, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Get Recent Bookings
  getRecentBookings: async (limit: number = 5): Promise<Booking[]> => {
    const response = await apiClient.get(
      API_ENDPOINTS.BOOKINGS.RECENT(limit)
    );
    return response.data;
  },

  // Get Total Bookings Count
  getTotalCount: async (): Promise<number> => {
    const response = await apiClient.get(API_ENDPOINTS.BOOKINGS.COUNT);
    return response.data;
  },

  // Get Booking Count by Date
  getCountByDate: async (date: string): Promise<number> => {
    const response = await apiClient.get(
      API_ENDPOINTS.BOOKINGS.COUNT_BY_DATE(date)
    );
    return response.data;
  },
};