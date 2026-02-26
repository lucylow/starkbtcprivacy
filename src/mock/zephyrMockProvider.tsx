// src/mock/zephyrMockProvider.tsx

import React, {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  createZephyrMockBundle,
  type ZephyrMockBundle,
} from "./index";

const ZephyrMockContext = createContext<ZephyrMockBundle | null>(null);

interface ZephyrMockProviderProps {
  children: ReactNode;
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
    throw new Error("useZephyrMock must be used within ZephyrMockProvider");
  }
  return ctx;
}

/**
 * Optional variant that simply returns null when the provider is not mounted.
 * Useful for components that can gracefully fall back to static data.
 */
export function useOptionalZephyrMock(): ZephyrMockBundle | null {
  return useContext(ZephyrMockContext);
}

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

