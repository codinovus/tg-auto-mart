import { PaginationMeta } from "../../../shared/model/pagination.dto";

/**
 * Data transfer object for creating a new store
 */
export interface CreateStoreDto {
  name: string;
  ownerId: string;
}

/**
 * Data transfer object representing a store response
 */
export interface StoreResponseDto {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data transfer object for the paginated response of stores
 */
export interface GetAllStoresResponseDto {
  success: boolean;
  message: string;
  data: StoreResponseDto[];
  pagination?: PaginationMeta;
  timestamp: string;
}

/**
 * Data transfer object for updating an existing store
 */
export interface UpdateStoreDto {
  name?: string;
}
