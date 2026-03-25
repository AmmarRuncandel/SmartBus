'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';

interface TerminalSelectProps {
  label: string;
  id: string;
  value: string;
  options: string[];
  excludeValue?: string;
  onChange: (val: string) => void;
  accentColor: string;
}

export default function TerminalSelect({
  label,
  id,
  value,
  options,
  excludeValue,
  onChange,
  accentColor,
}: TerminalSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(
    () => options.filter((option) => option !== excludeValue),
    [options, excludeValue],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      <label
        id={`${id}-label`}
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: 'rgba(26,26,26,0.55)' }}
      >
        {label}
      </label>

      <button
        id={id}
        type="button"
        aria-labelledby={`${id}-label`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setIsOpen(false);
          }
        }}
        className="relative w-full h-12 pl-9 pr-9 rounded-2xl text-left text-base font-semibold outline-none"
        style={{
          background: 'rgba(26,26,26,0.06)',
          border: `1.5px solid ${accentColor}35`,
          color: '#1A1A1A',
          boxShadow: isOpen ? `0 0 0 3px ${accentColor}20` : 'none',
        }}
      >
        <MapPin
          size={14}
          color={accentColor}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        />
        <span>{value}</span>
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform"
          style={{
            color: 'rgba(26,26,26,0.45)',
            transform: `translateY(-50%) rotate(${isOpen ? 180 : 0}deg)`,
          }}
        />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-labelledby={`${id}-label`}
          className="absolute left-0 right-0 top-[calc(100%+6px)] max-h-52 overflow-y-auto rounded-2xl p-1 z-20"
          style={{
            background: '#EEEEEE',
            border: `1px solid ${accentColor}30`,
            boxShadow: '0 12px 28px rgba(26,26,26,0.16)',
          }}
        >
          {filteredOptions.map((option) => {
            const isSelected = option === value;

            return (
              <li key={option} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-left"
                  style={{
                    color: '#1A1A1A',
                    background: isSelected ? `${accentColor}20` : 'transparent',
                  }}
                >
                  <span>{option}</span>
                  {isSelected && (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: accentColor }}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
