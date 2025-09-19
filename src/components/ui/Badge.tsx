import React, { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'secondary';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'secondary', size = 'sm', className = '' }: BadgeProps) {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variants = {
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100',
    danger: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  };
  
  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm'
  };

  return (
    <span className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}