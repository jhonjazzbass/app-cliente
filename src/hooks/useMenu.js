// src/hooks/useMenu.js

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient'; // Importamos el cliente de Supabase

export const useMenu = (restaurantId, tableId) => {
  // Estados para cada parte de los datos
  const [restaurantData, setRestaurantData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [tableData, setTableData] = useState(null);
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Función para cargar todos los datos ---
  const fetchAllData = useCallback(async () => {
    if (!restaurantId || !tableId) return;

    try {
      // Usamos Promise.all para ejecutar las consultas en paralelo y mejorar la velocidad
      const [restaurantRes, categoriesRes, productsRes, tableRes] = await Promise.all([
        supabase.from('restaurants').select('name, logo_url').eq('id', restaurantId).single(),
        supabase.from('categories').select('*').eq('restaurant_id', restaurantId).order('display_order'),
        supabase.from('products').select('*').eq('restaurant_id', restaurantId),
        supabase.from('tables').select('table_number').eq('id', tableId).single()
      ]);

      // Manejo de errores individuales
      if (restaurantRes.error) throw new Error(`Restaurante: ${restaurantRes.error.message}`);
      if (categoriesRes.error) throw new Error(`Categorías: ${categoriesRes.error.message}`);
      if (productsRes.error) throw new Error(`Productos: ${productsRes.error.message}`);
      if (tableRes.error) throw new Error(`Mesa: ${tableRes.error.message}`);

      // Actualizamos los estados con los datos obtenidos
      setRestaurantData(restaurantRes.data);
      setCategories(categoriesRes.data);
      setProducts(productsRes.data);
      setTableData({ tableNumber: tableRes.data.table_number });

    } catch (err) {
      console.error("Error cargando los datos iniciales del menú:", err);
      setError('No se pudieron cargar los datos del restaurante.');
    } finally {
      setLoading(false);
    }
  }, [restaurantId, tableId]);

  // --- Efecto para la carga inicial ---
  useEffect(() => {
    setLoading(true);
    fetchAllData();
  }, [fetchAllData]);

  // --- Efecto para la suscripción a tiempo real ---
  useEffect(() => {
    if (!restaurantId) return;

    const channel = supabase.channel(`menu-realtime-${restaurantId}`)
      .on('postgres_changes', {
        event: '*', // Escucha INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'products',
        filter: `restaurant_id=eq.${restaurantId}`
      }, (payload) => {
        console.log('Cambio detectado en productos, recargando menú...');
        fetchAllData(); // Si hay un cambio, recargamos todo
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'categories',
        filter: `restaurant_id=eq.${restaurantId}`
      }, (payload) => {
        console.log('Cambio detectado en categorías, recargando menú...');
        fetchAllData();
      })
      .subscribe();

    // Limpieza al desmontar el componente
    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId, fetchAllData]);
  
  // Combinamos los datos en el formato que espera el componente MenuView
  const menu = restaurantData ? {
      name: restaurantData.name,
      logoUrl: restaurantData.logo_url,
      categories,
      products,
  } : null;

  // Devolvemos los datos en la estructura esperada
  return { menu, tableData, recommendation, loading, error };
};