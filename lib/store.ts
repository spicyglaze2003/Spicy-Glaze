import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

export interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  productName: string;
  price: number;
  mrp?: number;
  quantity: number;
  stock?: number;
  imageUrl?: string;
}

interface CartStore {
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getTotalAmount: () => number;
  getItemCount: () => number;
}

function calculateTotals(items: CartItem[]) {
  const totalAmount = items.reduce(
    (total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );
  const itemCount = items.reduce(
    (count, item) => count + (Number(item.quantity) || 1),
    0
  );
  return { totalAmount, itemCount };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalAmount: 0,
      itemCount: 0,
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (item) => {
        const itemPrice = Number(item.price) || 0;
        const itemQty = Math.max(1, Number(item.quantity) || 1);
        const maxStock = item.stock !== undefined ? Number(item.stock) : 999;

        if (maxStock <= 0) {
          toast.error("This product is currently out of stock");
          return;
        }

        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.variantId === item.variantId);
          let nextItems: CartItem[];

          if (existingIndex > -1) {
            const existing = state.items[existingIndex];
            const desiredQty = existing.quantity + itemQty;

            if (desiredQty > maxStock) {
              toast.error(`Cannot add more. Only ${maxStock} items available in stock.`);
              nextItems = state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, price: itemPrice, quantity: maxStock, stock: maxStock }
                  : i
              );
            } else {
              nextItems = state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, price: itemPrice, quantity: desiredQty, stock: maxStock }
                  : i
              );
            }
          } else {
            const initialQty = Math.min(itemQty, maxStock);
            nextItems = [
              ...state.items,
              { ...item, price: itemPrice, quantity: initialQty, stock: maxStock },
            ];
          }

          const totals = calculateTotals(nextItems);
          return {
            items: nextItems,
            totalAmount: totals.totalAmount,
            itemCount: totals.itemCount,
            isOpen: true, // Automatically open cart drawer so user sees their item
          };
        });

        toast.success(`Added ${item.productName} to cart`);
      },

      removeItem: (variantId) => {
        set((state) => {
          const nextItems = state.items.filter((i) => i.variantId !== variantId);
          const totals = calculateTotals(nextItems);
          return {
            items: nextItems,
            totalAmount: totals.totalAmount,
            itemCount: totals.itemCount,
          };
        });
        toast.info("Item removed from cart");
      },

      updateQuantity: (variantId, quantity) => {
        set((state) => {
          const nextItems = state.items.map((i) => {
            if (i.variantId === variantId) {
              const maxStock = i.stock !== undefined ? Number(i.stock) : 999;
              if (quantity > maxStock) {
                toast.error(`Cannot exceed available stock of ${maxStock} units`);
                return { ...i, quantity: maxStock };
              }
              return { ...i, quantity: Math.max(1, quantity) };
            }
            return i;
          });

          const totals = calculateTotals(nextItems);
          return {
            items: nextItems,
            totalAmount: totals.totalAmount,
            itemCount: totals.itemCount,
          };
        });
      },

      clearCart: () => set({ items: [], totalAmount: 0, itemCount: 0 }),

      getTotalAmount: () => {
        const currentItems = get().items || [];
        return calculateTotals(currentItems).totalAmount;
      },

      getItemCount: () => {
        const currentItems = get().items || [];
        return calculateTotals(currentItems).itemCount;
      },
    }),
    {
      name: 'localmart-shopping-cart',
      // Persist only items so stale totals are never serialized
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.items)) {
          const totals = calculateTotals(state.items);
          state.totalAmount = totals.totalAmount;
          state.itemCount = totals.itemCount;
        }
      },
    }
  )
);
