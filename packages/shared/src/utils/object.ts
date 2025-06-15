/**
 * Object utility functions for manipulation, comparison, and type operations
 */

/**
 * Deep clones an object
 * @param obj - Object to clone
 * @returns Deep cloned object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  if (obj instanceof RegExp) return new RegExp(obj) as unknown as T;
  
  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  
  return obj;
}

/**
 * Deep merges multiple objects
 * @param target - Target object
 * @param sources - Source objects to merge
 * @returns Merged object
 */
export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target;
  
  const result = deepClone(target);
  
  for (const source of sources) {
    if (source && typeof source === 'object') {
      for (const key in source) {
        if (source.hasOwnProperty(key)) {
          const sourceValue = source[key];
          const targetValue = result[key];
          
          if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
            result[key] = deepMerge(targetValue, sourceValue);
          } else {
            result[key] = sourceValue as T[Extract<keyof T, string>];
          }
        }
      }
    }
  }
  
  return result;
}

/**
 * Checks if two objects are deeply equal
 * @param obj1 - First object
 * @param obj2 - Second object
 * @returns True if deeply equal
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (obj1 == null || obj2 == null) return obj1 === obj2;
  if (typeof obj1 !== typeof obj2) return false;
  
  if (obj1 instanceof Date && obj2 instanceof Date) {
    return obj1.getTime() === obj2.getTime();
  }
  
  if (obj1 instanceof RegExp && obj2 instanceof RegExp) {
    return obj1.toString() === obj2.toString();
  }
  
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false;
    return obj1.every((item, index) => deepEqual(item, obj2[index]));
  }
  
  if (typeof obj1 === 'object' && typeof obj2 === 'object') {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    return keys1.every(key => 
      keys2.includes(key) && deepEqual(obj1[key], obj2[key])
    );
  }
  
  return false;
}

/**
 * Gets a nested property value using dot notation
 * @param obj - Object to get value from
 * @param path - Property path (e.g., 'user.profile.name')
 * @param defaultValue - Default value if path doesn't exist
 * @returns Property value or default
 */
export function get<T = any>(obj: any, path: string, defaultValue?: T): T {
  if (!obj || typeof path !== 'string') return defaultValue as T;
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue as T;
    }
    result = result[key];
  }
  
  return result !== undefined ? result : defaultValue as T;
}

/**
 * Sets a nested property value using dot notation
 * @param obj - Object to set value in
 * @param path - Property path (e.g., 'user.profile.name')
 * @param value - Value to set
 * @returns Modified object
 */
export function set<T extends Record<string, any>>(obj: T, path: string, value: any): T {
  if (!obj || typeof path !== 'string') return obj;
  
  const keys = path.split('.');
  const result = deepClone(obj);
  let current = result;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
  return result;
}

/**
 * Checks if an object has a nested property
 * @param obj - Object to check
 * @param path - Property path
 * @returns True if property exists
 */
export function has(obj: any, path: string): boolean {
  if (!obj || typeof path !== 'string') return false;
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current == null || typeof current !== 'object' || !(key in current)) {
      return false;
    }
    current = current[key];
  }
  
  return true;
}

/**
 * Omits specified properties from an object
 * @param obj - Source object
 * @param keys - Keys to omit
 * @returns Object without specified keys
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Omit<T, K> {
  if (!obj || typeof obj !== 'object') return {} as Omit<T, K>;
  
  const result = {} as Omit<T, K>;
  const keysToOmit = new Set(keys);
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && !keysToOmit.has(key as unknown as K)) {
      (result as any)[key] = obj[key];
    }
  }
  
  return result;
}

/**
 * Picks specified properties from an object
 * @param obj - Source object
 * @param keys - Keys to pick
 * @returns Object with only specified keys
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Pick<T, K> {
  if (!obj || typeof obj !== 'object') return {} as Pick<T, K>;
  
  const result = {} as Pick<T, K>;
  
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  
  return result;
}

/**
 * Transforms object keys using a transformer function
 * @param obj - Source object
 * @param transformer - Key transformer function
 * @returns Object with transformed keys
 */
export function mapKeys<T extends Record<string, any>>(
  obj: T,
  transformer: (key: string, value: any) => string
): Record<string, any> {
  if (!obj || typeof obj !== 'object') return {};
  
  const result: Record<string, any> = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = transformer(key, obj[key]);
      result[newKey] = obj[key];
    }
  }
  
  return result;
}

/**
 * Transforms object values using a transformer function
 * @param obj - Source object
 * @param transformer - Value transformer function
 * @returns Object with transformed values
 */
export function mapValues<T extends Record<string, any>, R>(
  obj: T,
  transformer: (value: T[keyof T], key: string) => R
): Record<keyof T, R> {
  if (!obj || typeof obj !== 'object') return {} as Record<keyof T, R>;
  
  const result = {} as Record<keyof T, R>;
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = transformer(obj[key], key);
    }
  }
  
  return result;
}

/**
 * Inverts an object (swaps keys and values)
 * @param obj - Object to invert
 * @returns Inverted object
 */
export function invert<T extends Record<string | number, string | number>>(
  obj: T
): Record<string, string> {
  if (!obj || typeof obj !== 'object') return {};
  
  const result: Record<string, string> = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      result[String(value)] = String(key);
    }
  }
  
  return result;
}

/**
 * Flattens a nested object
 * @param obj - Object to flatten
 * @param prefix - Prefix for keys
 * @param separator - Key separator
 * @returns Flattened object
 */
