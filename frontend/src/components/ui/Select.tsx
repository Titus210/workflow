import React from 'react';
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: {
    value: string;
    label: string;
  }[];
}
export function Select({
  label,
  error,
  options,
  className = '',
  ...props
}: SelectProps) {
  return (
    <div className="space-y-1">
      {label &&
      <label className="block text-sm font-medium text-text-primary">
          {label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
      }
      <select
        className={`w-full px-3 py-2 border rounded bg-card-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${error ? 'border-error' : 'border-border-color'} ${className}`}
        {...props}>
        
        {options.map((option) =>
        <option key={option.value} value={option.value}>
            {option.label}
          </option>
        )}
      </select>
      {error && <p className="text-sm text-error">{error}</p>}
    </div>);

}