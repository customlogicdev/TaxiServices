// src/services/carTypeService.ts
import apiClient from './apiClient';
import { CarType, CarTypeFormData, PaginatedCarTypeResponse } from '../types';
import API_ENDPOINTS from '../config/apiEndpoints'; // ✅ Import karo

export const carTypeService = {
  getAll: async (page: number = 0, size: number = 10): Promise<PaginatedCarTypeResponse> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CAR_TYPES.BASE, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch car types:', error);
      return {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: 10,
        number: 0,
        last: true,
        first: true,
        empty: true,
      };
    }
  },

  create: async (data: CarTypeFormData): Promise<CarType> => {
    const response = await apiClient.post(API_ENDPOINTS.CAR_TYPES.BASE, data);
    return response.data;
  },

  update: async (id: number, data: Partial<CarTypeFormData>): Promise<CarType> => {
    const response = await apiClient.put(API_ENDPOINTS.CAR_TYPES.BY_ID(id), data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.CAR_TYPES.BY_ID(id));
  },

  // ✅ PUT method + API_ENDPOINTS use karo
  toggleStatus: async (id: number): Promise<CarType> => {
    const response = await apiClient.put(API_ENDPOINTS.CAR_TYPES.TOGGLE_STATUS(id));
    return response.data;
  },
};

// // src/services/carTypeService.ts
// import apiClient from './apiClient';
// import { CarType, CarTypeFormData, PaginatedCarTypeResponse } from '../types';

// export const carTypeService = {
//   getAll: async (page: number = 0, size: number = 10): Promise<PaginatedCarTypeResponse> => {
//     try {
//       const response = await apiClient.get(`/car-types?page=${page}&size=${size}`);
//       return response.data;
//     } catch (error) {
//       console.error('Failed to fetch car types, using mock data:', error);
//       return {
//         content: [
//           { carTypeId: 1, carCategoryName: 'Sedan', slug: 'sedan', isActive: true, createdAt: '2024-01-01', updatedAt: null },
//           { carTypeId: 2, carCategoryName: 'SUV', slug: 'suv', isActive: true, createdAt: '2024-01-02', updatedAt: null },
//           { carTypeId: 3, carCategoryName: 'Luxury', slug: 'luxury', isActive: true, createdAt: '2024-01-03', updatedAt: null },
//           { carTypeId: 4, carCategoryName: 'Van', slug: 'van', isActive: false, createdAt: '2024-01-04', updatedAt: null },
//         ],
//         totalPages: 1,
//         totalElements: 4,
//         size: 10,
//         number: 0,
//         last: true,
//         first: true,
//         empty: false,
//       };
//     }
//   },

//   create: async (data: CarTypeFormData): Promise<CarType> => {
//     const response = await apiClient.post('/car-types', data);
//     return response.data;
//   },

//   update: async (id: number, data: Partial<CarTypeFormData>): Promise<CarType> => {
//     const response = await apiClient.put(`/car-types/${id}`, data);
//     return response.data;
//   },

//   delete: async (id: number): Promise<void> => {
//     await apiClient.delete(`/car-types/${id}`);
//   },

//   toggleStatus: async (id: number): Promise<CarType> => {
//     const response = await apiClient.patch(`/car-types/${id}/toggle-status`);
//     return response.data;
//   },
// };
// // // src/services/carTypeService.ts
// // import apiClient from './apiClient';
// // import { CarType, CarTypeFormData, PaginatedCarTypeResponse } from '../types';

// // export const carTypeService = {
// //   // Get all car types with pagination
// //   getAll: async (page: number = 0, size: number = 10): Promise<PaginatedCarTypeResponse> => {
// //     try {
// //       const response = await apiClient.get<PaginatedCarTypeResponse>(`/car-types?page=${page}&size=${size}`);
// //       // Extract data from Axios response
// //       return response.data || response;
// //     } catch (error) {
// //       console.error('Failed to fetch car types:', error);
// //       // Return mock data if API fails
// //       return {
// //         content: [
// //           { carTypeId: 1, carCategoryName: 'Sedan', slug: 'sedan', isActive: true, createdAt: '2024-01-01', updatedAt: null },
// //           { carTypeId: 2, carCategoryName: 'SUV', slug: 'suv', isActive: true, createdAt: '2024-01-02', updatedAt: null },
// //           { carTypeId: 3, carCategoryName: 'Luxury', slug: 'luxury', isActive: true, createdAt: '2024-01-03', updatedAt: null },
// //           { carTypeId: 4, carCategoryName: 'Van', slug: 'van', isActive: false, createdAt: '2024-01-04', updatedAt: null },
// //         ],
// //         totalPages: 1,
// //         totalElements: 4,
// //         size: 10,
// //         number: 0,
// //         last: true,
// //         first: true,
// //         empty: false,
// //       };
// //     }
// //   },

// //   // Get car type by ID
// //   getById: async (id: number): Promise<CarType> => {
// //     const response = await apiClient.get<CarType>(`/car-types/${id}`);
// //     return response.data || response;
// //   },

// //   // Create new car type
// //   create: async (data: CarTypeFormData): Promise<CarType> => {
// //     const response = await apiClient.post<CarType>('/car-types', data);
// //     return response.data || response;
// //   },

// //   // Update car type
// //   update: async (id: number, data: Partial<CarTypeFormData>): Promise<CarType> => {
// //     const response = await apiClient.put<CarType>(`/car-types/${id}`, data);
// //     return response.data || response;
// //   },

// //   // Delete car type
// //   delete: async (id: number): Promise<void> => {
// //     await apiClient.delete(`/car-types/${id}`);
// //   },

// //   // Toggle active/inactive status
// //   toggleStatus: async (id: number): Promise<CarType> => {
// //     const response = await apiClient.patch<CarType>(`/car-types/${id}/toggle-status`);
// //     return response.data || response;
// //   },

// //   // Get active car types only
// //   getActive: async (): Promise<CarType[]> => {
// //     const response = await apiClient.get<CarType[]>('/car-types/active');
// //     return response.data || response;
// //   },

// //   // Check if slug exists
// // //   checkSlug: async (slug: string): Promise<boolean> => {
// // //     const response = await apiClient.get<boolean>(`/car-types/check-slug?slug=${slug}`);
// // //     return response.data || response;
// // //   },

// // //   // Get total count
// // //   getCount: async (): Promise<number> => {
// // //     const response = await apiClient.get<number>('/car-types/count');
// // //     return response.data || response;
// // //   },
// // };