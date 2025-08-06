import React, { useState, useMemo } from 'react';

function TipView({ subtotal, onContinue }) {
  const [tipPercentage, setTipPercentage] = useState(null);
  const [customTip, setCustomTip] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const tipAmount = useMemo(() => {
    if (isCustom) {
      const amount = parseFloat(customTip);
      return isNaN(amount) ? 0 : amount;
    }
    if (tipPercentage === null) return 0;
    return subtotal * (tipPercentage / 100);
  }, [tipPercentage, customTip, isCustom, subtotal]);

  const finalTotal = subtotal + tipAmount;

  const handleSelectPercentage = (p) => {
    setIsCustom(false);
    setCustomTip('');
    setTipPercentage(p);
  };

  const handleSelectCustom = () => {
    setIsCustom(true);
    setTipPercentage(null);
  };

  const handleContinue = () => {
    onContinue({
      tipAmount: parseFloat(tipAmount.toFixed(2)),
      finalTotal: parseFloat(finalTotal.toFixed(2)),
    });
  };

  return (
    <div className="p-8 text-center animate-fade-in">
      <h2 className="text-2xl font-bold text-white mb-2">¿Deseas agregar una propina?</h2>
      <p className="text-gray-400 mb-6">Tu apoyo es muy valorado por nuestro equipo.</p>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[10, 15, 20].map(p => (
          <button key={p} onClick={() => handleSelectPercentage(p)} className={`font-bold py-4 rounded-2xl transition-colors ${tipPercentage === p && !isCustom ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white'}`}>
            {p}%
          </button>
        ))}
        <button onClick={handleSelectCustom} className={`font-bold py-4 rounded-2xl transition-colors ${isCustom ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white'}`}>
          Otro monto
        </button>
      </div>
      {isCustom && (
        <div className="mb-6">
          <input type="number" value={customTip} onChange={(e) => setCustomTip(e.target.value)} placeholder="Ingresa un monto" className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 px-4 text-white text-center text-lg" />
        </div>
      )}
      <div className="bg-gray-800 rounded-2xl p-4 mb-8 text-left">
        <div className="flex justify-between text-gray-400">
          <span>Subtotal</span>
          <span>${subtotal.toLocaleString('es-CL')}</span>
        </div>
        <div className="flex justify-between text-gray-400 mt-2">
          <span>Propina</span>
          <span>${tipAmount.toLocaleString('es-CL')}</span>
        </div>
        <div className="border-t border-gray-700 my-3"></div>
        <div className="flex justify-between text-white font-bold text-xl">
          <span>Total a Pagar</span>
          <span>${finalTotal.toLocaleString('es-CL')}</span>
        </div>
      </div>
      <div className="space-y-4">
        <button onClick={handleContinue} className="w-full bg-blue-500 text-white font-bold py-4 rounded-2xl text-lg">
          Continuar al Pago
        </button>
        <button onClick={() => onContinue({ tipAmount: 0, finalTotal: subtotal })} className="w-full text-gray-400 font-semibold py-2">
          Continuar sin propina
        </button>
      </div>
    </div>
  );
}

export default TipView;
