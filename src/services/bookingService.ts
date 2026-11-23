import {
  BookingCategory,
  BookingRequest,
  BookingStatus,
  CategoryMetadata,
  Provider,
  ProviderFilterParams,
  Service,
} from '@/types/booking';
import { isValidBookingTransition, BookingStatus as BookkaroStatus } from '@/types/bookkaro';
import {
  CATEGORIES_METADATA,
  MOCK_PROVIDERS,
  MOCK_SERVICES,
} from './mockData';
import { INITIAL_CUSTOMER_BOOKINGS } from '@/data/mockDashboardBookings';
import {
  INITIAL_PORTAL_BOOKINGS,
  PortalBookingItem,
  CommissionLedgerRow,
  INITIAL_COMMISSION_LEDGER,
} from '@/data/mockProviderPortalData';
import { apiClient } from './apiClient';

const USE_REMOTE_API = process.env.NEXT_PUBLIC_USE_REMOTE_API === 'true';

const STORAGE_KEY_CUSTOMER = 'bookkaro_customer_bookings_patna_v1';
const STORAGE_KEY_PORTAL = 'bookkaro_portal_bookings_patna_v1';
const STORAGE_KEY_LEDGER = 'bookkaro_commission_ledger_patna_v1';

// In-memory reactive state
let mockBookingsState: BookingRequest[] = [...INITIAL_CUSTOMER_BOOKINGS];
let mockPortalBookingsState: PortalBookingItem[] = [...INITIAL_PORTAL_BOOKINGS];
let mockLedgerState: CommissionLedgerRow[] = [...INITIAL_COMMISSION_LEDGER];
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // ignore
    }
  });
}

function loadFromStorage() {
  if (typeof window === 'undefined') return;
  try {
    const rawCustomer = localStorage.getItem(STORAGE_KEY_CUSTOMER);
    if (rawCustomer) {
      const parsed = JSON.parse(rawCustomer);
      if (Array.isArray(parsed) && parsed.length > 0) {
        mockBookingsState = parsed;
      }
    }
    const rawPortal = localStorage.getItem(STORAGE_KEY_PORTAL);
    if (rawPortal) {
      const parsed = JSON.parse(rawPortal);
      if (Array.isArray(parsed) && parsed.length > 0) {
        mockPortalBookingsState = parsed;
      }
    }
    const rawLedger = localStorage.getItem(STORAGE_KEY_LEDGER);
    if (rawLedger) {
      const parsed = JSON.parse(rawLedger);
      if (Array.isArray(parsed) && parsed.length > 0) {
        mockLedgerState = parsed;
      }
    }
  } catch {
    // fallback to in-memory state
  }
}

function saveToStorage() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOMER, JSON.stringify(mockBookingsState));
    localStorage.setItem(STORAGE_KEY_PORTAL, JSON.stringify(mockPortalBookingsState));
    localStorage.setItem(STORAGE_KEY_LEDGER, JSON.stringify(mockLedgerState));
  } catch {
    // ignore
  }
}

function ensureBookingExists(bookingIdOrRef: string): number {
  const index = mockBookingsState.findIndex(
    (b) =>
      b.id === bookingIdOrRef ||
      b.bookingReference === bookingIdOrRef ||
      `p-${b.id}` === bookingIdOrRef ||
      b.id === `bk-${bookingIdOrRef}`
  );
  if (index !== -1) return index;

  const pIdx = mockPortalBookingsState.findIndex(
    (p) => p.id === bookingIdOrRef || p.bookingReference === bookingIdOrRef
  );
  if (pIdx !== -1) {
    const portal = mockPortalBookingsState[pIdx];
    const synthesized: BookingRequest = {
      id: portal.id.startsWith('p-') ? portal.id.slice(2) : portal.id,
      bookingReference: portal.bookingReference,
      customerId: 'cust-pat-sample',
      customerName: portal.customerName,
      customerPhone: portal.customerPhone,
      customerEmail: portal.customerEmail,
      providerId: 'prov-pat-01',
      providerName: 'Patliputra Pediatric & Child Care Clinic',
      providerAddress: 'Fraser Road, Patna',
      category: portal.category,
      serviceId: 'srv-pat-01',
      serviceName: portal.serviceName,
      status: portal.status,
      checkInPin: portal.checkInPin || '4821',
      scheduledDate: portal.scheduledDate,
      scheduledSlot: { startTime: portal.scheduledTime, endTime: portal.scheduledTime },
      paxOrUnits: 1,
      pricing: {
        basePrice: portal.estimatedPriceInr,
        taxesAndGst: 0,
        platformFee: 0,
        discountAmount: 0,
        totalAmount: portal.estimatedPriceInr,
        tokenPaidOnline: 0,
        amountPayableAtVenue: portal.estimatedPriceInr,
        currency: 'INR',
      },
      paymentStatus: 'PENDING',
      specialInstructions: portal.specialInstructions,
      createdAt: portal.createdAt,
      updatedAt: portal.createdAt,
      statusHistory: [
        {
          status: portal.status,
          timestamp: portal.createdAt,
          updatedBy: 'CUSTOMER',
          note: 'Booking request created.',
        },
      ],
    };
    mockBookingsState.push(synthesized);
    return mockBookingsState.length - 1;
  }
  return -1;
}

