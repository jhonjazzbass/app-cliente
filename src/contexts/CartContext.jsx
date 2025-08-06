// src/contexts/CartContext.jsx

import React, { createContext, useContext } from 'react';
import { useOrder } from './OrderContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { 
    activeOrderData, 
    addItemToOrder, 
    updateItemQuantityInOrder, 
    placeOrder,
    isProcessing 
  } = useOrder();

  const cart = activeOrderData?.status === 'ordering' ? activeOrderData.items || [] : [];

  // ==================================================================
  // 👇 INICIO DE LA MODIFICACIÓN LÓGICA 👇
  // ==================================================================
  
  const addToCart = (product) => {
    // Primero, revisamos si el producto ya está en el carrito colaborativo.
    const existingItem = cart.find(item => item.productId === product.id);

    if (existingItem) {
      // Si ya existe, simplemente llamamos a la función para sumar 1 a su cantidad.
      updateItemQuantityInOrder(product.id, 1);
    } else {
      // Si es un producto nuevo, llamamos a la función original para añadirlo al pedido.
      addItemToOrder(product);
    }
  };
  
  // Esta función no cambia, se usará para los botones '+' y '-' del contador.
  const updateQuantity = (productId, amount) => {
    updateItemQuantityInOrder(productId, amount);
  };
  // ==================================================================
  // 👆 FIN DE LA MODIFICACIÓN LÓGICA 👆
  // ==================================================================

  const handlePlaceOrder = async (observations, restaurantId, tableId) => {
    return await placeOrder(observations, restaurantId, tableId);
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const value = {
    cart,
    addToCart,
    updateQuantity,
    cartTotal,
    cartItemCount,
    handlePlaceOrder,
    isProcessing,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
