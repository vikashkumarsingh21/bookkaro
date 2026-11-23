import React from 'react';

export type SkeletonType = 'text' | 'avatar' | 'card' | 'button' | 'slot' | 'image';

export interface SkeletonLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: SkeletonType;
  lines?: number;
  width?: string;
  height?: string;
  circle?: boolean;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'text',
  lines = 3,
  width,
  height,
  circle = false,
  className = '',
  ...props
}) => {
  // Base warm pulse using semantic surface-subtle without blue undertones
  const baseShimmer =
    'relative overflow-hidden bg-surface-subtle rounded-[var(--radius-control)] animate-pulse';

  if (type === 'avatar') {
    return (
      <div
        className={`${baseShimmer} ${circle ? 'rounded-full' : 'rounded-[var(--radius-card)]'} ${
          width || 'w-12'
        } ${height || 'h-12'} shrink-0 ${className}`}
        {...props}
      />
    );
  }

  if (type === 'button') {
    return (
      <div
        className={`${baseShimmer} rounded-[var(--radius-control)] ${width || 'w-28'} ${
          height || 'h-10'
        } ${className}`}
        {...props}
      />
    );
  }

  if (type === 'slot') {
    return (
      <div
        className={`${baseShimmer} rounded-[var(--radius-control)] ${width || 'w-24'} ${
          height || 'h-9'
        } ${className}`}
        {...props}
      />
    );
  }

  if (type === 'image') {
    return (
      <div
        className={`${baseShimmer} rounded-[var(--radius-card)] w-full ${
          height || 'h-48'
        } ${className}`}
        {...props}
      />
    );
  }

  if (type === 'card') {
    return (
      <div
        className={`bg-surface rounded-[var(--radius-card)] border border-border-subtle p-5 flex flex-col space-y-4 ${className}`}
        {...props}
      >
        <div className="flex items-center space-x-3.5">
          <div className={`${baseShimmer} w-14 h-14 rounded-[var(--radius-control)] shrink-0`} />
          <div className="flex-1 space-y-2">
            <div className={`${baseShimmer} h-4 w-3/5 rounded`} />
            <div className={`${baseShimmer} h-3 w-2/5 rounded`} />
          </div>
        </div>
        <div className="space-y-2 pt-2">
          <div className={`${baseShimmer} h-3 w-full rounded`} />
          <div className={`${baseShimmer} h-3 w-4/5 rounded`} />
        </div>
        <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
          <div className={`${baseShimmer} h-4 w-20 rounded`} />
          <div className={`${baseShimmer} h-8 w-24 rounded-[var(--radius-control)]`} />
        </div>
      </div>
    );
  }

  // Default text skeleton
  return (
    <div className={`space-y-2.5 w-full ${className}`} {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`${baseShimmer} h-3.5 rounded ${
            index === lines - 1 && lines > 1 ? 'w-3/5' : 'w-full'
          }`}
          style={{
            height: height,
            width: index === lines - 1 && lines > 1 ? undefined : width,
          }}
        />
      ))}
    </div>
  );
};
