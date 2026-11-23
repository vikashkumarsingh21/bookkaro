import prisma from '../../config/db';
import { config } from '../../config';
import { razorpayService } from '../../config/razorpay';
import { NotFoundError } from '../../utils/errors';
import { LedgerQueryParams } from './billing.validation';
import { LedgerStatus, Prisma, SubscriptionTier } from '@prisma/client';

const SUBSCRIPTION_TIER_PRICES: Record<SubscriptionTier, number> = {
  FREE: 0,
  BASIC: 499,
  BUSINESS_PRO: 999,
};

export class BillingService {
  /**
   * Helper: Resolves provider owned strictly by PARTNER_OWNER
   */
  private async getOwnerProvider(ownerId: string) {
    const provider = await prisma.provider.findFirst({
      where: { ownerId },
    });

    if (!provider) {
      throw new NotFoundError(
        'No active merchant registered under your owner account in Patna.'
      );
    }

    return provider;
  }

  /**
   * GET /api/v1/partner/billing/summary
   */
  async getBillingSummary(ownerId: string) {
    const provider = await this.getOwnerProvider(ownerId);

    // Aggregate ledger values
    const [aggregates, pendingCount, paidCount, disputedCount] = await Promise.all([
      prisma.commissionLedger.aggregate({
        where: { providerId: provider.id },
        _sum: {
          finalBillInr: true,
          commissionAmountInr: true,
          netPayoutInr: true,
        },
        _count: { id: true },
      }),
      prisma.commissionLedger.count({
        where: { providerId: provider.id, status: LedgerStatus.PENDING },
      }),
      prisma.commissionLedger.count({
        where: { providerId: provider.id, status: LedgerStatus.PAID },
      }),
      prisma.commissionLedger.count({
        where: { providerId: provider.id, status: LedgerStatus.DISPUTED },
      }),
    ]);

    const realizedGmv = Number(aggregates._sum.finalBillInr || 0);
    const totalPlatformFee = Number(aggregates._sum.commissionAmountInr || 0);
    const netPayout = Number(aggregates._sum.netPayoutInr || 0);

    return {
      provider: {
        id: provider.id,
        providerCode: provider.providerCode,
        brandName: provider.brandName,
        category: provider.category,
      },
      commercials: {
        commercialModel: provider.commercialModel, // 'SUBSCRIPTION' | 'COMMISSION'
        commissionRate: provider.commissionRate, // e.g. 10.0 for hotels/salon, 5.0 for restaurants
        activeSubscriptionTier: provider.subscriptionTier,
        tierMonthlyPriceInr: SUBSCRIPTION_TIER_PRICES[provider.subscriptionTier],
      },
      ledgerTotals: {
        realizedGmv,
        totalPlatformFee,
        netPayout,
        totalTransactions: aggregates._count.id,
        counts: {
          pending: pendingCount,
          paid: paidCount,
          disputed: disputedCount,
        },
      },
    };
  }

  /**
   * GET /api/v1/partner/billing/ledger
   */
  async getLedgerEntries(ownerId: string, params: LedgerQueryParams) {
    const provider = await this.getOwnerProvider(ownerId);
    const { status, startDate, endDate, page, limit } = params;

    const where: Prisma.CommissionLedgerWhereInput = {
      providerId: provider.id,
    };

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(`${startDate}T00:00:00.000Z`);
      }
      if (endDate) {
        where.createdAt.lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    const [items, total] = await Promise.all([
      prisma.commissionLedger.findMany({
        where,
        include: {
          booking: {
            select: {
              id: true,
              bookingCode: true,
              category: true,
              slotDate: true,
              slotTime: true,
              customer: {
                select: {
                  fullName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.commissionLedger.count({ where }),
    ]);

    const formattedItems = items.map((entry) => ({
      id: entry.id,
      bookingId: entry.bookingId,
      bookingCode: entry.booking.bookingCode,
      customerName: entry.booking.customer.fullName,
      category: entry.booking.category,
      serviceDate: entry.booking.slotDate,
      finalBillInr: Number(entry.finalBillInr),
      commissionRate: entry.commissionRate,
      commissionAmountInr: Number(entry.commissionAmountInr),
      netPayoutInr: Number(entry.netPayoutInr),
      status: entry.status,
      createdAt: entry.createdAt,
    }));

    return {
      items: formattedItems,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * GET /api/v1/partner/billing/ledger/export
   * Generate CSV format ledger statement
   */
  async exportLedgerCsv(ownerId: string): Promise<{ filename: string; csv: string }> {
    const provider = await this.getOwnerProvider(ownerId);

    const items = await prisma.commissionLedger.findMany({
      where: { providerId: provider.id },
      include: {
        booking: {
          select: {
            bookingCode: true,
            category: true,
            slotDate: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'Ledger ID',
      'Booking Reference',
      'Category',
      'Service Date',
      'Final Bill (INR)',
      'Platform Rate (%)',
      'Platform Fee (INR)',
      'Net Payout (INR)',
      'Settlement Status',
      'Timestamp',
    ];

    const escapeCsvField = (val: unknown) => {
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = items.map((i) => [
      escapeCsvField(i.id),
      escapeCsvField(i.booking.bookingCode),
      escapeCsvField(i.booking.category),
      escapeCsvField(i.booking.slotDate),
      escapeCsvField(Number(i.finalBillInr).toFixed(2)),
      escapeCsvField(i.commissionRate),
      escapeCsvField(Number(i.commissionAmountInr).toFixed(2)),
      escapeCsvField(Number(i.netPayoutInr).toFixed(2)),
      escapeCsvField(i.status),
      escapeCsvField(i.createdAt.toISOString()),
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const filename = `bookkaro-ledger-${provider.providerCode}-${Date.now()}.csv`;

    return { filename, csv };
  }

  /**
   * POST /api/v1/partner/billing/subscription/upgrade
   */
  async upgradeSubscription(ownerId: string, targetTier: SubscriptionTier) {
    const provider = await this.getOwnerProvider(ownerId);
    const amountInr = SUBSCRIPTION_TIER_PRICES[targetTier];

    // Free tier downgrade
    if (amountInr === 0) {
      const updated = await prisma.provider.update({
        where: { id: provider.id },
        data: { subscriptionTier: SubscriptionTier.FREE },
      });

      return {
        message: 'Successfully updated to FREE tier.',
        provider: {
          id: updated.id,
          subscriptionTier: updated.subscriptionTier,
        },
      };
    }

    // Paid upgrade order via Razorpay
    const amountInPaise = amountInr * 100;
    const order = await razorpayService.createOrder({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `SUB-${provider.providerCode}-${targetTier}`,
      notes: {
        providerId: provider.id,
        ownerId,
        targetTier,
      },
    });

    // In mock mode, also proactively update the tier for ease of development/testing
    if (razorpayService.isMockMode) {
      await prisma.provider.update({
        where: { id: provider.id },
        data: { subscriptionTier: targetTier },
      });
    }

    return {
      orderId: order.id,
      amountInr,
      currency: 'INR',
      keyId: config.razorpay.keyId || 'rzp_test_bookkaro_patna_dev',
      targetTier,
      message: `Razorpay order created for ${targetTier} plan upgrade (₹${amountInr}/month).`,
    };
  }
}

export const billingService = new BillingService();
