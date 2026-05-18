// ============================================================
// CAMPUS EVENTS — Form Input Components
// ============================================================

import { cn } from "@/utils/helpers";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

// ── Shared label + error wrapper ──────────────────────────────────────────────
interface FieldWrapperProps {
  label?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FieldWrapper({
  label,
  error,
  required,
  children,
  className,
}: FieldWrapperProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-xs text-red-600 mt-0.5">{error}</p>
      )}
    </div>
  );
}

// ── Text / email / password / date Input ─────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, required, ...props }, ref) => (
    <FieldWrapper label={label} error={error} required={required}>
      <input
        ref={ref}
        {...props}
        required={required}
        className={cn(
          "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm",
          "placeholder:text-gray-400 text-gray-900",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
          "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
          "transition-colors",
          error && "border-red-400 focus:ring-red-400",
          className
        )}
      />
    </FieldWrapper>
  )
);
Input.displayName = "Input";

// ── Select ────────────────────────────────────────────────────────────────────
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, required, ...props }, ref) => (
    <FieldWrapper label={label} error={error} required={required}>
      <select
        ref={ref}
        {...props}
        required={required}
        className={cn(
          "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm",
          "text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
          "disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors",
          error && "border-red-400 focus:ring-red-400",
          className
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  )
);
Select.displayName = "Select";

// ── Textarea ──────────────────────────────────────────────────────────────────
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, required, ...props }, ref) => (
    <FieldWrapper label={label} error={error} required={required}>
      <textarea
        ref={ref}
        {...props}
        required={required}
        rows={props.rows ?? 4}
        className={cn(
          "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm",
          "placeholder:text-gray-400 text-gray-900 resize-vertical",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
          "disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors",
          error && "border-red-400 focus:ring-red-400",
          className
        )}
      />
    </FieldWrapper>
  )
);
Textarea.displayName = "Textarea";
