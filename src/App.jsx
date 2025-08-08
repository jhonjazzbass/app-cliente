import React, { useState, useEffect } from 'react';
import { CartProvider } from './contexts/CartContext';
import { OrderProvider, useOrder } from './contexts/OrderContext';
import { useMenu } from './hooks/useMenu';

import Header from './components/layout/Header';
import MenuView from './components/features/MenuView';
import OrderStatusView from './components/features/OrderStatusView';
import TipView from './components/features/TipView';
import PaymentView from './components/features/PaymentView';
import CartButton from './components/features/CartButton';
import CartSheet from './components/features/CartSheet';
import './index.css';

// --- 1. LEEMOS LOS PARÁMETROS DE LA URL EN LUGAR DE USAR CONSTANTES ---
const urlParams = new URLSearchParams(window.location.search);
const restaurantIdFromUrl = urlParams.get('restauranteId');
const tableIdFromUrl = urlParams.get('tableId');


// --- 2. ELIMINAMOS LAS CONSTANTES FIJAS ---
// const RESTAURANT_ID = '...';
// const TABLE_ID = '...';


// --- 3. MODIFICAMOS APPCONTENT PARA QUE RECIBA LOS IDs ---
function AppContent({ restaurantId, tableId }) {
  // --- 4. USAMOS LOS IDs RECIBIDOS PARA INICIALIZAR LOS HOOKS ---
  const { menu, tableData, recommendation, loading, error } = useMenu(restaurantId, tableId);
  const { activeOrderData } = useOrder();
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState('status');
  const [tipDetails, setTipDetails] = useState(null);

  useEffect(() => {
    if (activeOrderData?.status === 'bill_requested' && paymentStep === 'status') {
      setPaymentStep('tip');
    }
    if (activeOrderData?.status !== 'bill_requested' && paymentStep !== 'status') {
      resetFlow();
    }
  }, [activeOrderData, paymentStep]);

  const handleProceedToPayment = (details) => {
    setTipDetails(details);
    setPaymentStep('payment');
  };
  
  const handlePaymentInitiated = () => {
    setPaymentStep('processing_payment');
  };

  const resetFlow = () => {
    setPaymentStep('status');
    setTipDetails(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Cargando menú...</div>;
  }
  if (error) {
    return <div className="text-center text-red-400 p-8">{error}</div>;
  }
  if (!menu || !tableData) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Inicializando...</div>;
  }

  const renderContent = () => {
    const isOrdering = activeOrderData?.status === 'ordering';
    const hasActiveOrder = !!activeOrderData;

    if (hasActiveOrder && !isOrdering) {
      switch (paymentStep) {
        case 'tip':
          return <TipView subtotal={activeOrderData.total} onContinue={handleProceedToPayment} />;
        case 'payment':
          return <PaymentView orderDetails={tipDetails} onPaymentInitiated={handlePaymentInitiated} />;
        case 'processing_payment':
          return <div className="flex flex-col items-center justify-center text-center min-h-screen bg-gray-900 text-white p-4">Finalizando orden, por favor espere...</div>;
        default:
          return <OrderStatusView resetFlow={resetFlow} />;
      }
    }
    return <MenuView menu={menu} recommendation={recommendation} />;
  };

  return (
    <div className="max-w-lg mx-auto bg-gray-900 min-h-screen shadow-2xl relative">
      <Header 
        name={menu.name}
        logoUrl={menu.logoUrl}
        tableNumber={tableData.tableNumber}
      />
      
      {renderContent()}

      {activeOrderData?.status === 'ordering' && (
        <>
          <CartButton onClick={() => setIsCartOpen(true)} />
          <CartSheet 
            isOpen={isCartOpen} 
            onClose={() => setIsCartOpen(false)}
            // --- 5. PASAMOS LOS IDs DINÁMICOS AL CARTSHEET ---
            restaurantId={restaurantId}
            tableId={tableId}
          />
        </>
      )}
    </div>
  );
}

function App() {
  // --- 6. AÑADIMOS UNA VALIDACIÓN IMPORTANTE ---
  // Si la URL no contiene los IDs necesarios, mostramos un error claro.
  if (!restaurantIdFromUrl || !tableIdFromUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white text-center p-4">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Error de Acceso</h1>
        <p className="text-gray-400">El código QR no es válido o la URL está incompleta.</p>
        <p className="text-gray-500 text-sm mt-2">Por favor, asegúrate de escanear el código QR proporcionado en la mesa.</p>
      </div>
    );
  }

  // --- 7. PASAMOS LOS IDs DE LA URL A TODA LA APLICACIÓN ---
  return (
    <OrderProvider restaurantId={restaurantIdFromUrl} tableId={tableIdFromUrl}>
      <CartProvider>
        <AppContent restaurantId={restaurantIdFromUrl} tableId={tableIdFromUrl} />
      </CartProvider>
    </OrderProvider>
  );
}

export default App;