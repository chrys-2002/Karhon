"use client";
import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
}

export default function Button({ 
  children, 
  variant = "primary", 
  onClick, 
  type = "button",
  disabled = false,
  className = ""
}: ButtonProps) {
  let variantClasses = "";
  
  if (variant === "primary") {
    variantClasses = "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white";
  } else if (variant === "secondary") {
    variantClasses = "bg-gray-600 hover:bg-gray-700 text-white";
  } else if (variant === "outline") {
    variantClasses = "border-2 border-orange-500 text-orange-500 hover:bg-orange-50";
  }
  
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={"px-6 py-2 rounded-lg font-semibold transition-all duration-300 " + variantClasses + " " + disabledClasses + " " + className}
    >
      {children}
    </button>
  );
}
