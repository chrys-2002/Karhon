"use client";
import React from "react";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export default function Card({ children, title, className = "" }: CardProps) {
  return (
    <div className={"bg-white rounded-lg shadow-md overflow-hidden " + className}>
      {title && (
        <div className="border-b px-6 py-4 bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
