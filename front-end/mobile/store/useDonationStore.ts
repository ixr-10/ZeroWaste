import { create } from 'zustand';

interface DonationStore {
  image: string | null;
  category: string | null;
  description: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  address: string;
  latitude: number;
  longitude: number;
  setImage: (image: string | null) => void;
  setCategory: (category: string) => void;
  setDescription: (description: string) => void;
  setQuantity: (quantity: number) => void;
  setUnit: (unit: string) => void;
  setExpiryDate: (date: string) => void;
  setLocation: (address: string, lat: number, lng: number) => void;
  reset: () => void;
}

export const useDonationStore = create<DonationStore>((set) => ({
  image: null,
  category: null,
  description: '',
  quantity: 1,
  unit: 'Kg',
  expiryDate: '',
  address: '',
  latitude: 35.6971,
  longitude: -0.6308,
  setImage: (image) => set({ image }),
  setCategory: (category) => set({ category }),
  setDescription: (description) => set({ description }),
  setQuantity: (quantity) => set({ quantity }),
  setUnit: (unit) => set({ unit }),
  setExpiryDate: (expiryDate) => set({ expiryDate }),
  setLocation: (address, latitude, longitude) => set({ address, latitude, longitude }),
  reset: () => set({
    image: null, category: null, description: '',
    quantity: 1, unit: 'Kg', expiryDate: '',
    address: '', latitude: 35.6971, longitude: -0.6308,
  }),
}));