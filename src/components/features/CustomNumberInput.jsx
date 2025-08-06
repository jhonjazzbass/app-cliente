// src/components/features/CustomNumberInput.jsx

import React from 'react';

function CustomNumberInput({ value, onChange, onDecrement, onIncrement, step = 1000 }) {
  const handleStep = (direction) => {
    const currentValue = parseFloat(value) || 0;
    const newValue = direction === 'increment' ? currentValue + step : currentValue - step;
    
    // Creamos un evento 'fake' para que el onChange del padre funcione igual
    const event = {
      target: {
        value: String(newValue >= 0 ? newValue : 0)
      }
    };
    onChange(event);
  };

  return (
    <div className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors">
      <button 
        onClick={() => handleStep('decrement')}
        className="px-5 py-3 text-white text-2xl font-bold bg-gray-700 hover:bg-gray-600 transition-colors"
      >
        -
      </button>
      
      <input 
        type="number" 
        value={value} 
        onChange={onChange}
        placeholder="Ej: 20000"
        className="w-full bg-transparent text-white text-center text-xl font-semibold focus:outline-none"
      />

      <button 
        onClick={() => handleStep('increment')}
        className="px-5 py-3 text-white text-2xl font-bold bg-gray-700 hover:bg-gray-600 transition-colors"
      >
        +
      </button>
    </div>
  );
}

export default CustomNumberInput;