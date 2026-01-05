export interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  totalResults: number;
  isSearching: boolean;
}