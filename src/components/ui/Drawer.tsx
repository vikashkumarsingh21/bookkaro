'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: 'right' | 'left' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  side = 'right',
  size = 'md',
  className = '',
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses: Record<string, Record<string, string>> = {
    right: {
      sm: 'max-w-xs',
      md: 'max-w-md',
      lg: 'max-w-lg',
      full: 'max-w-full',
    },
    left: {
      sm: 'max-w-xs',
      md: 'max-w-md',
      lg: 'max-w-lg',
      full: 'max-w-full',
    },
    bottom: {
      sm: 'max-h-[40vh]',
      md: 'max-h-[60vh]',
      lg: 'max-h-[85vh]',
      full: 'max-h-screen',
    },
  };

  const sidePlacementClasses: Record<string, string> = {
    right: 'inset-y-0 right-0 border-l border-border-subtle animate-in slide-in-from-right duration-200',
    left: 'inset-y-0 left-0 border-r border-border-subtle animate-in slide-in-from-left duration-200',
    bottom: 'inset-x-0 bottom-0 border-t border-border-subtle rounded-t-[var(--radius-card)] animate-in slide-in-from-bottom duration-200',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Flat matte ink backdrop, zero blur */}
      <div
        className="fixed inset-0 bg-ink/60 transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Surface */}
      <div
        className={`
          fixed bg-surface shadow-xl flex flex-col z-10 w-full overflow-hidden text-left text-ink
          ${sidePlacementClasses[side]}
          ${sizeClasses[side][size]}
          ${className}
        `}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between p-5 border-b border-border-subtle shrink-0">
            <div>
              {title && (
                <h3 className="font-heading text-lg font-bold tracking-tight text-ink">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-[var(--radius-control)] text-ink-muted hover:text-ink hover:bg-surface-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content body with native scroll */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {children}
        </div>

        {/* Optional footer */}
        {footer && (
          <div className="p-4 border-t border-border-subtle bg-canvas shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
