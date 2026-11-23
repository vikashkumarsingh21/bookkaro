import React from 'react';
import Link from 'next/link';

export type ButtonVariant =
  | 'primary'
  | 'accent'
  | 'secondary'
  | 'outline'
  | 'subtle'
  | 'danger'
  | 'ghost'
  | 'forest'
  | 'terracotta';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  href?: string;
  target?: string;
  rel?: string;
}

export function getButtonStyles({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}): string {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 ease-out select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-ring';

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-xs px-3 py-1.5 rounded-[var(--radius-control)] gap-1.5 h-8',
    md: 'text-sm px-4 py-2 rounded-[var(--radius-control)] gap-2 h-10',
    lg: 'text-base px-6 py-2.5 rounded-[var(--radius-control)] gap-2.5 h-11',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-primary hover:bg-primary-hover text-primary-fg border border-primary focus-visible:ring-ring',
    accent:
      'bg-accent hover:opacity-90 text-accent-fg border border-accent focus-visible:ring-ring',
    secondary:
      'bg-surface-subtle hover:bg-border-subtle text-ink border border-border-subtle focus-visible:ring-ring',
    outline:
      'bg-surface hover:bg-surface-subtle text-ink border border-border-subtle focus-visible:ring-ring',
    subtle:
      'bg-surface-subtle hover:bg-border-subtle text-primary border border-border-subtle font-semibold focus-visible:ring-ring',
    danger:
      'bg-[#991B1B] hover:bg-[#7F1D1D] text-white border border-[#991B1B] focus-visible:ring-[#991B1B]',
    ghost:
      'bg-transparent hover:bg-surface-subtle text-ink focus-visible:ring-ring',
    forest:
      'bg-primary hover:bg-primary-hover text-primary-fg border border-primary focus-visible:ring-ring',
    terracotta:
      'bg-accent hover:opacity-90 text-accent-fg border border-accent focus-visible:ring-ring',
  };

  return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
    fullWidth ? 'w-full' : ''
  } ${className}`;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      href,
      target,
      rel,
      ...props
    },
    ref
  ) => {
    const computedClass = getButtonStyles({ variant, size, fullWidth, className });

    if (href) {
      return (
        <Link
          href={href}
          target={target}
          rel={rel}
          className={computedClass}
          onClick={props.onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>}
        >
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={computedClass}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
