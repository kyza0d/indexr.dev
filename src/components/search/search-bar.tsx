import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  isSmallScreen?: boolean;
  className?: string;
}

/**
  * Search bar component
  * @param value - The value of the search bar
  * @param onChange - The function to call when the search bar value changes
  * @returns The search bar component
*/
export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, isSmallScreen, className }) => {
  const [inputValue, setInputValue] = useState(value);
  const debouncedValue = useDebounce(inputValue, 300);

  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);


  return (
    <div className={cn(`relative inline-block mx-2 mt-2 ${isSmallScreen ? 'w-[200px]' : 'w-full'}`, className)}>
      <Search size={20} className="absolute left-3 top-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="pl-10 pr-24"
      />
    </div>
  );
};
