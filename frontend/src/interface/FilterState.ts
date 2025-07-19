export interface FilterState {
  rating: number;
  facilities: {
    wifi: boolean;
    food: boolean;
    laundry: boolean;
  };
  priceRange: {
    min: number;
    max: number;
  };
}