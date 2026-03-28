export interface FoodListing {
  id: string;
  title: string;
  description: string;
  category: string;
  weight: string;
  expiryDate: string;
  distance: number; // in meters
  imageUrl: string;
  username: string;
  avatarUrl?: string;
  isEmergency?: boolean;
}

export const CATEGORIES = [
  'Fruit & Vegetables',
  'Pastries',
  'Milk Products',
  'Meat & Fish',
  'Preserved Food',
  'Cooked Meals',
  'Drinks',
  'Other',
];

export const DISTANCE_OPTIONS = [
  { label: '< 500 m', value: 500 },
  { label: '< 1 km', value: 1000 },
  { label: '< 5 km', value: 5000 },
  { label: '< 10 km', value: 10000 },
  { label: 'All distances', value: Infinity },
];

export const MOCK_LISTINGS: FoodListing[] = [
  {
    id: '1',
    title: 'Mixed Berries',
    description:
      'Freshly picked mixed berries, sweet and juicy. Perfect for smoothies, yogurt, or eating as a snack',
    category: 'Fruit & Vegetables',
    weight: '2 Kg',
    expiryDate: '04/04/2026',
    distance: 320,
    imageUrl:
      'https://images.unsplash.com/photo-1563746924237-f81d3e6e5849?w=600&q=80',
    username: 'Sarah M.',
  },
  {
    id: '2',
    title: 'Homemade Bread',
    description:
      'Fresh sourdough bread baked this morning. Still warm. Great for sandwiches or toast.',
    category: 'Pastries',
    weight: '800 g',
    expiryDate: '28/03/2026',
    distance: 750,
    imageUrl:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
    username: 'Ahmed K.',
  },
  {
    id: '3',
    title: 'Organic Tomatoes',
    description:
      'Ripe organic tomatoes from my garden. No pesticides. Great for salads and sauces.',
    category: 'Fruit & Vegetables',
    weight: '1.5 Kg',
    expiryDate: '30/03/2026',
    distance: 1200,
    imageUrl:
      'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600&q=80',
    username: 'Fatima Z.',
  },
  {
    id: '4',
    title: 'Cooked Lentil Soup',
    description:
      'Homemade lentil soup with vegetables. Very nutritious and filling.',
    category: 'Cooked Meals',
    weight: '2 L',
    expiryDate: '28/03/2026',
    distance: 480,
    imageUrl:
      'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80',
    username: 'Youssef B.',
    isEmergency: true,
  },
  {
    id: '5',
    title: 'Whole Milk',
    description:
      'Fresh whole milk from local farm. Expires soon — please take if you need it.',
    category: 'Milk Products',
    weight: '3 L',
    expiryDate: '29/03/2026',
    distance: 220,
    imageUrl:
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80',
    username: 'Nadia H.',
    isEmergency: true,
  },
];