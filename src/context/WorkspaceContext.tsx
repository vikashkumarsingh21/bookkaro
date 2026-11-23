'use client';

import React, { createContext, useContext, useSyncExternalStore } from 'react';
import { WorkspaceView } from '@/types/booking';

interface WorkspaceContextType {
  currentWorkspace: WorkspaceView;
  setWorkspace: (view: WorkspaceView) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  availableCities: string[];
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const AVAILABLE_CITIES = [
  'Patna (All Zones)',
  'Fraser Road (800001)',
  'Boring Road (800013)',
  'Kankarbagh (800020)',
  'Bailey Road (800014)',
  'Rajendra Nagar (800016)',
  'Danapur & Saguna More (801503)',
  'Lalganj Corridor (844121)',
];

function subscribeToStorage(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('bookkaro_workspace_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('bookkaro_workspace_change', callback);
  };
}

function getWorkspaceSnapshot(): WorkspaceView {
  if (typeof window === 'undefined') return 'CUSTOMER';
  try {
    const saved = localStorage.getItem('bookkaro_workspace') as WorkspaceView;
    if (saved && ['CUSTOMER', 'PARTNER_OWNER', 'PARTNER_STAFF', 'ADMIN', 'PROVIDER'].includes(saved)) {
      return saved;
    }
  } catch {
    // Local storage inaccessible
  }
  return 'CUSTOMER';
}

function getCitySnapshot(): string {
  if (typeof window === 'undefined') return 'Patna (All Zones)';
  try {
    const savedCity = localStorage.getItem('bookkaro_city');
    if (savedCity && AVAILABLE_CITIES.includes(savedCity)) {
      return savedCity;
    }
  } catch {
    // Local storage inaccessible
  }
  return 'Patna (All Zones)';
}

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const currentWorkspace = useSyncExternalStore<WorkspaceView>(
    subscribeToStorage,
    getWorkspaceSnapshot,
    () => 'CUSTOMER' as WorkspaceView
  );

  const selectedCity = useSyncExternalStore<string>(
    subscribeToStorage,
    getCitySnapshot,
    () => 'Patna (All Zones)'
  );

  const setWorkspace = (view: WorkspaceView) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('bookkaro_workspace', view);
        window.dispatchEvent(new Event('bookkaro_workspace_change'));
      } catch {
        // ignore
      }
    }
  };

  const setCity = (city: string) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('bookkaro_city', city);
        window.dispatchEvent(new Event('bookkaro_workspace_change'));
      } catch {
        // ignore
      }
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace,
        setWorkspace,
        selectedCity,
        setSelectedCity: setCity,
        availableCities: AVAILABLE_CITIES,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
