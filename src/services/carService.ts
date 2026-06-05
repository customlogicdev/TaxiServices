// services/carService.ts
import apiClient from './apiClient';
import API_ENDPOINTS from '../config/apiEndpoints';
import { Car, CarFormData, PaginatedCarResponse } from '../types';

export const carService = {
   
  // ✅ Toggle car status
  toggleStatus: async (carId: number): Promise<Car> => {
    const response = await apiClient.put(`/cars/${carId}/toggle-status`);
    return response.data;
  },

  // ✅ Set specific status
  setStatus: async (carId: number, status: string): Promise<Car> => {
    const response = await apiClient.put(`/cars/${carId}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  // ✅ Get active cars only
  getActiveCars: async (): Promise<Car[]> => {
    const response = await apiClient.get('/cars/active');
    return response.data;
  },

  getAll: async (page = 0, size = 12): Promise<PaginatedCarResponse> => {
    const res = await apiClient.get(API_ENDPOINTS.CARS.BASE, { 
      params: { page, size, sort: 'createdAt,desc' } 
    });
    return res.data;
  },

  getCarTypes: async (): Promise<any[]> => {
    const res = await apiClient.get(API_ENDPOINTS.CAR_TYPES.BASE);
    return res.data.content || res.data || [];
  },

  filter: async (filters: Record<string, any>, page = 0, size = 12): Promise<PaginatedCarResponse> => {
    const res = await apiClient.get(API_ENDPOINTS.CARS.FILTER, { 
      params: { ...filters, page, size } 
    });
    return res.data;
  },
 
  search: async (keyword: string): Promise<Car[]> => {
    const res = await apiClient.get(API_ENDPOINTS.CARS.SEARCH, { 
      params: { keyword } 
    });
    return res.data;
  },

  create: async (data: CarFormData): Promise<Car> => {
    const res = await apiClient.post(API_ENDPOINTS.CARS.BASE, data);
    return res.data;
  },

  // ✅ CREATE with Image - NO Content-Type header
  createWithImage: async (data: CarFormData, imageFile: File): Promise<Car> => {
    const formData = new FormData();
    const carBlob = new Blob([JSON.stringify({
      name: data.name, slug: data.slug, carTypeId: data.carTypeId,
      seatingCapacity: data.seatingCapacity, luggageCapacity: data.luggageCapacity,
      perKmRate: data.perKmRate, description: data.description || '', isFeatured: data.isFeatured
    })], { type: 'application/json' });
    
    formData.append('car', carBlob);
    formData.append('image', imageFile);
    
    // ✅ NO headers - browser will set multipart/form-data automatically
    const res = await apiClient.post(API_ENDPOINTS.CARS.WITH_IMAGE, formData);
    return res.data;
  },

  update: async (id: number, data: Partial<CarFormData>): Promise<Car> => {
    const res = await apiClient.put(API_ENDPOINTS.CARS.BY_ID(id), data);
    return res.data;
  },

  // ✅ UPDATE with Image - NO Content-Type header
  updateWithImage: async (id: number, data: CarFormData, imageFile: File): Promise<Car> => {
    const formData = new FormData();
    const carBlob = new Blob([JSON.stringify({
      name: data.name, slug: data.slug, carTypeId: data.carTypeId,
      seatingCapacity: data.seatingCapacity, luggageCapacity: data.luggageCapacity,
      perKmRate: data.perKmRate, description: data.description || '', isFeatured: data.isFeatured
    })], { type: 'application/json' });
    
    formData.append('car', carBlob);
    formData.append('image', imageFile);
    
    // ✅ NO headers - browser will set multipart/form-data automatically
    const res = await apiClient.put(API_ENDPOINTS.CARS.UPDATE_WITH_IMAGE(id), formData);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.CARS.BY_ID(id));
  }
};

export const getCarImageUrl = (
  imagePath: string
): string => {

  if (!imagePath) {
    return '/placeholder-car.png';
  }

  // Already full URL
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Production Base URL
  const API_BASE =
    'https://customlogicinnovation.com/rudrabannataxiservices';
//  const API_BASE =
//     'http://localhost:8080';

  // Ensure proper path
  if (imagePath.startsWith('/')) {
    return `${API_BASE}${imagePath}`;
  }

  return `${API_BASE}/uploads/${imagePath}`;
};
// // services/carService.ts
// import apiClient from './apiClient';
// import API_ENDPOINTS from '../config/apiEndpoints';
// import { Car, CarFormData, PaginatedCarResponse } from '../types';

// export const carService = {
  
//   getAll: async (page = 0, size = 12): Promise<PaginatedCarResponse> => {
//     const res = await apiClient.get(API_ENDPOINTS.CARS.BASE, { 
//       params: { page, size, sort: 'createdAt,desc' } 
//     });
//     return res.data;
//   },

//   getCarTypes: async (): Promise<any[]> => {
//     const res = await apiClient.get(API_ENDPOINTS.CAR_TYPES.BASE);
//     return res.data.content || res.data || [];
//   },

//   filter: async (filters: Record<string, any>, page = 0, size = 12): Promise<PaginatedCarResponse> => {
//     const res = await apiClient.get(API_ENDPOINTS.CARS.FILTER, { 
//       params: { ...filters, page, size } 
//     });
//     return res.data;
//   },

//   search: async (keyword: string): Promise<Car[]> => {
//     const res = await apiClient.get(API_ENDPOINTS.CARS.SEARCH, { 
//       params: { keyword } 
//     });
//     return res.data;
//   },

//   create: async (data: CarFormData): Promise<Car> => {
//     const res = await apiClient.post(API_ENDPOINTS.CARS.BASE, data);
//     return res.data;
//   },

//   // ✅ CREATE with Image - NO Content-Type header
//   createWithImage: async (data: CarFormData, imageFile: File): Promise<Car> => {
//     const formData = new FormData();
//     const carBlob = new Blob([JSON.stringify({
//       name: data.name, slug: data.slug, carTypeId: data.carTypeId,
//       seatingCapacity: data.seatingCapacity, luggageCapacity: data.luggageCapacity,
//       perKmRate: data.perKmRate, description: data.description || '', isFeatured: data.isFeatured
//     })], { type: 'application/json' });
    
//     formData.append('car', carBlob);
//     formData.append('image', imageFile);
    
//     // ✅ NO headers - browser will set multipart/form-data automatically
//     const res = await apiClient.post(API_ENDPOINTS.CARS.WITH_IMAGE, formData);
//     return res.data;
//   },

//   update: async (id: number, data: Partial<CarFormData>): Promise<Car> => {
//     const res = await apiClient.put(API_ENDPOINTS.CARS.BY_ID(id), data);
//     return res.data;
//   },

//   // ✅ UPDATE with Image - NO Content-Type header
//   updateWithImage: async (id: number, data: CarFormData, imageFile: File): Promise<Car> => {
//     const formData = new FormData();
//     const carBlob = new Blob([JSON.stringify({
//       name: data.name, slug: data.slug, carTypeId: data.carTypeId,
//       seatingCapacity: data.seatingCapacity, luggageCapacity: data.luggageCapacity,
//       perKmRate: data.perKmRate, description: data.description || '', isFeatured: data.isFeatured
//     })], { type: 'application/json' });
    
//     formData.append('car', carBlob);
//     formData.append('image', imageFile);
    
//     // ✅ NO headers - browser will set multipart/form-data automatically
//     const res = await apiClient.put(API_ENDPOINTS.CARS.UPDATE_WITH_IMAGE(id), formData);
//     return res.data;
//   },

//   delete: async (id: number): Promise<void> => {
//     await apiClient.delete(API_ENDPOINTS.CARS.BY_ID(id));
//   }
// };

// export const getCarImageUrl = (
//   imagePath: string
// ): string => {

//   if (!imagePath) {
//     return '/placeholder-car.png';
//   }

//   // Already full URL
//   if (imagePath.startsWith('http')) {
//     return imagePath;
//   }

//   // Production Base URL
//   const API_BASE =
//     'https://customlogicinnovation.com/rudrabannataxiservices';

//   // Ensure proper path
//   if (imagePath.startsWith('/')) {
//     return `${API_BASE}${imagePath}`;
//   }

//   return `${API_BASE}/uploads/${imagePath}`;
// };