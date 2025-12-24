'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import { searchBusinesses, type SearchResult } from '@/actions/search-businesses';
import { cn } from '@/lib/utils';

type SearchBoxProps = {
  basePath: string;
  placeholder?: string;
  className?: string;
};

export function SearchBox({
  basePath,
  placeholder = 'Search businesses...',
  className,
}: SearchBoxProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await searchBusinesses({
        query: searchQuery,
        perPage: 8,
      });
      setResults(response.results);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      search(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, search]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          navigateToResult(results[selectedIndex]);
        } else if (query.trim()) {
          navigateToSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const navigateToResult = (result: SearchResult) => {
    const category = result.category_names[0]?.toLowerCase().replace(/\s+/g, '-') || 'business';
    const city = result.city?.toLowerCase().replace(/\s+/g, '-') || '';
    const state = result.state?.toLowerCase() || '';

    router.push(`/${basePath}/${category}/${city}/${state}/${result.id}`);
    setIsOpen(false);
    setQuery('');
  };

  const navigateToSearch = () => {
    router.push(`/${basePath}?q=${encodeURIComponent(query)}`);
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-10 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {isOpen && (query.trim() || results.length > 0) && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg">
          {results.length > 0 ? (
            <ul className="max-h-80 overflow-auto py-1">
              {results.map((result, index) => (
                <li key={result.id}>
                  <button
                    type="button"
                    onClick={() => navigateToResult(result)}
                    className={cn(
                      'flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-accent',
                      selectedIndex === index && 'bg-accent'
                    )}
                  >
                    <span className="font-medium">{result.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {[result.city, result.state?.toUpperCase()]
                        .filter(Boolean)
                        .join(', ')}
                      {result.category_names.length > 0 && (
                        <> &middot; {result.category_names[0]}</>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.trim() && !isLoading ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : null}

          {query.trim() && (
            <div className="border-t border-border px-3 py-2">
              <button
                type="button"
                onClick={navigateToSearch}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Search all results for &ldquo;{query}&rdquo;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
