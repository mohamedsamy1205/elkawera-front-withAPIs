import React, { useState, useEffect, useRef } from 'react';
import { Player } from '@/types';
import { Search, X as XIcon, User as UserIcon } from 'lucide-react';

interface PlayerSearchDropdownProps {
  players: Player[];
  value: string;
  onChange: (playerId: string) => void;
  placeholder?: string;
  label?: string;
  disabledIds?: string[];
}

export const PlayerSearchDropdown: React.FC<PlayerSearchDropdownProps> = ({
  players,
  value,
  onChange,
  placeholder = 'Search player...',
  label,
  disabledIds = []
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState<number>(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value && !query) {
      const p = players.find(p => p.id === value);
      setQuery(p ? p.name : '');
    }
  }, [value, players]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    if (isOpen) {
      window.addEventListener('mousedown', handleClick);
      return () => window.removeEventListener('mousedown', handleClick);
    }
  }, [isOpen]);

  const results = players.filter(
    (p) => (
      (p.name + ' ' + (p.position || '') + ' ' + (p.country || ''))
        .toLowerCase()
        .includes(query.toLowerCase())
    ) && !disabledIds.includes(p.id)
  );

  const selectPlayer = (id: string) => {
    onChange(id);
    setIsOpen(false);
    setQuery(players.find(p => p.id === id)?.name || '');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
    setHighlighted(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      setHighlighted(h => Math.min(h + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      setHighlighted(h => Math.max(0, h - 1));
    } else if (e.key === 'Enter') {
      if (results[highlighted]) selectPlayer(results[highlighted].id);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const clearSelection = (ev: React.MouseEvent) => {
    ev.stopPropagation();
    setQuery('');
    setIsOpen(false);
    onChange('');
  };

  useEffect(() => {
    setHighlighted(0);
  }, [results.length]);

  return (
    <div className="relative" ref={ref}>
      {label && (
        <label className="block text-xs uppercase text-gray-400 mb-2 font-bold">{label}</label>
      )}
      <div className="relative group" onClick={() => setIsOpen(true)}>
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-elkawera-accent transition-colors pointer-events-none z-10" />
        <input
          type="text"
          placeholder={placeholder}
          className="w-full bg-gradient-to-br from-black/60 to-black/40 border-2 border-white/20 rounded-xl p-3 pl-10 pr-8 text-white placeholder:text-gray-500 focus:border-elkawera-accent focus:shadow-[0_0_20px_rgba(0,255,157,0.3)] focus:outline-none transition-all duration-300 appearance-none"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {!!query && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-all duration-200"
            onClick={clearSelection}
            tabIndex={-1}
            type="button"
          >
            <XIcon size={16} />
          </button>
        )}
      </div>
      {isOpen && results.length > 0 && (
        <ul className="absolute left-0 z-50 mt-2 w-full max-h-64 bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl border-2 border-white/20 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] overflow-hidden animate-fade-in-up">
          <div className="overflow-y-auto max-h-64 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {results.map((p, i) => (
              <li
                key={p.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 border-b border-white/5 last:border-b-0 ${i === highlighted
                  ? 'bg-gradient-to-r from-elkawera-accent/30 to-elkawera-accent/10 text-white font-bold shadow-[inset_0_0_20px_rgba(0,255,157,0.2)]'
                  : 'hover:bg-white/10 text-gray-200 hover:text-white'
                  }`}
                onMouseDown={() => selectPlayer(p.id)}
                onMouseEnter={() => setHighlighted(i)}
              >
                <span className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center transition-all duration-200 ${i === highlighted
                  ? 'bg-gradient-to-br from-elkawera-accent/40 to-elkawera-accent/20 ring-2 ring-elkawera-accent/50'
                  : 'bg-white/10'
                  }`}>
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={18} className={i === highlighted ? 'text-elkawera-accent' : 'text-gray-400'} />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="truncate font-semibold">{p.name}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full ${i === highlighted
                      ? 'bg-elkawera-accent/20 text-elkawera-accent'
                      : 'bg-white/10 text-gray-400'
                      }`}>
                      {p.position}
                    </span>
                    <span>{p.country}</span>
                  </div>
                </div>
                <span className={`text-xl font-bold font-mono ${i === highlighted ? 'text-elkawera-accent' : 'text-gray-500'
                  }`}>
                  {p.overallScore}
                </span>
              </li>
            ))}
          </div>
        </ul>
      )}
      {isOpen && results.length === 0 && (
        <div className="absolute left-0 z-50 mt-2 w-full bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl border-2 border-white/20 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] px-4 py-6 text-center">
          <Search size={32} className="mx-auto mb-2 text-gray-600" />
          <p className="text-gray-400 font-medium">No players found</p>
          <p className="text-gray-600 text-sm mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );
};

