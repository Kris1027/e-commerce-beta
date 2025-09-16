'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  debounceDelay?: number;
  showIcon?: boolean;
  showClear?: boolean;
  autoFocus?: boolean;
  onClear?: () => void;
  minChars?: number;
  maxLength?: number;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function SearchInput({
  value: externalValue = '',
  onValueChange,
  placeholder = 'Search...',
  className,
  disabled = false,
  debounceDelay = 300,
  showIcon = true,
  showClear = true,
  autoFocus = false,
  onClear,
  minChars = 0,
  maxLength = 100,
  onFocus,
  onBlur,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(externalValue);
  const [isPendingSearch, setIsPendingSearch] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchedValueRef = useRef(externalValue);

  // Only update internal value from external when component mounts or when external value
  // changes programmatically (not from user typing)
  useEffect(() => {
    // Only sync if the external value is different from current internal value (indicates external change)
    if (externalValue !== internalValue) {
      setInternalValue(externalValue);
      // Update ref to track the last searched value
      lastSearchedValueRef.current = externalValue;
    }
  }, [externalValue, internalValue]);

  // Handle input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);

    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // Skip if below minimum characters (unless clearing)
    if (newValue.length > 0 && newValue.length < minChars) {
      setIsPendingSearch(false);
      return;
    }

    // Set pending state
    setIsPendingSearch(true);

    // Set up new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      onValueChange(newValue);
      lastSearchedValueRef.current = newValue;
      setIsPendingSearch(false);
      debounceTimerRef.current = null;
    }, debounceDelay);
  }, [onValueChange, debounceDelay, minChars]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleClear = useCallback(() => {
    // Clear any pending search
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    setInternalValue('');
    setIsPendingSearch(false);
    onValueChange('');
    lastSearchedValueRef.current = '';
    onClear?.();

    // Refocus input after clearing
    inputRef.current?.focus();
  }, [onValueChange, onClear]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Clear on Escape key
    if (e.key === 'Escape' && internalValue) {
      e.preventDefault();
      handleClear();
    }
  }, [internalValue, handleClear]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  // Show loading indicator only when we have a pending search
  const showLoading = isPendingSearch;

  return (
    <div className="relative group">
      {/* Search Icon or Loading Spinner */}
      {showIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {showLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Search className={cn(
              "h-4 w-4 transition-colors",
              isFocused ? "text-foreground" : "text-muted-foreground"
            )} />
          )}
        </div>
      )}

      <Input
        ref={inputRef}
        type="search"
        placeholder={placeholder}
        value={internalValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          showIcon && 'pl-10',
          showClear && internalValue && 'pr-10',
          'h-10 cursor-text transition-all duration-200',
          'bg-background/50 border-muted-foreground/20',
          'hover:border-muted-foreground/30',
          'focus:bg-background focus:border-primary',
          'placeholder:text-muted-foreground/60',
          isFocused && 'ring-1 ring-primary/20',
          className
        )}
        disabled={disabled}
        autoFocus={autoFocus}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        maxLength={maxLength}
        aria-label="Search"
        aria-describedby={minChars > 0 ? "search-hint" : undefined}
      />

      {/* Clear Button */}
      {showClear && internalValue && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2",
            "text-muted-foreground hover:text-foreground",
            "transition-all duration-200",
            "cursor-pointer rounded-sm",
            "hover:bg-accent p-0.5",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          )}
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Helper Text */}
      {minChars > 0 && isFocused && internalValue.length > 0 && internalValue.length < minChars && (
        <div
          id="search-hint"
          className="absolute top-full left-0 mt-1 text-xs text-muted-foreground"
        >
          Type at least {minChars} characters to search
        </div>
      )}
    </div>
  );
}