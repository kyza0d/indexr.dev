import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

/**
  * Search bar component
  * @param value - The value of the search bar
  * @param onChange - The function to call when the search bar value changes
  * @returns The search bar component
*/
export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState(value);
  const debouncedValue = useDebounce(inputValue, 300);

  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);


  return (
    <div className="relative inline-block">
      <Search size={18} className="absolute left-3 top-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="pl-10 pr-24 w-[400px]"
      />
    </div>
  );
};
