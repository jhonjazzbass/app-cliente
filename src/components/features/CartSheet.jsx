import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';

function CartSheet({ isOpen, onClose, restaurantId, tableId }) {
  const { cart, updateQuantity, cartTotal, handlePlaceOrder, isProcessing } = useCart();
  const [observations, setObservations] = useState('');

  const onPlaceOrderClick = async () => {
    const { success } = await handlePlaceOrder(observations, restaurantId, tableId);
    if (success) {
      onClose();
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-60 z-20 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>
      <div className={`fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-gray-800 rounded-t-2xl p-4 z-30 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        
        {/* 👇 CORRECCIÓN CLAVE: Solo renderizamos el contenido si el panel está abierto. 👇 */}
        {isOpen && (
          <>
            <div className="w-12 h-1.5 bg-gray-600 rounded-full mx-auto mb-4"></div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Tu Pedido</h2>
              <button onClick={onClose} className="text-gray-500 text-3xl hover:text-white">&times;</button>
            </div>
            
            <div className="space-y-4 mb-4 max-h-60 overflow-y-auto no-scrollbar">
              {cart.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Añade productos para empezar tu pedido.</p>
              ) : (
                cart.map(item => (
                  <div key={item.productId} className="flex items-center">
                    <div className="flex-1">
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="text-gray-400 text-sm">${item.price.toLocaleString('es-CL')}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button onClick={() => updateQuantity(item.productId, -1)} className="w-8 h-8 bg-gray-700 rounded-full text-white">-</button>
                      <span className="font-bold text-lg text-white">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, 1)} className="w-8 h-8 bg-gray-700 rounded-full text-white">+</button>
                    </div>
                    <p className="font-bold w-24 text-right text-white">${(item.price * item.quantity).toLocaleString('es-CL')}</p>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-700 pt-4">
                <div className="mb-4">
                    <label htmlFor="observations" className="text-sm font-semibold text-gray-300 mb-2 block">
                        Observaciones (opcional)
                    </label>
                    <textarea 
                        id="observations"
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        rows="3"
                        placeholder="Ej: Sin cebolla, extra mayonesa, etc."
                        className="w-full bg-gray-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    ></textarea>
                </div>

                <div className="flex justify-between font-bold text-xl mb-4 text-white">
                  <span>Total</span>
                  <span>${cartTotal.toLocaleString('es-CL')}</span>
                </div>
                <button 
                  onClick={onPlaceOrderClick} 
                  disabled={isProcessing}
                  className="w-full bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-md hover:bg-blue-600 text-lg disabled:bg-gray-500"
                >
                  {isProcessing ? 'Enviando...' : 'Realizar Pedido para la Mesa'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default CartSheet;
