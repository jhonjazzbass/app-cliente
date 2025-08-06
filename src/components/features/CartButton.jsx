    import React from 'react';
    import { useCart } from '../../contexts/CartContext';

    function CartButton({ onClick }) {
      const { cartItemCount, cartTotal } = useCart();

      if (cartItemCount === 0) {
        return null;
      }

      return (
        <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto p-4 z-20">
          <button 
            onClick={onClick}
            className="w-full bg-blue-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg flex justify-between items-center text-lg transform transition-transform hover:scale-105 active:scale-100"
          >
            <span>🛒 Ver Pedido ({cartItemCount})</span>
            <span>${cartTotal.toLocaleString('es-CL')}</span>
          </button>
        </div>
      );
    }

    export default CartButton;
    