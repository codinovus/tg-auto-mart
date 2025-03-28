/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Prisma, CryptoType, Role, OrderStatus, PaymentMethod, PaymentStatus, DisputeStatus, TransactionType } from '@prisma/client';

export class PrismaSchemaUtil {
  static getEnumValues(enumName: string): string[] {
    try {
      // Direct mapping for known enums
      const enumsMap = {
        'CryptoType': CryptoType,
        'Role': Role,
        'OrderStatus': OrderStatus,
        'PaymentMethod': PaymentMethod,
        'PaymentStatus': PaymentStatus,
        'DisputeStatus': DisputeStatus,
        'TransactionType': TransactionType
      };
      
      // Get the enum object
      const enumObj = enumsMap[enumName];
      
      if (enumObj) {
        // Filter out numeric keys and return string values
        return Object.keys(enumObj).filter(key => isNaN(Number(key)));
      }
      
      return [];
    } catch (error) {
      console.error(`Error getting enum values for ${enumName}:`, error);
      return [];
    }
  }

  static isEnum(fieldType: string): boolean {
    return ['CryptoType', 'Role', 'OrderStatus', 'PaymentMethod', 'PaymentStatus', 'DisputeStatus', 'TransactionType'].includes(fieldType);
  }

  static getFieldType(modelName: string, fieldName: string): string | null {
    try {
      const dmmf = Prisma.dmmf.datamodel;
      const model = dmmf.models.find(m => m.name === modelName);
      
      if (!model) return null;
      
      const field = model.fields.find(f => f.name === fieldName);
      return field ? field.type : null;
    } catch (error) {
      console.error('Error accessing Prisma schema:', error);
      return null;
    }
  }
}