// Initial client hydration from storage
loadFromStorage();

export const bookingService = {
  /**
   * Subscribe to booking store changes
   */
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  /**
   * Get all active customer bookings synchronously
   */
  getAllBookings(): BookingRequest[] {
    loadFromStorage();
    return [...mockBookingsState];
  },

  /**
   * Get portal bookings synchronously
   */
  getPortalBookings(): PortalBookingItem[] {
    loadFromStorage();
    return [...mockPortalBookingsState];
  },

  /**
   * Get commercial commission ledger synchronously
   */
  getCommissionLedger(): CommissionLedgerRow[] {
    loadFromStorage();
    return [...mockLedgerState];
  },

  /**
   * Get all active marketplace categories with metadata
   */
  async getCategories(): Promise<CategoryMetadata[]> {
    if (USE_REMOTE_API) {
      return apiClient.get<CategoryMetadata[]>('/categories');
    }
    await new Promise((resolve) => setTimeout(resolve, 60));
    return CATEGORIES_METADATA;
  },

  /**
   * Discover providers with Indian marketplace filters
   */
  async getProviders(params?: ProviderFilterParams): Promise<Provider[]> {
    if (USE_REMOTE_API) {
      return apiClient.get<Provider[]>('/providers', {
        category: params?.category,
        city: params?.city,
        searchQuery: params?.searchQuery,
        minRating: params?.minRating,
        revenueModel: params?.revenueModel,
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 80));
    let filtered = [...MOCK_PROVIDERS];

    if (params?.category) {
      filtered = filtered.filter((p) => p.category === params.category);
    }

    if (params?.city) {
      filtered = filtered.filter(
        (p) => p.city.toLowerCase() === params.city?.toLowerCase()
      );
    }

    if (params?.searchQuery) {
      const q = params.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortBio.toLowerCase().includes(q) ||
          p.subCategories.some((sub) => sub.toLowerCase().includes(q))
      );
    }

    if (params?.revenueModel) {
      filtered = filtered.filter((p) => p.revenueModel === params.revenueModel);
    }

    if (params?.minRating) {
      filtered = filtered.filter((p) => p.rating >= (params.minRating ?? 0));
    }

    return filtered;
  },

  /**
   * Get provider profile by unique slug
   */
  async getProviderBySlug(slug: string): Promise<Provider | null> {
    if (USE_REMOTE_API) {
      return apiClient.get<Provider>(`/providers/slug/${slug}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
    const provider = MOCK_PROVIDERS.find((p) => p.slug === slug);
    return provider || null;
  },

  /**
   * Get services for a specific provider
   */
  async getServicesByProviderId(providerId: string): Promise<Service[]> {
    if (USE_REMOTE_API) {
      return apiClient.get<Service[]>(`/providers/${providerId}/services`);
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
    return MOCK_SERVICES.filter((s) => s.providerId === providerId);
  },

  /**
   * List booking requests (used across Customer, Provider, and Admin views)
   */
  async getBookingRequests(
    status?: BookingStatus,
    category?: BookingCategory
  ): Promise<BookingRequest[]> {
    if (USE_REMOTE_API) {
      return apiClient.get<BookingRequest[]>('/bookings', { status, category });
    }
    loadFromStorage();
    await new Promise((resolve) => setTimeout(resolve, 60));
    let list = [...mockBookingsState];

    if (status) {
      list = list.filter((b) => b.status === status);
    }
    if (category) {
      list = list.filter((b) => b.category === category);
    }

    return list;
  },

  /**
   * Save a newly created booking into both Customer and Portal stores
   * Strictly starts with status: REQUESTED
   */
  addBooking(booking: BookingRequest): BookingRequest {
    loadFromStorage();

    // Ensure status is strictly REQUESTED
    const strictBooking: BookingRequest = {
      ...booking,
      status: 'REQUESTED',
      statusHistory: [
        {
          status: 'REQUESTED',
          timestamp: new Date().toISOString(),
          updatedBy: 'CUSTOMER',
          note: 'Booking request submitted on web by customer. Awaiting merchant roster confirmation.',
        },
      ],
    };

    mockBookingsState = [strictBooking, ...mockBookingsState];

    // Create corresponding Portal booking item for provider view
    const portalItem: PortalBookingItem = {
      id: `p-${strictBooking.id}`,
      bookingReference: strictBooking.bookingReference,
      customerName: strictBooking.customerName,
      customerPhone: strictBooking.customerPhone,
      customerEmail: strictBooking.customerEmail,
      serviceName: strictBooking.serviceName,
      category: strictBooking.category,
      categoryDetails: {
        branchName: strictBooking.providerAddress,
      },
      scheduledDate: strictBooking.scheduledDate,
      scheduledTime: strictBooking.scheduledSlot?.startTime || '11:00 AM',
      estimatedPriceInr: strictBooking.pricing.totalAmount,
      commissionPercentage: 8.0,
      status: 'REQUESTED',
      createdAt: strictBooking.createdAt,
      specialInstructions: strictBooking.specialInstructions,
    };

    mockPortalBookingsState = [portalItem, ...mockPortalBookingsState];

    saveToStorage();
    notifyListeners();
    return strictBooking;
  },

  /**
   * Create a new booking request with unique Indian Booking ID and 4-digit Venue PIN
   */
  async createBookingRequest(
    payload: Omit<
      BookingRequest,
      | 'id'
      | 'status'
      | 'createdAt'
      | 'updatedAt'
      | 'statusHistory'
      | 'bookingReference'
      | 'checkInPin'
    > & {
      bookingReference?: string;
      checkInPin?: string;
    }
  ): Promise<BookingRequest> {
    if (USE_REMOTE_API) {
      return apiClient.post<BookingRequest>('/bookings', payload);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingReference =
      payload.bookingReference || `BK-PAT-${randomSuffix}`;
    const checkInPin =
      payload.checkInPin || Math.floor(1000 + Math.random() * 9000).toString();

    const newBooking: BookingRequest = {
      ...payload,
      id: `bk-pat-${Date.now().toString(36)}`,
      bookingReference,
      checkInPin,
      status: 'REQUESTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [
        {
          status: 'REQUESTED',
          timestamp: new Date().toISOString(),
          updatedBy: 'CUSTOMER',
          note: 'Booking requested by customer on BOOKKARO Patna portal.',
        },
      ],
    };

    return this.addBooking(newBooking);
  },

  /**
   * Update booking status (Merchant acceptance, cancellation, dispute, etc.)
   */
  async updateBookingStatus(
    bookingId: string,
    newStatus: BookingStatus,
    updatedBy: 'CUSTOMER' | 'PROVIDER' | 'ADMIN' | 'SYSTEM' = 'PROVIDER',
    note?: string
  ): Promise<BookingRequest> {
    if (USE_REMOTE_API) {
      return apiClient.patch<BookingRequest>(`/bookings/${bookingId}/status`, {
        status: newStatus,
        note,
        updatedBy,
      });
    }

    loadFromStorage();
    await new Promise((resolve) => setTimeout(resolve, 80));
    const index = ensureBookingExists(bookingId);
    if (index === -1) {
      throw new Error(`Booking request ${bookingId} not found`);
    }

    const current = mockBookingsState[index];
    const updated: BookingRequest = {
      ...current,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      statusHistory: [
        ...current.statusHistory,
        {
          status: newStatus,
          timestamp: new Date().toISOString(),
          updatedBy,
          note,
        },
      ],
    };

    mockBookingsState[index] = updated;

    // Sync portal bookings state
    const pIdx = mockPortalBookingsState.findIndex(
      (p) => p.bookingReference === current.bookingReference || p.id === `p-${current.id}`
    );
    if (pIdx !== -1) {
      mockPortalBookingsState[pIdx] = {
        ...mockPortalBookingsState[pIdx],
        status: newStatus,
      };
    }

    saveToStorage();
    notifyListeners();
    return updated;
  },

  /**
   * Find a booking by its unique ID or reference
   */
  getBookingById(idOrRef: string): BookingRequest | undefined {
    loadFromStorage();
    return mockBookingsState.find((b) => b.id === idOrRef || b.bookingReference === idOrRef);
  },

  /**
   * Cancel booking with state-machine transition guard
   */
  async cancelBooking(bookingId: string, reason: string): Promise<BookingRequest> {
    loadFromStorage();
    const current = mockBookingsState.find((b) => b.id === bookingId);
    if (!current) {
      throw new Error(`Booking request ${bookingId} not found`);
    }

    if (!isValidBookingTransition(current.status as BookkaroStatus, 'CANCELLED')) {
      throw new Error(`Cannot cancel booking in status: ${current.status}`);
    }

    const updated = await this.updateBookingStatus(
      bookingId,
      'CANCELLED',
      'CUSTOMER',
      `Cancelled by customer: ${reason}`
    );

    // Also attach cancellationReason
    const index = mockBookingsState.findIndex((b) => b.id === bookingId);
    if (index !== -1) {
      mockBookingsState[index] = {
        ...mockBookingsState[index],
        cancellationReason: reason,
      };
      saveToStorage();
      notifyListeners();
      return mockBookingsState[index];
    }
    return updated;
  },

  /**
   * Raise a dispute / customer grievance with ticket generation
   */
  async raiseDispute(
    bookingId: string,
    disputeData: { ticketId: string; reason: string; description: string }
  ): Promise<BookingRequest> {
    loadFromStorage();
    const current = mockBookingsState.find((b) => b.id === bookingId);
    if (!current) {
      throw new Error(`Booking request ${bookingId} not found`);
    }

    if (!isValidBookingTransition(current.status as BookkaroStatus, 'DISPUTED')) {
      throw new Error(`Cannot raise dispute for booking in status: ${current.status}`);
    }

    const updated = await this.updateBookingStatus(
      bookingId,
      'DISPUTED',
      'CUSTOMER',
      `Grievance registered: ${disputeData.reason} (Ticket #${disputeData.ticketId})`
    );

    // Attach dispute object
    const index = mockBookingsState.findIndex((b) => b.id === bookingId);
    if (index !== -1) {
      mockBookingsState[index] = {
        ...mockBookingsState[index],
        dispute: {
          ...disputeData,
          filedAt: new Date().toISOString(),
          status: 'OPEN',
        },
      };
      saveToStorage();
      notifyListeners();
      return mockBookingsState[index];
    }
    return updated;
  },

  /**
   * Request a refund for eligible CANCELLED or DISPUTED bookings
   */
  async requestRefund(
    bookingId: string,
    payload: { reason: string; upiOrBankRef?: string }
  ): Promise<BookingRequest> {
    loadFromStorage();
    const current = mockBookingsState.find((b) => b.id === bookingId || b.bookingReference === bookingId);
    if (!current) {
      throw new Error(`Booking request ${bookingId} not found`);
    }

    if (!isValidBookingTransition(current.status as BookkaroStatus, 'REFUND_REQUESTED')) {
      throw new Error(`Cannot request refund for booking in status: ${current.status}. Must be CANCELLED or DISPUTED.`);
    }

    const updated = await this.updateBookingStatus(
      current.id,
      'REFUND_REQUESTED',
      'CUSTOMER',
      `Refund requested: ${payload.reason}${payload.upiOrBankRef ? ` (Payout: ${payload.upiOrBankRef})` : ''}`
    );

    const index = mockBookingsState.findIndex((b) => b.id === current.id);
    if (index !== -1) {
      mockBookingsState[index] = {
        ...mockBookingsState[index],
        refundRequest: {
          reason: payload.reason,
          upiOrBankRef: payload.upiOrBankRef,
          requestedAt: new Date().toISOString(),
        },
      };
      saveToStorage();
      notifyListeners();
      return mockBookingsState[index];
    }
    return updated;
  },

  /**
   * Approve and process refund to customer (Admin action)
   */
  async approveRefund(
    bookingId: string,
    adminNote?: string
  ): Promise<BookingRequest> {
    loadFromStorage();
    const current = mockBookingsState.find((b) => b.id === bookingId || b.bookingReference === bookingId);
    if (!current) {
      throw new Error(`Booking request ${bookingId} not found`);
    }

    if (!isValidBookingTransition(current.status as BookkaroStatus, 'REFUNDED')) {
      throw new Error(`Cannot approve refund for booking in status: ${current.status}. Must be in REFUND_REQUESTED or DISPUTED.`);
    }

    const updated = await this.updateBookingStatus(
      current.id,
      'REFUNDED',
      'ADMIN',
      adminNote || 'Refund approved by BOOKKARO Admin and credited back to customer account/UPI.'
    );

    const index = mockBookingsState.findIndex((b) => b.id === current.id);
    if (index !== -1) {
      mockBookingsState[index] = {
        ...mockBookingsState[index],
        paymentStatus: 'REFUNDED',
        refundRequest: {
          ...(mockBookingsState[index].refundRequest || {
            reason: 'Administrative refund approval',
            requestedAt: new Date().toISOString(),
          }),
          processedAt: new Date().toISOString(),
          adminNote: adminNote || 'Approved by Admin',
        },
      };
      saveToStorage();
      notifyListeners();
      return mockBookingsState[index];
    }
    return updated;
  },

  /**
   * Submit a verified review strictly for COMPLETED bookings
   */
  async addVerifiedReview(
    bookingId: string,
    review: { rating: number; comment: string; tags: string[] }
  ): Promise<BookingRequest> {
    loadFromStorage();
    const current = mockBookingsState.find((b) => b.id === bookingId);
    if (!current) {
      throw new Error(`Booking request ${bookingId} not found`);
    }

    if (current.status !== 'COMPLETED') {
      throw new Error(`Reviews can only be submitted for COMPLETED visits. Current status: ${current.status}`);
    }

    if (current.verifiedReview) {
      throw new Error('A verified review has already been recorded for this visit.');
    }

    await new Promise((resolve) => setTimeout(resolve, 80));

    const index = mockBookingsState.findIndex((b) => b.id === bookingId);
    if (index !== -1) {
      const updated: BookingRequest = {
        ...mockBookingsState[index],
        verifiedReview: {
          ...review,
          submittedAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      };
      mockBookingsState[index] = updated;
      saveToStorage();
      notifyListeners();
      return updated;
    }

    return current;
  },

  /**
   * Complete booking with 4-digit Venue PIN verification & Commercial Ledger entry
   */
  async completeBookingWithPin(
    bookingIdOrRef: string,
    checkInPin: string,
    finalBillValueInr: number
  ): Promise<{ booking: BookingRequest; ledgerEntry: CommissionLedgerRow }> {
    loadFromStorage();
    const index = ensureBookingExists(bookingIdOrRef);
    if (index === -1) {
      throw new Error(`Booking ${bookingIdOrRef} not found`);
    }

    const current = mockBookingsState[index];

    // Check PIN: if booking has a checkInPin, ensure it matches
    const expectedPin = current.checkInPin ? current.checkInPin.trim() : '4821';
    if (checkInPin.trim() !== expectedPin) {
      throw new Error(`Invalid 4-digit Venue PIN code. Code did not match booking verification code.`);
    }

    if (!isValidBookingTransition(current.status as BookkaroStatus, 'COMPLETED')) {
      throw new Error(`Cannot mark booking completed from status: ${current.status}`);
    }

    const now = new Date().toISOString();
    const realizedBill =
      Number(finalBillValueInr) > 0 ? Number(finalBillValueInr) : current.pricing.amountPayableAtVenue;

    const updatedBooking: BookingRequest = {
      ...current,
      status: 'COMPLETED',
      updatedAt: now,
      pricing: {
        ...current.pricing,
        amountPayableAtVenue: realizedBill,
      },
      statusHistory: [
        ...current.statusHistory,
        {
          status: 'COMPLETED',
          timestamp: now,
          updatedBy: 'PROVIDER',
          note: `Completed at venue upon 4-digit PIN verification. Realized bill: ₹${realizedBill}.`,
        },
      ],
    };

    mockBookingsState[index] = updatedBooking;

    // Update portal booking state
    const pIdx = mockPortalBookingsState.findIndex(
      (p) =>
        p.bookingReference === current.bookingReference ||
        p.id === `p-${current.id}` ||
        p.id === current.id ||
        p.id === bookingIdOrRef
    );

    let commRate = 8.0;
    if (pIdx !== -1) {
      commRate = mockPortalBookingsState[pIdx].commissionPercentage || 8.0;
      mockPortalBookingsState[pIdx] = {
        ...mockPortalBookingsState[pIdx],
        status: 'COMPLETED',
        finalRealizedPriceInr: realizedBill,
      };
    }

    // Immutable ledger entry
    const platformFee = Math.round((realizedBill * commRate) / 100);
    const netPayout = realizedBill - platformFee;

    const ledgerEntry: CommissionLedgerRow = {
      bookingId: current.id,
      bookingReference: current.bookingReference,
      customerName: current.customerName,
      serviceCompleted: current.serviceName,
      completedDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      finalBillValueInr: realizedBill,
      commissionPercentage: commRate,
      platformFeePayableInr: platformFee,
      netMerchantPayoutInr: netPayout,
      payoutStatus: 'PENDING_T_PLUS_1',
    };

    mockLedgerState = [ledgerEntry, ...mockLedgerState];

    saveToStorage();
    notifyListeners();

    return { booking: updatedBooking, ledgerEntry };
  },

  /**
   * Partner accepts and confirms incoming slot
   */
  async acceptBooking(bookingIdOrRef: string): Promise<BookingRequest> {
    return this.updateBookingStatus(
      bookingIdOrRef,
      'CONFIRMED',
      'PROVIDER',
      'Accepted & slot confirmed by partner on roster'
    );
  },

  /**
   * Partner declines incoming booking request with required reason
   */
  async declineBooking(bookingIdOrRef: string, reason: string): Promise<BookingRequest> {
    loadFromStorage();
    const index = ensureBookingExists(bookingIdOrRef);
    if (index === -1) {
      throw new Error(`Booking ${bookingIdOrRef} not found`);
    }

    const current = mockBookingsState[index];
    const now = new Date().toISOString();

    const updatedBooking: BookingRequest = {
      ...current,
      status: 'DECLINED',
      cancellationReason: reason,
      updatedAt: now,
      statusHistory: [
        ...current.statusHistory,
        {
          status: 'DECLINED',
          timestamp: now,
          updatedBy: 'PROVIDER',
          note: `Declined by partner: ${reason}`,
        },
      ],
    };

    mockBookingsState[index] = updatedBooking;

    const pIdx = mockPortalBookingsState.findIndex(
      (p) =>
        p.bookingReference === current.bookingReference ||
        p.id === `p-${current.id}` ||
        p.id === current.id ||
        p.id === bookingIdOrRef
    );
    if (pIdx !== -1) {
      mockPortalBookingsState[pIdx] = {
        ...mockPortalBookingsState[pIdx],
        status: 'DECLINED',
        declineReason: reason,
      };
    }

    saveToStorage();
    notifyListeners();
    return updatedBooking;
  },

  /**
   * Partner marks booking as No-Show
   */
  async markNoShow(bookingIdOrRef: string): Promise<BookingRequest> {
    return this.updateBookingStatus(
      bookingIdOrRef,
      'NO_SHOW',
      'PROVIDER',
      'Customer failed to arrive within booking window'
    );
  },
};
