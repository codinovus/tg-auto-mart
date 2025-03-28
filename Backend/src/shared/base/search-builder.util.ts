/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { PrismaSchemaUtil } from "../prisma/prisma-schema.util";


export type SearchableField = {
  name: string;
  type?: 'string' | 'number' | 'boolean' | 'date' | 'enum' | 'auto';
  modelName?: string;
  enumType?: string;
  nested?: boolean;
  relationField?: string;
  exact?: boolean;
  searchableFields?: SearchableField[];
  enumValues?: string[];
};

export class SearchBuilder {
  static buildWhereClause(
    searchTerm: string | undefined,
    searchableFields: SearchableField[],
  ): any {
    if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim() === '') {
      return {};
    }

    const cleanedSearchTerm = searchTerm.trim();
    
    const orConditions: any[] = [];

    for (const field of searchableFields) {
      const condition = this.buildFieldCondition(field, cleanedSearchTerm);
      if (condition) {
        orConditions.push(condition);
      }
    }

    if (orConditions.length > 0) {
      return { OR: orConditions };
    }
    
    return {};
  }

  private static buildFieldCondition(
    field: SearchableField,
    searchTerm: string,
  ): any | null {
    const { name, type, nested, relationField, exact, searchableFields, enumType } = field;
  
    if (nested && relationField && searchableFields) {
      const nestedConditions = searchableFields.map(field => this.buildFieldCondition(field, searchTerm))
        .filter(condition => condition !== null);
      
      if (nestedConditions.length > 0) {
        return {
          [relationField]: {
            OR: nestedConditions
          }
        };
      }
      return null;
    }
  
    let condition: any = null;
    const searchTermLower = searchTerm.toLowerCase();
  
    switch (type) {
      case 'string':
        condition = exact 
          ? { [name]: searchTerm }
          : { [name]: { contains: searchTerm, mode: 'insensitive' } };
        break;
      
      case 'number':
        { 
          const numValue = parseFloat(searchTerm);
          if (!isNaN(numValue)) {
            condition = { [name]: numValue };
          }
          break; 
        }
      
      case 'boolean':
        if (searchTermLower === 'true') {
          condition = { [name]: true };
        } else if (searchTermLower === 'false') {
          condition = { [name]: false };
        }
        break;
      
      case 'date':
        try {
          // Check for common date formats (YYYY-MM-DD, MM/DD/YYYY, etc.)
          const dateValue = new Date(searchTerm);
          
          if (!isNaN(dateValue.getTime())) {
            // Create start of day (00:00:00)
            const startOfDay = new Date(dateValue);
            startOfDay.setHours(0, 0, 0, 0);
            
            // Create end of day (23:59:59.999)
            const endOfDay = new Date(dateValue);
            endOfDay.setHours(23, 59, 59, 999);
            
            condition = { 
              [name]: { 
                gte: startOfDay, 
                lte: endOfDay 
              } 
            };
          } else {
            // Try special date keywords
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            // Handle "today", "yesterday", "this week", etc.
            switch (searchTermLower) {
              case 'today':
                condition = { 
                  [name]: { 
                    gte: today, 
                    lt: tomorrow 
                  } 
                };
                break;
                
              case 'yesterday':
                condition = { 
                  [name]: { 
                    gte: yesterday, 
                    lt: today 
                  } 
                };
                break;
                
              case 'this week':
              case 'thisweek':
                { const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
                
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 7); // End of week (next Sunday)
                
                condition = { 
                  [name]: { 
                    gte: startOfWeek, 
                    lt: endOfWeek 
                  } 
                };
                break; }
                
              case 'this month':
              case 'thismonth':
                { const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
                
                condition = { 
                  [name]: { 
                    gte: startOfMonth, 
                    lte: endOfMonth 
                  } 
                };
                break; }
  
              default:
                console.warn('Unrecognized date format or keyword:', searchTerm);
                break;
            }
          }
        } catch (error) {
          console.error('Invalid date format:', error);
        }
        break;
  
      case 'enum':
        if (enumType) {
          const enumValues = PrismaSchemaUtil.getEnumValues(enumType);
          const matchingEnum = enumValues.find(enumVal => enumVal.toLowerCase() === searchTermLower);
          if (matchingEnum) {
            condition = { [name]: matchingEnum };
          }
        }
        break;
  
      default:
        break;
    }
  
    return condition;
  }
}