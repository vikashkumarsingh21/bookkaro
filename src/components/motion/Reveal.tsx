'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
  delay?: number; // In seconds (e.g. 0.08) or milliseconds (e.g. 80)
  duration?: number; // In milliseconds, default 480ms (fast, calm editorial)
  yOffset?: number; // In pixels, default 14px
  threshold?: number; // Intersection threshold, default 0.12
  once?: boolean; // Trigger once, default true
}

/**
 * Reveal - Luxury Hospitality Scroll Reveal Wrapper
 * - Restrained 14px upward glide + gentle opacity fade
 * - Fast, calm editorial cubic-bezier([0.22, 1, 0.36, 1])
 * - GPU-composited only (transform and opacity) with zero layout shift (CLS = 0)
 * - Automatic prefers-reduced-motion fallback
 */
export const Reveal: React.FC<RevealProps> = ({
  children,
  as: Component = 'div',
  className = '',
  delay = 0,
  duration = 480,
  yOffset = 14,
  threshold = 0.12,
  once = true,
  style,
  ...props
}) => {
  const ref = useRef<HTMLElement>(null);
  const [reducedMotion] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  // Normalize delay: < 10 is treated as seconds (e.g. 0.08 -> 80ms), >= 10 as ms
  const delayMs = typeof delay === 'number' ? (delay < 10 ? Math.round(delay * 1000) : delay) : 0;

  useEffect(() => {
    if (reducedMotion) return;

    // IntersectionObserver support guard - defer fallback to prevent sync render cascades
    if (!ref.current || typeof IntersectionObserver === 'undefined') {
      const timer = setTimeout(() => setIsVisible(true), 0);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once && ref.current) {
              observer.unobserve(ref.current);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    const currentEl = ref.current;
    observer.observe(currentEl);

    return () => {
      if (currentEl) {
        observer.unobserve(currentEl);
      }
    };
  }, [threshold, once, reducedMotion]);

  const motionStyle: React.CSSProperties = reducedMotion
    ? { ...style }
    : {
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? 'translate3d(0, 0, 0)'
          : `translate3d(0, ${yOffset}px, 0)`,
        transitionProperty: 'opacity, transform',
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDelay: `${delayMs}ms`,
        willChange: isVisible ? 'auto' : 'opacity, transform',
      };

  return (
    <Component
      ref={ref}
      className={`reveal-motion ${className}`}
      style={motionStyle}
      {...props}
    >
      {children}
    </Component>
  );
};
