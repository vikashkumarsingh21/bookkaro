import React from 'react';
import { SkeletonLoader, SkeletonLoaderProps } from './SkeletonLoader';

export type SkeletonProps = SkeletonLoaderProps;

export const Skeleton: React.FC<SkeletonProps> = (props) => {
  return <SkeletonLoader {...props} />;
};

export { SkeletonLoader };
