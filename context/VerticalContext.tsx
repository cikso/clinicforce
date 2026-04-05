'use client';

import { createContext, useContext } from 'react';
import { VerticalConfig, getVertical } from '@/lib/verticals';

const VerticalContext = createContext<VerticalConfig>(getVertical('vet'));

export function VerticalProvider({
  vertical,
  children,
}: {
  vertical: string;
  children: React.ReactNode;
}) {
  return (
    <VerticalContext.Provider value={getVertical(vertical)}>
      {children}
    </VerticalContext.Provider>
  );
}

export function useVertical() {
  return useContext(VerticalContext);
}
