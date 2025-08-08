import React, { useState, useEffect } from 'react'; // Importamos useEffect
import { useCart } from '../../contexts/CartContext';
import SearchBar from './SearchBar';

// --- Componente de Navegación por Categorías (Sin cambios) ---
function CategoryNav({ categories, selectedCategory, onSelectCategory, disabled }) {
  if (!categories || categories.length === 0) return null;
  return (
    <nav className={`sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10 transition-opacity ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="px-4 py-3 flex space-x-3 overflow-x-auto no-scrollbar">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            disabled={disabled}
            className={`font-semibold px-4 py-2 rounded-full whitespace-nowrap transition-colors duration-200 ${
              selectedCategory === category.id && !disabled
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </nav>
  );
}


function ProductCard({ product }) {
  // Ahora ProductCard usa el contexto para saber qué hay en el carrito.
  const { cart, addToCart, updateQuantity } = useCart();

  // Buscamos si este producto específico ya está en el carrito.
  const cartItem = cart.find(item => item.productId === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  return (
    <div className="bg-gray-800 rounded-2xl p-4 flex space-x-4">
      <img src={product.imageUrl || 'https://placehold.co/100x100/1F2937/FFFFFF?text=Img'} alt={product.name} className="w-24 h-24 rounded-xl object-cover" />
      <div className="flex-1">
        <h3 className="font-semibold text-lg text-white">{product.name}</h3>
        <p className="text-gray-400 text-sm mt-1">{product.description}</p>
        <p className="text-xl font-bold mt-2 text-white">${product.price.toLocaleString('es-CL')}</p>
      </div>

      {/* Renderizado Condicional: Mostramos el contador o el botón de añadir. */}
      <div className="flex flex-col items-center justify-end">
        {quantityInCart > 0 ? (
          // Si el producto está en el carrito, mostramos el contador.
          <div className="flex items-center space-x-3 bg-gray-700 rounded-full">
            <button
              onClick={() => updateQuantity(product.id, -1)}
              className="text-white text-xl font-bold w-10 h-10 flex items-center justify-center"
            >
              -
            </button>
            <span className="text-white font-bold text-lg">{quantityInCart}</span>
            <button
              onClick={() => updateQuantity(product.id, 1)}
              className="text-white text-xl font-bold w-10 h-10 flex items-center justify-center"
            >
              +
            </button>
          </div>
        ) : (
          // Si no, mostramos el botón grande para añadirlo por primera vez.
          <button
            onClick={() => addToCart(product)}
            className="bg-blue-500 text-white w-12 h-12 rounded-full text-3xl font-bold flex items-center justify-center self-end hover:bg-blue-600 transition-transform transform active:scale-90"
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}

// --- Vista Principal del Menú (CON LA CORRECCIÓN) ---
function MenuView({ menu, recommendation }) {
  // 1. Inicializamos la categoría seleccionada como null
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 2. Usamos useEffect para establecer la categoría por defecto de forma segura
  useEffect(() => {
    // Si no hay una categoría seleccionada Y ya tenemos categorías cargadas...
    if (!selectedCategory && menu.categories && menu.categories.length > 0) {
      // ...seleccionamos la primera de la lista.
      setSelectedCategory(menu.categories[0].id);
    }
  }, [menu.categories, selectedCategory]); // Este efecto se ejecuta si las categorías cambian


  const isSearching = searchTerm.trim() !== '';

  const renderContent = () => {
    if (isSearching) {
      const searchResults = menu.products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (searchResults.length === 0) {
        return <p className="text-center text-gray-500 py-10">No se encontraron productos para "{searchTerm}".</p>;
      }
      const groupedResults = searchResults.reduce((acc, product) => {
        const category = menu.categories.find(c => c.id === product.categoryId);
        const categoryName = category ? category.name : 'Otros';
        (acc[categoryName] = acc[categoryName] || []).push(product);
        return acc;
      }, {});
      return Object.entries(groupedResults).map(([categoryName, products]) => (
        <section key={categoryName} className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">{categoryName}</h2>
          <div className="grid grid-cols-1 gap-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ));
    } else {
      // 3. Nos aseguramos de que haya una categoría seleccionada antes de filtrar
      if (!selectedCategory) {
        return <p className="text-center text-gray-500 py-10">Selecciona una categoría.</p>;
      }
      const categoryProducts = menu.products.filter(p => p.category_id === selectedCategory);
      return (
        <div className="grid grid-cols-1 gap-4">
          {categoryProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      );
    }
  };

  return (
    <>
      <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      {recommendation && !isSearching && (
        <div className="px-4 pb-4">
            <div className="bg-blue-900/50 border border-blue-700 text-blue-200 p-3 rounded-xl">
                <p><strong className="font-semibold">Sugerencia del Chef 🤖:</strong> {recommendation}</p>
            </div>
        </div>
      )}
      <CategoryNav 
        categories={menu.categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        disabled={isSearching}
      />
      <main className="p-4">
        {renderContent()}
      </main>
      <div className="h-28"></div>
    </>
  );
}

export default MenuView;

