import React from 'react';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label &&
      <label className="block text-sm font-medium text-text-primary">
          {label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
      }
      <input
        className={`w-full px-3 py-2 border rounded bg-card-bg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${error ? 'border-error' : 'border-border-color'} ${className}`}
        {...props} />
      
      {error && <p className="text-sm text-error">{error}</p>}
    </div>);

}