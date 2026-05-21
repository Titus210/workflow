import React from 'react';
interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
}
export function Toggle({ enabled, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-sm transition-colors ${enabled ? 'bg-accent' : 'bg-gray-300'}`}>
      
      <span className="sr-only">{label}</span>
      <span
        className={`inline-block h-4 w-4 transform rounded-sm bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
      
    </button>);

}