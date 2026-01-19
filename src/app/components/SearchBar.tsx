import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
}

export function SearchBar({ placeholder }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder={placeholder}
        className="w-full px-4 py-3 pr-12 rounded-full bg-sky-200 text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-400"
      />
      <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700" />
    </div>
  );
}
