// API endpoint builders and URL construction helpers

import { QueryParams, EndpointBuilder } from './types';

// Base endpoint configuration
export interface EndpointConfig {
  baseURL?: string;
  version?: string;
  prefix?: string;
}

// URL parameter replacement utility
export function replaceUrlParams(url: string, params: Record<string, any>): string {
  return url.replace(/:([a-zA-Z_$][a-zA-Z0-9_$]*)/g, (match, paramName) => {
    if (params[paramName] !== undefined) {
      return encodeURIComponent(String(params[paramName]));
    }
    return match; // Leave unmatched parameters as-is
  });
}

// Query parameter builder
export function buildQueryString(params: QueryParams): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  return searchParams.toString();
}

// Generic endpoint builder factory
export function createEndpointBuilder(template: string, config?: EndpointConfig): EndpointBuilder {
  return (params?: Record<string, any>) => {
    let url = template;
    
    // Add prefix if provided
    if (config?.prefix) {
      url = `${config.prefix}${url}`;
    }
    
    // Add version if provided
    if (config?.version) {
      url = `/v${config.version}${url}`;
    }

    if (params) {
      // Replace URL parameters
      url = replaceUrlParams(url, params);
      
      // Extract query parameters (those not used in URL replacement)
      const usedParams = (template.match(/:([a-zA-Z_$][a-zA-Z0-9_$]*)/g) || [])
        .map(match => match.substring(1));
      
      const queryParams: Record<string, any> = {};
      Object.entries(params).forEach(([key, value]) => {
        if (!usedParams.includes(key)) {
          queryParams[key] = value;
        }
      });

      // Add query string if there are unused parameters
      if (Object.keys(queryParams).length > 0) {
        const queryString = buildQueryString(queryParams);
        url = `${url}${queryString ? '?' + queryString : ''}`;
      }
    }

    return url;
  };
}

// Common REST endpoint builders
export const endpoints = {
  // User endpoints
  users: {
    list: createEndpointBuilder('/users'),
    get: createEndpointBuilder('/users/:id'),
    create: createEndpointBuilder('/users'),
    update: createEndpointBuilder('/users/:id'),
    delete: createEndpointBuilder('/users/:id'),
    profile: createEndpointBuilder('/users/profile'),
    avatar: createEndpointBuilder('/users/:id/avatar'),
  },

  // Authentication endpoints
  auth: {
    login: createEndpointBuilder('/auth/login'),
    logout: createEndpointBuilder('/auth/logout'),
    register: createEndpointBuilder('/auth/register'),
    refresh: createEndpointBuilder('/auth/refresh'),
    forgotPassword: createEndpointBuilder('/auth/forgot-password'),
    resetPassword: createEndpointBuilder('/auth/reset-password'),
    verify: createEndpointBuilder('/auth/verify/:token'),
    me: createEndpointBuilder('/auth/me'),
  },

  // Generic resource endpoints
  resource: (name: string) => ({
    list: createEndpointBuilder(`/${name}`),
    get: createEndpointBuilder(`/${name}/:id`),
    create: createEndpointBuilder(`/${name}`),
    update: createEndpointBuilder(`/${name}/:id`),
    delete: createEndpointBuilder(`/${name}/:id`),
  }),

  // Nested resource endpoints
  nestedResource: (parent: string, child: string) => ({
    list: createEndpointBuilder(`/${parent}/:parentId/${child}`),
    get: createEndpointBuilder(`/${parent}/:parentId/${child}/:id`),
    create: createEndpointBuilder(`/${parent}/:parentId/${child}`),
    update: createEndpointBuilder(`/${parent}/:parentId/${child}/:id`),
    delete: createEndpointBuilder(`/${parent}/:parentId/${child}/:id`),
  }),
};

