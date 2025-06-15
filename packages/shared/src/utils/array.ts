/**
 * Array utility functions for manipulation, sorting, and operations
 */

/**
 * Removes duplicate values from an array
 * @param arr - Array to deduplicate
 * @param key - Optional key function for object arrays
 * @returns Array with unique values
 */
export function unique<T>(arr: T[], key?: (item: T) => any): T[] {
  if (!Array.isArray(arr)) return [];
  
  if (key) {
    const seen = new Set();
    return arr.filter(item => {
      const keyValue = key(item);
      if (seen.has(keyValue)) return false;
      seen.add(keyValue);
      return true;
    });
  }
  
  return [...new Set(arr)];
}

/**
 * Groups array elements by a key function
 * @param arr - Array to group
 * @param key - Key function
 * @returns Object with grouped elements
 */
export function groupBy<T, K extends string | number>(
  arr: T[],
  key: (item: T) => K
): Record<K, T[]> {
  if (!Array.isArray(arr)) return {} as Record<K, T[]>;
  
  return arr.reduce((groups, item) => {
    const groupKey = key(item);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

/**
 * Sorts an array of objects by a key
 * @param arr - Array to sort
 * @param key - Key to sort by
 * @param direction - Sort direction
 * @returns Sorted array
 */
export function sortBy<T>(
  arr: T[],
  key: keyof T | ((item: T) => any),
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  if (!Array.isArray(arr)) return [];
  
  const getValue = typeof key === 'function' ? key : (item: T) => item[key];
  
  return [...arr].sort((a, b) => {
    const aVal = getValue(a);
    const bVal = getValue(b);
    
    let comparison = 0;
    
    if (aVal < bVal) comparison = -1;
    else if (aVal > bVal) comparison = 1;
    
    return direction === 'asc' ? comparison : -comparison;
  });
}

/**
 * Sorts an array by multiple keys
 * @param arr - Array to sort
 * @param keys - Array of sort configurations
 * @returns Sorted array
 */
export function sortByMultiple<T>(
  arr: T[],
  keys: Array<{
    key: keyof T | ((item: T) => any);
    direction?: 'asc' | 'desc';
  }>
): T[] {
  if (!Array.isArray(arr) || !keys.length) return [...arr];
  
  return [...arr].sort((a, b) => {
    for (const { key, direction = 'asc' } of keys) {
      const getValue = typeof key === 'function' ? key : (item: T) => item[key];
      const aVal = getValue(a);
      const bVal = getValue(b);
      
      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      else if (aVal > bVal) comparison = 1;
      
      if (comparison !== 0) {
        return direction === 'asc' ? comparison : -comparison;
      }
    }
    return 0;
  });
}

/**
 * Chunks an array into smaller arrays of specified size
 * @param arr - Array to chunk
 * @param size - Chunk size
 * @returns Array of chunks
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  if (!Array.isArray(arr) || size <= 0) return [];
  
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Flattens a nested array
 * @param arr - Array to flatten
 * @param depth - Maximum depth to flatten
 * @returns Flattened array
 */
export function flatten<T>(arr: any[], depth = Infinity): T[] {
  if (!Array.isArray(arr)) return [];
  
  return depth > 0 
    ? arr.reduce((acc, val) => 
        acc.concat(Array.isArray(val) ? flatten(val, depth - 1) : val), [])
    : arr.slice();
}

/**
 * Finds the intersection of multiple arrays
 * @param arrays - Arrays to intersect
 * @returns Array with common elements
 */
export function intersection<T>(...arrays: T[][]): T[] {
  if (!arrays.length) return [];
  if (arrays.length === 1) return [...arrays[0]];
  
  return arrays.reduce((acc, curr) => {
    if (!Array.isArray(curr)) return acc;
    return acc.filter(item => curr.includes(item));
  });
}

/**
 * Finds the union of multiple arrays (all unique elements)
 * @param arrays - Arrays to unite
 * @returns Array with all unique elements
 */
export function union<T>(...arrays: T[][]): T[] {
  const combined = arrays.flat();
  return unique(combined);
}

/**
 * Finds the difference between two arrays (elements in first but not second)
 * @param arr1 - First array
 * @param arr2 - Second array
 * @returns Array with different elements
 */
export function difference<T>(arr1: T[], arr2: T[]): T[] {
  if (!Array.isArray(arr1)) return [];
  if (!Array.isArray(arr2)) return [...arr1];
  
  return arr1.filter(item => !arr2.includes(item));
}

/**
 * Finds the symmetric difference between two arrays (elements in either but not both)
 * @param arr1 - First array
 * @param arr2 - Second array
 * @returns Array with symmetric difference
 */
export function symmetricDifference<T>(arr1: T[], arr2: T[]): T[] {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return [];
  
  return [
    ...arr1.filter(item => !arr2.includes(item)),
    ...arr2.filter(item => !arr1.includes(item))
  ];
}

/**
 * Shuffles an array randomly
 * @param arr - Array to shuffle
 * @returns Shuffled array
 */
export function shuffle<T>(arr: T[]): T[] {
  if (!Array.isArray(arr)) return [];
  
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Gets a random sample from an array
 * @param arr - Array to sample from
 * @param size - Sample size
 * @returns Random sample
 */
export function sample<T>(arr: T[], size: number): T[] {
  if (!Array.isArray(arr) || size <= 0) return [];
  if (size >= arr.length) return shuffle(arr);
  
  const shuffled = shuffle(arr);
  return shuffled.slice(0, size);
}

/**
 * Gets a random element from an array
 * @param arr - Array to pick from
 * @returns Random element
 */
export function randomElement<T>(arr: T[]): T | undefined {
  if (!Array.isArray(arr) || arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Partitions an array into two arrays based on a predicate
 * @param arr - Array to partition
 * @param predicate - Predicate function
 * @returns Tuple of [truthy, falsy] arrays
 */
export function partition<T>(arr: T[], predicate: (item: T) => boolean): [T[], T[]] {
  if (!Array.isArray(arr)) return [[], []];
  
  const truthy: T[] = [];
  const falsy: T[] = [];
  
  for (const item of arr) {
    if (predicate(item)) {
      truthy.push(item);
    } else {
      falsy.push(item);
    }
  }
  
  return [truthy, falsy];
}

/**
 * Counts occurrences of elements in an array
 * @param arr - Array to count
 * @param key - Optional key function for objects
 * @returns Object with counts
 */
export function countBy<T>(arr: T[], key?: (item: T) => string | number): Record<string, number> {
  if (!Array.isArray(arr)) return {};
  
  const counts: Record<string, number> = {};
  
  for (const item of arr) {
    const countKey = key ? String(key(item)) : String(item);
    counts[countKey] = (counts[countKey] || 0) + 1;
  }
  
  return counts;
}

/**
 * Finds the most frequent element(s) in an array
 * @param arr - Array to analyze
 * @param key - Optional key function for objects
 * @returns Array of most frequent elements
 */
export function mode<T>(arr: T[], key?: (item: T) => string | number): T[] {
  if (!Array.isArray(arr) || arr.length === 0) return [];
  
  const counts = countBy(arr, key);
  const maxCount = Math.max(...Object.values(counts));
  
  const getValue = key || ((item: T) => item);
  return arr.filter(item => counts[String(getValue(item))] === maxCount);
}

/**
 * Removes elements from an array by value
 * @param arr - Array to filter
 * @param values - Values to remove
 * @returns Filtered array
 */
export function without<T>(arr: T[], ...values: T[]): T[] {
  if (!Array.isArray(arr)) return [];
  return arr.filter(item => !values.includes(item));
}

/**
 * Removes elements from an array by index
 * @param arr - Array to filter
 * @param indices - Indices to remove
 * @returns Filtered array
 */
export function removeAtIndices<T>(arr: T[], ...indices: number[]): T[] {
  if (!Array.isArray(arr)) return [];
  const indexSet = new Set(indices);
  return arr.filter((_, index) => !indexSet.has(index));
}

/**
 * Moves an element from one index to another
 * @param arr - Array to modify
 * @param fromIndex - Source index
 * @param toIndex - Target index
 * @returns Array with moved element
 */
export function move<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
  if (!Array.isArray(arr)) return [];
  if (fromIndex < 0 || fromIndex >= arr.length) return [...arr];
  if (toIndex < 0 || toIndex >= arr.length) return [...arr];
  
  const result = [...arr];
  const element = result.splice(fromIndex, 1)[0];
  result.splice(toIndex, 0, element);
  return result;
}

/**
 * Inserts elements at a specific index
 * @param arr - Array to modify
 * @param index - Index to insert at
 * @param elements - Elements to insert
 * @returns Array with inserted elements
 */
export function insertAt<T>(arr: T[], index: number, ...elements: T[]): T[] {
  if (!Array.isArray(arr)) return elements;
  const result = [...arr];
  result.splice(index, 0, ...elements);
  return result;
}

/**
 * Replaces elements at a specific index
 * @param arr - Array to modify
 * @param index - Index to replace at
 * @param count - Number of elements to replace
 * @param elements - New elements
 * @returns Array with replaced elements
 */
export function replaceAt<T>(arr: T[], index: number, count: number, ...elements: T[]): T[] {
  if (!Array.isArray(arr)) return elements;
  const result = [...arr];
  result.splice(index, count, ...elements);
  return result;
}

/**
 * Rotates array elements left or right
 * @param arr - Array to rotate
 * @param positions - Number of positions to rotate (positive = right, negative = left)
 * @returns Rotated array
 */
export function rotate<T>(arr: T[], positions: number): T[] {
  if (!Array.isArray(arr) || arr.length <= 1) return [...arr];
  
  const len = arr.length;
  const normalizedPositions = ((positions % len) + len) % len;
  
  return [...arr.slice(normalizedPositions), ...arr.slice(0, normalizedPositions)];
}

/**
 * Zips multiple arrays together
 * @param arrays - Arrays to zip
 * @returns Array of tuples
 */
export function zip<T>(...arrays: T[][]): T[][] {
  if (!arrays.length) return [];
  
  const maxLength = Math.max(...arrays.map(arr => Array.isArray(arr) ? arr.length : 0));
  const result: T[][] = [];
  
  for (let i = 0; i < maxLength; i++) {
    result.push(arrays.map(arr => Array.isArray(arr) ? arr[i] : undefined as any));
  }
  
  return result;
}

/**
 * Unzips an array of tuples
 * @param arr - Array of tuples to unzip
 * @returns Array of arrays
 */
export function unzip<T>(arr: T[][]): T[][] {
  if (!Array.isArray(arr) || arr.length === 0) return [];
  
  const maxLength = Math.max(...arr.map(tuple => Array.isArray(tuple) ? tuple.length : 0));
  const result: T[][] = [];
  
  for (let i = 0; i < maxLength; i++) {
    result.push(arr.map(tuple => Array.isArray(tuple) ? tuple[i] : undefined as any));
  }
  
  return result;
}

/**
 * Checks if array is empty
 * @param arr - Array to check
 * @returns True if empty
 */
export function isEmpty<T>(arr: T[]): boolean {
  return !Array.isArray(arr) || arr.length === 0;
}

/**
 * Gets the first element that matches a predicate
 * @param arr - Array to search
 * @param predicate - Predicate function
 * @returns First matching element or undefined
 */
export function find<T>(arr: T[], predicate: (item: T, index: number) => boolean): T | undefined {
  if (!Array.isArray(arr)) return undefined;
  return arr.find(predicate);
}

/**
 * Gets the last element that matches a predicate
 * @param arr - Array to search
 * @param predicate - Predicate function
 * @returns Last matching element or undefined
 */
export function findLast<T>(arr: T[], predicate: (item: T, index: number) => boolean): T | undefined {
  if (!Array.isArray(arr)) return undefined;
  
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i], i)) {
      return arr[i];
    }
  }
  
  return undefined;
}

/**
 * Gets the min and max values from an array
 * @param arr - Array of numbers
 * @returns Object with min and max values
 */
export function minMax(arr: number[]): { min: number; max: number } | null {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  
  let min = arr[0];
  let max = arr[0];
  
  for (let i = 1; i < arr.length; i++) {
    if (typeof arr[i] === 'number' && !isNaN(arr[i])) {
      min = Math.min(min, arr[i]);
      max = Math.max(max, arr[i]);
    }
  }
  
  return { min, max };
}

/**
 * Calculates the sum of an array of numbers
 * @param arr - Array of numbers
 * @param key - Optional key function for objects
 * @returns Sum of values
 */
export function sum<T>(arr: T[], key?: (item: T) => number): number {
  if (!Array.isArray(arr)) return 0;
  
  const getValue = key || ((item: T) => typeof item === 'number' ? item : 0);
  return arr.reduce((acc, item) => acc + getValue(item), 0);
}

/**
 * Calculates the average of an array of numbers
 * @param arr - Array of numbers
 * @param key - Optional key function for objects
 * @returns Average value
 */
export function average<T>(arr: T[], key?: (item: T) => number): number {
  if (!Array.isArray(arr) || arr.length === 0) return 0;
  return sum(arr, key) / arr.length;
}