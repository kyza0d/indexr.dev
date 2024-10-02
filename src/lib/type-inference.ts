import { JsonValue } from '@/types';
import validator from 'validator';

export type InferredType =
  | 'undefined'
  | 'any'
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'email'
  | 'phone'
  | 'website'
  | 'ip'
  | 'array'
  | 'object'
  | 'null'
  | 'currency'
  | 'percentage'
  | 'uuid'
  | 'url'
  | 'empty'
  | 'unknown'
  | 'bigint'
  | 'regex';

export const inferType = (value: any): InferredType => {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') {
    if (value instanceof RegExp) return 'regex';
    return 'object';
  }
  if (typeof value === 'symbol') return 'unknown';
  if (typeof value === 'bigint') return 'bigint';

  const stringValue = String(value).trim();
  if (stringValue === '') return 'empty';

  // Simple type checks
  if (/^(true|false)$/i.test(stringValue)) return 'boolean';
  if (/^-?\d+(\.\d+)?$/.test(stringValue)) return 'number';

  // Use validator.js for advanced validations
  if (validator.isEmail(stringValue)) return 'email';
  if (validator.isURL(stringValue, { require_protocol: true })) return 'url';
  if (validator.isDate(stringValue)) return 'date';
  if (validator.isMobilePhone(stringValue, 'any')) return 'phone';
  if (validator.isIP(stringValue)) return 'ip';
  if (validator.isUUID(stringValue)) return 'uuid';

  // Currency and percentage checks
  if (/^-?\d+(\.\d+)?%$/.test(stringValue)) return 'percentage';

  return 'string';
};
