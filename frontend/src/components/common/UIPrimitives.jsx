import React from 'react';

/**
 * Standardized Sharp-Edged Button Component
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold select-none transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#0593C6] focus-visible:outline-offset-2';
  
  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5',
    md: 'text-xs sm:text-sm px-4 py-2',
    lg: 'text-sm sm:text-base px-5 py-2.5',
  };

  const variantStyles = {
    primary: 'dokmeh-btn-primary',
    secondary: 'dokmeh-btn-secondary',
    ghost: 'dokmeh-btn-ghost',
    danger: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-300 shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5',
    outline: 'bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#0F172A] shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant] || ''} ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  );
}

/**
 * Standardized Sharp-Edged Geometric Badge
 */
export function Badge({
  children,
  variant = 'default',
  className = '',
}) {
  const variants = {
    default: 'text-[#64748B] bg-[#F8FAFC] border-[#E2E8F0]',
    primary: 'dokmeh-badge-primary',
    accent: 'dokmeh-badge-active',
    success: 'text-emerald-800 bg-emerald-50 border-emerald-300',
    mono: 'font-mono text-[#0F172A] bg-[#FFFFFF] border-[#CBD5E1]',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 ${variants[variant]} ${className}`}>
      {variant === 'accent' && <span className="w-1.5 h-1.5 bg-[#D83995]" />}
      {children}
    </span>
  );
}

/**
 * Standardized Sharp-Edged Card Container
 */
export function Card({
  children,
  className = '',
  hoverEffect = true,
  ...props
}) {
  return (
    <div
      className={`bg-white border border-[#E2E8F0] shadow-hard-sm ${
        hoverEffect ? 'hover:border-[#0F172A] transition-all' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Standardized Sharp Skeleton Shimmer Loader
 */
export function Skeleton({ className = '' }) {
  return <div className={`skeleton-sharp ${className}`} />;
}
