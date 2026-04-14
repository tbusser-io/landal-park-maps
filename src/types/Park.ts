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
};

export type FilterState = {
  countries: string[];
  features: string[];
  locations: string[];
  showVisitedOnly: boolean;
  showUnvisitedOnly: boolean;
  showPromotionsOnly: boolean;
};

export type FilterChip = {
  label: string;
  key: string;
  value: string;
};
