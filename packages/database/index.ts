// Core exports
export * from './src/client';
export * from './src/queries';
export * from './src/utils';

// Type exports (without conflicts)
export {
  type Database,
  type Tables,
  type TablesInsert,
  type TablesUpdate,
  type Enums,
  type Json,
} from './src/types/database';

// Additional type utilities
export * from './src/types';