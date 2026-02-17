import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * Reusable input component with label and error handling
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const inputClasses = `
      w-full px-4 py-2 rounded-lg border
      ${
        error
          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
          : 'border-secondary-300 focus:ring-primary-500 focus:border-primary-500'
      }
      focus:outline-none focus:ring-2
      disabled:bg-secondary-100 disabled:cursor-not-allowed
      ${className}
    `;

    return (
      <div className="w-full">
        {label && (
          <label className="text-secondary-700 mb-2 block text-sm font-medium">
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <input ref={ref} className={inputClasses} {...props} />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {helperText && !error && <p className="text-secondary-500 mt-1 text-sm">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
