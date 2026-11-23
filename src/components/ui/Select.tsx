import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  leftIcon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      leftIcon,
      children,
      id,
      className = '',
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold uppercase tracking-wider text-ink-muted flex items-center justify-between"
          >
            <span>
              {label} {required && <span className="text-accent">*</span>}
            </span>
          </label>
        )}

        <div
          className={`
            relative flex items-center w-full rounded-[var(--radius-control)] bg-surface border transition-all duration-150
            ${
              error
                ? 'border-accent focus-within:ring-2 focus-within:ring-accent/20 focus-within:border-accent'
                : 'border-border-input hover:border-ink-muted focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-ring'
            }
            ${disabled ? 'opacity-60 bg-surface-subtle cursor-not-allowed' : ''}
          `}
        >
          {leftIcon && (
            <div className="pl-3.5 pr-1 text-ink-muted flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}

          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            required={required}
            className={`
              w-full bg-transparent px-3 py-2 pr-9 text-sm text-ink appearance-none
              focus:outline-none focus:ring-0 border-0 h-10 disabled:cursor-not-allowed
              ${leftIcon ? 'pl-2' : ''}
              ${className}
            `}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                    className="bg-surface text-ink"
                  >
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-muted">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {error && (
          <span className="text-xs text-accent font-medium animate-in fade-in-50 duration-150">
            {error}
          </span>
        )}

        {!error && helperText && (
          <span className="text-xs text-ink-muted leading-relaxed">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
