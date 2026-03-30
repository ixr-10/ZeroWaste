import { create } from 'zustand';

export interface MyRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  weight: string;
  expiryDate: string;
  distance: number;
  donorName: string;
  donorId: string;
  imageUrl: string;
  status: 'pending' | 'confirmed' | 'rejected';
}

interface AppStore {
  myRequests: MyRequest[];
  addRequest: (item: MyRequest) => void;
  cancelRequest: (id: string) => void;
  updateRequestStatus: (id: string, status: MyRequest['status']) => void;
  isReserved: (id: string) => boolean;
}

export const useAppStore = create<AppStore>((set, get) => ({
  myRequests: [],

  addRequest: (item) =>
    set((state) => {
      const exists = state.myRequests.find((r) => r.id === item.id);
      if (exists) return state;
      return { myRequests: [item, ...state.myRequests] };
    }),

  cancelRequest: (id) =>
    set((state) => ({
      myRequests: state.myRequests.filter((r) => r.id !== id),
    })),

  updateRequestStatus: (id, status) =>
    set((state) => ({
      myRequests: state.myRequests.map((r) =>
        r.id === id ? { ...r, status } : r
      ),
    })),

  // helper to check if an item is already reserved
  isReserved: (id) => get().myRequests.some((r) => r.id === id),
}));