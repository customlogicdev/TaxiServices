import apiClient from './apiClient';
import API_ENDPOINTS from '../../config/apiEndpoints';
import { CarType, CarTypeFormData, PaginatedCarTypeResponse } from '../../types';

export const carTypeService = {
  // Get all car types (paginated)
  getAll: async (page: number = 0, size: number = 10): Promise<PaginatedCarTypeResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.CAR_TYPES.BASE, {
      params: { page, size, sort: 'carTypeId,asc' },
    });
    return response.data;
  },

  // Get by ID
  getById: async (id: number): Promise<CarType> => {
    const response = await apiClient.get(API_ENDPOINTS.CAR_TYPES.BY_ID(id));
    return response.data;
  },

  // Get by slug
  getBySlug: async (slug: string): Promise<CarType> => {
    const response = await apiClient.get(API_ENDPOINTS.CAR_TYPES.BY_SLUG(slug));
    return response.data;
  },

  // Create
  create: async (data: CarTypeFormData): Promise<CarType> => {
    const response = await apiClient.post(API_ENDPOINTS.CAR_TYPES.BASE, data);
    return response.data;
  },

  // Update
  update: async (id: number, data: Partial<CarTypeFormData>): Promise<CarType> => {
    const response = await apiClient.put(API_ENDPOINTS.CAR_TYPES.BY_ID(id), data);
    return response.data;
  },

  // Delete
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.CAR_TYPES.BY_ID(id));
  },

  // Toggle status
  toggleStatus: async (id: number): Promise<CarType> => {
    const response = await apiClient.patch(API_ENDPOINTS.CAR_TYPES.TOGGLE_STATUS(id));
    return response.data;
  },

  // Get active
  getActive: async (): Promise<CarType[]> => {
    const response = await apiClient.get(API_ENDPOINTS.CAR_TYPES.ACTIVE);
    return response.data;
  },

  // Check slug
  checkSlug: async (slug: string): Promise<boolean> => {
    const response = await apiClient.get(API_ENDPOINTS.CAR_TYPES.CHECK_SLUG(slug));
    return response.data;
  },

  // Get count
  getCount: async (): Promise<number> => {
    const response = await apiClient.get(API_ENDPOINTS.CAR_TYPES.COUNT);
    return response.data;
  },
};