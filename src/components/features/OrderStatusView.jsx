import React, { useState } from 'react';
import { useOrder } from '../../contexts/OrderContext';

// --- 👇 Nuevo Componente: Modal de Asistencia 👇 ---
function AssistanceModal({ isOpen, onClose, onSelect }) {
  if (!isOpen) return null;

  const assistanceOptions = [
    'Llamar al mesero',
    'Necesito cubiertos',
    'Necesito servilletas',
    'Quiero añadir algo a mi pedido',
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-40 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
        <h3 className="text-xl font-bold text-white mb-4">¿En qué podemos ayudarte?</h3>
        <div className="space-y-3">
          {assistanceOptions.map(option => (
            <button
              key={option}
              onClick={() => onSelect(option)}
              className="w-full text-left bg-gray-700 text-white p-3 rounded-lg hover:bg-gray-600"
            >
              {option}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full mt-6 text-gray-400 font-semibold py-2"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

function OrderStatusView({ resetFlow }) {
  const { activeOrderData, updateOrderStatus, submitFeedback, resetOrder, isProcessing, requestAssistance } = useOrder();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para el modal

  const handleFullReset = () => {
    resetOrder();
    resetFlow();
  };


  const handleSubmitAndReset = async () => {
    // Primero, intentamos enviar el feedback al servidor
    const { success } = await submitFeedback(rating, comment);

    // Si el envío fue exitoso (o incluso si no lo fue, para no dejar al usuario atascado),
    // reiniciamos completamente el flujo.
    if (success) {
      console.log('Feedback enviado con éxito. Reiniciando flujo...');
      handleFullReset(); // <--- ESTA ES LA CORRECCIÓN CLAVE
    }
  };

  const handleAssistanceRequest = async (details) => {
    setIsModalOpen(false); // Cierra el modal
    await requestAssistance(details);
  };

  if (!activeOrderData) return <div className="p-8 text-center text-gray-400">Cargando estado del pedido...</div>;
  
  const assistanceButton = (
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-yellow-500 text-black w-16 h-16 rounded-full text-3xl font-bold flex items-center justify-center shadow-lg hover:bg-yellow-400 z-30"
        aria-label="Solicitar Ayuda"
      >
        🛎️
      </button>
  );

  switch (activeOrderData.status) {
    case 'paid':
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">¡Gracias por tu visita!</h2>
          <p className="text-gray-400 mb-6">Déjanos tu opinión</p>
          <div className="text-4xl text-gray-600 cursor-pointer mb-6">
            {[1, 2, 3, 4, 5].map(star => (
              <span key={star} onClick={() => setRating(star)} className={star <= rating ? 'text-yellow-400' : ''}>★</span>
            ))}
          </div>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Comentario (opcional)" rows="4" className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 px-4 text-white mb-6"></textarea>
          <div className="space-y-4">
            <button onClick={handleSubmitAndReset} disabled={isProcessing} className="w-full bg-blue-500 text-white font-bold py-4 rounded-2xl">Enviar</button>
            <button onClick={handleFullReset} className="w-full bg-gray-700 text-white font-bold py-4 rounded-2xl">Omitir</button>
          </div>
        </div>
      );
    case 'cash_payment_pending':
      return (
        <>
            <div className="p-8 text-center"><h2 className="text-2xl font-bold text-white">Pago Informado</h2><p className="text-gray-400">Un mesero se acerca para completar el pago.</p></div>
            {assistanceButton}
            <AssistanceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSelect={handleAssistanceRequest} />
        </>
      );
    case 'waiting_for_pos':
      return (
        <>
            <div className="p-8 text-center"><h2 className="text-2xl font-bold text-white">Espere por favor</h2><p className="text-gray-400">Un mesero se acerca con el terminal de pago.</p></div>
            {assistanceButton}
            <AssistanceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSelect={handleAssistanceRequest} />
        </>
      );
    default:
      return (
        <>
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">¡Gracias por tu pedido!</h2>
            <p className="text-gray-400 mb-6">Tu comida está en preparación. Cuando desees pagar, presiona el botón.</p>
            <button 
  onClick={() => {
    // --- 👇 LÍNEA AÑADIDA PARA DEPURAR 👇 ---
    console.log('Botón "Pedir la Cuenta" presionado. Llamando a updateOrderStatus...');
    updateOrderStatus('bill_requested');
  }} 
  disabled={isProcessing} 
  className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl"
>
  {isProcessing ? '...' : 'Pedir la Cuenta'}
</button>
          </div>
          {assistanceButton}
          <AssistanceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSelect={handleAssistanceRequest} />
        </>
      );
  }
}

export default OrderStatusView;
