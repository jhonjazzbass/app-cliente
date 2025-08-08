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

// --- Leemos los parámetros de la URL con los nombres correctos ---
const urlParams = new URLSearchParams(window.location.search);
const restaurantId = urlParams.get('restaurantId'); // Corregido de 'restauranteId'
const tableId = urlParams.get('tableId');

function AppContent({ restaurantId, tableId }) {
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
    // Este mensaje se mostrará mientras se inicializa el pedido
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
            restaurantId={restaurantId}
            tableId={tableId}
          />
        </>
      )}
    </div>
  );
}

function App() {
  // La validación ahora usa las variables corregidas
  if (!restaurantId || !tableId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white text-center p-4">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Error de Acceso</h1>
        <p className="text-gray-400">El código QR no es válido o la URL está incompleta.</p>
        <p className="text-gray-500 text-sm mt-2">Por favor, asegúrate de escanear el código QR proporcionado en la mesa.</p>
      </div>
    );
  }

  // Pasamos los IDs corregidos a toda la aplicación
  return (
    <OrderProvider restaurantId={restaurantId} tableId={tableId}>
      <CartProvider>
        <AppContent restaurantId={restaurantId} tableId={tableId} />
      </CartProvider>
    </OrderProvider>
  );
}

export default App;