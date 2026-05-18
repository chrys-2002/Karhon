'use client';
import React from 'react';

interface InputProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'password' | 'date' | 'textarea';
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
}

export default function Input({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  required = false,
  error,
  placeholder
}: InputProps) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          rows={4}
          className={w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 }
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
          className={w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 }
        />
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
