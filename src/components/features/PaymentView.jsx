// src/components/features/PaymentView.jsx

import React, { useState } from 'react';
import { useOrder } from '../../contexts/OrderContext';
import CustomNumberInput from './CustomNumberInput'; // 👈 1. Importa el nuevo componente

function PaymentView({ orderDetails, onPaymentInitiated }) {
  const { updateOrderStatus } = useOrder();
  const [showCashInput, setShowCashInput] = useState(false);
  const [cashAmount, setCashAmount] = useState('');
  const [processingMethod, setProcessingMethod] = useState(null);

  const totalToPay = orderDetails.finalTotal;

  const handleInformCashPayment = async () => {
    const cash = parseFloat(cashAmount);
    if (isNaN(cash) || cash < totalToPay) {
      alert('El monto ingresado es menor que el total a pagar.');
      return;
    }
    setProcessingMethod('cash');
    const paymentDetails = {
      method: 'Efectivo',
      tipAmount: orderDetails.tipAmount,
      finalTotal: totalToPay,
      amountReceived: cash,
      change: cash - totalToPay
    };
    const { success } = await updateOrderStatus('cash_payment_pending', { paymentDetails });
    if (success) {
      onPaymentInitiated();
    } else {
      setProcessingMethod(null);
    }
  };
  
  const handleCardPayment = async () => {
    setProcessingMethod('card');
    const paymentDetails = {
      method: 'Tarjeta',
      tipAmount: orderDetails.tipAmount,
      finalTotal: totalToPay,
    };
    const { success } = await updateOrderStatus('waiting_for_pos', { paymentDetails });
    if (success) {
      onPaymentInitiated();
    } else {
      setProcessingMethod(null);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white mb-4">Selecciona tu método de pago</h2>
      <p className="text-gray-400 mb-6">Total a pagar: <strong className="text-white">${totalToPay.toLocaleString('es-CL')}</strong></p>
      
      {!showCashInput ? (
        <div className="space-y-4">
          <button 
            onClick={() => setShowCashInput(true)} 
            disabled={processingMethod !== null} 
            className="w-full bg-gray-700 text-white font-bold py-4 rounded-2xl disabled:bg-gray-500 disabled:opacity-50"
          >
            Efectivo
          </button>
          <button 
            onClick={handleCardPayment} 
            disabled={processingMethod !== null} 
            className="w-full bg-gray-700 text-white font-bold py-4 rounded-2xl disabled:bg-gray-500 disabled:opacity-50"
          >
            {processingMethod === 'card' ? 'Procesando...' : 'Tarjeta'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-400">Pagas con:</p>
          
          {/* 👈 2. Reemplaza el <input> viejo por el nuevo componente */}
          <CustomNumberInput 
            value={cashAmount}
            onChange={(e) => setCashAmount(e.target.value)}
            step={1000} // Puedes ajustar el salto aquí (ej. 500, 1000, etc.)
          />
          
          <button 
            onClick={handleInformCashPayment} 
            disabled={processingMethod !== null} 
            className="w-full bg-blue-500 text-white font-bold py-4 rounded-2xl disabled:bg-gray-500 disabled:opacity-50"
          >
            {processingMethod === 'cash' ? 'Procesando...' : 'Informar Pago en Efectivo'}
          </button>
        </div>
      )}
    </div>
  );
}

export default PaymentView;