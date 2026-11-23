import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RotateCcw,
  AlertTriangle,
  UserX,
  Hourglass,
  CalendarCheck,
} from 'lucide-react';
import { BookingStatus } from '@/types/booking';

interface BookingStatusBadgeProps {
  status: BookingStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  // STRICT MATTE PALETTE: Terracotta for REQUESTED, Forest Green for ACCEPTED/CONFIRMED/COMPLETED,
  // Warm Slate for EXPIRED/CANCELLED, Muted Crimson for DECLINED/NO_SHOW/DISPUTED
  const configMap: Record<
    BookingStatus,
    {
      label: string;
      bg: string;
      text: string;
      border: string;
      icon: React.ElementType;
      pulse?: boolean;
      pulseColor?: string;
    }
  > = {
    REQUESTED: {
      label: 'Booking Requested',
      bg: 'bg-[#FAF1EB]',
      text: 'text-[#C25E28]',
      border: 'border-[#F3DEC9]',
      icon: Hourglass,
      pulse: true,
      pulseColor: 'bg-[#C25E28]',
    },
    ACCEPTED: {
      label: 'Provider Accepted',
      bg: 'bg-[#EBF2EE]',
      text: 'text-[#143D2B]',
      border: 'border-[#C8DBD1]',
      icon: CalendarCheck,
    },
    CONFIRMED: {
      label: 'Slot Confirmed',
      bg: 'bg-[#143D2B]',
      text: 'text-white',
      border: 'border-[#143D2B]',
      icon: CheckCircle2,
    },
    COMPLETED: {
      label: 'Visit Completed',
      bg: 'bg-[#EBF2EE]',
      text: 'text-[#143D2B]',
      border: 'border-[#C8DBD1]',
      icon: CheckCircle2,
    },
    DECLINED: {
      label: 'Merchant Declined',
      bg: 'bg-[#FDF2F2]',
      text: 'text-[#9E2A2B]',
      border: 'border-[#F8D7DA]',
      icon: XCircle,
    },
    EXPIRED: {
      label: 'Request Expired',
      bg: 'bg-[#FAF9F6]',
      text: 'text-[#52524E]',
      border: 'border-[#E2DDD5]',
      icon: Clock,
    },
    CANCELLED: {
      label: 'Cancelled',
      bg: 'bg-[#FAF9F6]',
      text: 'text-[#52524E]',
      border: 'border-[#E2DDD5]',
      icon: RotateCcw,
    },
    NO_SHOW: {
      label: 'Marked No-Show',
      bg: 'bg-[#FDF2F2]',
      text: 'text-[#9E2A2B]',
      border: 'border-[#F8D7DA]',
      icon: UserX,
    },
    DISPUTED: {
      label: 'Dispute Open',
      bg: 'bg-[#FDF2F2]',
      text: 'text-[#9E2A2B]',
      border: 'border-[#F8D7DA]',
      icon: AlertTriangle,
      pulse: true,
      pulseColor: 'bg-[#9E2A2B]',
    },
    REFUND_REQUESTED: {
      label: 'Refund Requested',
      bg: 'bg-[#FAF1EB]',
      text: 'text-[#C25E28]',
      border: 'border-[#F3DEC9]',
      icon: RotateCcw,
      pulse: true,
      pulseColor: 'bg-[#C25E28]',
    },
    REFUNDED: {
      label: 'Refund Processed',
      bg: 'bg-[#EBF2EE]',
      text: 'text-[#143D2B]',
      border: 'border-[#C8DBD1]',
      icon: CheckCircle2,
    },
  };

  const current = configMap[status] || {
    label: status,
    bg: 'bg-[#FAF9F6]',
    text: 'text-[#52524E]',
    border: 'border-[#E2DDD5]',
    icon: AlertCircle,
  };

  const Icon = current.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium tracking-tight rounded-full border select-none transition-colors
        ${current.bg} ${current.text} ${current.border} ${sizeClasses[size]} ${className}
      `}
    >
      {showIcon && (
        <span className="relative flex items-center justify-center">
          <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
          {current.pulse && (
            <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  current.pulseColor || 'bg-[#C25E28]'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                  current.pulseColor || 'bg-[#C25E28]'
                }`}
              />
            </span>
          )}
        </span>
      )}
      <span>{current.label}</span>
    </span>
  );
};
