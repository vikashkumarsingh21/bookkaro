import React from 'react';
import { BookingStatus } from '@/types/booking';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'accent'
  | 'subtle'
  | 'outline'
  | 'status'
  | 'plum'
  | 'plum-subtle'
  | 'forest'
  | 'forest-subtle'
  | 'terracotta'
  | 'terracotta-subtle'
  | 'sand'
  | 'charcoal';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  status?: BookingStatus;
  dot?: boolean;
  dotPulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  status,
  dot = false,
  dotPulse = false,
  className = '',
  ...props
}) => {
  const sizeStyles: Record<BadgeSize, string> = {
    sm: 'text-[11px] font-medium px-2 py-0.5 rounded-[var(--radius-control)] gap-1 tracking-tight',
    md: 'text-xs font-medium px-2.5 py-1 rounded-[var(--radius-control)] gap-1.5 tracking-tight',
  };

  // Base styling - strictly flat, matte, hairline border using semantic tokens
  let variantClass = 'bg-surface-subtle text-ink-muted border border-border-subtle';
  let dotColor = 'bg-ink-muted';

  if (status) {
    switch (status) {
      case 'REQUESTED':
        variantClass = 'bg-surface-subtle text-primary border border-border-subtle font-semibold';
        dotColor = 'bg-primary';
        break;
      case 'ACCEPTED':
        variantClass = 'bg-surface-subtle text-accent border border-border-subtle font-medium';
        dotColor = 'bg-accent';
        break;
      case 'CONFIRMED':
        variantClass = 'bg-primary text-primary-fg border border-primary font-semibold';
        dotColor = 'bg-primary-fg';
        break;
      case 'COMPLETED':
        variantClass = 'bg-surface text-ink border border-border-subtle font-medium';
        dotColor = 'bg-ink';
        break;
      case 'DECLINED':
        variantClass = 'bg-red-50 text-red-800 border border-red-200 font-medium';
        dotColor = 'bg-red-700';
        break;
      case 'EXPIRED':
        variantClass = 'bg-surface-subtle text-ink-muted border border-border-subtle';
        dotColor = 'bg-ink-muted';
        break;
      case 'CANCELLED':
        variantClass = 'bg-surface-subtle text-ink-muted border border-border-subtle';
        dotColor = 'bg-ink-muted';
        break;
      case 'NO_SHOW':
        variantClass = 'bg-rose-50 text-rose-800 border border-rose-200 font-medium';
        dotColor = 'bg-rose-700';
        break;
      case 'DISPUTED':
        variantClass = 'bg-amber-50 text-amber-900 border border-amber-200 font-semibold';
        dotColor = 'bg-amber-700';
        break;
    }
  } else {
    switch (variant) {
      case 'primary':
      case 'forest':
      case 'plum':
        variantClass = 'bg-primary text-primary-fg border border-primary font-semibold';
        dotColor = 'bg-primary-fg';
        break;
      case 'subtle':
      case 'forest-subtle':
      case 'plum-subtle':
        variantClass = 'bg-surface-subtle text-primary border border-border-subtle font-medium';
        dotColor = 'bg-primary';
        break;
      case 'accent':
      case 'terracotta':
        variantClass = 'bg-accent text-accent-fg border border-accent font-semibold';
        dotColor = 'bg-accent-fg';
        break;
      case 'terracotta-subtle':
        variantClass = 'bg-surface-subtle text-accent border border-border-subtle font-medium';
        dotColor = 'bg-accent';
        break;
      case 'charcoal':
        variantClass = 'bg-ink text-surface border border-ink font-medium';
        dotColor = 'bg-surface';
        break;
      case 'sand':
        variantClass = 'bg-surface-subtle text-ink border border-border-subtle font-medium';
        dotColor = 'bg-ink';
        break;
      case 'outline':
        variantClass = 'bg-surface text-ink border border-border-subtle';
        dotColor = 'bg-ink';
        break;
      case 'default':
      default:
        variantClass = 'bg-surface-subtle text-ink-muted border border-border-subtle';
        dotColor = 'bg-ink-muted';
        break;
    }
  }

  return (
    <span
      className={`
        inline-flex items-center select-none shrink-0 transition-colors
        ${sizeStyles[size]}
        ${variantClass}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span
          className={`
            w-1.5 h-1.5 rounded-full shrink-0
            ${dotColor}
            ${dotPulse ? 'animate-pulse' : ''}
          `}
        />
      )}
      <span>{children}</span>
    </span>
  );
};
