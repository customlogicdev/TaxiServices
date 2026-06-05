// import apiClient from './apiClient';
// import API_ENDPOINTS from '../../config/apiEndpoints';
// import { Admin, LoginRequest, LoginResponse } from '../../types';

// export const adminService = {
//   // Login
//   login: async (data: LoginRequest): Promise<LoginResponse> => {
//     const response = await apiClient.post(API_ENDPOINTS.ADMIN.LOGIN, data);
//     return response.data;
//   },

//   // Logout
//   logout: async (id: number): Promise<void> => {
//     await apiClient.post(API_ENDPOINTS.ADMIN.LOGOUT(id));
//   },

//   // Validate Session
//   validateSession: async (sessionToken: string): Promise<Admin> => {
//     const response = await apiClient.post(API_ENDPOINTS.ADMIN.VALIDATE_SESSION, {
//       sessionToken,
//     });
//     return response.data;
//   },

//   // Get All Admins
//   getAllAdmins: async (page: number = 0, size: number = 10) => {
//     const response = await apiClient.get(API_ENDPOINTS.ADMIN.BASE, {
//       params: { page, size, sort: 'createdAt,desc' },
//     });
//     return response.data;
//   },

//   // Create Admin
//   createAdmin: async (data: { username: string; password: string }): Promise<Admin> => {
//     const response = await apiClient.post(API_ENDPOINTS.ADMIN.BASE, data);
//     return response.data;
//   },

//   // Update Admin
//   updateAdmin: async (id: number, data: Partial<Admin>): Promise<Admin> => {
//     const response = await apiClient.put(API_ENDPOINTS.ADMIN.BY_ID(id), data);
//     return response.data;
//   },

//   // Delete Admin
//   deleteAdmin: async (id: number): Promise<void> => {
//     await apiClient.delete(API_ENDPOINTS.ADMIN.BY_ID(id));
//   },

//   // Get Admin Count
//   getCount: async (): Promise<number> => {
//     const response = await apiClient.get(API_ENDPOINTS.ADMIN.COUNT);
//     return response.data;
//   },
// };

// services/adminService.ts
import apiClient from './apiClient';

export const adminService = {
  login: async (username: string, password: string) => {
    const res = await apiClient.post('/admins/login', { username, password });
    return res.data;
  },

  logout: async (id: number) => {
    const res = await apiClient.post(`/admins/${id}/logout`);
    return res.data;
  },

  validateSession: async () => {
    const res = await apiClient.get('/admins/validate-session');
    return res.data;
  },
};