export function flatten(
  obj: Record<string, any>,
  prefix = '',
  separator = '.'
): Record<string, any> {
  if (!obj || typeof obj !== 'object') return {};
  
  const result: Record<string, any> = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}${separator}${key}` : key;
      const value = obj[key];
      
      if (isPlainObject(value)) {
        Object.assign(result, flatten(value, newKey, separator));
      } else {
        result[newKey] = value;
      }
    }
  }
  
  return result;
}

/**
 * Unflattens a flattened object
 * @param obj - Flattened object
 * @param separator - Key separator
 * @returns Nested object
 */
export function unflatten(
  obj: Record<string, any>,
  separator = '.'
): Record<string, any> {
  if (!obj || typeof obj !== 'object') return {};
  
  const result: Record<string, any> = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const keys = key.split(separator);
      let current = result;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!(k in current) || typeof current[k] !== 'object' || current[k] === null) {
          current[k] = {};
        }
        current = current[k];
      }
      
      current[keys[keys.length - 1]] = obj[key];
    }
  }
  
  return result;
}

/**
 * Gets all property paths from an object
 * @param obj - Object to get paths from
 * @param prefix - Path prefix
 * @param separator - Path separator
 * @returns Array of property paths
 */
export function getPaths(
  obj: Record<string, any>,
  prefix = '',
  separator = '.'
): string[] {
  if (!obj || typeof obj !== 'object') return [];
  
  const paths: string[] = [];
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const path = prefix ? `${prefix}${separator}${key}` : key;
      paths.push(path);
      
      if (isPlainObject(obj[key])) {
        paths.push(...getPaths(obj[key], path, separator));
      }
    }
  }
  
  return paths;
}

/**
 * Checks if a value is a plain object
 * @param value - Value to check
 * @returns True if plain object
 */
export function isPlainObject(value: any): value is Record<string, any> {
  if (!value || typeof value !== 'object') return false;
  if (value.constructor !== Object && value.constructor !== undefined) return false;
  return Object.prototype.toString.call(value) === '[object Object]';
}

/**
 * Checks if an object is empty
 * @param obj - Object to check
 * @returns True if empty
 */
export function isEmpty(obj: any): boolean {
  if (obj == null) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
}

/**
 * Gets the size of an object (number of enumerable properties)
 * @param obj - Object to measure
 * @returns Number of properties
 */
export function size(obj: any): number {
  if (obj == null) return 0;
  if (Array.isArray(obj)) return obj.length;
  if (typeof obj === 'object') return Object.keys(obj).length;
  if (typeof obj === 'string') return obj.length;
  return 0;
}

/**
 * Type guard for checking if value is an object
 * @param value - Value to check
 * @returns True if object
 */
export function isObject(value: any): value is Record<string, any> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Type guard for checking if value is a function
 * @param value - Value to check
 * @returns True if function
 */
export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}

/**
 * Type guard for checking if value is a string
 * @param value - Value to check
 * @returns True if string
 */
export function isString(value: any): value is string {
  return typeof value === 'string';
}

/**
 * Type guard for checking if value is a number
 * @param value - Value to check
 * @returns True if number
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard for checking if value is a boolean
 * @param value - Value to check
 * @returns True if boolean
 */
export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type guard for checking if value is null
 * @param value - Value to check
 * @returns True if null
 */
export function isNull(value: any): value is null {
  return value === null;
}

/**
 * Type guard for checking if value is undefined
 * @param value - Value to check
 * @returns True if undefined
 */
export function isUndefined(value: any): value is undefined {
  return value === undefined;
}

/**
 * Type guard for checking if value is null or undefined
 * @param value - Value to check
 * @returns True if null or undefined
 */
export function isNil(value: any): value is null | undefined {
  return value == null;
}

/**
 * Type guard for checking if value is an array
 * @param value - Value to check
 * @returns True if array
 */
export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

/**
 * Type guard for checking if value is a Date
 * @param value - Value to check
 * @returns True if Date
 */
export function isDate(value: any): value is Date {
  return value instanceof Date;
}

/**
 * Type guard for checking if value is a RegExp
 * @param value - Value to check
 * @returns True if RegExp
 */
export function isRegExp(value: any): value is RegExp {
  return value instanceof RegExp;
}

/**
 * Safely gets a property value with type assertion
 * @param obj - Object to get value from
 * @param key - Property key
 * @param guard - Type guard function
 * @returns Property value if it matches the type, undefined otherwise
 */
export function safeGet<T>(
  obj: any,
  key: string,
  guard: (value: any) => value is T
): T | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  const value = obj[key];
  return guard(value) ? value : undefined;
}

/**
 * Compares two objects and returns the differences
 * @param obj1 - First object
 * @param obj2 - Second object
 * @returns Object containing the differences
 */
export function diff(obj1: Record<string, any>, obj2: Record<string, any>): Record<string, any> {
  if (!isPlainObject(obj1) || !isPlainObject(obj2)) return {};
  
  const result: Record<string, any> = {};
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
  
  for (const key of allKeys) {
    const val1 = obj1[key];
    const val2 = obj2[key];
    
    if (!deepEqual(val1, val2)) {
      if (isPlainObject(val1) && isPlainObject(val2)) {
        const nestedDiff = diff(val1, val2);
        if (!isEmpty(nestedDiff)) {
          result[key] = nestedDiff;
        }
      } else {
        result[key] = { from: val1, to: val2 };
      }
    }
  }
  
  return result;
}