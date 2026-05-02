import { useEffect, useState } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = '搜索...' }: SearchInputProps) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => onChange(local), 200);
    return () => clearTimeout(timer);
  }, [local, onChange]);

  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={local}
        onChange={e => setLocal(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 sm:py-1.5 text-sm rounded-md bg-white/5 border border-white/10 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30 min-h-[40px]"
      />
      {local && (
        <button
          onClick={() => setLocal('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-300 hover:bg-white/10 transition-colors"
          title="清除"
        >
          ×
        </button>
      )}
    </div>
  );
}

interface Chip {
  label: string;
  value: string;
}

interface ChipGroupProps {
  chips: Chip[];
  selected: string | null;
  onChange: (value: string | null) => void;
}

export function ChipGroup({ chips, selected, onChange }: ChipGroupProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1.5 sm:py-1 text-xs rounded-full border transition-colors min-h-[32px] ${
          selected === null
            ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300'
        }`}
      >
        全部
      </button>
      {chips.map(chip => (
        <button
          key={chip.value}
          onClick={() => onChange(selected === chip.value ? null : chip.value)}
          className={`px-3 py-1.5 sm:py-1 text-xs rounded-full border transition-colors min-h-[32px] ${
            selected === chip.value
              ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
              : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300'
          }`}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
