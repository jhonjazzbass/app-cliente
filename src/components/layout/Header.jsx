    import React from 'react';

    function Header({ name, tableNumber, logoUrl }) {
      return (
        <header className="p-6 flex items-center space-x-4">
          <img 
  src={logoUrl || 'https://placehold.co/64x64/374151/FFFFFF?text=Logo'} 
  alt="Logo del Restaurante" 
  className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" 
/>
          <div>
            <h1 className="text-3xl font-bold text-white">{name}</h1>
            <p className="text-gray-400">Mesa {tableNumber}</p>
          </div>
        </header>
      );
    }

    export default Header;
    