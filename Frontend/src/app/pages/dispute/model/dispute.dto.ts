import { DisputeStatus } from "../../../shared/enums/app-enums";
import { PaginationMeta } from "../../../shared/model/pagination.dto";
import { OrderResponseDto } from "../../order/model/order.dto";
import { UserResponseDto } from "../../user/model/user.dto";

/**
 * Data transfer object for creating a new dispute
 */
export interface CreateDisputeDto {
  orderId: string;
  userId: string;
  reason: string;
}

/**
 * Data transfer object for updating an existing dispute
 */
export interface UpdateDisputeDto {
  status?: DisputeStatus;
  resolution?: string;
}

/**
 * Data transfer object representing a dispute response
 */
export interface DisputeResponseDto {
  id: string;
  order: OrderResponseDto;
  orderId: string;
  user: UserResponseDto;
  userId: string;
  status: DisputeStatus;
  reason: string;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data transfer object for the paginated response of disputes
 */
export interface GetAllDisputesResponseDto {
  success: boolean;
  message: string;
  data: DisputeResponseDto[];
  pagination?: PaginationMeta;
  timestamp: string;
}

/**
 * Data transfer object for a single dispute response
 */
export interface GetDisputeByIdResponseDto {
  success: boolean;
  message: string;
  data: DisputeResponseDto;
  timestamp: string;
}
