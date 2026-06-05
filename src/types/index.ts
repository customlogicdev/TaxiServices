// =========================================================
// BOOKING TYPES
// =========================================================

// export interface Booking {
//   bookingId: number;
//   bookingNumber: string;
//   carId: number;
//   carName: string;
//   customerName: string;
//   customerPhone: string;
//   customerEmail: string | null;
//   pickupLocation: string | null;
//   dropLocation: string | null;
//   pickupDate: string;
//   pickupTime: string;
//   passengerCount: number;
//   specialNote: string | null;
//   createdAt: string;
// }

// export interface BookingFormData {
//   customerName: string;
//   customerPhone: string;
//   customerEmail?: string;
//   carId: number;
//   pickupLocation?: string;
//   dropLocation?: string;
//   pickupDate: string;
//   pickupTime: string;
//   passengerCount?: number;
//   specialNote?: string;
// }

// export interface PaginatedBookingResponse {
//   content: Booking[];
//   pageable: {
//     pageNumber: number;
//     pageSize: number;
//     sort: { empty: boolean; sorted: boolean; unsorted: boolean };
//     offset: number;
//     paged: boolean;
//     unpaged: boolean;
//   };
//   last: boolean;
//   totalPages: number;
//   totalElements: number;
//   size: number;
//   number: number;
//   sort: { empty: boolean; sorted: boolean; unsorted: boolean };
//   numberOfElements: number;
//   first: boolean;
//   empty: boolean;
// }
 
// =========================================================
// BOOKING TYPES
// =========================================================

export interface Booking {
  bookingId: number;
  bookingNumber: string;
  carId: number;
  carName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  pickupLocation: string | null;
  dropLocation: string | null;
  pickupDate: string;
  pickupTime: string;
  passengerCount: number;  
  specialNote: string | null;
  createdAt: string;
}

export interface BookingFormData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  carId: number;
  pickupLocation?: string;
  dropLocation?: string;
  pickupDate: string;
  pickupTime: string;
  passengerCount?: number;
  specialNote?: string;
}

export interface PaginatedBookingResponse {
  content: Booking[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: { empty: boolean; sorted: boolean; unsorted: boolean };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: { empty: boolean; sorted: boolean; unsorted: boolean };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface BookingFilters {
  search: string;
  dateFrom: string;
  dateTo: string;
  carName: string;
  status: string;
}

export interface PaginationState {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}
// =========================================================
// CAR TYPES (Fleet)
// =========================================================

// types/car.ts
export interface Car {
  carId: number;
  carTypeId: number;
  carTypeName: string;
  name: string;
  slug: string;
  imagePath: string;
  seatingCapacity: number;
  luggageCapacity: number;
  perKmRate: number;
  description: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
    status: string;  // ✅ Add this
  
}

export interface CarFormData {
  name: string;
  slug: string;
  carTypeId: number;
  imagePath?: string;
  seatingCapacity: number;
  luggageCapacity: number;
  perKmRate: number;
  description: string;
  isFeatured: boolean;
}

export interface CarTypeData {
  carTypeId: number;
  carCategoryName: string;
  slug: string;
  isActive: boolean;
}

export interface PaginatedCarResponse {
  content: Car[];
  pageable: { pageNumber: number; pageSize: number; };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
}
// export interface Car {
//   carId: number;
//   carTypeId: number;
//   carTypeName: string;
//   name: string;
//   slug: string;
//   imagePath: string | null;
//   seatingCapacity: number;
//   luggageCapacity: number;
//   perKmRate: number;
//   description: string | null;
//   isFeatured: boolean;
//   createdAt: string;
//   updatedAt: string | null;
// }

// export interface CarFormData {
//   name: string;
//   slug: string;
//   carTypeId: number;
//   seatingCapacity: number;
//   luggageCapacity: number;
//   perKmRate: number;
//   description?: string;
//   isFeatured?: boolean;
// }

// export interface PaginatedCarResponse {
//   content: Car[];
//   totalPages: number;
//   totalElements: number;
//   size: number;
//   number: number;
//   last: boolean;
//   first: boolean;
//   empty: boolean;
// }

// =========================================================
// CAR TYPE (Category) TYPES
// =========================================================

export interface CarType {
  carTypeId: number;
  carCategoryName: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CarTypeFormData {
  carCategoryName: string;
  slug: string;
  isActive?: boolean;
}

export interface PaginatedCarTypeResponse {
  content: CarType[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  last: boolean;
  first: boolean;
  empty: boolean;
}

// =========================================================
// ADMIN TYPES
// =========================================================

export interface Admin {
  id: number;
  username: string;
  password?: string;
  sessionToken?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  username: string;
  sessionToken: string;
  lastLogin: string;
  createdAt: string;
}

export interface AdminUser {
  name: string;
  role: string;
}

// =========================================================
// CUSTOMER TYPES
// =========================================================

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  totalSpending: number;
  loyaltyPoints: number;
  registrationDate: string;
}

// =========================================================
// GALLERY TYPES
// =========================================================

// export interface GalleryImage {
//   id: number;
//   imagePath: string;
//   caption: string | null;
//   isActive: boolean;
//   createdAt: string;
//   updatedAt?: string | null;
// }
  
// types/index.ts
export interface GalleryImage {
  id: number;
  imagePath: string;
  caption: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryImageDTO {
  imagePath?: string;
  caption?: string;
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

// =========================================================
// COMMON TYPES
// =========================================================

export interface MenuItem {
  icon: string;
  label: string;
  path: string;
}



// types/contact.ts
export interface ContactSubmission {
  id: number;
  name: string;
  phone: string;
  email: string;
  message: string;
  createdAt: string;
}

export interface ContactFilter {
  name?: string;
  email?: string;
  phone?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}
// ============================================
// Admin Types
// ============================================

export interface AdminUser {
  id: number;
  username: string;
  password?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  sessionToken?: string;
}

export interface AdminFormData {
  username: string;
  password: string;
}

export interface Notification {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}