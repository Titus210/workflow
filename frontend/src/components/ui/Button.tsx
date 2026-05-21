import React from 'react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  children: React.ReactNode;
}
export function Button({
  variant = 'primary',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
  'px-4 py-2 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-accent text-white hover:bg-blue-700',
    secondary: 'border border-border-color text-text-primary hover:bg-gray-50',
    danger: 'border border-error text-error hover:bg-red-50',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
  };
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}>
      
      {children}
    </button>);

}