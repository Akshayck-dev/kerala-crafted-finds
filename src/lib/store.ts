import { useSyncExternalStore, useCallback } from "react";
import type { Product } from "./data";

export interface CartItem {
  product: Product;
  quantity: number;
}

let cartItems: CartItem[] = [];
let wishlistIds: Set<string> = new Set();
let fetchedProducts: Product[] = [];
let isCartOpen = false;
let isCheckoutOpen = false;

let cartListeners: Array<() => void> = [];
let wishlistListeners: Array<() => void> = [];
let cartOpenListeners: Array<() => void> = [];
let checkoutOpenListeners: Array<() => void> = [];
let productsListeners: Array<() => void> = [];

function emitCart() {
  cartListeners.forEach((l) => l());
}
function emitWishlist() {
  wishlistListeners.forEach((l) => l());
}
function emitCartOpen() {
  cartOpenListeners.forEach((l) => l());
}
function emitCheckoutOpen() {
  checkoutOpenListeners.forEach((l) => l());
}
function emitProducts() {
  productsListeners.forEach((l) => l());
}

export function toggleCart(open?: boolean) {
  isCartOpen = open ?? !isCartOpen;
  emitCartOpen();
}

export function toggleCheckout(open?: boolean) {
  isCheckoutOpen = open ?? !isCheckoutOpen;
  emitCheckoutOpen();
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
  toggleCart(true);
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
function getCartOpenSnapshot() {
  return isCartOpen;
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

export function useCartDrawer() {
  const isOpen = useSyncExternalStore(
    (cb) => {
      cartOpenListeners.push(cb);
      return () => {
        cartOpenListeners = cartOpenListeners.filter((l) => l !== cb);
      };
    },
    getCartOpenSnapshot,
    getCartOpenSnapshot
  );

  return { isOpen, toggleCart };
}

export function useCheckoutModal() {
  const isOpen = useSyncExternalStore(
    (cb) => {
      checkoutOpenListeners.push(cb);
      return () => {
        checkoutOpenListeners = checkoutOpenListeners.filter((l) => l !== cb);
      };
    },
    () => isCheckoutOpen,
    () => isCheckoutOpen
  );

  return { isOpen, toggleCheckout };
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

export function setProducts(products: Product[]) {
  fetchedProducts = products;
  emitProducts();
}

export function useProducts() {
  const products = useSyncExternalStore(
    (cb) => {
      productsListeners.push(cb);
      return () => {
        productsListeners = productsListeners.filter((l) => l !== cb);
      };
    },
    () => fetchedProducts,
    () => fetchedProducts
  );

  return { products, setProducts };
}
