import { Plus, Minus } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { MenuItem } from '../types';
import { useState } from 'react';

interface MenuItemCardProps {
  item: MenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { addToCart, cart } = useStore();
  const [showQuantity, setShowQuantity] = useState(false);
  
  const cartItem = cart.find((ci) => ci.menu_item.id === item.id);
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    addToCart(item);
    setShowQuantity(true);
  };

  const handleIncrement = () => {
    addToCart(item);
  };

  const handleDecrement = () => {
    if (quantity <= 1) {
      setShowQuantity(false);
    }
  };

  return (
    <div className="card flex flex-col sm:flex-row overflow-hidden">
      <div className="sm:w-32 h-32 sm:h-auto flex-shrink-0">
        <img
          src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900">{item.name}</h3>
          <span className="font-bold text-primary-600">${item.price.toFixed(2)}</span>
        </div>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{item.description}</p>
        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
          {item.category}
        </span>
      </div>
      <div className="p-4 flex items-center justify-end sm:justify-center">
        {!item.is_available ? (
          <span className="text-gray-400 text-sm">Unavailable</span>
        ) : showQuantity || quantity > 0 ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDecrement}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <button
              onClick={handleIncrement}
              className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            className="btn-primary"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
