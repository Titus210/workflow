import React from 'react';
interface TextareaProps extends
  React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  showCount?: boolean;
}
export function Textarea({
  label,
  error,
  showCount,
  className = '',
  maxLength,
  value,
  ...props
}: TextareaProps) {
  const count = value ? String(value).length : 0;
  return (
    <div className="space-y-1">
      {label &&
      <label className="block text-sm font-medium text-text-primary">
          {label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
      }
      <textarea
        className={`w-full px-3 py-2 border rounded bg-card-bg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${error ? 'border-error' : 'border-border-color'} ${className}`}
        maxLength={maxLength}
        value={value}
        {...props} />
      
      <div className="flex justify-between items-center">
        {error && <p className="text-sm text-error">{error}</p>}
        {showCount && maxLength &&
        <p className="text-sm text-text-secondary ml-auto">
            {count}/{maxLength}
          </p>
        }
      </div>
    </div>);

}