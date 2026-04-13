import { useSyncExternalStore, useCallback } from "react";
import type { Product } from "./data";

export interface CartItem {
  product: Product;
  quantity: number;
}

let cartItems: CartItem[] = [];
let wishlistIds: Set<string> = new Set();
let cartListeners: Array<() => void> = [];
let wishlistListeners: Array<() => void> = [];

function emitCart() {
  cartListeners.forEach((l) => l());
}
function emitWishlist() {
  wishlistListeners.forEach((l) => l());
}

export function addToCart(product: Product, qty = 1) {
  const existing = cartItems.find((i) => i.product.id === product.id);
  if (existing) {
    cartItems = cartItems.map((i) =>
      i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i
    );
  } else {
    cartItems = [...cartItems, { product, quantity: qty }];
  }
  emitCart();
}

export function removeFromCart(productId: string) {
  cartItems = cartItems.filter((i) => i.product.id !== productId);
  emitCart();
}

export function updateQuantity(productId: string, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  cartItems = cartItems.map((i) =>
    i.product.id === productId ? { ...i, quantity } : i
  );
  emitCart();
}

export function clearCart() {
  cartItems = [];
  emitCart();
}

export function toggleWishlist(productId: string) {
  wishlistIds = new Set(wishlistIds);
  if (wishlistIds.has(productId)) {
    wishlistIds.delete(productId);
  } else {
    wishlistIds.add(productId);
  }
  emitWishlist();
}

function getCartSnapshot() {
  return cartItems;
}
function getWishlistSnapshot() {
  return wishlistIds;
}

export function useCart() {
  const items = useSyncExternalStore(
    (cb) => {
      cartListeners.push(cb);
      return () => {
        cartListeners = cartListeners.filter((l) => l !== cb);
      };
    },
    getCartSnapshot,
    getCartSnapshot
  );

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return { items, totalItems, totalPrice };
}

export function useWishlist() {
  const ids = useSyncExternalStore(
    (cb) => {
      wishlistListeners.push(cb);
      return () => {
        wishlistListeners = wishlistListeners.filter((l) => l !== cb);
      };
    },
    getWishlistSnapshot,
    getWishlistSnapshot
  );

  const isWishlisted = useCallback((id: string) => ids.has(id), [ids]);
  return { wishlistIds: ids, isWishlisted, count: ids.size };
}
