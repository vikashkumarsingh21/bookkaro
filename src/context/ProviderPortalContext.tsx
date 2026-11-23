'use client';

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import {
  MERCHANT_PROFILES,
  MerchantProfile,
  PortalBookingItem,
  PortalServiceItem,
  INITIAL_SERVICE_CATALOG,
  DaySchedule,
  INITIAL_WEEKLY_SCHEDULE,
  BranchItem,
  INITIAL_BRANCHES,
  SubscriptionData,
  INITIAL_SUBSCRIPTION_DATA,
  CommissionLedgerRow,
  StaffMemberItem,
  INITIAL_STAFF_MEMBERS,
} from '@/data/mockProviderPortalData';
import { bookingService } from '@/services/bookingService';

interface ProviderPortalContextType {
  activeMerchant: MerchantProfile;
  setActiveMerchant: (merchant: MerchantProfile) => void;
  bookings: PortalBookingItem[];
  pendingCount: number;
  todayConfirmedCount: number;
  completedThisMonthCount: number;
  netEarningsInr: number;
  acceptBooking: (bookingId: string) => Promise<void>;
  declineBooking: (bookingId: string, reason: string) => Promise<void>;
  completeBookingWithPin: (
    bookingId: string,
    checkInPin: string,
    finalBillInr: number
  ) => Promise<void>;
  completeBooking: (bookingId: string, finalBillInr: number) => Promise<void>;
  markNoShow: (bookingId: string) => Promise<void>;
  services: PortalServiceItem[];
  toggleServiceActive: (serviceId: string) => void;
  addService: (service: Omit<PortalServiceItem, 'id'>) => void;
  weeklySchedule: DaySchedule[];
  updateWeeklySchedule: (schedule: DaySchedule[]) => void;
  branches: BranchItem[];
  subscriptionData: SubscriptionData;
  commissionLedger: CommissionLedgerRow[];
  branchStaff: StaffMemberItem[];
  addBranchStaff: (staff: Omit<StaffMemberItem, 'id' | 'addedDate'>) => void;
  toggleStaffStatus: (staffId: string) => void;
}

const ProviderPortalContext = createContext<ProviderPortalContextType | undefined>(undefined);

export const ProviderPortalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeMerchant, setActiveMerchant] = useState<MerchantProfile>(MERCHANT_PROFILES[0]);
  const [bookings, setBookings] = useState<PortalBookingItem[]>(() => {
    return bookingService.getPortalBookings();
  });
  const [commissionLedger, setCommissionLedger] = useState<CommissionLedgerRow[]>(() => {
    return bookingService.getCommissionLedger();
  });

  const syncStateFromService = useCallback(() => {
    setBookings(bookingService.getPortalBookings());
    setCommissionLedger(bookingService.getCommissionLedger());
  }, []);

  useEffect(() => {
    return bookingService.subscribe(syncStateFromService);
  }, [syncStateFromService]);

  const [services, setServices] = useState<PortalServiceItem[]>(INITIAL_SERVICE_CATALOG);
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>(INITIAL_WEEKLY_SCHEDULE);
  const [branches] = useState<BranchItem[]>(INITIAL_BRANCHES);
  const [subscriptionData] = useState<SubscriptionData>(INITIAL_SUBSCRIPTION_DATA);
  const [branchStaff, setBranchStaff] = useState<StaffMemberItem[]>(INITIAL_STAFF_MEMBERS);

  // Derived KPI metrics
  const pendingCount = useMemo(
    () => bookings.filter((b) => b.status === 'REQUESTED').length,
    [bookings]
  );

  const todayConfirmedCount = useMemo(
    () => bookings.filter((b) => b.status === 'CONFIRMED').length,
    [bookings]
  );

  const completedThisMonthCount = useMemo(
    () => bookings.filter((b) => b.status === 'COMPLETED').length + 138,
    [bookings]
  );

  const netEarningsInr = useMemo(() => {
    const totalGmv = commissionLedger.reduce((sum, item) => sum + item.netMerchantPayoutInr, 0);
    return totalGmv + 142000;
  }, [commissionLedger]);

  // Actions wired to bookingService
  const acceptBooking = async (bookingId: string) => {
    await bookingService.acceptBooking(bookingId);
    syncStateFromService();
  };

  const declineBooking = async (bookingId: string, reason: string) => {
    await bookingService.declineBooking(bookingId, reason);
    syncStateFromService();
  };

  const completeBookingWithPin = async (
    bookingId: string,
    checkInPin: string,
    finalBillInr: number
  ) => {
    await bookingService.completeBookingWithPin(bookingId, checkInPin, finalBillInr);
    syncStateFromService();
  };

  const completeBooking = async (bookingId: string, finalBillInr: number) => {
    const booking = bookings.find((b) => b.id === bookingId);
    const pin = booking?.checkInPin || '4821';
    await bookingService.completeBookingWithPin(bookingId, pin, finalBillInr);
    syncStateFromService();
  };

  const markNoShow = async (bookingId: string) => {
    await bookingService.markNoShow(bookingId);
    syncStateFromService();
  };

  const toggleServiceActive = (serviceId: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const addService = (newService: Omit<PortalServiceItem, 'id'>) => {
    const item: PortalServiceItem = {
      ...newService,
      id: `srv-custom-${Date.now().toString(36)}`,
    };
    setServices((prev) => [item, ...prev]);
  };

  const updateWeeklySchedule = (newSchedule: DaySchedule[]) => {
    setWeeklySchedule(newSchedule);
  };

  const addBranchStaff = (staff: Omit<StaffMemberItem, 'id' | 'addedDate'>) => {
    const newStaff: StaffMemberItem = {
      ...staff,
      id: `stf-${Date.now().toString(36)}`,
      addedDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };
    setBranchStaff((prev) => [...prev, newStaff]);
  };

  const toggleStaffStatus = (staffId: string) => {
    setBranchStaff((prev) =>
      prev.map((s) =>
        s.id === staffId ? { ...s, status: s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : s
      )
    );
  };

  return (
    <ProviderPortalContext.Provider
      value={{
        activeMerchant,
        setActiveMerchant,
        bookings,
        pendingCount,
        todayConfirmedCount,
        completedThisMonthCount,
        netEarningsInr,
        acceptBooking,
        declineBooking,
        completeBookingWithPin,
        completeBooking,
        markNoShow,
        services,
        toggleServiceActive,
        addService,
        weeklySchedule,
        updateWeeklySchedule,
        branches,
        subscriptionData,
        commissionLedger,
        branchStaff,
        addBranchStaff,
        toggleStaffStatus,
      }}
    >
      {children}
    </ProviderPortalContext.Provider>
  );
};

export const useProviderPortal = (): ProviderPortalContextType => {
  const context = useContext(ProviderPortalContext);
  if (!context) {
    throw new Error('useProviderPortal must be used within a ProviderPortalProvider');
  }
  return context;
};
