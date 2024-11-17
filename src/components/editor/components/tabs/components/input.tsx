import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AutoGrowingInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  onCancel?: () => void;
}

export function AutoGrowingInput({
  value,
  onChange,
  onSubmit,
  onCancel,
  className,
  ...props
}: AutoGrowingInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (inputRef.current && measureRef.current) {
      // Add some padding to the width
      const width = measureRef.current.offsetWidth;
      inputRef.current.style.width = `${Math.max(50, width)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSubmit) {
      e.preventDefault();
      onSubmit();
    } else if (e.key === 'Escape' && onCancel) {
      e.preventDefault();
      onCancel();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative inline-block">
      <input
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={cn(
          "bg-transparent h-5 focus:ring-1 outline-none ring-offset-4 ring-offset-border",
          className
        )}
        {...props}
      />
      <span
        ref={measureRef}
        className="invisible fixed left-0 top-0 whitespace-pre"
        aria-hidden="true"
      >
        {value}
      </span>
    </div>
  );
}
