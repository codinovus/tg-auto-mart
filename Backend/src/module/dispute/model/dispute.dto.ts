import { PaginationMeta } from "src/shared/model/GenericResponse.dto";
import { DisputeStatus } from "@prisma/client";
import { OrderResponseDto } from "src/module/order/model/order.dto";
import { UserResponseDto } from "src/module/user/model/user.model";


export class DisputeResponseDto {
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

export class GetAllDisputesResponseDto {
  success: boolean;
  message: string;
  data: DisputeResponseDto[];
  pagination?: PaginationMeta;
  timestamp: string;

  constructor(
    success: boolean,
    message: string,
    data: DisputeResponseDto[],
    pagination?: PaginationMeta
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.pagination = pagination;
    this.timestamp = new Date().toISOString();
  }
}

export class GetDisputeByIdResponseDto {
  success: boolean;
  message: string;
  data: DisputeResponseDto;
  timestamp: string;

  constructor(success: boolean, message: string, data: DisputeResponseDto) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}

export class CreateDisputeDto {
  orderId: string;
  userId: string;
  reason: string;
}

export class UpdateDisputeDto {
  status?: DisputeStatus;
  resolution?: string;
}
