import React from 'react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  prefixText?: string;
  suffixText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      prefixText,
      suffixText,
      id,
      className = '',
      disabled,
      required,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
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

          {prefixText && (
            <span className="pl-3 text-xs font-medium text-ink-muted select-none tabular-nums border-r border-border-subtle pr-2.5 mr-1">
              {prefixText}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            required={required}
            className={`
              w-full bg-transparent px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50
              focus:outline-none focus:ring-0 border-0 h-10 disabled:cursor-not-allowed
              ${type === 'number' ? 'tabular-nums' : ''}
              ${leftIcon || prefixText ? 'pl-1.5' : 'pl-3.5'}
              ${rightIcon || suffixText ? 'pr-1.5' : 'pr-3.5'}
              ${className}
            `}
            {...props}
          />

          {suffixText && (
            <span className="pr-3 text-xs font-medium text-ink-muted select-none tabular-nums border-l border-border-subtle pl-2.5 ml-1">
              {suffixText}
            </span>
          )}

          {rightIcon && (
            <div className="pr-3.5 pl-1 text-ink-muted flex items-center">
              {rightIcon}
            </div>
          )}
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

Input.displayName = 'Input';
