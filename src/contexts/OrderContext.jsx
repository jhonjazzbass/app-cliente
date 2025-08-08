// src/contexts/OrderContext.jsx

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children, restaurantId, tableId }) => {
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [activeOrderData, setActiveOrderData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // --- LÓGICA DE INICIALIZACIÓN MEJORADA (de 'copia.dart') ---
  const initializeOrder = useCallback(async () => {
    if (!tableId) return;
    setIsInitializing(true);
    try {
      // Código corregido y más robusto
const { data: existingOrder, error } = await supabase
  .from('orders')
  .select('*')
  .eq('table_id', tableId)
  .in('order_status', ['ordering', 'received', 'ready_for_pickup', 'served', 'bill_requested', 'waiting_for_pos', 'cash_payment_pending'])
  .maybeSingle(); // <-- CAMBIO CLAVE

      if (error && error.code !== 'PGRST116') { // Ignoramos el error "No rows found"
        throw error;
      }
      
      if (existingOrder) {
        // Establecemos tanto los datos como el ID del pedido encontrado
        setActiveOrderData(existingOrder);
        setActiveOrderId(existingOrder.id);
      }
    } catch (err) {
      console.error("Error inicializando el pedido:", err);
    } finally {
      setIsInitializing(false);
    }
  }, [tableId]);

  useEffect(() => {
    initializeOrder();
  }, [initializeOrder]);

  // --- SUSCRIPCIÓN A CAMBIOS EN TIEMPO REAL (sin cambios) ---
  useEffect(() => {
    if (!activeOrderId) {
      setActiveOrderData(null);
      return;
    }

    const channel = supabase
      .channel(`order-${activeOrderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${activeOrderId}`,
        },
        (payload) => {
          console.log('¡Cambio en el pedido recibido!', payload.new);
          setActiveOrderData(prevData => ({ ...prevData, ...payload.new }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeOrderId]);

  // --- RESTO DE LAS FUNCIONES (sin cambios) ---
  const manageItemInOrder = async (itemData) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-collaborative-order', {
        body: {
          tableId,
          restaurantId,
          item: itemData,
          orderId: activeOrderId,
        },
      });

      if (error) throw error;

      if (data.orderId && !activeOrderId) {
        setActiveOrderId(data.orderId);
      }
      return { success: true };

    } catch (err) {
      console.error("Error gestionando el item:", err);
      alert('No se pudo añadir el producto. Intenta de nuevo.');
      return { success: false };
    } finally {
      setIsProcessing(false);
    }
  };

  const addItemToOrder = (product) => {
    const itemData = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    };
    manageItemInOrder(itemData);
  };

  const updateItemQuantityInOrder = (productId, amount) => {
    const currentItem = activeOrderData.items.find(item => item.productId === productId);
    if (!currentItem) return;
    
    const itemData = {
      productId,
      name: currentItem.name,
      price: currentItem.price,
      quantity: currentItem.quantity + amount
    };
    manageItemInOrder(itemData);
  };

  const placeOrder = async (observations) => {
    if (!activeOrderId) return { success: false };
    return await updateOrderStatus('received', { observations });
  };
  
  const updateOrderStatus = async (newStatus, details = {}) => {
    if (!activeOrderId) return { success: false };
    setIsProcessing(true);
    try {
      const { error } = await supabase.functions.invoke('update-order-status', {
          body: { 
              orderId: activeOrderId, 
              newStatus,
              ...details,
          },
      });

      if (error) throw error;

      setActiveOrderData(prevOrderData => ({
        ...prevOrderData,
        status: newStatus,
        ...details,
      }));
      return { success: true };

    } catch (err) {
      console.error(`Error al cambiar estado a ${newStatus}:`, err);
      alert('Ocurrió un error. Por favor, intenta de nuevo.');
      return { success: false };
    } finally {
      setIsProcessing(false);
    }
  };
  
 const requestAssistance = async (details) => {
  if (!activeOrderId) {
    alert("No se puede solicitar asistencia si no hay un pedido activo.");
    return { success: false };
  }
  try {
    const { error } = await supabase.functions.invoke('request-assistance', {
      body: {
        orderId: activeOrderId,
        details: details,
      },
    });

    if (error) throw error;

    alert("Tu solicitud de asistencia ha sido enviada al personal.");
    return { success: true };

  } catch (err) {
    console.error('Error al solicitar asistencia:', err);
    alert('No se pudo enviar tu solicitud. Por favor, intenta de nuevo o contacta al personal directamente.');
    return { success: false };
  }
};

  const submitFeedback = async (rating, comment) => {
    if (!activeOrderId) return { success: false };
    if (rating === 0) {
      alert('Por favor, selecciona una calificación de 1 a 5 estrellas.');
      return { success: false };
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase.functions.invoke('submit-feedback', {
        body: {
          orderId: activeOrderId,
          rating,
          comment,
        },
      });
      
      if (error) throw error;

      return { success: true };

    } catch (err)
    {
      console.error('Error al enviar el feedback:', err);
      alert('No se pudo guardar tu opinión. Por favor, intenta de nuevo.');
      return { success: false };
    } finally {
      setIsProcessing(false);
    }
  };

  const resetOrder = () => { setActiveOrderId(null); };

  const value = {
    activeOrderId,
    activeOrderData,
    isProcessing,
    isInitializing,
    addItemToOrder,
    updateItemQuantityInOrder,
    placeOrder,
    updateOrderStatus,
    requestAssistance,
    submitFeedback,
    resetOrder
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};