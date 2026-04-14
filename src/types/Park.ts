export type Park = {
  id: string;
  name: string;
  country: string;
  region: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  description: string;
  imageUrl: string;

  features: {
    indoorPool: boolean;
    swimmingParadise: boolean;
    petsAllowed: boolean;
    luxury: boolean;
    childFriendly: boolean;
    wellness: boolean;
    restaurant: boolean;
  };

  location: {
    nearSea: boolean;
    forest: boolean;
    nearLake: boolean;
  };

  promotion?: {
    active: boolean;
    text: string;
  };
};

export type User = {
  email: string;
  name: string;
  visitedParkIds: string[];
  favoriteParkIds: string[];
};

export type FilterValue = 'exclude' | 'any' | 'must';

export type FilterState = {
  countries: Record<string, FilterValue>;
  features: Record<string, FilterValue>;
  locations: Record<string, FilterValue>;
  showVisitedOnly: boolean;
  showUnvisitedOnly: boolean;
  showPromotionsOnly: boolean;
  showFavoritesOnly: boolean;
  searchQuery: string;
};

export type FilterChip = {
  label: string;
  key: string;
  value: string;
  filterValue: FilterValue;
};
