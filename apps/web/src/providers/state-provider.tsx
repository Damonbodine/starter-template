/**
 * State Provider for Web App
 * Sets up all state management providers
 */

'use client';

import React, { ReactNode, useEffect } from 'react';
import { TRPCProvider } from './trpc-provider';
import { 
  setupUserStoreSubscriptions,
  setupAppStoreSubscriptions,
  setupNotificationStoreSubscriptions,
  setupDefaultErrorHandlers,
} from '@starter-template/shared/store';

interface StateProviderProps {
  children: ReactNode;
}

export function StateProvider({ children }: StateProviderProps) {
  useEffect(() => {
    // Setup store subscriptions and error handlers
    setupUserStoreSubscriptions();
    setupAppStoreSubscriptions();
    setupNotificationStoreSubscriptions();
    setupDefaultErrorHandlers();
  }, []);

  return (
    <TRPCProvider>
      {children}
    </TRPCProvider>
  );
}