// Versioned endpoint builders
export function createVersionedEndpoints(version: string, prefix?: string) {
  const config: EndpointConfig = { version, prefix };
  
  return {
    users: {
      list: createEndpointBuilder('/users', config),
      get: createEndpointBuilder('/users/:id', config),
      create: createEndpointBuilder('/users', config),
      update: createEndpointBuilder('/users/:id', config),
      delete: createEndpointBuilder('/users/:id', config),
    },
    
    auth: {
      login: createEndpointBuilder('/auth/login', config),
      logout: createEndpointBuilder('/auth/logout', config),
      register: createEndpointBuilder('/auth/register', config),
      refresh: createEndpointBuilder('/auth/refresh', config),
    },

    resource: (name: string) => ({
      list: createEndpointBuilder(`/${name}`, config),
      get: createEndpointBuilder(`/${name}/:id`, config),
      create: createEndpointBuilder(`/${name}`, config),
      update: createEndpointBuilder(`/${name}/:id`, config),
      delete: createEndpointBuilder(`/${name}/:id`, config),
    }),
  };
}

// GraphQL endpoint helpers
export const graphql = {
  endpoint: '/graphql',
  subscription: '/graphql/subscription',
  
  // Query builder helpers
  buildQuery: (query: string, variables?: Record<string, any>) => ({
    query,
    variables,
  }),
  
  buildMutation: (mutation: string, variables?: Record<string, any>) => ({
    query: mutation,
    variables,
  }),
  
  buildSubscription: (subscription: string, variables?: Record<string, any>) => ({
    query: subscription,
    variables,
  }),
};

// File upload endpoint helpers
export const upload = {
  single: createEndpointBuilder('/upload'),
  multiple: createEndpointBuilder('/upload/multiple'),
  avatar: createEndpointBuilder('/upload/avatar'),
  documents: createEndpointBuilder('/upload/documents'),
  images: createEndpointBuilder('/upload/images'),
};

// Search endpoint helpers
export const search = {
  global: createEndpointBuilder('/search'),
  users: createEndpointBuilder('/search/users'),
  content: createEndpointBuilder('/search/content'),
  suggestions: createEndpointBuilder('/search/suggestions'),
};

// Admin endpoint helpers
export const admin = {
  users: {
    list: createEndpointBuilder('/admin/users'),
    get: createEndpointBuilder('/admin/users/:id'),
    create: createEndpointBuilder('/admin/users'),
    update: createEndpointBuilder('/admin/users/:id'),
    delete: createEndpointBuilder('/admin/users/:id'),
    ban: createEndpointBuilder('/admin/users/:id/ban'),
    unban: createEndpointBuilder('/admin/users/:id/unban'),
  },
  
  analytics: {
    dashboard: createEndpointBuilder('/admin/analytics/dashboard'),
    users: createEndpointBuilder('/admin/analytics/users'),
    performance: createEndpointBuilder('/admin/analytics/performance'),
  },
  
  system: {
    health: createEndpointBuilder('/admin/system/health'),
    metrics: createEndpointBuilder('/admin/system/metrics'),
    logs: createEndpointBuilder('/admin/system/logs'),
  },
};

// Utility functions for common endpoint patterns
export const utils = {
  // Pagination helpers
  withPagination: (url: string, page: number = 1, limit: number = 10) => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}page=${page}&limit=${limit}`;
  },

  // Sorting helpers
  withSort: (url: string, sortBy: string, sortOrder: 'asc' | 'desc' = 'asc') => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}sortBy=${sortBy}&sortOrder=${sortOrder}`;
  },

  // Filtering helpers
  withFilters: (url: string, filters: Record<string, any>) => {
    const queryString = buildQueryString(filters);
    if (queryString) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}${queryString}`;
    }
    return url;
  },

  // Include/expand helpers (for related data)
  withIncludes: (url: string, includes: string[]) => {
    if (includes.length === 0) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}include=${includes.join(',')}`;
  },
};

// Export everything as default for convenience
export default {
  endpoints,
  createVersionedEndpoints,
  createEndpointBuilder,
  replaceUrlParams,
  buildQueryString,
  graphql,
  upload,
  search,
  admin,
  utils,
};