import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface BaseFieldProps {
  error?: string;
  label: string;
}

type InputFieldProps = BaseFieldProps & InputHTMLAttributes<HTMLInputElement>;
type TextareaFieldProps = BaseFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function FormInput({ error, label, className = '', ...props }: InputFieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
      <input
        className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand ${
          error ? 'border-red-300' : 'border-gray-200'
        } ${className}`.trim()}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

export function FormTextarea({ error, label, className = '', ...props }: TextareaFieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
      <textarea
        className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand ${
          error ? 'border-red-300' : 'border-gray-200'
        } ${className}`.trim()}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
