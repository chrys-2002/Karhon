"use client";
import React from "react";

interface InputProps {
  label: string;
  name: string;
  type?: "text" | "email" | "tel" | "password" | "date" | "textarea" | "number";
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
  rows?: number;
}

export default function Input({ 
  label, 
  name, 
  type = "text", 
  value, 
  onChange, 
  required = false,
  error,
  placeholder,
  rows = 4
}: InputProps) {
  const baseClassName = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 " + (error ? "border-red-500" : "border-gray-300");
  
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={value as string}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          rows={rows}
          className={baseClassName}
        />
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={baseClassName}
        />
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
