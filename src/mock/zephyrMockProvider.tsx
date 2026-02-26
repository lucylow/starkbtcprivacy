// src/mock/zephyrMockProvider.tsx

import React, { createContext, useContext, useMemo } from 'react';
import { createZephyrMockBundle, ZephyrMockBundle } from './index';

const ZephyrMockContext = createContext<ZephyrMockBundle | null>(null);

interface ZephyrMockProviderProps {
  children: React.ReactNode;
}

export const ZephyrMockProvider: React.FC<ZephyrMockProviderProps> = ({
  children,
}) => {
  const value = useMemo(() => createZephyrMockBundle(), []);

  return (
    <ZephyrMockContext.Provider value={value}>
      {children}
    </ZephyrMockContext.Provider>
  );
};

export function useZephyrMock(): ZephyrMockBundle {
  const ctx = useContext(ZephyrMockContext);
  if (!ctx) {
    throw new Error('useZephyrMock must be used within ZephyrMockProvider');
  }
  return ctx;
}

