import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorDetails: any = null;

    // Handle NestJS HTTP exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      message = typeof errorResponse === 'string' ? errorResponse : (errorResponse as any).message;
    }

    // Handle Prisma errors
    else if (exception instanceof PrismaClientKnownRequestError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Database error';

      switch (exception.code) {
        case 'P2002':
          message = 'A record with this value already exists';
          errorDetails = exception.meta;
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          break;
        case 'P2014':
          message = 'Foreign key constraint failed';
          break;
        case 'P2003':
          message = 'Invalid reference to another table';
          break;
        default:
          errorDetails = exception.message;
          break;
      }
    }

    // Handle validation errors (from class-validator)
    else if (exception instanceof Error && (exception as any).errors) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Validation failed';
      errorDetails = (exception as any).errors;
    }

    // Handle unknown errors
    else if (exception instanceof Error) {
      message = exception.message;
      errorDetails = exception.stack;
    }

    // Send JSON response
    response.status(status).json({
      statusCode: status,
      message,
      ...(errorDetails ? { errorDetails } : {}),
    });
  }
}
