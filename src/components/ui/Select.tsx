"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, type LucideIcon } from "lucide-react";

interface Option {
  value: string;
  label: string;
  /** Emoji (rétro-compatible). */
  icon?: string;
  /** Icône premium Lucide — affichée dans une pastille colorée. */
  Icon?: LucideIcon;
  /** Sous-libellé optionnel affiché en gris sous le label. */
  desc?: string;
}

interface SelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  options: Option[];
  required?: boolean;
}

export default function Select({ label, name, value, onChange, options, required = false }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(opt => opt.value === value);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span style={{ color: "#2a8a8a" }}>*</span>}
      </label>
      
      <motion.button
        type="button"
        whileTap={{ scale: 0.99 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 text-left bg-white border rounded-xl focus:outline-none transition-all flex justify-between items-center"
        style={{ borderColor: "#e0ecec" }}
      >
        <span className="flex items-center gap-3 min-w-0">
          {selectedOption?.Icon ? (
            <span className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
              <selectedOption.Icon size={18} style={{ color: "#2a8a8a" }} strokeWidth={1.7} />
            </span>
          ) : selectedOption?.icon ? (
            <span className="text-lg flex-shrink-0">{selectedOption.icon}</span>
          ) : null}
          <span className="min-w-0">
            <span className={`block text-sm truncate ${!selectedOption ? "text-gray-400" : "text-gray-800 font-medium"}`}>
              {selectedOption ? selectedOption.label : "Sélectionnez une option"}
            </span>
            {selectedOption?.desc && (
              <span className="block text-xs text-gray-400 truncate">{selectedOption.desc}</span>
            )}
          </span>
        </span>
        <motion.svg 
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-4 h-4 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl overflow-hidden"
          >
            {options.map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ backgroundColor: "#f0f7f7" }}
                onClick={() => {
                  onChange({ target: { name, value: option.value } });
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2.5 text-left text-sm transition-all flex items-center gap-3 ${
                  value === option.value ? "font-semibold" : "text-gray-700"
                }`}
                style={value === option.value ? { backgroundColor: "#eaf4f4", color: "#1a2e5a" } : undefined}
              >
                {option.Icon ? (
                  <span className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                    <option.Icon size={18} style={{ color: "#2a8a8a" }} strokeWidth={1.7} />
                  </span>
                ) : option.icon ? (
                  <span className="text-lg flex-shrink-0">{option.icon}</span>
                ) : null}
                <span className="flex-1 min-w-0">
                  <span className="block truncate">{option.label}</span>
                  {option.desc && <span className="block text-xs text-gray-400 font-normal truncate">{option.desc}</span>}
                </span>
                {value === option.value && (
                  <Check size={16} className="ml-auto flex-shrink-0" style={{ color: "#2a8a8a" }} />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
