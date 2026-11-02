"use client";

import { useSyncExternalStore } from "react";

// The plugin restores a saved cart asynchronously and exposes no "loading"
// flag for it. It keeps the cart ID in localStorage (removing it if the cart
// can't be fetched), so "ID stored but no cart yet" means "still restoring".
// Polled because same-tab localStorage writes don't fire events.
const subscribe = (onChange: () => void) => {
  const interval = window.setInterval(onChange, 500);
  return () => window.clearInterval(interval);
};
const hasStoredCart = () => localStorage.getItem("cart") !== null;

/** True while a saved cart is still being fetched (avoids an "empty" flash). */
export function useCartRestoring(cart: unknown) {
  const storedCart = useSyncExternalStore(
    subscribe,
    hasStoredCart,
    () => true, // server render: assume there may be a cart to restore
  );
  return !cart && storedCart;
}
